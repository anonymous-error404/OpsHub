// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

contract EscrowRegistry {

address public owner;

struct EscrowDeal{

uint id;

string escrowId;

address buyer;

address seller;

uint amount;

string status;

string metadataHash;

uint timestamp;

}

uint public dealCounter;

mapping(uint=>EscrowDeal)
public deals;

event EscrowCreated(

uint id,
string escrowId,
address buyer,
address seller,
uint amount

);

event EscrowCompleted(

uint id,
string status

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

function recordEscrow(

string memory escrowId,

address buyer,

address seller,

uint amount,

string memory status,

string memory metadataHash

)

public

onlyOwner

{

dealCounter++;

deals[dealCounter]=EscrowDeal(

dealCounter,
escrowId,
buyer,
seller,
amount,
status,
metadataHash,
block.timestamp

);

emit EscrowCreated(

dealCounter,
escrowId,
buyer,
seller,
amount

);

}

function completeEscrow(

uint id,

string memory status

)

public

onlyOwner

{

deals[id].status=status;

emit EscrowCompleted(

id,
status

);

}

function getEscrow(uint id)

public view

returns(

uint,
string memory,
address,
address,
uint,
string memory,
string memory,
uint

){

EscrowDeal memory d=
deals[id];

return(

d.id,
d.escrowId,
d.buyer,
d.seller,
d.amount,
d.status,
d.metadataHash,
d.timestamp

);

}

}