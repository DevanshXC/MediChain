/**
 * MediChain Demo Blockchain Data Seeder
 * 
 * Generates realistic on-chain healthcare records, access permissions,
 * and security audit logs on the local Hardhat blockchain network
 * and synchronizes them into the MySQL database.
 */

const { ethers } = require('../backend/node_modules/ethers');
const mysql = require('../backend/node_modules/mysql2/promise');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const RPC_URL = 'http://127.0.0.1:8545';
const ADMIN_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const ENCRYPTION_KEY_HEX = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
const ENCRYPTION_KEY = Buffer.from(ENCRYPTION_KEY_HEX, 'hex');

const UPLOAD_DIR = path.resolve(__dirname, '../backend/uploads/encrypted');

function encrypt(buffer) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]);
}

function generateHash(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

async function main() {
  console.log('====================================================');
  console.log('   MEDICHAIN ON-CHAIN DEMO DATA SEEDING UTILITY    ');
  console.log('====================================================\n');

  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }

  // 1. Setup Ethers provider and NonceManager
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const rawWallet = new ethers.Wallet(ADMIN_KEY, provider);
  const signer = new ethers.NonceManager(rawWallet);
  console.log('🔗 Connected to local Hardhat node at', RPC_URL);
  console.log('🔑 Relayer/Admin Address:', await signer.getAddress());

  // 2. Load contract addresses and ABIs
  const addrPath = path.resolve(__dirname, '../backend/src/config/contractAddresses.json');
  const addrs = JSON.parse(fs.readFileSync(addrPath, 'utf8'));
  const contracts = addrs.contracts || addrs;

  const abisDir = path.resolve(__dirname, '../backend/src/config/abis');
  const medRecordsAbi = JSON.parse(fs.readFileSync(path.join(abisDir, 'MedicalRecords.json'), 'utf8')).abi;
  const accessAbi = JSON.parse(fs.readFileSync(path.join(abisDir, 'MediAccessControl.json'), 'utf8')).abi;
  const auditAbi = JSON.parse(fs.readFileSync(path.join(abisDir, 'AuditLog.json'), 'utf8')).abi;

  const medRecordsContract = new ethers.Contract(contracts.MedicalRecords, medRecordsAbi, signer);
  const accessContract = new ethers.Contract(contracts.MediAccessControl, accessAbi, signer);
  const auditContract = new ethers.Contract(contracts.AuditLog, auditAbi, signer);

  console.log('📜 Contracts Loaded:');
  console.log('   MedicalRecords  :', contracts.MedicalRecords);
  console.log('   AccessControl   :', contracts.MediAccessControl);
  console.log('   AuditLog        :', contracts.AuditLog);

  // 3. Connect to Database
  const db = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'medichain',
  });
  console.log('\n🗄️  Connected to MySQL database (medichain)');

  // Resolve Devansh Saxena (patient 1) and other actors
  const [patientRows] = await db.query(
    `SELECT p.id as patient_id, p.user_id, p.patient_code, p.first_name, p.last_name, u.wallet_address
     FROM patients p JOIN users u ON p.user_id = u.id WHERE u.wallet_address = ? LIMIT 1`,
    ['0x70997970C51812dc3A010C7d01b50e0d17dc79C8']
  );
  if (patientRows.length === 0) {
    throw new Error('Patient Devansh Saxena (0x7099...) not found in database');
  }
  const patient = patientRows[0];
  console.log(`👤 Target Patient: ${patient.first_name} ${patient.last_name} (${patient.patient_code}) - ${patient.wallet_address}`);

  const [docSarah] = await db.query(
    `SELECT d.id as doctor_id, d.user_id, u.wallet_address FROM doctors d JOIN users u ON d.user_id = u.id WHERE u.wallet_address = ?`,
    ['0x90F79bf6EB2c4f870365E785982E1f101E93b906']
  );
  const [docMichael] = await db.query(
    `SELECT d.id as doctor_id, d.user_id, u.wallet_address FROM doctors d JOIN users u ON d.user_id = u.id WHERE u.wallet_address = ?`,
    ['0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65']
  );
  const [hospCity] = await db.query(
    `SELECT h.id as hospital_id, h.user_id, u.wallet_address FROM hospitals h JOIN users u ON h.user_id = u.id WHERE u.wallet_address = ?`,
    ['0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc']
  );

  const doctorSarahId = docSarah[0]?.doctor_id || 1;
  const doctorMichaelId = docMichael[0]?.doctor_id || 2;
  const hospitalId = hospCity[0]?.hospital_id || 1;

  // ----------------------------------------------------
  // SECTION A: CREATE REAL ON-CHAIN MEDICAL RECORDS
  // ----------------------------------------------------
  console.log('\n--- 1. Generating & Mining Realistic Medical Records ---');

  const demoRecords = [
    {
      category: 'diagnosis',
      categoryEnum: 0,
      filename: 'Cardiology_12_Lead_ECG_Analysis.pdf',
      notes: 'Resting 12-lead electrocardiogram indicates normal sinus rhythm. PR interval 158 ms, QRS duration 86 ms, QTc 412 ms. Normal hemodynamic profile.',
      content: `MEDICHAIN CLINICAL DIAGNOSTIC REPORT
Patient Name: Devansh Saxena
Patient ID: ${patient.patient_code}
Date: 2026-11-15
Attending Physician: Dr. Sarah Johnson, MD, FACC (Cardiology)
Facility: City General Hospital - Department of Cardiology

CLINICAL INDICATION:
Routine annual cardiovascular evaluation and fitness-for-activity screening.

FINDINGS:
- Blood Pressure: 118/76 mmHg resting
- Heart Rate: 68 bpm, regular rate and rhythm
- 12-Lead ECG: Normal sinus rhythm with normal axis. No acute ST-T wave abnormalities.
- Echocardiography Summary: Normal left ventricular size and systolic function (LVEF 62%).

IMPRESSION & PLAN:
1. Normal baseline cardiovascular findings.
2. Continue balanced low-sodium nutritional plan and aerobic conditioning.
3. Follow-up scheduled in 12 months.

Cryptographic Verification:
Document SHA-256 hash registered on MediChain Smart Contract.
Off-chain Storage: AES-256-GCM Encrypted.`,
    },
    {
      category: 'prescription',
      categoryEnum: 1,
      filename: 'Rx_Atorvastatin_Ramipril_Daily.pdf',
      notes: 'Active prescription for preventative cardioprotective regimen. Dispense 90-day supply with 3 authorized refills.',
      content: `MEDICHAIN ELECTRONIC PRESCRIPTION
Patient: Devansh Saxena (ID: ${patient.patient_code})
Date: 2026-11-15
Prescribing Physician: Dr. Sarah Johnson, MD (License: LIC-001092)
Clinic: City General Cardiology Clinic

Rx 1: Atorvastatin Calcium 20 mg Oral Tablet
- Sig: Take 1 tablet by mouth daily at bedtime
- Quantity: 90 tablets
- Refills: 3

Rx 2: Ramipril 5 mg Oral Capsule
- Sig: Take 1 capsule by mouth once daily in morning
- Quantity: 90 capsules
- Refills: 3

Pharmacy Instructions: Generic substitution permitted. Monitored on MediChain ledger.`,
    },
    {
      category: 'lab_report',
      categoryEnum: 2,
      filename: 'Comprehensive_Lipid_Metabolic_Panel.pdf',
      notes: 'Comprehensive 14-parameter metabolic panel and automated lipid profile. All markers within optimal reference ranges.',
      content: `CITY GENERAL HOSPITAL LABORATORY SERVICES
CLINICAL LABORATORY ACCREDITATION: CAP / CLIA
Specimen ID: LAB-2026-90812
Patient: Devansh Saxena | DOB: 2005-03-14

LIPID PANEL (FASTING 12 HOURS):
- Total Cholesterol: 168 mg/dL (Reference: <200 mg/dL) [OPTIMAL]
- HDL Cholesterol: 56 mg/dL (Reference: >40 mg/dL) [GOOD]
- LDL Cholesterol: 92 mg/dL (Reference: <100 mg/dL) [OPTIMAL]
- Triglycerides: 104 mg/dL (Reference: <150 mg/dL) [NORMAL]

COMPREHENSIVE METABOLIC PANEL:
- Fasting Glucose: 86 mg/dL (70-99 mg/dL)
- Hemoglobin A1c: 5.2% (<5.7%)
- BUN / Creatinine Ratio: 14.2 (Normal)
- eGFR: >90 mL/min/1.73m² (Normal renal function)
- Potassium: 4.3 mEq/L (3.5-5.0 mEq/L)
- Alanine Aminotransferase (ALT): 22 U/L (7-56 U/L)

Validated electronically by Chief Pathologist Dr. Ronald Vance, MD.`,
    },
    {
      category: 'lab_report',
      categoryEnum: 2,
      filename: 'High_Resolution_Chest_Radiograph.pdf',
      notes: 'Posteroanterior and lateral digital chest radiography. Unremarkable cardiothoracic silhouette and clear lung fields.',
      content: `DEPARTMENT OF DIAGNOSTIC RADIOLOGY
CITY GENERAL HOSPITAL
Examination: Chest 2-View (PA and Lateral)
Patient: Devansh Saxena | Code: ${patient.patient_code}
Date: 2026-11-16

CLINICAL HISTORY:
Health assessment clearance.

FINDINGS:
- Lungs: Bilateral lung parenchyma is clear. No focal consolidation, pneumothorax, or pleural effusion.
- Heart & Mediastinum: Cardiothoracic ratio is normal (<0.50). Mediastinal contours and hila are unremarkable.
- Bones & Soft Tissues: Thoracic cage structures intact. No acute osseous abnormality.

IMPRESSION:
Normal posteroanterior and lateral chest radiograph. Negative for acute cardiopulmonary disease.

Radiologist: Dr. Helena Vance, MD (City General Radiology)`,
    },
    {
      category: 'consultation',
      categoryEnum: 4,
      filename: 'Annual_Cardiovascular_Risk_Assessment.pdf',
      notes: 'Comprehensive preventive health consultation. Stratified as lowest-quintile 10-year atherosclerotic cardiovascular disease risk.',
      content: `CONSULTATION CLINICAL SUMMARY
Provider: Dr. Sarah Johnson, MD, FACC
Patient: Devansh Saxena (PAT001)
Consultation Type: In-Person Annual Health Check

SUBJECTIVE:
Patient reports excellent energy, zero chest discomfort, no dyspnea upon exertion. Regular aerobic exercise 4x weekly. Sleep quality 7.5 hours nightly.

OBJECTIVE:
- Weight: 72.5 kg | Height: 178 cm | BMI: 22.9 kg/m²
- Vitals: BP 118/76 mmHg | Pulse 64 bpm | SpO2 99% on room air
- Physical Exam: Well-developed, alert, oriented x4. Regular S1/S2 heart sounds, no murmurs. Lungs clear to auscultation bilaterally.

ASSESSMENT:
Extremely healthy baseline cardiovascular and metabolic state. 10-year ASCVD risk calculated at 1.4% (minimal risk category).

RECOMMENDATIONS:
1. Maintain current hydration, sleep, and physical activity routine.
2. Annual wellness checkup in 12 months.`,
    },
    {
      category: 'discharge_summary',
      categoryEnum: 5,
      filename: 'Ambulatory_Observation_Discharge_Summary.pdf',
      notes: 'Discharge summary following successful ambulatory Holter monitoring session. Full activity clearance granted.',
      content: `DISCHARGE SUMMARY & CARE PLAN
Facility: City General Hospital - Day Observation Unit
Patient: Devansh Saxena | MRN: ${patient.patient_code}
Attending: Dr. Sarah Johnson, MD

ADMISSION DATE: 2026-11-16 08:30
DISCHARGE DATE: 2026-11-16 16:45

SUMMARY OF HOSPITAL STAY:
Patient admitted to ambulatory unit for observational Holter continuous cardiac rhythm monitoring. 8-hour continuous strip confirms sustained normal sinus rhythm with zero clinically significant ectopy, no pauses, and zero tachyarrhythmias.

DISCHARGE MEDICATIONS:
Continue routine prescribed maintenance as documented in MediChain registry.

DISCHARGE CONDITION: Stable, ambulatory, alert.
DISCHARGE DESTINATION: Home with routine activities.`,
    },
  ];

  for (const item of demoRecords) {
    const recordUuid = crypto.randomUUID();
    const rawBuffer = Buffer.from(item.content, 'utf8');
    const fileHash = generateHash(rawBuffer);
    const encrypted = encrypt(rawBuffer);
    const encFilename = `${recordUuid}.enc`;

    // Save encrypted file
    fs.writeFileSync(path.join(UPLOAD_DIR, encFilename), encrypted);

    // Call smart contract MedicalRecords.registerRecord
    const recordIdBytes32 = ethers.id(recordUuid);
    const docHashBytes32 = ethers.zeroPadValue('0x' + fileHash, 32);

    process.stdout.write(`   Mining on blockchain: ${item.filename.padEnd(46)} `);
    const tx = await medRecordsContract.registerRecord(
      recordIdBytes32,
      patient.wallet_address,
      docHashBytes32,
      item.categoryEnum
    );
    const receipt = await tx.wait();
    console.log(`[Tx: ${receipt.hash.slice(0, 10)}... (Block #${receipt.blockNumber})]`);

    // Insert into MySQL medical_records
    const [recInsert] = await db.query(
      `INSERT INTO medical_records
         (record_uuid, patient_id, doctor_id, hospital_id, category, original_filename,
          encrypted_filename, file_hash, file_size, mime_type, blockchain_record_id, blockchain_tx_hash, block_number, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        recordUuid,
        patient.patient_id,
        doctorSarahId,
        hospitalId,
        item.category,
        item.filename,
        encFilename,
        fileHash,
        rawBuffer.length,
        'application/pdf',
        recordIdBytes32,
        receipt.hash,
        receipt.blockNumber,
        item.notes,
      ]
    );

    // Record in blockchain_transactions table
    await db.query(
      `INSERT INTO blockchain_transactions
         (tx_hash, event_type, actor_address, contract_address, block_number, gas_used, metadata)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE block_number = VALUES(block_number)`,
      [
        receipt.hash,
        'RECORD_REGISTERED',
        await signer.getAddress(),
        contracts.MedicalRecords,
        receipt.blockNumber,
        receipt.gasUsed ? Number(receipt.gasUsed) : 85000,
        JSON.stringify({
          recordUuid,
          filename: item.filename,
          category: item.category,
          patient: patient.first_name + ' ' + patient.last_name,
        }),
      ]
    );

    // Record in audit_logs table
    await db.query(
      `INSERT INTO audit_logs
         (event_type, actor_user_id, subject_user_id, record_id, description, blockchain_tx_hash)
       VALUES ('RECORD_CREATED', ?, ?, ?, ?, ?)`,
      [
        docSarah[0]?.user_id || 12,
        patient.user_id,
        recInsert.insertId,
        `Created on-chain medical record: ${item.filename} (${item.category})`,
        receipt.hash,
      ]
    );
  }

  // ----------------------------------------------------
  // SECTION B: CREATE REAL ON-CHAIN ACCESS CONSENTS
  // ----------------------------------------------------
  console.log('\n--- 2. Setting Up Live On-Chain Patient Access Requests & Consents ---');

  // Consent 1: Approved Active Permission for Dr. Michael Chen (Neurology)
  const reqUuid1 = crypto.randomUUID();
  const reqBytes1 = ethers.id(reqUuid1);
  process.stdout.write(`   Mining Access Request (Dr. Michael Chen - Neurology): `);
  const txReq1 = await accessContract.createRequest(
    reqBytes1,
    patient.wallet_address,
    false, // not emergency
    'Comprehensive neurological consult & sleep study evaluation',
    30 * 86400 // 30 days
  );
  const rcptReq1 = await txReq1.wait();
  console.log(`[Tx: ${rcptReq1.hash.slice(0, 10)}...]`);

  process.stdout.write(`   Mining Access Approval (Devansh Saxena -> Dr. Chen):   `);
  const txApp1 = await accessContract.approveRequest(reqBytes1);
  const rcptApp1 = await txApp1.wait();
  console.log(`[Tx: ${rcptApp1.hash.slice(0, 10)}...]`);

  // Insert into access_requests and permissions
  const [arInsert1] = await db.query(
    `INSERT INTO access_requests
       (request_uuid, doctor_id, patient_id, status, is_emergency, reason, blockchain_tx_hash, block_number, responded_at)
     VALUES (?, ?, ?, 'approved', 0, ?, ?, ?, NOW())`,
    [
      reqUuid1,
      doctorMichaelId,
      patient.patient_id,
      'Comprehensive neurological consult & sleep study evaluation',
      rcptApp1.hash,
      rcptApp1.blockNumber,
    ]
  );
  const expiresAt = new Date(Date.now() + 30 * 86400 * 1000);
  await db.query(
    `INSERT INTO permissions (request_id, granted_at, expires_at)
     VALUES (?, NOW(), ?)
     ON DUPLICATE KEY UPDATE granted_at = NOW(), expires_at = ?, revoked_at = NULL`,
    [arInsert1.insertId, expiresAt, expiresAt]
  );

  // In-app notifications
  await db.query(
    `INSERT INTO notifications (user_id, type, title, message, related_request_id, is_read)
     VALUES (?, 'access_approved', 'Doctor Access Active', 'Dr. Michael Chen (Neurology) has active verified access to your medical records.', ?, 1)`,
    [patient.user_id, arInsert1.insertId]
  );

  // Consent 2: PENDING Access Request from Dr. Emily Davis (Doctor ID: 3) for Demo Interactive Approval
  const reqUuid2 = crypto.randomUUID();
  const reqBytes2 = ethers.id(reqUuid2);
  process.stdout.write(`   Mining Pending Request (Dr. Emily Davis - Orthopedics): `);
  const txReq2 = await accessContract.createRequest(
    reqBytes2,
    patient.wallet_address,
    false,
    'Sports medicine musculoskeletal assessment & spinal posture review',
    14 * 86400 // 14 days
  );
  const rcptReq2 = await txReq2.wait();
  console.log(`[Tx: ${rcptReq2.hash.slice(0, 10)}...]`);

  const [arInsert2] = await db.query(
    `INSERT INTO access_requests
       (request_uuid, doctor_id, patient_id, status, is_emergency, reason, blockchain_tx_hash, block_number)
     VALUES (?, 3, ?, 'pending', 0, ?, ?, ?)`,
    [
      reqUuid2,
      patient.patient_id,
      'Sports medicine musculoskeletal assessment & spinal posture review',
      rcptReq2.hash,
      rcptReq2.blockNumber,
    ]
  );

  await db.query(
    `INSERT INTO notifications (user_id, type, title, message, related_request_id, is_read)
     VALUES (?, 'access_request', 'New Access Request', 'Dr. Emily Davis (Orthopedics) requested access: Sports medicine musculoskeletal assessment', ?, 0)`,
    [patient.user_id, arInsert2.insertId]
  );

  // ----------------------------------------------------
  // SECTION C: LOG AUDIT EVENTS TO AuditLog CONTRACT
  // ----------------------------------------------------
  console.log('\n--- 3. Mining On-Chain Security & Integrity Audit Events ---');

  const auditEvents = [
    { type: 0, desc: 'PATIENT_AUTHENTICATED', subject: patient.wallet_address },
    { type: 1, desc: 'RECORD_INTEGRITY_VERIFIED', subject: patient.wallet_address },
    { type: 2, desc: 'CONSENT_GRANTED_ON_CHAIN', subject: patient.wallet_address },
    { type: 3, desc: 'SMART_CONTRACT_ACCESS_CHECK', subject: docSarah[0]?.wallet_address || patient.wallet_address },
  ];

  for (const ev of auditEvents) {
    process.stdout.write(`   Mining AuditLog Event [${ev.desc}]: `.padEnd(52));
    const tx = await auditContract.logEvent(
      ev.type,
      await signer.getAddress(),
      ev.subject,
      ethers.id(ev.desc + Date.now())
    );
    const rcpt = await tx.wait();
    console.log(`[Tx: ${rcpt.hash.slice(0, 10)}...]`);

    await db.query(
      `INSERT INTO audit_logs (event_type, actor_user_id, subject_user_id, description, blockchain_tx_hash)
       VALUES (?, 1, ?, ?, ?)`,
      [ev.desc, patient.user_id, `Verified security ledger event: ${ev.desc}`, rcpt.hash]
    );

    await db.query(
      `INSERT INTO blockchain_transactions
         (tx_hash, event_type, actor_address, contract_address, block_number, gas_used, metadata)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE block_number = VALUES(block_number)`,
      [
        rcpt.hash,
        ev.desc,
        await signer.getAddress(),
        contracts.AuditLog,
        rcpt.blockNumber,
        rcpt.gasUsed ? Number(rcpt.gasUsed) : 65000,
        JSON.stringify({ event: ev.desc, subject: ev.subject }),
      ]
    );
  }

  // Summary counts
  const [totalRecs] = await db.query(`SELECT COUNT(*) as count FROM medical_records WHERE patient_id = ?`, [patient.patient_id]);
  const [totalTxs] = await db.query(`SELECT COUNT(*) as count FROM blockchain_transactions`);
  const [totalAudits] = await db.query(`SELECT COUNT(*) as count FROM audit_logs`);

  console.log('\n====================================================');
  console.log('   🎉 DEMO BLOCKCHAIN DATA SEEDING COMPLETE!');
  console.log('====================================================');
  console.log(`📊 Total Patient Records Available : ${totalRecs[0].count}`);
  console.log(`📊 Total Blockchain Transactions   : ${totalTxs[0].count}`);
  console.log(`📊 Total Audit Logs Available       : ${totalAudits[0].count}`);
  console.log(`🎯 Active Doctor Consent            : Dr. Sarah Johnson (Cardiology) - APPROVED`);
  console.log(`🎯 Interactive Pending Request      : Dr. Michael Chen (Neurology) - PENDING (Ready for Demo)`);
  console.log(`🛡️  All Documents Encrypted & Verifiable with SHA-256 On-Chain`);

  await db.end();
}

main().catch((err) => {
  console.error('\n❌ Seeding failed:', err);
  process.exit(1);
});
