const axios = require("axios");
const crypto = require("crypto");
const { ethers } = require("ethers");
const db = require("../config/db");
const txService = require("./TransactionService");
require("dotenv").config();
const artifact = require("../../abi/EscrowRegistry.json");

const abi = artifact.abi;
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const serverWallet = new ethers.Wallet(process.env.SERVER_PRIVATE_KEY, provider);
const contract = new ethers.Contract(process.env.ESCROW_CONTRACT, abi, serverWallet);

const ESCROW_SERVER = process.env.ESCROW_SERVER || "http://localhost:8081";

async function requestEscrow(buyerWallet, sellerWallet, amount, deadlineDays = 7) {
    try {
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + deadlineDays);

        const response = await axios.post(ESCROW_SERVER + "/contracts", {
            buyer_id: buyerWallet,
            seller_id: sellerWallet,
            amount: amount
        });
        const escrow = response.data;
    
        await db.query(`
            INSERT INTO escrow_contracts 
            (escrow_id, buyer_wallet, seller_wallet, amount, status, initiator_wallet, deadline) 
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [escrow.contract_id, buyerWallet, sellerWallet, amount, 'PENDING_PAYMENT', sellerWallet, deadline]);
    
        return {
            escrowId: escrow.contract_id,
            status: 'PENDING_PAYMENT'
        };
    } catch (e) {
        console.error("[EscrowService] requestEscrow FAILED", e?.response?.data || e.message);
        throw e;
    }
}

async function payEscrow(escrowId, razorpayPaymentId) {
    const result = await db.query(
        "SELECT * FROM escrow_contracts WHERE escrow_id=$1 AND status='PENDING_PAYMENT'", [escrowId]
    );
    if (!result.rows.length) throw new Error("Escrow not found or already paid");
    const escrow = result.rows[0];

    await axios.post(ESCROW_SERVER + `/initiate-payment/${escrowId}`);

    const pyStatus = await axios.get(ESCROW_SERVER + `/contract-status/${escrowId}`);
    
    const metadataHash = crypto.createHash("sha256").update(JSON.stringify({
        ...pyStatus.data,
        razorpayPaymentId
    })).digest("hex");

    const tx = await contract.recordEscrow(
        escrowId,
        escrow.buyer_wallet,
        escrow.seller_wallet,
        escrow.amount,
        "LOCKED",
        metadataHash
    );

    const receipt = await tx.wait();
    
    const event = receipt.logs.find(
        log => log.topics[0] === contract.interface.getEvent("EscrowCreated").topicHash
    );
    const decoded = contract.interface.parseLog(event);
    const dealId = decoded.args.id;

    await db.query(`
        UPDATE escrow_contracts SET status='LOCKED_ON_CHAIN', blockchain_deal_id=$1
        WHERE escrow_id=$2
    `, [dealId, escrowId]);

    try {
        await txService.recordPayment(
            escrow.buyer_wallet,
            escrow.seller_wallet,
            escrow.amount,
            razorpayPaymentId,
            { type: "ESCROW_LOCK", escrowId }
        );
    } catch(e) {
        console.error("[Ledger Error] Non-critical ledger failure:", e.shortMessage || e.message);
    }

    return {
        escrowId,
        dealId,
        blockchainTx: tx.hash
    };
}

async function completeEscrow(escrowId) { 
    const result = await db.query(
        "SELECT * FROM escrow_contracts WHERE escrow_id=$1", [escrowId]
    );
    const escrow = result.rows[0];
    const dealId = escrow.blockchain_deal_id;
    
    const statusRes = await axios.get(ESCROW_SERVER + `/contract-status/${escrowId}`);
    const pyStatus = statusRes.data.status;

    if (pyStatus === 'LOCKED') {
        await axios.post(ESCROW_SERVER + `/confirm-delivery/${escrowId}`);
        await axios.post(ESCROW_SERVER + `/disburse-funds/${escrowId}`);
    } else if (pyStatus === 'EXECUTED') {
        await axios.post(ESCROW_SERVER + `/disburse-funds/${escrowId}`);
    }

    let paymentProofHash = "Pending/Ledger Error";
    try {
        const paymentProof = await txService.recordPayment(
            escrow.buyer_wallet,
            escrow.seller_wallet,
            escrow.amount,
            escrow.escrow_id,
            { type: "ESCROW", escrowId, dealId: dealId.toString() }
        );
        paymentProofHash = paymentProof.blockchainHash;
    } catch(e) {
        console.error("[Ledger Error] Non-critical ledger failure:", e.shortMessage || e.message);
    }

    const tx = await contract.completeEscrow(dealId, "COMPLETED");
    await tx.wait();

    await db.query(`
        UPDATE escrow_contracts SET status='COMPLETED', blockchain_tx=$1
        WHERE escrow_id=$2
    `, [paymentProofHash, escrowId]);

    return {
        escrowCompletion: tx.hash,
        paymentProof: paymentProofHash
    };
}

async function getUserEscrows(wallet) {
    const result = await db.query(
        "SELECT * FROM escrow_contracts WHERE buyer_wallet=$1 OR seller_wallet=$1 ORDER BY created_at DESC",
        [wallet]
    );
    return result.rows;
}

async function getAnalytics(wallet) {
    const result = await db.query(
        "SELECT * FROM escrow_contracts WHERE buyer_wallet=$1 OR seller_wallet=$1",
        [wallet]
    );
    const escrows = result.rows;

    const totalTransactions = escrows.length;
    const totalVolume = escrows.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
    const completedEscrows = escrows.filter(e => e.status === 'COMPLETED');
    const completionRate = totalTransactions > 0 ? (completedEscrows.length / totalTransactions) * 100 : 100;

    const now = new Date();
    const overdueCount = escrows.filter(e => 
        e.status !== 'COMPLETED' && e.deadline && new Date(e.deadline) < now
    ).length;

    return {
        totalTransactions,
        totalVolume,
        escrowDeals: totalTransactions,
        verifyRate: completionRate.toFixed(0) + '%',
        overdueCount,
        activeCount: totalTransactions - completedEscrows.length
    };
}

async function getPartnerRelationship(wallet, partnerWallet) {
    const result = await db.query(
        `SELECT * FROM escrow_contracts 
         WHERE (buyer_wallet=$1 AND seller_wallet=$2) 
            OR (buyer_wallet=$2 AND seller_wallet=$1)`,
        [wallet, partnerWallet]
    );
    const deals = result.rows;
    const completed = deals.filter(d => d.status === 'COMPLETED').length;
    
    return {
        totalDeals: deals.length,
        completedDeals: completed,
        trustScore: deals.length > 0 ? (completed / deals.length) * 100 : 0
    };
}

module.exports = { requestEscrow, payEscrow, completeEscrow, getUserEscrows, getAnalytics, getPartnerRelationship };