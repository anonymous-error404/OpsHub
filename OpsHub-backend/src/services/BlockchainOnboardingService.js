const walletService=
require("./WalletService");

const blockchain=
require("./BlockchainService");

const userService=
require("./UserService");

async function enableForUser(user){

if(user.blockchain_enabled){

return{

message:
"Already enabled",

wallet:
user.wallet_address

};

}

// create wallet

const wallet=
walletService
.createWallet();

// register business

const tx=
await blockchain
.registerBusiness(

wallet.address,
user.name

);

// store

await userService
.enableBlockchain(

user.id,

wallet.address,

wallet.privateKey,

tx

);

return{

wallet:
wallet.address,

tx:tx

};

}

module.exports={

enableForUser

};