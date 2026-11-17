import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import * as authService from '../services/authService';
import { query } from '../config/database';
import { RowDataPacket } from 'mysql2';
import logger from '../utils/logger';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  message: { success: false, error: 'Too many requests, please try again later.' },
});

/**
 * POST /api/auth/nonce
 * Returns or creates nonce for the wallet address
 */
router.post(
  '/nonce',
  authLimiter,
  [body('walletAddress').isEthereumAddress().withMessage('Invalid wallet address')],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, error: 'Validation failed', details: errors.array() });
      return;
    }

    try {
      const { walletAddress } = req.body as { walletAddress: string };
      const nonce = await authService.generateNonce(walletAddress);
      const message = `Sign this message to authenticate with MediChain.\nNonce: ${nonce}`;
      res.json({ success: true, data: { nonce, message } });
    } catch (err) {
      logger.error('Nonce generation failed', err);
      res.status(500).json({ success: false, error: 'Failed to generate nonce' });
    }
  }
);

/**
 * POST /api/auth/verify
 * Verify wallet signature and return JWT
 */
router.post(
  '/verify',
  authLimiter,
  [
    body('walletAddress').isEthereumAddress(),
    body('nonce').notEmpty(),
    body('signature').notEmpty(),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, error: 'Validation failed', details: errors.array() });
      return;
    }

    try {
      const { walletAddress, nonce, signature } = req.body as {
        walletAddress: string;
        nonce: string;
        signature: string;
      };

      const user = await authService.getUserByWallet(walletAddress);
      if (!user) {
        res.status(404).json({ success: false, error: 'User not found. Please register first.' });
        return;
      }

      if (user.nonce !== nonce) {
        res.status(401).json({ success: false, error: 'Invalid nonce' });
        return;
      }

      const valid = await authService.verifySignature(walletAddress, nonce, signature);
      if (!valid) {
        res.status(401).json({ success: false, error: 'Invalid signature' });
        return;
      }

      await authService.refreshNonce(walletAddress);

      const token = authService.generateJWT(user.id, user.wallet_address, user.role, user.status);
      res.json({
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            walletAddress: user.wallet_address,
            role: user.role,
            status: user.status,
          },
        },
      });
    } catch (err) {
      logger.error('Signature verification failed', err);
      res.status(500).json({ success: false, error: 'Authentication failed' });
    }
  }
);

/**
 * GET /api/auth/demo-accounts
 * Returns current names and roles from the database for the demo accounts
 */
router.get('/demo-accounts', async (req: Request, res: Response): Promise<void> => {
  try {
    const demoWallets = [
      '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
      '0x90f79bf6eb2c4f870365e785982e1f101e93b906',
      '0x9965507d1a55bcc2695c58ba16fb37d819b0a4dc',
      '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
    ];

    const rows = await query<RowDataPacket[]>(
      `SELECT u.wallet_address, u.role,
              p.first_name as pat_first, p.last_name as pat_last, p.patient_code,
              d.first_name as doc_first, d.last_name as doc_last, d.doctor_code, d.specialization,
              h.name as hosp_name, h.hospital_code
       FROM users u
       LEFT JOIN patients p ON p.user_id = u.id
       LEFT JOIN doctors d ON d.user_id = u.id
       LEFT JOIN hospitals h ON h.user_id = u.id
       WHERE LOWER(u.wallet_address) IN (?, ?, ?, ?)`,
      demoWallets
    );

    const accountMap: Record<string, { name: string; code?: string }> = {};
    for (const r of rows) {
      const addr = (r['wallet_address'] as string).toLowerCase();
      if (r['role'] === 'patient') {
        const full = `${r['pat_first'] || ''} ${r['pat_last'] || ''}`.trim() || 'Patient';
        accountMap[addr] = { name: full, code: r['patient_code'] || 'PAT001' };
      } else if (r['role'] === 'doctor') {
        const full = `Dr. ${r['doc_first'] || ''} ${r['doc_last'] || ''}`.trim();
        accountMap[addr] = { name: full, code: r['specialization'] || r['doctor_code'] || 'Cardiology' };
      } else if (r['role'] === 'hospital') {
        accountMap[addr] = { name: r['hosp_name'] || 'Hospital', code: r['hospital_code'] || 'HOS001' };
      } else if (r['role'] === 'admin') {
        accountMap[addr] = { name: 'Administrator', code: 'SYS' };
      }
    }

    res.json({ success: true, data: accountMap });
  } catch (err: any) {
    logger.error('Failed to get demo accounts', err);
    res.status(500).json({ success: false, error: 'Failed to get demo accounts' });
  }
});

/**
 * GET /api/auth/wallet-info/:address
 * Checks if a wallet is registered and returns public name/role info
 */
router.get('/wallet-info/:address', async (req: Request, res: Response): Promise<void> => {
  try {
    const address = req.params.address.toLowerCase();
    const rows = await query<RowDataPacket[]>(
      `SELECT u.id, u.wallet_address, u.role, u.status,
              p.first_name as pat_first, p.last_name as pat_last, p.patient_code,
              d.first_name as doc_first, d.last_name as doc_last, d.doctor_code,
              h.name as hosp_name, h.hospital_code
       FROM users u
       LEFT JOIN patients p ON p.user_id = u.id
       LEFT JOIN doctors d ON d.user_id = u.id
       LEFT JOIN hospitals h ON h.user_id = u.id
       WHERE LOWER(u.wallet_address) = ? LIMIT 1`,
      [address]
    );

    if (rows.length === 0) {
      res.json({ success: true, data: { registered: false } });
      return;
    }

    const r = rows[0];
    let name = 'User';
    let code = '';
    if (r['role'] === 'patient') {
      name = `${r['pat_first'] || ''} ${r['pat_last'] || ''}`.trim() || 'Patient';
      code = r['patient_code'] || '';
    } else if (r['role'] === 'doctor') {
      name = `Dr. ${r['doc_first'] || ''} ${r['doc_last'] || ''}`.trim();
      code = r['doctor_code'] || '';
    } else if (r['role'] === 'hospital') {
      name = r['hosp_name'] || 'Hospital';
      code = r['hospital_code'] || '';
    } else if (r['role'] === 'admin') {
      name = 'Administrator';
      code = 'SYS';
    }

    res.json({
      success: true,
      data: {
        registered: true,
        id: r['id'],
        role: r['role'],
        status: r['status'],
        name,
        code,
      },
    });
  } catch (err: any) {
    logger.error('Failed to get wallet info', err);
    res.status(500).json({ success: false, error: 'Failed to check wallet info' });
  }
});

export default router;
