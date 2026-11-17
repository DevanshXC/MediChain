// scripts/deploy.js
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  // ── 1. Deploy UserRegistry ────────────────────────────────────────────────
  console.log("Deploying UserRegistry...");
  const UserRegistry = await ethers.getContractFactory("UserRegistry");
  const userRegistry = await UserRegistry.deploy();
  await userRegistry.waitForDeployment();
  console.log("UserRegistry deployed to:", userRegistry.target);

  // ── 2. Deploy MedicalRecords ──────────────────────────────────────────────
  console.log("\nDeploying MedicalRecords...");
  const MedicalRecords = await ethers.getContractFactory("MedicalRecords");
  const medicalRecords = await MedicalRecords.deploy(userRegistry.target);
  await medicalRecords.waitForDeployment();
  console.log("MedicalRecords deployed to:", medicalRecords.target);

  // ── 3. Deploy MediAccessControl ───────────────────────────────────────────
  console.log("\nDeploying MediAccessControl...");
  const MediAccessControl = await ethers.getContractFactory("MediAccessControl");
  const mediAccessControl = await MediAccessControl.deploy(userRegistry.target);
  await mediAccessControl.waitForDeployment();
  console.log("MediAccessControl deployed to:", mediAccessControl.target);

  // ── 4. Deploy AuditLog ────────────────────────────────────────────────────
  console.log("\nDeploying AuditLog...");
  const AuditLog = await ethers.getContractFactory("AuditLog");
  const auditLog = await AuditLog.deploy();
  await auditLog.waitForDeployment();
  console.log("AuditLog deployed to:", auditLog.target);

  // ── 5. Set deployer as approved logger in AuditLog ────────────────────────
  console.log("\nSetting deployer as approved logger in AuditLog...");
  const tx = await auditLog.setApprovedLogger(deployer.address, true);
  await tx.wait();
  console.log("Deployer approved as logger:", deployer.address);

  // ── 5b. Pre-register and approve demo accounts in UserRegistry ─────────────
  console.log("\nPre-registering demo accounts in UserRegistry...");
  const demoUsers = [
    { address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", role: 1, name: "Alice Nguyen (Patient)" },
    { address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", role: 1, name: "Benjamin Okafor (Patient)" },
    { address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906", role: 2, name: "Dr. Sarah Johnson (Doctor)" },
    { address: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65", role: 2, name: "Dr. Michael Chen (Doctor)" },
    { address: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc", role: 3, name: "City General Hospital (Hospital)" },
  ];

  for (const u of demoUsers) {
    const regTx = await userRegistry.adminRegisterUser(u.address, u.role, ethers.ZeroHash, true);
    await regTx.wait();
    console.log(`  Registered & approved ${u.name}: ${u.address}`);
  }

  // ── 6. Prepare addresses object ───────────────────────────────────────────
  const addresses = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    deployedAt: new Date().toISOString(),
    contracts: {
      UserRegistry: userRegistry.target,
      MedicalRecords: medicalRecords.target,
      MediAccessControl: mediAccessControl.target,
      AuditLog: auditLog.target,
    },
  };

  console.log("\n── Deployed Addresses ──────────────────────────────────────");
  console.log(JSON.stringify(addresses.contracts, null, 2));

  // ── 7. Write contractAddresses.json to backend and frontend ──────────────
  const outputDirs = [
    path.resolve(__dirname, "../../backend/src/config"),
    path.resolve(__dirname, "../../frontend/src/config"),
  ];

  for (const dir of outputDirs) {
    fs.mkdirSync(dir, { recursive: true });
    const outPath = path.join(dir, "contractAddresses.json");
    fs.writeFileSync(outPath, JSON.stringify(addresses, null, 2));
    console.log(`\nAddresses written to: ${outPath}`);

    // ── 8. Copy ABI JSON files ──────────────────────────────────────────────
    const abiDir = path.join(dir, "abis");
    fs.mkdirSync(abiDir, { recursive: true });

    const contractNames = ["UserRegistry", "MedicalRecords", "MediAccessControl", "AuditLog"];
    for (const name of contractNames) {
      const artifactPath = path.resolve(
        __dirname,
        `../artifacts/contracts/${name}.sol/${name}.json`
      );
      if (fs.existsSync(artifactPath)) {
        const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
        const abiOut = path.join(abiDir, `${name}.json`);
        fs.writeFileSync(abiOut, JSON.stringify({ abi: artifact.abi, contractName: name }, null, 2));
        console.log(`ABI copied: ${abiOut}`);
      } else {
        console.warn(`WARNING: Artifact not found for ${name} at ${artifactPath}`);
      }
    }
  }

  console.log("\n✅ Deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
