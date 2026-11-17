import crypto from 'crypto';

/**
 * Generate a SHA-256 hex hash of a string.
 */
export function sha256(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * Generate a random hex nonce of given byte length.
 */
export function generateNonce(byteLength = 32): string {
  return crypto.randomBytes(byteLength).toString('hex');
}

/**
 * Convert hex string to bytes32 (0x-prefixed, 32-byte padded).
 */
export function hexToBytes32(hex: string): string {
  const clean = hex.replace(/^0x/, '').padStart(64, '0');
  return '0x' + clean;
}
