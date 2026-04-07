const express =
    require("express");

const statusService =
    require("../services/BlockchainStatusService");

const router =
    express.Router();

router.get(

    "/status/:email",

    async (req, res) => {

        const result =
            await statusService
                .getStatus(

                    req.params.email

                );

        res.json(result);

    });

module.exports =
    router;