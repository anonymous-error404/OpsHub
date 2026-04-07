const express =
    require("express");

const escrowService =
    require("../services/EscrowService");

const userService =
    require("../services/UserService");

const router =
    express.Router();

router.post(

    "/create",

    async (req, res) => {

        try {

            const {

                buyerEmail,
                sellerEmail,
                amount

            } = req.body;

            const buyer =
                await userService
                    .findByEmail(

                        buyerEmail

                    );

            const seller =
                await userService
                    .findByEmail(

                        sellerEmail

                    );

            const result =
                await escrowService
                    .createEscrow(

                        buyer.wallet_address,

                        seller.wallet_address,

                        amount

                    );

            res.json(result);

        }
        catch (e) {

            res.status(500)
                .json({

                    error: e.message

                });

        }

    });

router.post(

    "/complete",

    async (req, res) => {

        try {

            const {

                dealId

            } = req.body;

            // lookup escrow id

            const result =
                await db.query(

                    "SELECT escrow_id FROM escrow_contracts WHERE blockchain_deal_id=$1",

                    [dealId]

                );

            const escrowId =
                result.rows[0].escrow_id;

            const tx =
                await escrowService
                    .completeEscrow(

                        dealId,
                        escrowId,
                        "COMPLETED"

                    );

            res.json({

                tx

            });

        }
        catch (e) {

            res.status(500)
                .json({

                    error: e.message

                });

        }

    });

router.get(

    "/user/:email",

    async (req, res) => {

        try {

            const user = await userService.findByEmail(req.params.email);

            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            const escrows = await escrowService.getUserEscrows(user.wallet_address);

            res.json(escrows);

        } catch (e) {
            res.status(500).json({ error: e.message });
        }

    }
);

module.exports =
    router;