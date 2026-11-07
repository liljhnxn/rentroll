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

  const network = await ethers.provider.getNetwork();
  const feeData = await ethers.provider.getFeeData();
  const balance = await ethers.provider.getBalance(deployer.address);

  console.log("--------------------------------------------------");
  console.log("Target Network Chain ID:", network.chainId.toString());
  console.log("Deployer Address:", deployer.address);
  console.log("Deployer Balance:", ethers.formatEther(balance));
  console.log("Current Gas Price:", feeData.gasPrice ? ethers.formatUnits(feeData.gasPrice, "gwei") + " gwei" : "N/A");
  console.log("--------------------------------------------------");

  const RentRollFactory = await ethers.getContractFactory("RentRoll");
  console.log("Deploying RentRoll contract with minimal gas...");

  const rentRoll = await RentRollFactory.deploy();

  await rentRoll.waitForDeployment();
  const contractAddress = await rentRoll.getAddress();

  console.log("==================================================");
  console.log("RentRoll successfully deployed to:", contractAddress);
  console.log("==================================================");

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
  console.log("Updated NEXT_PUBLIC_CONTRACT_ADDRESS in .env");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
