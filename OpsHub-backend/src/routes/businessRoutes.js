const express =
    require("express");

const service =
    require("../services/BusinessService");

const blockchain =
    require("../services/BlockchainService");

const router =
    express.Router();

router.post(

    "/onboard",

    async (req, res) => {

        try {

            const { name } =
                req.body;

            const business =
                await service
                    .onboardBusiness(name);

            res.json(

                business

            );

        }

        catch (e) {

            res.status(500)
                .json({

                    error: e.message

                });

        }

    });

router.get(

    "/:address",

    async (req, res) => {

        const data =
            await blockchain
                .getBusiness(

                    req.params.address

                );

        res.json(data);

    });

module.exports =
    router;