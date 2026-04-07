const express =
    require("express");

const paymentService =
    require("../services/PaymentService");

const router =
    express.Router();

router.post(

    "/razorpay/webhook",

    async (req, res) => {

        try {

            const payment =
                req.body;

            const result =
                await paymentService
                    .processPayment(payment);

            res.json({

                success: true,

                blockchainTx:
                    result.blockchainHash,

                metadataHash:
                    result.metadataHash

            });

        }
        catch (e) {

            res.status(500)
                .json({

                    error: e.message

                });

        }

    });

module.exports =
    router;