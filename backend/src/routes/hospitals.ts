import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { query } from '../config/database';
import { RowDataPacket } from 'mysql2';
import logger from '../utils/logger';

const router = Router();

/**
 * GET /api/hospitals
 */
router.get('/', authenticateToken, async (_req: Request, res: Response): Promise<void> => {
  try {
    const rows = await query<RowDataPacket[]>(
      `SELECT u.id, u.wallet_address, u.status,
              h.name, h.registration_number, h.address, h.phone, h.email
       FROM users u
       JOIN hospitals h ON h.user_id = u.id
       WHERE u.role = 'hospital' AND u.status = 'approved'
       ORDER BY h.name`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    logger.error('List hospitals failed', err);
    res.status(500).json({ success: false, error: 'Failed to fetch hospitals' });
  }
});

export default router;
