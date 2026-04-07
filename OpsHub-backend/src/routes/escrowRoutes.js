const express = require("express");
const escrowService = require("../services/EscrowService");
const userService = require("../services/UserService");
const router = express.Router();

router.post("/request", async (req, res) => {
    try {
        const { buyerEmail, sellerEmail, amount, deadlineDays } = req.body;
        const buyer = await userService.findByEmail(buyerEmail);
        const seller = await userService.findByEmail(sellerEmail);
        const result = await escrowService.requestEscrow(buyer.wallet_address, seller.wallet_address, amount, deadlineDays);
        res.json(result);
    } catch (e) {
        console.error("[Escrow API] Error in /request:", e);
        res.status(500).json({ error: e.message });
    }
});

router.post("/pay", async (req, res) => {
    try {
        const { escrowId, paymentId } = req.body;
        const result = await escrowService.payEscrow(escrowId, paymentId);
        res.json(result);
    } catch (e) {
        console.error("[Escrow API] Error in /pay:", e);
        res.status(500).json({ error: e.message });
    }
});

router.post("/complete", async (req, res) => {
    try {
        const { escrowId } = req.body; 
        const result = await escrowService.completeEscrow(escrowId);
        res.json(result);
    } catch (e) {
        console.error("[Escrow API] Error in /complete:", e);
        res.status(500).json({ error: e.message });
    }
});

router.get("/analytics/:email", async (req, res) => {
    try {
        const user = await userService.findByEmail(req.params.email);
        if (!user) return res.status(404).json({ error: "User not found" });
        const analytics = await escrowService.getAnalytics(user.wallet_address);
        res.json(analytics);
    } catch (e) {
        console.error("[Escrow API] Error in /analytics/:email:", e);
        res.status(500).json({ error: e.message });
    }
});

router.get("/relationship/:email/:partnerEmail", async (req, res) => {
    try {
        const user = await userService.findByEmail(req.params.email);
        const partner = await userService.findByEmail(req.params.partnerEmail);
        if (!user || !partner) return res.status(404).json({ error: "User or Partner not found" });
        const relationship = await escrowService.getPartnerRelationship(user.wallet_address, partner.wallet_address);
        res.json(relationship);
    } catch (e) {
        console.error("[Escrow API] Error in /relationship/:email/:partnerEmail:", e);
        res.status(500).json({ error: e.message });
    }
});

router.get("/user/:email", async (req, res) => {
    try {
        const user = await userService.findByEmail(req.params.email);
        if (!user) return res.status(404).json({ error: "User not found" });
        const escrows = await escrowService.getUserEscrows(user.wallet_address);
        res.json(escrows);
    } catch (e) {
        console.error("[Escrow API] Error in /user/:email:", e);
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;