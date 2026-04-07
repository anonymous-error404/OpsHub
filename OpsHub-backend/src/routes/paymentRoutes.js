const express = require("express");
const paymentService = require("../services/PaymentService");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_SX3iJMg1wTlHNx",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "vLaMKmYesb0Scv9anci35vWO"
});

router.post("/razorpay/webhook", async (req, res) => {
    try {
        const payment = req.body;
        const result = await paymentService.processPayment(payment);
        res.json({
            success: true,
            blockchainTx: result.blockchainHash,
            metadataHash: result.metadataHash
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Create Razorpay Order
router.post("/create-order", async (req, res) => {
    try {
        const { amount } = req.body;
        const options = {
            amount: Math.round(amount * 100), // convert to paise
            currency: "INR",
            receipt: "receipt_" + Date.now()
        };
        const order = await razorpay.orders.create(options);
        res.json({
            order_id: order.id,
            amount: order.amount,
            key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_SX3iJMg1wTlHNx" // Send public test key to frontend avoiding .env hassle
        });
    } catch (error) {
        console.error("Error creating order", error);
        res.status(500).json({ error: "Error creating razorpay order" });
    }
});

// Verify Payment
router.post("/verify-payment", (req, res) => {
    const { order_id, payment_id, signature } = req.body;
    const body = order_id + "|" + payment_id;
    const secret = process.env.RAZORPAY_KEY_SECRET || "vLaMKmYesb0Scv9anci35vWO";

    const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(body.toString())
        .digest("hex");

    if (expectedSignature === signature) {
        res.json({ status: "success", payment_id });
    } else {
        res.status(400).json({ status: "failure", error: "Invalid payment signature" });
    }
});

module.exports = router;