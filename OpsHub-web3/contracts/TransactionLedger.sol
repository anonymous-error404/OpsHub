// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

contract TransactionLedger {

address public owner;

struct Transaction{

uint id;

address from;

address to;

uint amount;

string razorpayPaymentId;

string metadataHash;

uint timestamp;

}

uint public txCounter;

mapping(uint=>Transaction)
public transactions;

mapping(address=>uint[])
public businessTransactions;

event TransactionRecorded(

uint id,

address from,

address to,

uint amount,

string paymentId

);

modifier onlyOwner(){

require(

msg.sender==owner,

"Not authorized"

);

_;

}

constructor(){

owner=msg.sender;

}

function recordTransaction(

address from,

address to,

uint amount,

string memory paymentId,

string memory metadataHash

)

public

onlyOwner

{

require(

from!=address(0),

"Invalid sender"

);

require(

to!=address(0),

"Invalid receiver"

);

txCounter++;

transactions[txCounter]=Transaction(

txCounter,

from,

to,

amount,

paymentId,

metadataHash,

block.timestamp

);

businessTransactions[from]
.push(txCounter);

businessTransactions[to]
.push(txCounter);

emit TransactionRecorded(

txCounter,

from,

to,

amount,

paymentId

);

}

function getTransaction(

uint id

)

public view

returns(

uint,
address,
address,
uint,
string memory,
string memory,
uint

){

Transaction memory t=
transactions[id];

return(

t.id,
t.from,
t.to,
t.amount,
t.razorpayPaymentId,
t.metadataHash,
t.timestamp

);

}

function getBusinessTransactions(

address business

)

public view

returns(uint[] memory){

return businessTransactions[business];

}

}