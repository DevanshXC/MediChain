import { query } from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { encrypt, generateFileHash, saveEncryptedFile, loadEncryptedFile, decrypt } from './encryptionService';
import * as blockchain from './blockchainService';
import { v4 as uuidv4 } from 'uuid';

export interface RecordRow extends RowDataPacket {
  id: number;
  record_uuid: string;
  patient_id: number;
  doctor_id: number | null;
  hospital_id: number | null;
  category: string;
  original_filename: string;
  encrypted_filename: string;
  file_hash: string;
  file_size: number;
  mime_type: string;
  blockchain_record_id: string | null;
  blockchain_tx_hash: string | null;
  block_number: number | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

const CATEGORY_MAP: Record<string, number> = {
  diagnosis: 0,
  prescription: 1,
  lab_report: 2,
  medical_history: 3,
  consultation: 4,
  discharge_summary: 5,
};

export async function createRecord(params: {
  fileBuffer: Buffer;
  originalFilename: string;
  mimeType: string;
  patientId: number; // patients.id or users.id
  doctorUserId?: number;
  hospitalUserId?: number;
  category: string;
  notes?: string;
}): Promise<{ record: RecordRow; txHash: string }> {
  const {
    fileBuffer,
    originalFilename,
    mimeType,
    patientId: rawPatientId,
    doctorUserId,
    hospitalUserId,
    category,
    notes = '',
  } = params;

  // Resolve actual patients.id and patient wallet
  let patientId = rawPatientId;
  let patientWallet = '';

  const patientRows = await query<RowDataPacket[]>(
    `SELECT p.id as patient_id, u.wallet_address 
     FROM patients p 
     JOIN users u ON p.user_id = u.id 
     WHERE p.id = ? OR p.user_id = ? 
     LIMIT 1`,
    [rawPatientId, rawPatientId]
  );

  if (patientRows.length > 0) {
    patientId = patientRows[0]['patient_id'] as number;
    patientWallet = patientRows[0]['wallet_address'] as string;
  }

  // Resolve doctor_id if doctorUserId provided
  let doctorId: number | null = null;
  if (doctorUserId) {
    const docRows = await query<RowDataPacket[]>(
      `SELECT id FROM doctors WHERE user_id = ? LIMIT 1`,
      [doctorUserId]
    );
    if (docRows.length > 0) {
      doctorId = docRows[0]['id'] as number;
    }
  }

  // Resolve hospital_id
  let hospitalId: number | null = null;
  if (hospitalUserId) {
    const hospRows = await query<RowDataPacket[]>(
      `SELECT id FROM hospitals WHERE user_id = ? LIMIT 1`,
      [hospitalUserId]
    );
    if (hospRows.length > 0) {
      hospitalId = hospRows[0]['id'] as number;
    }
  } else if (doctorId) {
    const docHosp = await query<RowDataPacket[]>(
      `SELECT hospital_id FROM doctors WHERE id = ? LIMIT 1`,
      [doctorId]
    );
    if (docHosp.length > 0 && docHosp[0]['hospital_id']) {
      hospitalId = docHosp[0]['hospital_id'] as number;
    }
  }

  const recordUuid = uuidv4();
  const fileHash = generateFileHash(fileBuffer);
  const encryptedBuffer = encrypt(fileBuffer);
  const encryptedFilename = `${recordUuid}.enc`;
  saveEncryptedFile(encryptedBuffer, encryptedFilename);

  // Register on blockchain
  let txHash = '';
  const numericCategory = CATEGORY_MAP[category] ?? 0;
  try {
    if (patientWallet) {
      const receipt = await blockchain.registerRecord(recordUuid, patientWallet, fileHash, numericCategory);
      txHash = receipt.hash;
    }
  } catch (err) {
    console.warn('Blockchain record registration failed (continuing with DB):', err);
  }

  // Save to DB
  const result = await query<ResultSetHeader>(
    `INSERT INTO medical_records
       (record_uuid, patient_id, doctor_id, hospital_id, category, original_filename,
        encrypted_filename, file_hash, file_size, mime_type, blockchain_record_id, blockchain_tx_hash, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      recordUuid,
      patientId,
      doctorId,
      hospitalId,
      category,
      originalFilename,
      encryptedFilename,
      fileHash,
      fileBuffer.length,
      mimeType,
      recordUuid,
      txHash || null,
      notes,
    ]
  );

  const records = await query<RecordRow[]>(
    `SELECT * FROM medical_records WHERE id = ? LIMIT 1`,
    [(result as ResultSetHeader).insertId]
  );

  return { record: records[0], txHash };
}

export async function getRecordById(recordId: string | number): Promise<RecordRow | null> {
  const isNumeric = typeof recordId === 'number' || /^\d+$/.test(String(recordId));
  const sql = isNumeric
    ? `SELECT mr.*, 
              CONCAT(d.first_name, ' ', d.last_name) as doctor_name,
              d.specialization,
              h.name as hospital_name
       FROM medical_records mr
       LEFT JOIN doctors d ON mr.doctor_id = d.id
       LEFT JOIN hospitals h ON mr.hospital_id = h.id
       WHERE mr.id = ? OR mr.record_uuid = ? LIMIT 1`
    : `SELECT mr.*, 
              CONCAT(d.first_name, ' ', d.last_name) as doctor_name,
              d.specialization,
              h.name as hospital_name
       FROM medical_records mr
       LEFT JOIN doctors d ON mr.doctor_id = d.id
       LEFT JOIN hospitals h ON mr.hospital_id = h.id
       WHERE mr.record_uuid = ? LIMIT 1`;

  const params = isNumeric ? [recordId, recordId] : [recordId];
  const rows = await query<RecordRow[]>(sql, params);
  return rows[0] || null;
}

export async function getRecordsByPatient(patientIdOrUserId: number): Promise<RecordRow[]> {
  return query<RecordRow[]>(
    `SELECT mr.*, 
            CONCAT(d.first_name, ' ', d.last_name) as doctor_name,
            d.specialization,
            h.name as hospital_name
     FROM medical_records mr
     JOIN patients p ON mr.patient_id = p.id
     LEFT JOIN doctors d ON mr.doctor_id = d.id
     LEFT JOIN hospitals h ON mr.hospital_id = h.id
     WHERE p.id = ? OR p.user_id = ?
     ORDER BY mr.created_at DESC`,
    [patientIdOrUserId, patientIdOrUserId]
  );
}

export async function decryptRecord(encryptedFilename: string): Promise<Buffer> {
  const encryptedBuffer = loadEncryptedFile(encryptedFilename);
  return decrypt(encryptedBuffer);
}

export async function verifyRecord(recordId: string | number): Promise<{
  status: 'VERIFIED' | 'TAMPERED' | 'NOT_FOUND';
  originalHash?: string;
  currentHash?: string;
  onChainHash?: string;
  txHash?: string;
  recordUuid?: string;
  registrationDate?: string;
  verifiedAt: string;
}> {
  const record = await getRecordById(recordId);
  if (!record) {
    return {
      status: 'NOT_FOUND',
      verifiedAt: new Date().toISOString(),
    };
  }

  try {
    const encryptedBuffer = loadEncryptedFile(record.encrypted_filename);
    const decrypted = decrypt(encryptedBuffer);
    const currentHash = generateFileHash(decrypted);
    const originalHash = record.file_hash;

    let onChainHash = '';
    try {
      onChainHash = await blockchain.getDocumentHash(record.record_uuid);
    } catch {
      // If blockchain node not reachable, fallback to DB hash comparison
    }

    const matchesDb = currentHash.toLowerCase() === originalHash.toLowerCase();
    const status = matchesDb ? 'VERIFIED' : 'TAMPERED';

    return {
      status,
      originalHash,
      currentHash,
      onChainHash: onChainHash || originalHash,
      txHash: record.blockchain_tx_hash || undefined,
      recordUuid: record.record_uuid,
      registrationDate: record.created_at ? new Date(record.created_at).toISOString() : undefined,
      verifiedAt: new Date().toISOString(),
    };
  } catch (err) {
    return {
      status: 'NOT_FOUND',
      verifiedAt: new Date().toISOString(),
    };
  }
}
