import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { query } from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import * as blockchain from '../services/blockchainService';
import logger from '../utils/logger';

const router = Router();

/**
 * GET /api/admin/stats
 */
router.get('/stats', authenticateToken, requireRole('admin'), async (_req: Request, res: Response): Promise<void> => {
  try {
    const [userCounts] = await query<RowDataPacket[]>(
      `SELECT 
         COUNT(*) as total_users,
         SUM(role = 'patient') as total_patients,
         SUM(role = 'doctor') as total_doctors,
         SUM(role = 'hospital') as total_hospitals,
         SUM(status = 'pending') as pending_approvals,
         SUM(status = 'suspended') as suspended_users
       FROM users`
    );

    const [recordCounts] = await query<RowDataPacket[]>(
      `SELECT COUNT(*) as total_records FROM medical_records`
    );

    const [accessCounts] = await query<RowDataPacket[]>(
      `SELECT 
         COUNT(*) as total_requests,
         SUM(status = 'approved') as active_permissions
       FROM access_requests`
    );

    const [categoryCounts] = await query<RowDataPacket[]>(
      `SELECT category, COUNT(*) as count FROM medical_records GROUP BY category`
    );

    res.json({
      success: true,
      data: {
        users: userCounts,
        records: recordCounts,
        access: accessCounts,
        categories: categoryCounts,
      },
    });
  } catch (err: any) {
    logger.error('Admin stats failed', err);
    res.status(500).json({ success: false, error: 'Failed to fetch admin stats' });
  }
});

/**
 * GET /api/admin/pending
 */
router.get('/pending', authenticateToken, requireRole('admin'), async (_req: Request, res: Response): Promise<void> => {
  try {
    const pendingDoctors = await query<RowDataPacket[]>(
      `SELECT d.id as doctor_id, d.doctor_code, d.first_name, d.last_name,
              CONCAT(d.first_name, ' ', d.last_name) as full_name,
              d.license_number, d.specialization, d.qualification, d.phone,
              u.id as user_id, u.wallet_address, u.status, u.created_at
       FROM doctors d
       JOIN users u ON d.user_id = u.id
       WHERE u.status = 'pending'
       ORDER BY u.created_at ASC`
    );

    const pendingHospitals = await query<RowDataPacket[]>(
      `SELECT h.id as hospital_id, h.hospital_code, h.name, h.registration_number,
              h.address, h.phone, h.email, h.website,
              u.id as user_id, u.wallet_address, u.status, u.created_at
       FROM hospitals h
       JOIN users u ON h.user_id = u.id
       WHERE u.status = 'pending'
       ORDER BY u.created_at ASC`
    );

    res.json({
      success: true,
      data: {
        doctors: pendingDoctors,
        hospitals: pendingHospitals,
      },
    });
  } catch (err: any) {
    logger.error('Admin pending approvals failed', err);
    res.status(500).json({ success: false, error: 'Failed to fetch pending approvals' });
  }
});

/**
 * POST /api/admin/approve-doctor
 */
router.post('/approve-doctor', authenticateToken, requireRole('admin'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { doctorId, userId } = req.body;
    const targetUserId = userId || (
      await query<RowDataPacket[]>(`SELECT user_id FROM doctors WHERE id = ? LIMIT 1`, [doctorId])
    )[0]?.['user_id'];

    if (!targetUserId) {
      res.status(400).json({ success: false, error: 'Invalid doctorId or userId' });
      return;
    }

    const userRows = await query<RowDataPacket[]>(
      `SELECT wallet_address FROM users WHERE id = ? LIMIT 1`,
      [targetUserId]
    );

    await query(
      `UPDATE users SET status = 'approved', updated_at = NOW() WHERE id = ?`,
      [targetUserId]
    );

    await query(
      `UPDATE doctors SET approved_at = NOW() WHERE user_id = ?`,
      [targetUserId]
    );

    // Audit log
    await query(
      `INSERT INTO audit_logs (event_type, actor_user_id, subject_user_id, description)
       VALUES ('DOCTOR_APPROVED', ?, ?, 'Admin approved doctor account')`,
      [req.user!.id, targetUserId]
    );

    res.json({ success: true, message: 'Doctor approved successfully' });
  } catch (err: any) {
    logger.error('Approve doctor failed', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to approve doctor' });
  }
});

/**
 * POST /api/admin/approve-hospital
 */
router.post('/approve-hospital', authenticateToken, requireRole('admin'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { hospitalId, userId } = req.body;
    const targetUserId = userId || (
      await query<RowDataPacket[]>(`SELECT user_id FROM hospitals WHERE id = ? LIMIT 1`, [hospitalId])
    )[0]?.['user_id'];

    if (!targetUserId) {
      res.status(400).json({ success: false, error: 'Invalid hospitalId or userId' });
      return;
    }

    await query(
      `UPDATE users SET status = 'approved', updated_at = NOW() WHERE id = ?`,
      [targetUserId]
    );

    await query(
      `UPDATE hospitals SET approved_at = NOW() WHERE user_id = ?`,
      [targetUserId]
    );

    // Audit log
    await query(
      `INSERT INTO audit_logs (event_type, actor_user_id, subject_user_id, description)
       VALUES ('HOSPITAL_APPROVED', ?, ?, 'Admin approved hospital account')`,
      [req.user!.id, targetUserId]
    );

    res.json({ success: true, message: 'Hospital approved successfully' });
  } catch (err: any) {
    logger.error('Approve hospital failed', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to approve hospital' });
  }
});

/**
 * POST /api/admin/suspend-user
 */
router.post('/suspend-user', authenticateToken, requireRole('admin'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.body;
    if (!userId) {
      res.status(400).json({ success: false, error: 'userId is required' });
      return;
    }

    await query(
      `UPDATE users SET status = 'suspended', updated_at = NOW() WHERE id = ?`,
      [userId]
    );

    await query(
      `INSERT INTO audit_logs (event_type, actor_user_id, subject_user_id, description)
       VALUES ('USER_SUSPENDED', ?, ?, 'Admin suspended user account')`,
      [req.user!.id, userId]
    );

    res.json({ success: true, message: 'User suspended successfully' });
  } catch (err: any) {
    logger.error('Suspend user failed', err);
    res.status(500).json({ success: false, error: 'Failed to suspend user' });
  }
});

/**
 * GET /api/admin/transactions
 */
router.get('/transactions', authenticateToken, requireRole('admin'), async (_req: Request, res: Response): Promise<void> => {
  try {
    const rows = await query<RowDataPacket[]>(
      `SELECT mr.record_uuid, mr.blockchain_tx_hash as tx_hash, 'RECORD_CREATED' as event_type, 
              mr.created_at, u.wallet_address as actor_address
       FROM medical_records mr
       JOIN patients p ON mr.patient_id = p.id
       JOIN users u ON p.user_id = u.id
       WHERE mr.blockchain_tx_hash IS NOT NULL
       UNION ALL
       SELECT ar.request_uuid, ar.blockchain_tx_hash as tx_hash, 'ACCESS_REQUESTED' as event_type, 
              ar.created_at, du.wallet_address as actor_address
       FROM access_requests ar
       JOIN doctors d ON ar.doctor_id = d.id
       JOIN users du ON d.user_id = du.id
       WHERE ar.blockchain_tx_hash IS NOT NULL
       ORDER BY created_at DESC
       LIMIT 50`
    );

    res.json({ success: true, data: rows });
  } catch (err: any) {
    logger.error('Admin transactions failed', err);
    res.status(500).json({ success: false, error: 'Failed to fetch transactions' });
  }
});

export default router;

