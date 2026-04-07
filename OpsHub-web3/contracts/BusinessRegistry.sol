// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

contract BusinessRegistry {

struct Business{

string name;

address owner;

uint created;

bool exists;

}

mapping(address=>Business)
public businesses;

event BusinessRegistered(

address owner,
string name

);

function registerBusiness(

address owner,
string memory name

) public {

require(

!businesses[owner].exists,

"Already registered"

);

businesses[owner]=
Business(

name,
owner,
block.timestamp,
true

);

emit BusinessRegistered(

owner,
name

);

}

function getBusiness(

address user

)

public view

returns(

string memory,
address,
uint,
bool

)

{

Business memory b=
businesses[user];

return(

b.name,
b.owner,
b.created,
b.exists

);

}

}