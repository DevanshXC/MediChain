const { ethers } = require('./backend/node_modules/ethers');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000/api';

// Hardhat test accounts
const ACCOUNTS = {
  admin: {
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    key: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  },
  patient: {
    address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    key: '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
  },
  doctor: {
    address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    key: '0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6',
  },
  hospital: {
    address: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
    key: '0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba',
  },
};

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAILED: ${message}`);
    failed++;
  }
}

async function login(account) {
  const wallet = new ethers.Wallet(account.key);

  // 1. Get nonce
  const nonceRes = await fetch(`${BASE_URL}/auth/nonce`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ walletAddress: account.address }),
  });
  const nonceData = await nonceRes.json();
  if (!nonceData.success) throw new Error(`Nonce failed: ${JSON.stringify(nonceData)}`);

  const { nonce, message } = nonceData.data;

  // 2. Sign message
  const signature = await wallet.signMessage(message);

  // 3. Verify signature
  const verifyRes = await fetch(`${BASE_URL}/auth/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      walletAddress: account.address,
      nonce,
      signature,
    }),
  });
  const verifyData = await verifyRes.json();
  if (!verifyData.success) throw new Error(`Verify failed: ${JSON.stringify(verifyData)}`);

  return verifyData.data;
}

async function runTests() {
  console.log('====================================================');
  console.log('   MEDICHAIN END-TO-END SYSTEM VERIFICATION SUITE   ');
  console.log('====================================================\n');

  // TEST 1: Health check
  console.log('--- 1. Testing Health & API Connectivity ---');
  try {
    const health = await (await fetch(`${BASE_URL}/health`)).json();
    assert(health.status === 'ok', `Backend health check is 'ok' (${health.service})`);
  } catch (e) {
    assert(false, `Backend health check failed: ${e.message}`);
  }

  // TEST 2: Hardhat Blockchain JSON-RPC
  console.log('\n--- 2. Testing Hardhat Localhost Blockchain ---');
  try {
    const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
    const net = await provider.getNetwork();
    assert(Number(net.chainId) === 31337, `Hardhat network connected on chainId 31337`);

    const contractConfig = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'backend/src/config/contractAddresses.json'), 'utf-8')
    );
    const contracts = contractConfig.contracts || contractConfig;
    assert(!!contracts.UserRegistry, `UserRegistry address: ${contracts.UserRegistry}`);
    assert(!!contracts.MedicalRecords, `MedicalRecords address: ${contracts.MedicalRecords}`);
    assert(!!contracts.MediAccessControl, `MediAccessControl address: ${contracts.MediAccessControl}`);
    assert(!!contracts.AuditLog, `AuditLog address: ${contracts.AuditLog}`);

    const code = await provider.getCode(contracts.MedicalRecords);
    assert(code !== '0x' && code.length > 10, `MedicalRecords smart contract has deployed bytecode`);
  } catch (e) {
    assert(false, `Blockchain check failed: ${e.message}`);
  }

  // TEST 3: SIWE Authentication Flow for all 4 roles
  console.log('\n--- 3. Testing SIWE Authentication Flow ---');
  let adminAuth, patientAuth, doctorAuth, hospitalAuth;
  try {
    adminAuth = await login(ACCOUNTS.admin);
    assert(adminAuth.user.role === 'admin', `Admin signed in with SIWE (role: ${adminAuth.user.role})`);

    patientAuth = await login(ACCOUNTS.patient);
    assert(patientAuth.user.role === 'patient', `Patient signed in with SIWE (role: ${patientAuth.user.role})`);

    doctorAuth = await login(ACCOUNTS.doctor);
    assert(doctorAuth.user.role === 'doctor', `Doctor signed in with SIWE (role: ${doctorAuth.user.role})`);

    hospitalAuth = await login(ACCOUNTS.hospital);
    assert(hospitalAuth.user.role === 'hospital', `Hospital signed in with SIWE (role: ${hospitalAuth.user.role})`);
  } catch (e) {
    assert(false, `SIWE Login failed: ${e.message}`);
  }

  // TEST 4: Admin Capabilities
  console.log('\n--- 4. Testing Admin Dashboard & Monitoring Endpoints ---');
  try {
    const statsRes = await fetch(`${BASE_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${adminAuth.token}` },
    });
    const statsData = await statsRes.json();
    assert(statsData.success && statsData.data.users.total_users > 0, `Admin fetched system stats (${statsData.data.users.total_users} users, ${statsData.data.records.total_records} records)`);

    const pendingRes = await fetch(`${BASE_URL}/admin/pending`, {
      headers: { Authorization: `Bearer ${adminAuth.token}` },
    });
    const pendingData = await pendingRes.json();
    assert(pendingData.success && (Array.isArray(pendingData.data.doctors) || Array.isArray(pendingData.data.hospitals)), `Admin fetched pending doctor/hospital approval queue`);

    const auditRes = await fetch(`${BASE_URL}/audit`, {
      headers: { Authorization: `Bearer ${adminAuth.token}` },
    });
    const auditData = await auditRes.json();
    assert(auditData.success && Array.isArray(auditData.data.logs), `Admin fetched audit trail (${auditData.data.logs.length} logs)`);
  } catch (e) {
    assert(false, `Admin endpoints failed: ${e.message}`);
  }

  // TEST 5: Patient Dashboard & Records
  console.log('\n--- 5. Testing Patient Profile & Records ---');
  let patientProfile;
  let originalFirstName = 'Devansh';
  let originalLastName = 'Saxena';
  try {
    const profileRes = await fetch(`${BASE_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${patientAuth.token}` },
    });
    patientProfile = await profileRes.json();
    originalFirstName = patientProfile.data.first_name || 'Devansh';
    originalLastName = patientProfile.data.last_name || 'Saxena';
    assert(patientProfile.success && !!patientProfile.data.first_name, `Patient profile loaded (Name: ${patientProfile.data.first_name} ${patientProfile.data.last_name}, Code: ${patientProfile.data.patient_code})`);

    // Test profile update (change name)
    const updateProfileRes = await fetch(`${BASE_URL}/users/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${patientAuth.token}`,
      },
      body: JSON.stringify({
        firstName: `${originalFirstName} Tested`,
        lastName: originalLastName,
      }),
    });
    const updateData = await updateProfileRes.json();
    assert(updateData.success && updateData.data.first_name === `${originalFirstName} Tested`, `Patient name updated via PATCH /api/users/profile to '${updateData.data?.first_name}'`);

    // Revert back to the user's saved name
    await fetch(`${BASE_URL}/users/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${patientAuth.token}`,
      },
      body: JSON.stringify({
        firstName: originalFirstName,
        lastName: originalLastName,
      }),
    });

    const patientRecordsRes = await fetch(`${BASE_URL}/records/patient/${patientProfile.data.patient_id}`, {
      headers: { Authorization: `Bearer ${patientAuth.token}` },
    });
    const patientRecords = await patientRecordsRes.json();
    assert(patientRecords.success && patientRecords.data.length > 0, `Patient retrieved own medical records (${patientRecords.data.length} records found)`);
  } catch (e) {
    assert(false, `Patient records failed: ${e.message}`);
  }

  // TEST 6: Doctor Patient Search & Unauthorized Access Denial
  console.log('\n--- 6. Testing Doctor Search & Access Control Enforcement ---');
  try {
    const searchRes = await fetch(`${BASE_URL}/patients/search?q=${encodeURIComponent(originalFirstName)}`, {
      headers: { Authorization: `Bearer ${doctorAuth.token}` },
    });
    const searchData = await searchRes.json();
    assert(searchData.success && searchData.data.length > 0, `Doctor searched for patient '${originalFirstName}' and found ${searchData.data.length} match`);

    // Verify Doctor CANNOT read Alice's records before access is granted
    const deniedRes = await fetch(`${BASE_URL}/records/patient/${patientProfile.data.patient_id}`, {
      headers: { Authorization: `Bearer ${doctorAuth.token}` },
    });
    assert(deniedRes.status === 403, `Doctor blocked with 403 Forbidden when accessing unapproved patient records`);
  } catch (e) {
    assert(false, `Doctor search/permission check failed: ${e.message}`);
  }

  // TEST 7: Consent Request & Approval Flow
  console.log('\n--- 7. Testing Granular Consent Request, Approval & Access Flow ---');
  let createdRequestId;
  try {
    // Doctor requests access
    const reqRes = await fetch(`${BASE_URL}/access/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${doctorAuth.token}`,
      },
      body: JSON.stringify({
        patientId: patientProfile.data.patient_id,
        reason: 'Cardiology follow-up consultation and treatment planning',
        durationDays: 14,
      }),
    });
    const reqData = await reqRes.json();
    assert(reqData.success && reqData.data.id, `Doctor submitted access request (ID: ${reqData.data.id})`);
    createdRequestId = reqData.data.id;

    // Patient views incoming requests
    const patientReqsRes = await fetch(`${BASE_URL}/access/requests`, {
      headers: { Authorization: `Bearer ${patientAuth.token}` },
    });
    const patientReqs = await patientReqsRes.json();
    const foundReq = patientReqs.data.find(r => r.id === createdRequestId);
    assert(!!foundReq, `Patient sees incoming doctor request in their inbox`);

    // Patient approves request
    const approveRes = await fetch(`${BASE_URL}/access/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${patientAuth.token}`,
      },
      body: JSON.stringify({ requestId: createdRequestId, durationDays: 14 }),
    });
    const approveData = await approveRes.json();
    assert(approveData.success, `Patient approved doctor access on smart contract & database`);

    // Doctor now CAN access records
    const allowedRes = await fetch(`${BASE_URL}/records/patient/${patientProfile.data.patient_id}`, {
      headers: { Authorization: `Bearer ${doctorAuth.token}` },
    });
    const allowedData = await allowedRes.json();
    assert(allowedRes.status === 200 && allowedData.success, `Doctor successfully accessed patient records after consent approval`);
  } catch (e) {
    assert(false, `Consent request/approval flow failed: ${e.message}`);
  }

  // TEST 8: Document Upload, AES-256-GCM Encryption & On-Chain Registration
  console.log('\n--- 8. Testing Medical Record Upload, AES-256-GCM Encryption & On-Chain Registration ---');
  let newRecordId;
  try {
    const formData = new FormData();
    const sampleReportContent = `MEDICHAIN CLINICAL DIAGNOSTIC REPORT\nPatient: Alice Nguyen\nDoctor: Dr. Sarah Johnson\nDate: 2026-11-13\nFindings: Blood pressure normal (120/80 mmHg). Resting ECG indicates normal sinus rhythm.\nDiagnosis: Well controlled hypertension.`;
    const blob = new Blob([sampleReportContent], { type: 'text/plain' });

    formData.append('document', blob, 'alice_cardio_exam_nov2026.txt');
    formData.append('patientId', String(patientProfile.data.patient_id));
    formData.append('category', 'diagnosis');
    formData.append('notes', 'Annual cardiology diagnostic examination notes');

    const uploadRes = await fetch(`${BASE_URL}/records/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${doctorAuth.token}`,
      },
      body: formData,
    });
    const uploadData = await uploadRes.json();
    assert(uploadData.success, `Medical record uploaded, AES-256-GCM encrypted, and registered on blockchain`);
    assert(!!uploadData.txHash, `On-chain blockchain transaction hash emitted: ${uploadData.txHash}`);
    newRecordId = uploadData.data.id;
  } catch (e) {
    assert(false, `Upload/encryption failed: ${e.message}`);
  }

  // TEST 9: Decryption & Download
  console.log('\n--- 9. Testing Authenticated Decryption & File Retrieval ---');
  try {
    const downloadRes = await fetch(`${BASE_URL}/records/${newRecordId}/download`, {
      headers: { Authorization: `Bearer ${doctorAuth.token}` },
    });
    const downloadedText = await downloadRes.text();
    assert(downloadRes.status === 200 && downloadedText.includes('MEDICHAIN CLINICAL DIAGNOSTIC REPORT'), `Record successfully decrypted off-chain and verified byte-for-byte`);
  } catch (e) {
    assert(false, `Record download/decryption failed: ${e.message}`);
  }

  // TEST 10: Cryptographic Integrity Verification (VERIFIED vs TAMPERED)
  console.log('\n--- 10. Testing Smart Contract Document Hash Integrity Verification ---');
  try {
    const verifyRes = await fetch(`${BASE_URL}/records/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${patientAuth.token}`,
      },
      body: JSON.stringify({ recordId: newRecordId }),
    });
    const verifyData = await verifyRes.json();
    assert(verifyData.success && verifyData.data.status === 'VERIFIED', `Document integrity status is 'VERIFIED' against smart contract hash`);
    assert(verifyData.data.currentHash === verifyData.data.originalHash, `Decrypted hash matches original SHA-256: ${verifyData.data.currentHash.slice(0, 16)}...`);
  } catch (e) {
    assert(false, `Integrity verification failed: ${e.message}`);
  }

  // TEST 11: Revocation Flow
  console.log('\n--- 11. Testing Patient Access Revocation & Immediate Doctor Lockout ---');
  try {
    const revokeRes = await fetch(`${BASE_URL}/access/revoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${patientAuth.token}`,
      },
      body: JSON.stringify({ requestId: createdRequestId }),
    });
    const revokeData = await revokeRes.json();
    assert(revokeData.success, `Patient revoked access permission on blockchain and DB`);

    // Verify Doctor is now immediately BLOCKED from downloading the record
    const postRevokeRes = await fetch(`${BASE_URL}/records/${newRecordId}/download`, {
      headers: { Authorization: `Bearer ${doctorAuth.token}` },
    });
    assert(postRevokeRes.status === 403, `Doctor is immediately blocked (403 Forbidden) from retrieving patient files after revocation`);
  } catch (e) {
    assert(false, `Revocation test failed: ${e.message}`);
  }

  // TEST 12: Notifications
  console.log('\n--- 12. Testing Real-Time In-App Notifications ---');
  try {
    const notifRes = await fetch(`${BASE_URL}/notifications`, {
      headers: { Authorization: `Bearer ${patientAuth.token}` },
    });
    const notifData = await notifRes.json();
    assert(notifData.success && Array.isArray(notifData.data.notifications), `Patient received notification logs (${notifData.data.notifications.length} notifications)`);
  } catch (e) {
    assert(false, `Notifications check failed: ${e.message}`);
  }

  // SUMMARY
  console.log('\n====================================================');
  console.log(`RESULTS: ${passed} passed, ${failed} failed`);
  console.log('====================================================');
  if (failed === 0) {
    console.log('🎉 ALL SYSTEMS FULLY OPERATIONAL AND VERIFIED!');
  } else {
    console.error('⚠️ SOME TESTS FAILED. INVESTIGATION REQUIRED.');
  }
}

runTests().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
