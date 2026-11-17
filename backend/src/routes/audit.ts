import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { query } from '../config/database';
import { RowDataPacket } from 'mysql2';
import logger from '../utils/logger';

const router = Router();

/**
 * GET /api/audit
 * All audit logs (admin or hospital)
 */
router.get('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query['page'] as string) || 1;
    const limit = parseInt(req.query['limit'] as string) || 50;
    const offset = (page - 1) * limit;

    const rows = await query<RowDataPacket[]>(
      `SELECT al.*, 
              u.wallet_address as actor_wallet,
              u.role as actor_role
       FROM audit_logs al
       LEFT JOIN users u ON al.actor_user_id = u.id
       ORDER BY al.created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const countRows = await query<RowDataPacket[]>(`SELECT COUNT(*) as total FROM audit_logs`);
    const total = (countRows[0] as { total: number })['total'];

    res.json({ success: true, data: { logs: rows, total, page, limit } });
  } catch (err: any) {
    logger.error('Get audit logs failed', err);
    res.status(500).json({ success: false, error: 'Failed to fetch audit logs' });
  }
});

/**
 * GET /api/audit/patient/:patientId
 * Audit trail for a specific patient
 */
router.get('/patient/:patientId', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const patientId = parseInt(req.params['patientId']);

    // Check if requesting user is patient themselves or admin
    if (user.role === 'patient') {
      const patCheck = await query<RowDataPacket[]>(
        `SELECT id FROM patients WHERE user_id = ? AND (id = ? OR user_id = ?)`,
        [user.id, patientId, patientId]
      );
      if (patCheck.length === 0) {
        res.status(403).json({ success: false, error: 'Access denied' });
        return;
      }
    }

    const rows = await query<RowDataPacket[]>(
      `SELECT al.*, 
              u.wallet_address as actor_wallet,
              u.role as actor_role
       FROM audit_logs al
       LEFT JOIN users u ON al.actor_user_id = u.id
       WHERE al.subject_user_id = ? 
          OR al.actor_user_id = ?
          OR al.record_id IN (SELECT id FROM medical_records WHERE patient_id = ?)
       ORDER BY al.created_at DESC
       LIMIT 50`,
      [patientId, patientId, patientId]
    );

    res.json({ success: true, data: rows });
  } catch (err: any) {
    logger.error('Get patient audit logs failed', err);
    res.status(500).json({ success: false, error: 'Failed to fetch patient audit history' });
  }
});

export default router;

