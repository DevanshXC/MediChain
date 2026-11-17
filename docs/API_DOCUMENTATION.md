# MediChain — REST API Documentation

Base URL: `http://localhost:5000`

All endpoints except `/api/auth/*` and public registration require an `Authorization` header:
```
Authorization: Bearer <jwt_token>
```

---

## 1. Authentication Endpoints

### `POST /api/auth/nonce`
Generate or retrieve cryptographic challenge nonce for a wallet address.
- **Request Body**:
  ```json
  { "walletAddress": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" }
  ```
- **Response `200`**:
  ```json
  {
    "success": true,
    "data": {
      "nonce": "c6a28bf2...",
      "message": "Sign this message to authenticate with MediChain.\nNonce: c6a28bf2..."
    }
  }
  ```

### `POST /api/auth/verify`
Verifies the cryptographic ECDSA signature from MetaMask and issues a 24-hour JWT token.
- **Request Body**:
  ```json
  {
    "walletAddress": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    "nonce": "c6a28bf2...",
    "signature": "0x4355c47d63924e..."
  }
  ```
- **Response `200`**:
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsIn...",
      "user": {
        "id": 2,
        "walletAddress": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
        "role": "patient",
        "status": "approved"
      }
    }
  }
  ```

---

## 2. User & Profile Endpoints

### `POST /api/users/register`
Register a user profile with role-specific details.
- **Request Body**:
  ```json
  {
    "walletAddress": "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    "role": "doctor",
    "profileData": {
      "firstName": "Sarah",
      "lastName": "Johnson",
      "licenseNumber": "MED-LIC-44821",
      "specialization": "Cardiology",
      "qualification": "MD, FACC",
      "phone": "+1 555-0133"
    }
  }
  ```
- **Response `201`**:
  ```json
  {
    "success": true,
    "message": "Registration submitted. Awaiting administrator approval.",
    "data": { "id": 4, "role": "doctor", "status": "pending" }
  }
  ```

### `GET /api/users/profile`
Fetch authenticated user profile with joined role-specific details.

### `GET /api/users` (Admin only)
Paginated list of all registered platform users.

---

## 3. Medical Record Endpoints

### `POST /api/records/upload`
Upload a medical record document with AES-256-GCM encryption & on-chain hash commitment.
- **Headers**: `Content-Type: multipart/form-data`
- **Form Fields**:
  - `document`: Binary file (PDF, PNG, JPG, DOCX, TXT)
  - `patientId`: Integer patient identifier
  - `category`: `diagnosis` | `prescription` | `lab_report` | `medical_history` | `consultation` | `discharge_summary`
  - `notes`: String
- **Response `201`**:
  ```json
  {
    "success": true,
    "data": {
      "id": 14,
      "record_uuid": "f81d4fae-7dec-11d0-a765-00a0c91e6bf6",
      "patient_id": 1,
      "category": "diagnosis",
      "original_filename": "echocardiogram_report.pdf",
      "file_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      "blockchain_tx_hash": "0x5d46c8e390c8b..."
    },
    "txHash": "0x5d46c8e390c8b..."
  }
  ```

### `GET /api/records/patient/:patientId`
List medical records for a patient (requires valid doctor consent or patient ownership).

### `GET /api/records/:id/download`
Streams the decrypted plaintext document for authorized users.

### `POST /api/records/verify`
Performs cryptographic document integrity check comparing off-chain file hash with `MedicalRecords.sol`.
- **Request Body**:
  ```json
  { "recordId": "f81d4fae-7dec-11d0-a765-00a0c91e6bf6" }
  ```
- **Response `200`**:
  ```json
  {
    "success": true,
    "data": {
      "status": "VERIFIED",
      "originalHash": "e3b0c442...",
      "currentHash": "e3b0c442...",
      "onChainHash": "e3b0c442...",
      "txHash": "0x5d46c...",
      "verifiedAt": "2026-11-12T12:00:00.000Z"
    }
  }
  ```

---

## 4. Access & Consent Endpoints

### `POST /api/access/request`
Doctor submits an access request for patient records.
- **Request Body**:
  ```json
  {
    "patientId": 1,
    "isEmergency": false,
    "reason": "Cardiology diagnostic evaluation",
    "durationDays": 14
  }
  ```

### `GET /api/access/requests`
Fetch access requests scoped to the authenticated role.

### `POST /api/access/approve`
Patient approves an access request, writing approval to `MediAccessControl.sol`.
- **Request Body**:
  ```json
  { "requestId": "UUID-OR-ID", "durationDays": 14 }
  ```

### `POST /api/access/reject`
Patient rejects an access request.

### `POST /api/access/revoke`
Patient revokes an active permission on-chain. Future backend file access is blocked.

---

## 5. Audit & Admin Endpoints

- `GET /api/audit`: Paginated system audit log
- `GET /api/audit/patient/:patientId`: Patient-specific audit trail
- `GET /api/admin/stats`: User counts, records, permissions, categories
- `GET /api/admin/pending`: List pending doctor and hospital registrations
- `POST /api/admin/approve-doctor`: Approve doctor account
- `POST /api/admin/approve-hospital`: Approve hospital facility
- `POST /api/admin/suspend-user`: Suspend unauthorized account
- `GET /api/admin/transactions`: Real-time blockchain transaction log

