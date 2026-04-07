const { buildModule } =
require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule(

"TransactionLedgerModule",

(m)=>{

const ledger =
m.contract("TransactionLedger");

return { ledger };

});