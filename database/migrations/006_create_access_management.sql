-- Migration 006: Create access management tables
USE medichain;

CREATE TABLE IF NOT EXISTS access_requests (
  id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  request_uuid       VARCHAR(66)  NOT NULL UNIQUE,
  doctor_id          INT UNSIGNED NOT NULL,
  patient_id         INT UNSIGNED NOT NULL,
  status             ENUM('pending','approved','rejected','revoked') NOT NULL DEFAULT 'pending',
  is_emergency       TINYINT(1)   NOT NULL DEFAULT 0,
  reason             TEXT,
  blockchain_tx_hash VARCHAR(66),
  block_number       INT UNSIGNED,
  requested_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  responded_at       TIMESTAMP NULL,
  created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (doctor_id)  REFERENCES doctors(id)   ON DELETE CASCADE,
  FOREIGN KEY (patient_id) REFERENCES patients(id)  ON DELETE CASCADE,
  INDEX idx_doctor  (doctor_id),
  INDEX idx_patient (patient_id),
  INDEX idx_status  (status)
);

CREATE TABLE IF NOT EXISTS permissions (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  request_id   INT UNSIGNED NOT NULL UNIQUE,
  granted_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at   TIMESTAMP NULL,
  revoked_at   TIMESTAMP NULL,
  revoke_tx_hash VARCHAR(66),
  FOREIGN KEY (request_id) REFERENCES access_requests(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS emergency_access (
  id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  doctor_id          INT UNSIGNED NOT NULL,
  patient_id         INT UNSIGNED NOT NULL,
  reason             TEXT NOT NULL,
  approved_by        INT UNSIGNED,
  blockchain_tx_hash VARCHAR(66),
  expires_at         TIMESTAMP NOT NULL,
  created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (doctor_id)  REFERENCES doctors(id),
  FOREIGN KEY (patient_id) REFERENCES patients(id)
);
