const express = require("express");
const networkService = require("../services/NetworkService");

const router = express.Router();

router.post("/request", async (req, res) => {
    try {
        const { from, to } = req.body;
        const result = await networkService.requestConnection(from, to);
        res.json(result);
    } catch (e) {
        console.error("[Network API] Error in /request:", e);
        res.status(500).json({ error: e.message });
    }
});

router.post("/accept", async (req, res) => {
    try {
        const { from, to } = req.body; 
        const result = await networkService.acceptConnection(from, to);
        res.json(result);
    } catch (e) {
        console.error("[Network API] Error in /accept:", e);
        res.status(500).json({ error: e.message });
    }
});

router.get("/mutuals/:email", async (req, res) => {
    try {
        const result = await networkService.getMutuals(req.params.email);
        res.json(result);
    } catch (e) {
        console.error("[Network API] Error in /mutuals:", e);
        res.status(500).json({ error: e.message });
    }
});

router.get("/users/:email", async (req, res) => {
    try {
        const result = await networkService.getAllUsers(req.params.email);
        res.json(result);
    } catch (e) {
        console.error("[Network API] Error in /users:", e);
        res.status(500).json({ error: e.message });
    }
});

router.get("/pending/:email", async (req, res) => {
    try {
        const result = await networkService.getPendingRequests(req.params.email);
        res.json(result);
    } catch (e) {
        console.error("[Network API] Error in /pending:", e);
        res.status(500).json({ error: e.message });
    }
});

router.post("/disconnect", async (req, res) => {
    try {
        const { from, to } = req.body;
        const result = await networkService.disconnectConnection(from, to);
        res.json(result);
    } catch (e) {
        console.error("[Network API] Error in /disconnect:", e);
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
