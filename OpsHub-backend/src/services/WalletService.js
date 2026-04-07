const { ethers } =
    require("ethers");

const enc =
    require("../utils/Encryption");

function createWallet() {

    const wallet =
        ethers.Wallet
            .createRandom();

    return {

        address:
            wallet.address,

        privateKey:
            enc.encrypt(
                wallet.privateKey
            )

    };

}

function loadWallet(

    encryptedKey,
    provider

) {

    const key =
        enc.decrypt(
            encryptedKey
        );

    return new ethers.Wallet(
        key,
        provider
    );

}

module.exports = {

    createWallet,
    loadWallet

};