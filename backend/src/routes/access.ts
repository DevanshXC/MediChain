import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { query } from '../config/database';
import { RowDataPacket } from 'mysql2';
import * as accessService from '../services/accessService';
import logger from '../utils/logger';

const router = Router();

/**
 * POST /api/access/request
 */
router.post(
  '/request',
  authenticateToken,
  requireRole('doctor'),
  [
    body('patientId').isInt({ min: 1 }),
    body('isEmergency').optional().isBoolean(),
    body('reason').notEmpty().isString().isLength({ max: 500 }),
    body('durationDays').optional().isInt({ min: 1, max: 365 }),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, error: 'Validation failed', details: errors.array() });
      return;
    }

    try {
      const { patientId, isEmergency = false, reason, durationDays = 7 } = req.body;
      const user = req.user!;

      const request = await accessService.createAccessRequest({
        doctorUserId: user.id,
        patientIdOrUserId: patientId,
        isEmergency: Boolean(isEmergency),
        reason,
        durationDays: Number(durationDays),
      });

      res.status(201).json({ success: true, data: request });
    } catch (err: any) {
      logger.error('Create access request failed', err);
      res.status(500).json({ success: false, error: err.message || 'Failed to create access request' });
    }
  }
);

/**
 * GET /api/access/requests
 */
router.get('/requests', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    let requests: accessService.AccessRequestRow[] = [];

    if (user.role === 'doctor') {
      requests = await accessService.getRequestsForDoctor(user.id);
    } else if (user.role === 'patient') {
      requests = await accessService.getRequestsForPatient(user.id);
    } else if (user.role === 'admin' || user.role === 'hospital') {
      requests = await query<accessService.AccessRequestRow[]>(
        `SELECT ar.*,
                CONCAT(d.first_name, ' ', d.last_name) as doctor_name,
                d.specialization,
                CONCAT(p.first_name, ' ', p.last_name) as patient_name,
                p.patient_code,
                perm.expires_at,
                perm.revoked_at
         FROM access_requests ar
         JOIN doctors d ON ar.doctor_id = d.id
         JOIN patients p ON ar.patient_id = p.id
         LEFT JOIN permissions perm ON perm.request_id = ar.id
         ORDER BY ar.created_at DESC LIMIT 100`
      );
    }

    res.json({ success: true, data: requests });
  } catch (err: any) {
    logger.error('Get access requests failed', err);
    res.status(500).json({ success: false, error: 'Failed to fetch access requests' });
  }
});

/**
 * POST /api/access/approve
 */
router.post(
  '/approve',
  authenticateToken,
  requireRole('patient'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { requestId, durationDays = 7 } = req.body;
      if (!requestId) {
        res.status(400).json({ success: false, error: 'requestId is required' });
        return;
      }

      const updated = await accessService.approveAccessRequest(requestId, durationDays);
      res.json({ success: true, data: updated, message: 'Access granted successfully' });
    } catch (err: any) {
      logger.error('Approve access request failed', err);
      res.status(500).json({ success: false, error: err.message || 'Failed to approve request' });
    }
  }
);

/**
 * POST /api/access/reject
 */
router.post(
  '/reject',
  authenticateToken,
  requireRole('patient'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { requestId } = req.body;
      if (!requestId) {
        res.status(400).json({ success: false, error: 'requestId is required' });
        return;
      }

      const updated = await accessService.rejectAccessRequest(requestId);
      res.json({ success: true, data: updated, message: 'Access request rejected' });
    } catch (err: any) {
      logger.error('Reject access request failed', err);
      res.status(500).json({ success: false, error: err.message || 'Failed to reject request' });
    }
  }
);

/**
 * POST /api/access/revoke
 */
router.post(
  '/revoke',
  authenticateToken,
  requireRole('patient'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { requestId } = req.body;
      if (!requestId) {
        res.status(400).json({ success: false, error: 'requestId is required' });
        return;
      }

      const updated = await accessService.revokeAccess(requestId);
      res.json({ success: true, data: updated, message: 'Access revoked successfully' });
    } catch (err: any) {
      logger.error('Revoke access failed', err);
      res.status(500).json({ success: false, error: err.message || 'Failed to revoke access' });
    }
  }
);

export default router;
