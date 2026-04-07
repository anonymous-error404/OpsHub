const axios =
    require("axios");

const crypto =
    require("crypto");

const { ethers } =
    require("ethers");

const db =
    require("../config/db");

const txService =
    require("./TransactionService");

require("dotenv").config();

const artifact =
    require("../../abi/EscrowRegistry.json");

const abi =
    artifact.abi;

const provider =
    new ethers.JsonRpcProvider(

        process.env.RPC_URL
    );

const serverWallet =
    new ethers.Wallet(

        process.env.SERVER_PRIVATE_KEY,

        provider
    );

const contract =
    new ethers.Contract(

        process.env.ESCROW_CONTRACT,

        abi,

        serverWallet

    );

const ESCROW_SERVER =
    "http://localhost:8080";

async function createEscrow(

    buyerWallet,
    sellerWallet,
    amount

) {

    // 1 call escrow server

    const response =
        await axios.post(

            ESCROW_SERVER +
            "/contracts",

            {

                buyer_id:
                    buyerWallet,

                seller_id:
                    sellerWallet,

                amount: amount

            }

        );

    const escrow =
        response.data;

    // 2 hash metadata

    const metadataHash =
        crypto
            .createHash("sha256")
            .update(

                JSON.stringify(escrow)

            )
            .digest("hex");

    // 3 record on blockchain

    const tx =
        await contract
            .recordEscrow(

                escrow.contract_id,

                buyerWallet,

                sellerWallet,

                amount,

                escrow.status,

                metadataHash

            );

    const receipt =
        await tx.wait();

    // 4 extract deal id from event

    const event =
        receipt.logs.find(

            log => log.topics[0] ===
                contract.interface
                    .getEvent("EscrowCreated")
                    .topicHash

        );

    const decoded =
        contract.interface
            .parseLog(event);

    const dealId =
        decoded.args.id;

    // 5 store mapping

    await db.query(

        `INSERT INTO escrow_contracts
(escrow_id,
buyer_wallet,
seller_wallet,
amount,
blockchain_deal_id,
status)

VALUES($1,$2,$3,$4,$5,$6)`,

        [

            escrow.contract_id,
            buyerWallet,
            sellerWallet,
            amount,
            dealId,
            escrow.status

        ]

    );

    return {

        escrowId:
            escrow.contract_id,

        dealId:
            dealId,

        blockchainTx:
            tx.hash

    };

}

async function completeEscrow(

    dealId

) {

    // 1 lookup escrow

    const result =
        await db.query(

            `SELECT escrow_id,
buyer_wallet,
seller_wallet,
amount

FROM escrow_contracts

WHERE blockchain_deal_id=$1`,

            [dealId]

        );

    const escrow =
        result.rows[0];

    // 2 release funds

    await axios.post(

        ESCROW_SERVER +
        "/contracts/release",

        {

            contract_id:
                escrow.escrow_id

        }

    );

    // 3 record transaction proof

    const paymentProof =
        await txService
            .recordPayment(

                escrow.buyer_wallet,

                escrow.seller_wallet,

                escrow.amount,

                escrow.escrow_id,

                {

                    type: "ESCROW",

                    escrowId:
                        escrow.escrow_id,

                    dealId:
                        dealId

                }

            );

    // 4 update escrow blockchain

    const tx =
        await contract
            .completeEscrow(

                dealId,

                "COMPLETED"

            );

    await tx.wait();

    // 5 update DB

    await db.query(

        `UPDATE escrow_contracts

SET status='COMPLETED',

blockchain_tx=$1

WHERE blockchain_deal_id=$2`,

        [

            paymentProof.blockchainHash,

            dealId

        ]

    );

    return {

        escrowCompletion:
            tx.hash,

        paymentProof:
            paymentProof.blockchainHash

    };

}

async function getUserEscrows(wallet) {

    const result = await db.query(

        `SELECT * FROM escrow_contracts 
         WHERE buyer_wallet=$1 OR seller_wallet=$1 
         ORDER BY created_at DESC`,

        [wallet]

    );

    return result.rows;

}

module.exports = {

    createEscrow,
    completeEscrow,
    getUserEscrows

};