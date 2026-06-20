const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const OracleRegistry = await hre.ethers.getContractFactory("OracleRegistry");
  const registry = await OracleRegistry.deploy();
  await registry.deployed();

  console.log("OracleRegistry deployed to:", registry.address);
  console.log("Network:", hre.network.name);
  console.log("Owner:", deployer.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
