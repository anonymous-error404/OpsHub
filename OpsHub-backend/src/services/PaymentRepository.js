const db =
require("../config/db");

async function savePayment(

paymentId,
from,
to,
amount,
metadataHash,
blockchainTx,
json

){

await db.query(

`INSERT INTO payments
(razorpay_payment_id,
from_wallet,
to_wallet,
amount,
metadata_hash,
blockchain_tx,
payment_json)

VALUES($1,$2,$3,$4,$5,$6,$7)`,

[

paymentId,
from,
to,
amount,
metadataHash,
blockchainTx,
json

]

);

}

async function getBusinessPayments(wallet){

const result =
await db.query(

`SELECT * FROM payments
WHERE from_wallet=$1
OR to_wallet=$1
ORDER BY created_at DESC`,

[wallet]

);

return result.rows;

}

module.exports={

savePayment,
getBusinessPayments

};