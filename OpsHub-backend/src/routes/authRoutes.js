const express =
    require("express");

const auth =
    require("../services/AuthService");

const onboarding =
    require("../services/BlockchainOnboardingService");

const userService =
    require("../services/UserService");

const router =
    express.Router();

router.post(

    "/login",

    async (req, res) => {

        try {

            const {

                email,
                password

            } = req.body;


            const data =
                await auth.login(

                    email,
                    password

                );

            res.json(data);

        }
        catch (e) {

            res.status(500)
                .json({

                    error: e.message

                });

        }

    });

router.post(

    "/enable-blockchain",

    async (req, res) => {

        try {

            const { email } =
                req.body;

            const user =
                await userService
                    .findByEmail(email);

            const result =
                await onboarding
                    .enableForUser(user);

            res.json(result);

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