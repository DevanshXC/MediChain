import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { query } from '../config/database';
import { RowDataPacket } from 'mysql2';
import * as accessService from '../services/accessService';
import logger from '../utils/logger';

const router = Router();

/**
 * GET /api/patients
 * List patients for doctors, hospitals, and admins
 */
router.get(
  '/',
  authenticateToken,
  requireRole('admin', 'hospital', 'doctor'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user!;
      const rows = await query<RowDataPacket[]>(
        `SELECT p.id, p.user_id, p.patient_code, p.first_name, p.last_name,
                CONCAT(p.first_name, ' ', p.last_name) as full_name,
                p.date_of_birth, p.gender, p.blood_type, p.phone,
                u.wallet_address, u.status
         FROM patients p
         JOIN users u ON p.user_id = u.id
         ORDER BY p.first_name ASC, p.last_name ASC`
      );

      // If doctor is requesting, annotate with access status
      if (user.role === 'doctor') {
        const enriched = await Promise.all(
          rows.map(async (pat) => {
            const hasAccess = await accessService.checkDoctorAccess(user.id, pat['id']);
            return {
              ...pat,
              hasAccess,
            };
          })
        );
        res.json({ success: true, data: enriched });
        return;
      }

      res.json({ success: true, data: rows });
    } catch (err: any) {
      logger.error('List patients failed', err);
      res.status(500).json({ success: false, error: 'Failed to fetch patients' });
    }
  }
);

/**
 * GET /api/patients/search?q=
 */
router.get('/search', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const q = ((req.query['q'] as string) || '').trim();
    if (!q) {
      res.json({ success: true, data: [] });
      return;
    }

    const searchTerm = `%${q}%`;
    const rows = await query<RowDataPacket[]>(
      `SELECT p.id, p.user_id, p.patient_code, p.first_name, p.last_name,
              CONCAT(p.first_name, ' ', p.last_name) as full_name,
              p.date_of_birth, p.gender, p.blood_type,
              u.wallet_address
       FROM patients p
       JOIN users u ON p.user_id = u.id
       WHERE p.patient_code LIKE ? 
          OR p.first_name LIKE ? 
          OR p.last_name LIKE ? 
          OR CONCAT(p.first_name, ' ', p.last_name) LIKE ?
       LIMIT 20`,
      [searchTerm, searchTerm, searchTerm, searchTerm]
    );

    res.json({ success: true, data: rows });
  } catch (err: any) {
    logger.error('Search patients failed', err);
    res.status(500).json({ success: false, error: 'Search failed' });
  }
});

/**
 * GET /api/patients/:id
 */
router.get('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const patientId = parseInt(req.params['id']);

    const rows = await query<RowDataPacket[]>(
      `SELECT p.*, CONCAT(p.first_name, ' ', p.last_name) as full_name,
              u.wallet_address, u.status, u.role
       FROM patients p
       JOIN users u ON p.user_id = u.id
       WHERE p.id = ? OR p.user_id = ?
       LIMIT 1`,
      [patientId, patientId]
    );

    if (!rows[0]) {
      res.status(404).json({ success: false, error: 'Patient not found' });
      return;
    }

    const patient = rows[0];

    // Authorization check
    if (user.role === 'patient' && user.id !== patient['user_id']) {
      res.status(403).json({ success: false, error: 'Access denied' });
      return;
    }

    let hasAccess = true;
    if (user.role === 'doctor') {
      hasAccess = await accessService.checkDoctorAccess(user.id, patient['id']);
    }

    res.json({
      success: true,
      data: {
        ...patient,
        hasAccess,
      },
    });
  } catch (err: any) {
    logger.error('Get patient failed', err);
    res.status(500).json({ success: false, error: 'Failed to fetch patient' });
  }
});

export default router;
