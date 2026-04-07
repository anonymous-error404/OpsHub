const { expect } =
require("chai");

const { ethers } =
require("hardhat");

describe(

"BusinessRegistry",

function(){

let contract;

let owner;

let addr1;

beforeEach(

async function(){

[owner,addr1] =
await ethers.getSigners();

const SMB =
await ethers
.getContractFactory(
"BusinessRegistry"
);

contract =
await SMB.deploy();

await contract
.waitForDeployment();

});

it(

"Should register business",

async function(){

await contract
.registerBusiness(

addr1.address,

"SMB Corp"

);

const result =
await contract
.getBusiness(

addr1.address

);

expect(
result[0]
).to.equal(
"SMB Corp"
);

});

it(

"Should prevent duplicate",

async function(){

await contract
.registerBusiness(

addr1.address,

"Test"

);

await expect(

contract
.registerBusiness(

addr1.address,

"Test2"

)

).to.be.reverted;

});

it(

"Should fail if not exists",

async function(){

const result =
await contract
.getBusiness(

addr1.address

);

expect(
result[3]
).to.equal(false);

});

});