const {ethers}=
require("ethers");

const crypto=
require("crypto");

require("dotenv").config();

const artifact=
require("../../abi/TransactionLedger.json");

const abi=
artifact.abi;

const provider=
new ethers.JsonRpcProvider(

process.env.RPC_URL
);

const serverWallet=
new ethers.Wallet(

process.env.SERVER_PRIVATE_KEY,

provider
);

const contract=
new ethers.Contract(

process.env.TX_CONTRACT,

abi,

serverWallet

);

async function recordPayment(

from,
to,
amount,
paymentId,
paymentData

){

const metadataHash=
crypto
.createHash("sha256")
.update(

JSON.stringify(paymentData)

)
.digest("hex");

const tx=
await contract
.recordTransaction(

from,
to,
amount,
paymentId,
metadataHash

);

await tx.wait();

return{

blockchainHash:
tx.hash,

metadataHash

};

}

async function getTransaction(id){

return await contract
.getTransaction(id);

}

module.exports={

recordPayment,
getTransaction

};