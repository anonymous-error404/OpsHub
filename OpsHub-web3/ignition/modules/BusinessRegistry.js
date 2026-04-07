const { buildModule } =
require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule(

"BusinessRegistryModule",

(m)=>{

const businessRegistry =
m.contract("BusinessRegistry");

return {

businessRegistry

};

});