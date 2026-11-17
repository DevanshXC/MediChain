import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { query } from '../config/database';
import { RowDataPacket } from 'mysql2';
import logger from '../utils/logger';

const router = Router();

/**
 * GET /api/doctors
 */
router.get('/', authenticateToken, async (_req: Request, res: Response): Promise<void> => {
  try {
    const rows = await query<RowDataPacket[]>(
      `SELECT d.id as doctor_id, d.doctor_code, d.first_name, d.last_name,
              CONCAT(d.first_name, ' ', d.last_name) as full_name,
              d.license_number, d.specialization, d.qualification, d.phone,
              d.hospital_id, h.name as hospital_name,
              u.id as user_id, u.wallet_address, u.status
       FROM doctors d
       JOIN users u ON d.user_id = u.id
       LEFT JOIN hospitals h ON d.hospital_id = h.id
       WHERE u.role = 'doctor'
       ORDER BY d.first_name ASC`
    );
    res.json({ success: true, data: rows });
  } catch (err: any) {
    logger.error('List doctors failed', err);
    res.status(500).json({ success: false, error: 'Failed to fetch doctors' });
  }
});

/**
 * GET /api/doctors/search?q=
 */
router.get('/search', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const q = `%${(req.query['q'] as string) || ''}%`;
    const rows = await query<RowDataPacket[]>(
      `SELECT d.id as doctor_id, d.doctor_code, d.first_name, d.last_name,
              CONCAT(d.first_name, ' ', d.last_name) as full_name,
              d.license_number, d.specialization, d.phone,
              d.hospital_id, h.name as hospital_name,
              u.id as user_id, u.wallet_address, u.status
       FROM doctors d
       JOIN users u ON d.user_id = u.id
       LEFT JOIN hospitals h ON d.hospital_id = h.id
       WHERE (d.first_name LIKE ? OR d.last_name LIKE ? OR d.license_number LIKE ? OR d.specialization LIKE ?)
       ORDER BY d.first_name ASC LIMIT 50`,
      [q, q, q, q]
    );
    res.json({ success: true, data: rows });
  } catch (err: any) {
    logger.error('Doctor search failed', err);
    res.status(500).json({ success: false, error: 'Search failed' });
  }
});

export default router;
