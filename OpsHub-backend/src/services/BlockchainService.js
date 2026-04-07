const { ethers } =
    require("ethers");

require("dotenv").config();

const artifact =
    require("../../abi/BusinessRegistry.json");

const abi =
    artifact.abi;

const provider =
    new ethers.JsonRpcProvider(

        process.env.RPC_URL

    );

const serverWallet =
    new ethers.Wallet(

        process.env.SERVER_PRIVATE_KEY,

        provider

    );

const contract =
    new ethers.Contract(

        process.env.CONTRACT_ADDRESS,

        abi,

        serverWallet

    );

async function registerBusiness(

    wallet,
    name

) {

    const tx =
        await contract
            .registerBusiness(

                wallet,
                name

            );

    await tx.wait();

    return tx.hash;

}

async function getBusiness(address) {

    return await contract
        .getBusiness(address);

}

module.exports = {

    registerBusiness,
    getBusiness,
    provider

};