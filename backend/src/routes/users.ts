import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { query } from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import logger from '../utils/logger';

const router = Router();

/**
 * POST /api/users/register
 */
router.post(
  '/register',
  [
    body('walletAddress').notEmpty().isString(),
    body('role').isIn(['patient', 'doctor', 'hospital']),
    body('profileData').isObject(),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, error: 'Validation failed', details: errors.array() });
      return;
    }

    try {
      const { walletAddress, role, profileData } = req.body as {
        walletAddress: string;
        role: 'patient' | 'doctor' | 'hospital';
        profileData: Record<string, any>;
      };

      const normalized = walletAddress.toLowerCase();

      // Check if user already exists
      const existing = await query<RowDataPacket[]>(
        `SELECT id, role, status FROM users WHERE wallet_address = ? LIMIT 1`,
        [normalized]
      );

      let userId: number;
      // Patients are automatically approved; doctors and hospitals require admin approval
      const initialStatus = role === 'patient' ? 'approved' : 'pending';

      if (existing.length > 0) {
        userId = existing[0]['id'];
        await query(
          `UPDATE users SET role = ?, status = ?, updated_at = NOW() WHERE id = ?`,
          [role, initialStatus, userId]
        );
      } else {
        const userInsert = await query<ResultSetHeader>(
          `INSERT INTO users (wallet_address, role, status, nonce)
           VALUES (?, ?, ?, UUID())`,
          [normalized, role, initialStatus]
        );
        userId = userInsert.insertId;
      }

      // Role specific table insert
      if (role === 'patient') {
        const patientCode = profileData['patientCode'] || `PAT-${Date.now().toString().slice(-6)}`;
        const firstName = profileData['firstName'] || profileData['fullName']?.split(' ')[0] || 'Patient';
        const lastName = profileData['lastName'] || profileData['fullName']?.split(' ').slice(1).join(' ') || 'User';

        await query(
          `INSERT INTO patients 
             (user_id, patient_code, first_name, last_name, date_of_birth, gender, blood_type, phone, address, emergency_contact)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE 
             first_name = VALUES(first_name),
             last_name = VALUES(last_name),
             date_of_birth = VALUES(date_of_birth),
             gender = VALUES(gender),
             blood_type = VALUES(blood_type),
             phone = VALUES(phone),
             address = VALUES(address),
             emergency_contact = VALUES(emergency_contact)`,
          [
            userId,
            patientCode,
            firstName,
            lastName,
            profileData['dateOfBirth'] || null,
            profileData['gender'] || 'other',
            profileData['bloodType'] || profileData['bloodGroup'] || 'O+',
            profileData['phone'] || '',
            profileData['address'] || '',
            profileData['emergencyContact'] || '',
          ]
        );
      } else if (role === 'doctor') {
        const doctorCode = profileData['doctorCode'] || `DOC-${Date.now().toString().slice(-6)}`;
        const firstName = profileData['firstName'] || profileData['fullName']?.split(' ')[0] || 'Dr.';
        const lastName = profileData['lastName'] || profileData['fullName']?.split(' ').slice(1).join(' ') || 'Physician';
        const licenseNumber = profileData['licenseNumber'] || `LIC-${Date.now().toString().slice(-6)}`;

        await query(
          `INSERT INTO doctors 
             (user_id, doctor_code, first_name, last_name, license_number, specialization, qualification, phone, hospital_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE 
             first_name = VALUES(first_name),
             last_name = VALUES(last_name),
             license_number = VALUES(license_number),
             specialization = VALUES(specialization),
             qualification = VALUES(qualification),
             phone = VALUES(phone),
             hospital_id = VALUES(hospital_id)`,
          [
            userId,
            doctorCode,
            firstName,
            lastName,
            licenseNumber,
            profileData['specialization'] || 'General Practice',
            profileData['qualification'] || 'MD / MBBS',
            profileData['phone'] || '',
            profileData['hospitalId'] || null,
          ]
        );
      } else if (role === 'hospital') {
        const hospitalCode = profileData['hospitalCode'] || `HOS-${Date.now().toString().slice(-6)}`;
        const name = profileData['name'] || 'Healthcare Facility';
        const registrationNumber = profileData['registrationNumber'] || `REG-${Date.now().toString().slice(-6)}`;

        await query(
          `INSERT INTO hospitals 
             (user_id, hospital_code, name, registration_number, address, phone, email, website, specialty_areas)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE 
             name = VALUES(name),
             registration_number = VALUES(registration_number),
             address = VALUES(address),
             phone = VALUES(phone),
             email = VALUES(email),
             website = VALUES(website),
             specialty_areas = VALUES(specialty_areas)`,
          [
            userId,
            hospitalCode,
            name,
            registrationNumber,
            profileData['address'] || '',
            profileData['phone'] || '',
            profileData['email'] || '',
            profileData['website'] || '',
            profileData['specialtyAreas'] || '',
          ]
        );
      }

      res.status(201).json({
        success: true,
        message: role === 'patient' 
          ? 'Registration successful.' 
          : 'Registration submitted. Awaiting administrator approval.',
        data: { id: userId, walletAddress: normalized, role, status: initialStatus },
      });
    } catch (err: any) {
      logger.error('User registration failed', err);
      res.status(500).json({ success: false, error: err.message || 'Registration failed' });
    }
  }
);

/**
 * GET /api/users/profile
 */
router.get('/profile', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    let profileQuery = '';

    if (user.role === 'patient') {
      profileQuery = `
        SELECT u.id, u.wallet_address, u.role, u.status, u.created_at,
               p.id as patient_id, p.patient_code, p.first_name, p.last_name,
               CONCAT(p.first_name, ' ', p.last_name) as full_name,
               p.date_of_birth, p.gender, p.blood_type, p.phone, p.address, p.emergency_contact
        FROM users u 
        LEFT JOIN patients p ON p.user_id = u.id 
        WHERE u.id = ?`;
    } else if (user.role === 'doctor') {
      profileQuery = `
        SELECT u.id, u.wallet_address, u.role, u.status, u.created_at,
               d.id as doctor_id, d.doctor_code, d.first_name, d.last_name,
               CONCAT(d.first_name, ' ', d.last_name) as full_name,
               d.license_number, d.specialization, d.qualification, d.phone, d.hospital_id,
               h.name as hospital_name
        FROM users u 
        LEFT JOIN doctors d ON d.user_id = u.id 
        LEFT JOIN hospitals h ON d.hospital_id = h.id
        WHERE u.id = ?`;
    } else if (user.role === 'hospital') {
      profileQuery = `
        SELECT u.id, u.wallet_address, u.role, u.status, u.created_at,
               h.id as hospital_id, h.hospital_code, h.name, h.registration_number,
               h.address, h.phone, h.email, h.website, h.specialty_areas
        FROM users u 
        LEFT JOIN hospitals h ON h.user_id = u.id 
        WHERE u.id = ?`;
    } else {
      profileQuery = `SELECT id, wallet_address, role, status, created_at FROM users WHERE id = ?`;
    }

    const rows = await query<RowDataPacket[]>(profileQuery, [user.id]);
    if (!rows[0]) {
      res.status(404).json({ success: false, error: 'Profile not found' });
      return;
    }

    res.json({ success: true, data: rows[0] });
  } catch (err: any) {
    logger.error('Get profile failed', err);
    res.status(500).json({ success: false, error: 'Failed to fetch profile' });
  }
});

/**
 * GET /api/users (admin)
 */
router.get(
  '/',
  authenticateToken,
  requireRole('admin'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query['page'] as string) || 1;
      const limit = parseInt(req.query['limit'] as string) || 20;
      const offset = (page - 1) * limit;

      const rows = await query<RowDataPacket[]>(
        `SELECT id, wallet_address, role, status, created_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [limit, offset]
      );
      const countRows = await query<RowDataPacket[]>(`SELECT COUNT(*) as total FROM users`);
      const total = (countRows[0] as { total: number })['total'];

      res.json({ success: true, data: { users: rows, total, page, limit } });
    } catch (err: any) {
      logger.error('List users failed', err);
      res.status(500).json({ success: false, error: 'Failed to fetch users' });
    }
  }
);

/**
 * PATCH /api/users/profile  —  Update profile (name + role-specific fields)
 */
router.patch(
  '/profile',
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user!;
      const data = req.body as Record<string, any>;

      if (user.role === 'patient') {
        const fields: string[] = [];
        const values: any[] = [];
        if (data.firstName !== undefined) { fields.push('first_name = ?'); values.push(data.firstName); }
        if (data.lastName !== undefined) { fields.push('last_name = ?'); values.push(data.lastName); }
        if (data.phone !== undefined) { fields.push('phone = ?'); values.push(data.phone); }
        if (data.address !== undefined) { fields.push('address = ?'); values.push(data.address); }
        if (data.gender !== undefined) { fields.push('gender = ?'); values.push(data.gender); }
        if (data.bloodType !== undefined) { fields.push('blood_type = ?'); values.push(data.bloodType); }
        if (data.emergencyContact !== undefined) { fields.push('emergency_contact = ?'); values.push(data.emergencyContact); }
        if (data.dateOfBirth !== undefined) { fields.push('date_of_birth = ?'); values.push(data.dateOfBirth); }

        if (fields.length === 0) { res.status(400).json({ success: false, error: 'No fields to update' }); return; }
        values.push(user.id);
        await query(`UPDATE patients SET ${fields.join(', ')} WHERE user_id = ?`, values);
      } else if (user.role === 'doctor') {
        const fields: string[] = [];
        const values: any[] = [];
        if (data.firstName !== undefined) { fields.push('first_name = ?'); values.push(data.firstName); }
        if (data.lastName !== undefined) { fields.push('last_name = ?'); values.push(data.lastName); }
        if (data.phone !== undefined) { fields.push('phone = ?'); values.push(data.phone); }
        if (data.specialization !== undefined) { fields.push('specialization = ?'); values.push(data.specialization); }
        if (data.qualification !== undefined) { fields.push('qualification = ?'); values.push(data.qualification); }

        if (fields.length === 0) { res.status(400).json({ success: false, error: 'No fields to update' }); return; }
        values.push(user.id);
        await query(`UPDATE doctors SET ${fields.join(', ')} WHERE user_id = ?`, values);
      } else if (user.role === 'hospital') {
        const fields: string[] = [];
        const values: any[] = [];
        if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
        if (data.phone !== undefined) { fields.push('phone = ?'); values.push(data.phone); }
        if (data.email !== undefined) { fields.push('email = ?'); values.push(data.email); }
        if (data.address !== undefined) { fields.push('address = ?'); values.push(data.address); }
        if (data.website !== undefined) { fields.push('website = ?'); values.push(data.website); }
        if (data.specialtyAreas !== undefined) { fields.push('specialty_areas = ?'); values.push(data.specialtyAreas); }

        if (fields.length === 0) { res.status(400).json({ success: false, error: 'No fields to update' }); return; }
        values.push(user.id);
        await query(`UPDATE hospitals SET ${fields.join(', ')} WHERE user_id = ?`, values);
      } else {
        res.status(400).json({ success: false, error: 'Admin profiles cannot be updated via this endpoint' });
        return;
      }

      // Reload the profile and return
      const profileRes = await query<RowDataPacket[]>(
        user.role === 'patient'
          ? `SELECT u.id, u.wallet_address, u.role, u.status, p.first_name, p.last_name, CONCAT(p.first_name,' ',p.last_name) as full_name, p.phone, p.address, p.gender, p.blood_type, p.emergency_contact, p.date_of_birth, p.patient_code FROM users u LEFT JOIN patients p ON p.user_id=u.id WHERE u.id=?`
          : user.role === 'doctor'
          ? `SELECT u.id, u.wallet_address, u.role, u.status, d.first_name, d.last_name, CONCAT(d.first_name,' ',d.last_name) as full_name, d.phone, d.specialization, d.qualification, d.doctor_code FROM users u LEFT JOIN doctors d ON d.user_id=u.id WHERE u.id=?`
          : `SELECT u.id, u.wallet_address, u.role, u.status, h.name, h.phone, h.email, h.address, h.website, h.specialty_areas, h.hospital_code FROM users u LEFT JOIN hospitals h ON h.user_id=u.id WHERE u.id=?`,
        [user.id]
      );

      res.json({ success: true, message: 'Profile updated successfully', data: profileRes[0] });
    } catch (err: any) {
      logger.error('Update profile failed', err);
      res.status(500).json({ success: false, error: err.message || 'Profile update failed' });
    }
  }
);

export default router;
