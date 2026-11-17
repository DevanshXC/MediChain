import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { uploadMiddleware } from '../middleware/upload';
import { query } from '../config/database';
import { RowDataPacket } from 'mysql2';
import * as recordService from '../services/recordService';
import * as accessService from '../services/accessService';
import logger from '../utils/logger';

const router = Router();

/**
 * POST /api/records/upload
 */
router.post(
  '/upload',
  authenticateToken,
  requireRole('doctor', 'hospital'),
  uploadMiddleware.single('document'),
  async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
      res.status(400).json({ success: false, error: 'Document file is required' });
      return;
    }

    try {
      const { patientId, category = 'diagnosis', notes = '' } = req.body;
      const user = req.user!;

      if (!patientId) {
        res.status(400).json({ success: false, error: 'patientId is required' });
        return;
      }

      const { record, txHash } = await recordService.createRecord({
        fileBuffer: req.file.buffer,
        originalFilename: req.file.originalname,
        mimeType: req.file.mimetype,
        patientId: Number(patientId),
        doctorUserId: user.role === 'doctor' ? user.id : undefined,
        hospitalUserId: user.role === 'hospital' ? user.id : undefined,
        category,
        notes,
      });

      // Audit log
      await query(
        `INSERT INTO audit_logs (event_type, actor_user_id, record_id, description, blockchain_tx_hash)
         VALUES ('RECORD_CREATED', ?, ?, ?, ?)`,
        [user.id, record.id, `Created medical record (${category})`, txHash || null]
      );

      // Strip sensitive internal fields
      const { encrypted_filename: _, ...safeRecord } = record;
      res.status(201).json({
        success: true,
        data: safeRecord,
        txHash,
        message: 'Medical record uploaded and encrypted successfully',
      });
    } catch (err: any) {
      logger.error('Record upload failed', err);
      res.status(500).json({ success: false, error: err.message || 'Failed to upload record' });
    }
  }
);

/**
 * GET /api/records/patient/:patientId
 */
router.get('/patient/:patientId', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const targetPatientId = parseInt(req.params['patientId']);

    // Access check:
    // If patient: can only view own records
    // If doctor: check permissions
    // If admin or hospital: allowed
    if (user.role === 'patient') {
      const ownRows = await query<RowDataPacket[]>(
        `SELECT id FROM patients WHERE user_id = ? AND (id = ? OR user_id = ?)`,
        [user.id, targetPatientId, targetPatientId]
      );
      if (ownRows.length === 0) {
        res.status(403).json({ success: false, error: 'Access denied: cannot view other patients records' });
        return;
      }
    } else if (user.role === 'doctor') {
      const hasAccess = await accessService.checkDoctorAccess(user.id, targetPatientId);
      if (!hasAccess) {
        res.status(403).json({ success: false, error: 'No active access permission for this patient' });
        return;
      }
    }

    const records = await recordService.getRecordsByPatient(targetPatientId);
    const sanitized = records.map(({ encrypted_filename: _, ...rest }) => rest);

    // Audit log
    await query(
      `INSERT INTO audit_logs (event_type, actor_user_id, description)
       VALUES ('RECORD_ACCESSED', ?, ?)`,
      [user.id, `Viewed medical records for patient ID ${targetPatientId}`]
    );

    res.json({ success: true, data: sanitized });
  } catch (err: any) {
    logger.error('Get patient records failed', err);
    res.status(500).json({ success: false, error: 'Failed to fetch records' });
  }
});

/**
 * GET /api/records/:id
 */
router.get('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const record = await recordService.getRecordById(req.params['id']);
    if (!record) {
      res.status(404).json({ success: false, error: 'Record not found' });
      return;
    }

    // Permission check
    if (user.role === 'patient') {
      const patientCheck = await query<RowDataPacket[]>(
        `SELECT id FROM patients WHERE id = ? AND user_id = ?`,
        [record.patient_id, user.id]
      );
      if (patientCheck.length === 0) {
        res.status(403).json({ success: false, error: 'Access denied' });
        return;
      }
    } else if (user.role === 'doctor') {
      const hasAccess = await accessService.checkDoctorAccess(user.id, record.patient_id);
      if (!hasAccess) {
        res.status(403).json({ success: false, error: 'No active access permission for this record' });
        return;
      }
    }

    const { encrypted_filename: _, ...safeRecord } = record;
    res.json({ success: true, data: safeRecord });
  } catch (err: any) {
    logger.error('Get record failed', err);
    res.status(500).json({ success: false, error: 'Failed to fetch record' });
  }
});

/**
 * GET /api/records/:id/download
 */
router.get('/:id/download', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const record = await recordService.getRecordById(req.params['id']);
    if (!record) {
      res.status(404).json({ success: false, error: 'Record not found' });
      return;
    }

    // Permission check
    if (user.role === 'patient') {
      const patientCheck = await query<RowDataPacket[]>(
        `SELECT id FROM patients WHERE id = ? AND user_id = ?`,
        [record.patient_id, user.id]
      );
      if (patientCheck.length === 0) {
        res.status(403).json({ success: false, error: 'Access denied' });
        return;
      }
    } else if (user.role === 'doctor') {
      const hasAccess = await accessService.checkDoctorAccess(user.id, record.patient_id);
      if (!hasAccess) {
        res.status(403).json({ success: false, error: 'No active access permission for this record' });
        return;
      }
    }

    const decrypted = await recordService.decryptRecord(record.encrypted_filename);

    res.setHeader('Content-Disposition', `attachment; filename="${record.original_filename}"`);
    res.setHeader('Content-Type', record.mime_type || 'application/octet-stream');
    res.setHeader('Content-Length', decrypted.length);
    res.send(decrypted);
  } catch (err: any) {
    logger.error('Record download failed', err);
    res.status(500).json({ success: false, error: 'Failed to download record' });
  }
});

/**
 * POST /api/records/verify
 */
router.post('/verify', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { recordId } = req.body;
    if (!recordId) {
      res.status(400).json({ success: false, error: 'recordId is required' });
      return;
    }

    const result = await recordService.verifyRecord(recordId);

    // Audit log
    await query(
      `INSERT INTO audit_logs (event_type, actor_user_id, description, metadata)
       VALUES ('DOCUMENT_VERIFIED', ?, ?, ?)`,
      [
        req.user?.id || null,
        `Verified document integrity for record ${recordId}: ${result.status}`,
        JSON.stringify(result),
      ]
    );

    res.json({ success: true, data: result });
  } catch (err: any) {
    logger.error('Document verification failed', err);
    res.status(500).json({ success: false, error: 'Verification failed' });
  }
});

export default router;
