import { ethers, TransactionReceipt, ContractTransactionResponse } from 'ethers';
import fs from 'fs';
import path from 'path';
import logger from '../utils/logger';

let provider: ethers.JsonRpcProvider;
let adminWallet: ethers.Wallet;

// Contract instances cache
const contracts: Record<string, ethers.Contract> = {};

function getProvider(): ethers.JsonRpcProvider {
  if (!provider) {
    const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || 'http://127.0.0.1:8545';
    provider = new ethers.JsonRpcProvider(rpcUrl);
  }
  return provider;
}

let adminSigner: ethers.NonceManager | null = null;

function getAdminWallet(): ethers.ContractRunner {
  if (!adminSigner) {
    const privateKey = process.env.ADMIN_PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
    const rawWallet = new ethers.Wallet(privateKey, getProvider());
    adminSigner = new ethers.NonceManager(rawWallet);
  }
  return adminSigner;
}

function loadContractAddresses(): Record<string, string> {
  try {
    const filePath = path.resolve(__dirname, '../config/contractAddresses.json');
    if (!fs.existsSync(filePath)) {
      logger.warn('contractAddresses.json not found — blockchain calls will fail');
      return {};
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(data);
    return parsed.contracts || parsed;
  } catch (err) {
    logger.warn('contractAddresses.json could not be loaded: ' + err);
    return {};
  }
}

function loadABI(contractName: string): ethers.InterfaceAbi {
  try {
    const abiPath = path.resolve(__dirname, '../config/abis', `${contractName}.json`);
    if (!fs.existsSync(abiPath)) {
      logger.warn(`ABI for ${contractName} not found at ${abiPath}`);
      return [];
    }
    const data = fs.readFileSync(abiPath, 'utf-8');
    const parsed = JSON.parse(data);
    return parsed.abi || parsed;
  } catch (err) {
    logger.warn(`ABI for ${contractName} could not be loaded: ` + err);
    return [];
  }
}

function getContract(name: string): ethers.Contract {
  if (!contracts[name]) {
    const addresses = loadContractAddresses();
    const address = addresses[name];
    if (!address) throw new Error(`Contract address for ${name} not configured`);
    const abi = loadABI(name);
    contracts[name] = new ethers.Contract(address, abi, getAdminWallet());
  }
  return contracts[name];
}

async function sendTx(contractName: string, method: string, args: unknown[]): Promise<TransactionReceipt> {
  const contract = getContract(contractName);
  try {
    const tx: ContractTransactionResponse = await (contract[method] as (...a: unknown[]) => Promise<ContractTransactionResponse>)(...args);
    const receipt = await tx.wait();
    if (!receipt) throw new Error(`Transaction ${method} returned null receipt`);
    return receipt;
  } catch (err: any) {
    if (adminSigner) {
      adminSigner.reset();
    }
    throw err;
  }
}

// ─── MedicalRecords ───────────────────────────────────────────────────────────

export async function registerRecord(
  recordId: string,
  patientAddress: string,
  documentHash: string,
  category: number
): Promise<TransactionReceipt> {
  const recordIdBytes32 = ethers.id(recordId);
  const docHashBytes32 = ethers.zeroPadValue('0x' + documentHash, 32);
  return sendTx('MedicalRecords', 'registerRecord', [
    recordIdBytes32,
    patientAddress,
    docHashBytes32,
    category,
  ]);
}

export async function getDocumentHash(recordId: string): Promise<string> {
  const contract = getContract('MedicalRecords');
  const recordIdBytes32 = ethers.id(recordId);
  const hash: string = await (contract['getDocumentHash'] as (id: string) => Promise<string>)(recordIdBytes32);
  return hash;
}

// ─── MediAccessControl ────────────────────────────────────────────────────────

export async function createAccessRequest(
  requestId: string,
  patientAddress: string,
  isEmergency: boolean,
  reason: string,
  durationSeconds: number
): Promise<TransactionReceipt> {
  const requestIdBytes32 = ethers.id(requestId);
  return sendTx('MediAccessControl', 'createRequest', [
    requestIdBytes32,
    patientAddress,
    isEmergency,
    reason,
    durationSeconds,
  ]);
}

export async function approveAccessRequest(requestId: string): Promise<TransactionReceipt> {
  const requestIdBytes32 = ethers.id(requestId);
  return sendTx('MediAccessControl', 'approveRequest', [requestIdBytes32]);
}

export async function rejectAccessRequest(requestId: string): Promise<TransactionReceipt> {
  const requestIdBytes32 = ethers.id(requestId);
  return sendTx('MediAccessControl', 'rejectRequest', [requestIdBytes32]);
}

export async function revokeAccess(requestId: string): Promise<TransactionReceipt> {
  const requestIdBytes32 = ethers.id(requestId);
  return sendTx('MediAccessControl', 'revokeAccess', [requestIdBytes32]);
}

export async function hasValidAccess(
  doctorAddress: string,
  patientAddress: string
): Promise<boolean> {
  const contract = getContract('MediAccessControl');
  const result: boolean = await (contract['hasValidAccess'] as (d: string, p: string) => Promise<boolean>)(
    doctorAddress,
    patientAddress
  );
  return result;
}

// ─── AuditLog ────────────────────────────────────────────────────────────────

export async function logAuditEvent(
  eventType: number,
  actor: string,
  subject: string,
  metadataHash: string
): Promise<TransactionReceipt> {
  const metaBytes32 = ethers.zeroPadValue('0x' + metadataHash.replace(/^0x/, ''), 32);
  return sendTx('AuditLog', 'logEvent', [eventType, actor, subject, metaBytes32]);
}
