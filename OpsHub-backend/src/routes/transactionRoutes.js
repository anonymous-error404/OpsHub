const express =
    require("express");

const txService =
    require("../services/TransactionService");

const router =
    express.Router();

router.get(

    "/:id",

    async (req, res) => {

        try {

            const tx =
                await txService
                    .getTransaction(

                        req.params.id

                    );

            res.json(tx);

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