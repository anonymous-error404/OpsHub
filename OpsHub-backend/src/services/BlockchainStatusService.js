const userService =
    require("./UserService");

async function getStatus(email) {

    const user =
        await userService
            .findByEmail(email);

    return {

        enabled:
            user.blockchain_enabled,

        wallet:
            user.wallet_address,

        tx:
            user.blockchain_tx

    };

}

module.exports = {

    getStatus

};