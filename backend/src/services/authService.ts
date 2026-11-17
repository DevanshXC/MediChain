import { ethers } from 'ethers';
import jwt from 'jsonwebtoken';
import { query } from '../config/database';
import { generateNonce as cryptoNonce } from '../utils/hash';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface UserRow extends RowDataPacket {
  id: number;
  wallet_address: string;
  role: string;
  status: string;
  nonce: string;
}

/**
 * Generate (or refresh) a nonce for the given walletAddress.
 * Upserts the user record if it doesn't exist.
 */
export async function generateNonce(walletAddress: string): Promise<string> {
  const nonce = cryptoNonce(16); // 32-hex chars
  const normalized = walletAddress.toLowerCase();

  await query<ResultSetHeader>(
    `INSERT INTO users (wallet_address, nonce, role, status)
     VALUES (?, ?, 'patient', 'pending')
     ON DUPLICATE KEY UPDATE nonce = ?, updated_at = NOW()`,
    [normalized, nonce, nonce]
  );

  return nonce;
}

/**
 * Verify that the signature matches the walletAddress signing the nonce message.
 */
export async function verifySignature(
  walletAddress: string,
  nonce: string,
  signature: string
): Promise<boolean> {
  try {
    const message = `Sign this message to authenticate with MediChain.\nNonce: ${nonce}`;
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === walletAddress.toLowerCase();
  } catch {
    return false;
  }
}

/**
 * Generate a JWT for the user.
 */
export function generateJWT(userId: number, walletAddress: string, role: string, status: string): string {
  const secret = process.env.JWT_SECRET || 'secret';
  const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
  return jwt.sign(
    { id: userId, walletAddress: walletAddress.toLowerCase(), role, status },
    secret,
    { expiresIn } as jwt.SignOptions
  );
}

/**
 * Invalidate the used nonce by setting a new one.
 */
export async function refreshNonce(walletAddress: string): Promise<void> {
  const nonce = cryptoNonce(16);
  await query<ResultSetHeader>(
    `UPDATE users SET nonce = ? WHERE wallet_address = ?`,
    [nonce, walletAddress.toLowerCase()]
  );
}

/**
 * Fetch a user by wallet address.
 */
export async function getUserByWallet(walletAddress: string): Promise<UserRow | null> {
  const rows = await query<UserRow[]>(
    `SELECT id, wallet_address, role, status, nonce FROM users WHERE wallet_address = ? LIMIT 1`,
    [walletAddress.toLowerCase()]
  );
  return rows[0] || null;
}
