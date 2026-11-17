-- Migration 005: Create medical_records and record_versions tables
USE medichain;

CREATE TABLE IF NOT EXISTS medical_records (
  id                   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  record_uuid          VARCHAR(66)  NOT NULL UNIQUE,
  patient_id           INT UNSIGNED NOT NULL,
  doctor_id            INT UNSIGNED,
  hospital_id          INT UNSIGNED,
  category             ENUM('diagnosis','prescription','lab_report','medical_history','consultation','discharge_summary') NOT NULL,
  original_filename    VARCHAR(255) NOT NULL,
  encrypted_filename   VARCHAR(255) NOT NULL,
  file_hash            VARCHAR(64)  NOT NULL,
  file_size            INT UNSIGNED,
  mime_type            VARCHAR(100),
  blockchain_record_id VARCHAR(66),
  blockchain_tx_hash   VARCHAR(66),
  block_number         INT UNSIGNED,
  notes                TEXT,
  created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id)  REFERENCES patients(id)  ON DELETE RESTRICT,
  FOREIGN KEY (doctor_id)   REFERENCES doctors(id)   ON DELETE SET NULL,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE SET NULL,
  INDEX idx_patient  (patient_id),
  INDEX idx_category (category),
  INDEX idx_hash     (file_hash)
);

CREATE TABLE IF NOT EXISTS record_versions (
  id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  record_id          INT UNSIGNED NOT NULL,
  version_number     INT UNSIGNED NOT NULL DEFAULT 1,
  file_hash          VARCHAR(64)  NOT NULL,
  encrypted_filename VARCHAR(255) NOT NULL,
  blockchain_tx_hash VARCHAR(66),
  created_by         INT UNSIGNED,
  created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (record_id) REFERENCES medical_records(id) ON DELETE CASCADE,
  UNIQUE KEY uk_record_version (record_id, version_number)
);
