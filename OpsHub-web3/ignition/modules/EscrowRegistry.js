const { buildModule } =
require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule(

"EscrowRegistryModule",

(m)=>{

const escrow =
m.contract("EscrowRegistry");

return { escrow };

});