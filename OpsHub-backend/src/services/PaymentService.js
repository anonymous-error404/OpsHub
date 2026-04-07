const txService =
require("./TransactionService");

const repo =
require("./PaymentRepository");

async function processPayment(payment){

const from =
payment.notes.fromWallet;

const to =
payment.notes.toWallet;

const amount =
payment.amount;

const paymentId =
payment.id;

const result =
await txService
.recordPayment(

from,
to,
amount,
paymentId,
payment

);

// store off chain

await repo.savePayment(

paymentId,
from,
to,
amount,
result.metadataHash,
result.blockchainHash,
payment

);

return result;

}

module.exports={

processPayment

};