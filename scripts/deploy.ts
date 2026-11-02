import hre from "hardhat";
const { ethers } = hre;
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  if (!deployer) {
    console.error("==================================================");
    console.error("ERROR: No deployer account found!");
    console.error("Please provide PRIVATE_KEY in your .env file or environment variable.");
    console.error("Example: PRIVATE_KEY=0xabcdef...");
    console.error("==================================================");
    process.exit(1);
  }

  console.log("--------------------------------------------------");
  console.log("Deploying RentRoll contract with account:", deployer.address);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "BOHR");
  console.log("--------------------------------------------------");

  const RentRollFactory = await ethers.getContractFactory("RentRoll");
  console.log("Deploying RentRoll contract...");
  const rentRoll = await RentRollFactory.deploy();

  await rentRoll.waitForDeployment();
  const contractAddress = await rentRoll.getAddress();

  console.log("RentRoll successfully deployed to:", contractAddress);
  console.log("--------------------------------------------------");

  // Update or append NEXT_PUBLIC_CONTRACT_ADDRESS in .env
  const envPath = path.join(process.cwd(), ".env");
  let envContent = "";
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf-8");
  }

  if (envContent.includes("NEXT_PUBLIC_CONTRACT_ADDRESS=")) {
    envContent = envContent.replace(
      /NEXT_PUBLIC_CONTRACT_ADDRESS=.*/g,
      `NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`
    );
  } else {
    envContent += `\nNEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}\n`;
  }

  fs.writeFileSync(envPath, envContent.trim() + "\n");
  console.log("Saved deployed contract address to .env");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
