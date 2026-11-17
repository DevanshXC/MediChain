import { query } from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import * as blockchain from './blockchainService';
import { v4 as uuidv4 } from 'uuid';

export interface AccessRequestRow extends RowDataPacket {
  id: number;
  request_uuid: string;
  doctor_id: number;
  patient_id: number;
  status: 'pending' | 'approved' | 'rejected' | 'revoked';
  is_emergency: number | boolean;
  reason: string | null;
  blockchain_tx_hash: string | null;
  block_number: number | null;
  requested_at: Date;
  responded_at: Date | null;
  created_at: Date;
  updated_at: Date;
  // joined fields
  doctor_name?: string;
  specialization?: string;
  license_number?: string;
  doctor_wallet?: string;
  patient_name?: string;
  patient_code?: string;
  patient_wallet?: string;
  expires_at?: Date | null;
  revoked_at?: Date | null;
}

export async function createAccessRequest(params: {
  doctorUserId: number;
  patientIdOrUserId: number;
  isEmergency: boolean;
  reason: string;
  durationDays?: number;
}): Promise<AccessRequestRow> {
  const { doctorUserId, patientIdOrUserId, isEmergency, reason, durationDays = 7 } = params;
  const requestUuid = uuidv4();
  const durationSeconds = durationDays * 86400;

  // Resolve doctor_id and doctor wallet
  const docRows = await query<RowDataPacket[]>(
    `SELECT d.id as doctor_id, u.wallet_address 
     FROM doctors d 
     JOIN users u ON d.user_id = u.id 
     WHERE d.user_id = ? OR d.id = ? LIMIT 1`,
    [doctorUserId, doctorUserId]
  );
  if (docRows.length === 0) {
    throw new Error('Doctor record not found');
  }
  const doctorId = docRows[0]['doctor_id'] as number;
  const doctorWallet = docRows[0]['wallet_address'] as string;

  // Resolve patient_id and patient wallet
  const patRows = await query<RowDataPacket[]>(
    `SELECT p.id as patient_id, u.wallet_address 
     FROM patients p 
     JOIN users u ON p.user_id = u.id 
     WHERE p.id = ? OR p.user_id = ? LIMIT 1`,
    [patientIdOrUserId, patientIdOrUserId]
  );
  if (patRows.length === 0) {
    throw new Error('Patient record not found');
  }
  const patientId = patRows[0]['patient_id'] as number;
  const patientWallet = patRows[0]['wallet_address'] as string;

  let txHash = '';
  try {
    const receipt = await blockchain.createAccessRequest(
      requestUuid,
      patientWallet,
      isEmergency,
      reason,
      durationSeconds
    );
    txHash = receipt.hash;
  } catch (err) {
    console.warn('Blockchain createAccessRequest failed (continuing with DB):', err);
  }

  const result = await query<ResultSetHeader>(
    `INSERT INTO access_requests
       (request_uuid, doctor_id, patient_id, is_emergency, reason, blockchain_tx_hash)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [requestUuid, doctorId, patientId, isEmergency ? 1 : 0, reason, txHash || null]
  );

  const insertId = (result as ResultSetHeader).insertId;

  // Create notification for patient
  await query(
    `INSERT INTO notifications (user_id, type, title, message, related_request_id)
     SELECT p.user_id, 'access_request', 'New Access Request', 
            CONCAT('Dr. requested access: ', ?), ?
     FROM patients p WHERE p.id = ?`,
    [reason, insertId, patientId]
  );

  return (await getRequestById(insertId))!;
}

export async function approveAccessRequest(
  requestUuidOrId: string | number,
  durationDays: number = 7
): Promise<AccessRequestRow> {
  const request = await getRequestById(requestUuidOrId);
  if (!request) throw new Error('Access request not found');

  let txHash = '';
  try {
    const receipt = await blockchain.approveAccessRequest(request.request_uuid);
    txHash = receipt.hash;
  } catch (err) {
    console.warn('Blockchain approveAccessRequest failed (continuing with DB):', err);
  }

  // Update request status
  await query(
    `UPDATE access_requests 
     SET status = 'approved', responded_at = NOW() 
     WHERE id = ?`,
    [request.id]
  );

  // Upsert into permissions table
  const expiresAt = new Date(Date.now() + durationDays * 86400 * 1000);
  await query(
    `INSERT INTO permissions (request_id, expires_at)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE granted_at = NOW(), expires_at = ?, revoked_at = NULL, revoke_tx_hash = NULL`,
    [request.id, expiresAt, expiresAt]
  );

  // Notify doctor
  await query(
    `INSERT INTO notifications (user_id, type, title, message, related_request_id)
     SELECT d.user_id, 'access_approved', 'Access Request Approved',
            'Patient approved your medical record access request', ?
     FROM doctors d WHERE d.id = ?`,
    [request.id, request.doctor_id]
  );

  // Audit log
  await query(
    `INSERT INTO audit_logs (event_type, actor_user_id, subject_user_id, request_id, description, blockchain_tx_hash)
     SELECT 'ACCESS_APPROVED', p.user_id, d.user_id, ?, 'Patient approved access request', ?
     FROM patients p, doctors d WHERE p.id = ? AND d.id = ?`,
    [request.id, txHash || null, request.patient_id, request.doctor_id]
  );

  return (await getRequestById(request.id))!;
}

export async function rejectAccessRequest(requestUuidOrId: string | number): Promise<AccessRequestRow> {
  const request = await getRequestById(requestUuidOrId);
  if (!request) throw new Error('Access request not found');

  let txHash = '';
  try {
    const receipt = await blockchain.rejectAccessRequest(request.request_uuid);
    txHash = receipt.hash;
  } catch (err) {
    console.warn('Blockchain rejectAccessRequest failed (continuing with DB):', err);
  }

  await query(
    `UPDATE access_requests 
     SET status = 'rejected', responded_at = NOW() 
     WHERE id = ?`,
    [request.id]
  );

  // Notify doctor
  await query(
    `INSERT INTO notifications (user_id, type, title, message, related_request_id)
     SELECT d.user_id, 'access_rejected', 'Access Request Rejected',
            'Patient rejected your medical record access request', ?
     FROM doctors d WHERE d.id = ?`,
    [request.id, request.doctor_id]
  );

  return (await getRequestById(request.id))!;
}

export async function revokeAccess(requestUuidOrId: string | number): Promise<AccessRequestRow> {
  const request = await getRequestById(requestUuidOrId);
  if (!request) throw new Error('Access request not found');

  let txHash = '';
  try {
    const receipt = await blockchain.revokeAccess(request.request_uuid);
    txHash = receipt.hash;
  } catch (err) {
    console.warn('Blockchain revokeAccess failed (continuing with DB):', err);
  }

  await query(
    `UPDATE access_requests SET status = 'revoked', updated_at = NOW() WHERE id = ?`,
    [request.id]
  );

  await query(
    `UPDATE permissions 
     SET revoked_at = NOW(), revoke_tx_hash = ? 
     WHERE request_id = ?`,
    [txHash || null, request.id]
  );

  // Notify doctor
  await query(
    `INSERT INTO notifications (user_id, type, title, message, related_request_id)
     SELECT d.user_id, 'access_revoked', 'Access Revoked',
            'Patient has revoked your medical record access permission', ?
     FROM doctors d WHERE d.id = ?`,
    [request.id, request.doctor_id]
  );

  // Audit log
  await query(
    `INSERT INTO audit_logs (event_type, actor_user_id, subject_user_id, request_id, description, blockchain_tx_hash)
     SELECT 'ACCESS_REVOKED', p.user_id, d.user_id, ?, 'Patient revoked access permission', ?
     FROM patients p, doctors d WHERE p.id = ? AND d.id = ?`,
    [request.id, txHash || null, request.patient_id, request.doctor_id]
  );

  return (await getRequestById(request.id))!;
}

export async function getRequestById(requestUuidOrId: string | number): Promise<AccessRequestRow | null> {
  const isNumeric = typeof requestUuidOrId === 'number' || /^\d+$/.test(String(requestUuidOrId));
  const whereClause = isNumeric
    ? `ar.id = ? OR ar.request_uuid = ?`
    : `ar.request_uuid = ?`;
  const params = isNumeric ? [requestUuidOrId, requestUuidOrId] : [requestUuidOrId];

  const rows = await query<AccessRequestRow[]>(
    `SELECT ar.*,
            CONCAT(d.first_name, ' ', d.last_name) as doctor_name,
            d.specialization,
            d.license_number,
            du.wallet_address as doctor_wallet,
            CONCAT(p.first_name, ' ', p.last_name) as patient_name,
            p.patient_code,
            pu.wallet_address as patient_wallet,
            perm.expires_at,
            perm.revoked_at
     FROM access_requests ar
     JOIN doctors d ON ar.doctor_id = d.id
     JOIN users du ON d.user_id = du.id
     JOIN patients p ON ar.patient_id = p.id
     JOIN users pu ON p.user_id = pu.id
     LEFT JOIN permissions perm ON perm.request_id = ar.id
     WHERE ${whereClause}
     LIMIT 1`,
    params
  );

  return rows[0] || null;
}

export async function getRequestsForPatient(patientUserId: number): Promise<AccessRequestRow[]> {
  return query<AccessRequestRow[]>(
    `SELECT ar.*,
            CONCAT(d.first_name, ' ', d.last_name) as doctor_name,
            d.specialization,
            d.license_number,
            du.wallet_address as doctor_wallet,
            perm.expires_at,
            perm.revoked_at
     FROM access_requests ar
     JOIN patients p ON ar.patient_id = p.id
     JOIN doctors d ON ar.doctor_id = d.id
     JOIN users du ON d.user_id = du.id
     LEFT JOIN permissions perm ON perm.request_id = ar.id
     WHERE p.user_id = ?
     ORDER BY ar.created_at DESC`,
    [patientUserId]
  );
}

export async function getRequestsForDoctor(doctorUserId: number): Promise<AccessRequestRow[]> {
  return query<AccessRequestRow[]>(
    `SELECT ar.*,
            CONCAT(p.first_name, ' ', p.last_name) as patient_name,
            p.patient_code,
            pu.wallet_address as patient_wallet,
            perm.expires_at,
            perm.revoked_at
     FROM access_requests ar
     JOIN doctors d ON ar.doctor_id = d.id
     JOIN patients p ON ar.patient_id = p.id
     JOIN users pu ON p.user_id = pu.id
     LEFT JOIN permissions perm ON perm.request_id = ar.id
     WHERE d.user_id = ?
     ORDER BY ar.created_at DESC`,
    [doctorUserId]
  );
}

export async function checkDoctorAccess(doctorUserId: number, patientIdOrUserId: number): Promise<boolean> {
  const rows = await query<RowDataPacket[]>(
    `SELECT perm.id, perm.expires_at, perm.revoked_at
     FROM permissions perm
     JOIN access_requests ar ON perm.request_id = ar.id
     JOIN doctors d ON ar.doctor_id = d.id
     JOIN patients p ON ar.patient_id = p.id
     WHERE d.user_id = ? 
       AND (p.id = ? OR p.user_id = ?)
       AND ar.status = 'approved'
       AND perm.revoked_at IS NULL
       AND (perm.expires_at IS NULL OR perm.expires_at > NOW())
     LIMIT 1`,
    [doctorUserId, patientIdOrUserId, patientIdOrUserId]
  );

  return rows.length > 0;
}
