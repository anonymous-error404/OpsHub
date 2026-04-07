const db =
require("../config/db");

async function findByEmail(email){

const result =
await db.query(

"SELECT * FROM users WHERE email=$1",

[email]

);

return result.rows[0];

}

async function enableBlockchain(

userId,
wallet,
encryptedKey,
tx

){

await db.query(

`UPDATE users
SET wallet_address=$1,
wallet_private_key=$2,
blockchain_enabled=true,
blockchain_tx=$3

WHERE id=$4`,

[

wallet,
encryptedKey,
tx,
userId

]

);

}

module.exports={

findByEmail,
enableBlockchain

};