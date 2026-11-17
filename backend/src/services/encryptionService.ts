import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const KEY_HEX = process.env.ENCRYPTION_KEY || '0'.repeat(64);
const ENCRYPTION_KEY = Buffer.from(KEY_HEX, 'hex');

export interface EncryptedResult {
  encrypted: Buffer;
  iv: string;
  authTag: string;
}

/**
 * Encrypt a buffer using AES-256-GCM.
 * Returns encrypted payload with iv and authTag prepended:
 *   [12-byte IV][16-byte authTag][ciphertext]
 */
export function encrypt(buffer: Buffer): Buffer {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]);
}

/**
 * Decrypt a buffer that was encrypted with encrypt().
 * Expects [12-byte IV][16-byte authTag][ciphertext] layout.
 */
export function decrypt(combined: Buffer): Buffer {
  const iv = combined.subarray(0, 12);
  const authTag = combined.subarray(12, 28);
  const ciphertext = combined.subarray(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

/**
 * Compute SHA-256 hex hash of a buffer.
 */
export function generateFileHash(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Save encrypted file to disk.
 */
export function saveEncryptedFile(encryptedBuffer: Buffer, filename: string): string {
  const uploadDir = process.env.UPLOAD_DIR || './uploads/encrypted';
  const absDir = path.resolve(uploadDir);
  if (!fs.existsSync(absDir)) {
    fs.mkdirSync(absDir, { recursive: true });
  }
  const filePath = path.join(absDir, filename);
  fs.writeFileSync(filePath, encryptedBuffer);
  return filePath;
}

/**
 * Load encrypted file from disk.
 */
export function loadEncryptedFile(filename: string): Buffer {
  const uploadDir = process.env.UPLOAD_DIR || './uploads/encrypted';
  const filePath = path.join(path.resolve(uploadDir), filename);
  return fs.readFileSync(filePath);
}
