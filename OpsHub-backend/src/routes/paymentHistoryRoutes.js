const express =
    require("express");

const repo =
    require("../services/PaymentRepository");

const userService =
    require("../services/UserService");

const router =
    express.Router();

router.get(

    "/:email",

    async (req, res) => {

        const user =
            await userService
                .findByEmail(

                    req.params.email

                );

        const payments =
            await repo
                .getBusinessPayments(

                    user.wallet_address

                );

        res.json(payments);

    });

module.exports =
    router;