const { expect } =
require("chai");

const { ethers } =
require("hardhat");

describe(

"TransactionLedger",

function(){

let contract;

let owner;

let addr1;

let addr2;

beforeEach(

async function(){

[owner,addr1,addr2]=
await ethers.getSigners();

const Ledger=
await ethers
.getContractFactory(
"TransactionLedger"
);

contract=
await Ledger.deploy();

await contract
.waitForDeployment();

});

it(

"Should create transaction",

async function(){

await contract
.connect(addr1)
.createTransaction(

addr2.address,

100,

"Supply payment"

);

const tx=
await contract
.getTransaction(1);

expect(tx[3])
.to.equal(100);

});

it(

"Should complete transaction",

async function(){

await contract
.connect(addr1)
.createTransaction(

addr2.address,

100,

"Test"

);

await contract
.connect(addr2)
.completeTransaction(1);

const tx=
await contract
.getTransaction(1);

expect(tx[6])
.to.equal(true);

});

});