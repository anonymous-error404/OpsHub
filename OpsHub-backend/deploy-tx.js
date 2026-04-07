const { ethers } = require("ethers");
const fs = require("fs");

async function main() {
    console.log("Deploying fresh TransactionLedger...");
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const wallet = new ethers.Wallet(process.env.SERVER_PRIVATE_KEY, provider);
    const artifact = JSON.parse(fs.readFileSync("abi/TransactionLedger.json"));
    
    // Deploy the contract to Sepolia instantly using the backend test private key
    const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
    const contract = await factory.deploy();
    await contract.waitForDeployment();
    
    const address = await contract.getAddress();
    console.log("=== DONE ===");
    console.log("FRESH_TX_CONTRACT=" + address);
}

main().catch(console.error);
