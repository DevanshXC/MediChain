-- ============================================================
--  MediChain Database Schema
--  Combined migration file — run once to build from scratch.
--  Generated: 2026-11-12
-- ============================================================

-- ============================================================
--  001_create_users.sql
-- ============================================================
-- Migration 001: Create users table
-- MediChain Database

CREATE DATABASE IF NOT EXISTS medichain CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE medichain;

CREATE TABLE IF NOT EXISTS users (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  wallet_address  VARCHAR(42)  NOT NULL UNIQUE,
  role            ENUM('patient','doctor','hospital','admin') NOT NULL,
  status          ENUM('pending','approved','suspended') NOT NULL DEFAULT 'pending',
  nonce           VARCHAR(64)  NOT NULL DEFAULT (UUID()),
  email           VARCHAR(255),
  created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_wallet (wallet_address),
  INDEX idx_role   (role),
  INDEX idx_status (status)
);


-- ============================================================
--  002_create_patients.sql
-- ============================================================
-- Migration 002: Create patients table
USE medichain;

CREATE TABLE IF NOT EXISTS patients (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id           INT UNSIGNED NOT NULL UNIQUE,
  patient_code      VARCHAR(20)  NOT NULL UNIQUE,
  first_name        VARCHAR(100) NOT NULL,
  last_name         VARCHAR(100) NOT NULL,
  date_of_birth     DATE,
  gender            ENUM('male','female','other'),
  blood_type        ENUM('A+','A-','B+','B-','AB+','AB-','O+','O-'),
  phone             VARCHAR(20),
  address           TEXT,
  emergency_contact VARCHAR(255),
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_patient_code (patient_code)
);


-- ============================================================
--  003_create_doctors.sql
-- ============================================================
-- Migration 003: Create hospitals and doctors tables
USE medichain;

CREATE TABLE IF NOT EXISTS hospitals (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id             INT UNSIGNED NOT NULL UNIQUE,
  hospital_code       VARCHAR(20)  NOT NULL UNIQUE,
  name                VARCHAR(255) NOT NULL,
  registration_number VARCHAR(100) NOT NULL UNIQUE,
  address             TEXT,
  phone               VARCHAR(20),
  email               VARCHAR(255),
  website             VARCHAR(255),
  specialty_areas     TEXT,
  blockchain_tx_hash  VARCHAR(128),
  approved_at         TIMESTAMP NULL,
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS doctors (
  id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id            INT UNSIGNED NOT NULL UNIQUE,
  hospital_id        INT UNSIGNED,
  doctor_code        VARCHAR(20)  NOT NULL UNIQUE,
  first_name         VARCHAR(100) NOT NULL,
  last_name          VARCHAR(100) NOT NULL,
  license_number     VARCHAR(100) NOT NULL UNIQUE,
  specialization     VARCHAR(255) NOT NULL,
  qualification      VARCHAR(255),
  phone              VARCHAR(20),
  blockchain_tx_hash VARCHAR(128),
  approved_at        TIMESTAMP NULL,
  created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)      REFERENCES users(id)      ON DELETE CASCADE,
  FOREIGN KEY (hospital_id)  REFERENCES hospitals(id)  ON DELETE SET NULL,
  INDEX idx_license  (license_number),
  INDEX idx_hospital (hospital_id)
);


-- ============================================================
--  004_create_hospitals.sql
-- ============================================================
-- Migration 004: Additional hospital indexes
USE medichain;

ALTER TABLE hospitals ADD INDEX idx_hospital_code (hospital_code);


-- ============================================================
--  005_create_medical_records.sql
-- ============================================================
-- Migration 005: Create medical_records and record_versions tables
USE medichain;

CREATE TABLE IF NOT EXISTS medical_records (
  id                   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  record_uuid          VARCHAR(128) NOT NULL UNIQUE,
  patient_id           INT UNSIGNED NOT NULL,
  doctor_id            INT UNSIGNED,
  hospital_id          INT UNSIGNED,
  category             ENUM('diagnosis','prescription','lab_report','medical_history','consultation','discharge_summary') NOT NULL,
  original_filename    VARCHAR(255) NOT NULL,
  encrypted_filename   VARCHAR(255) NOT NULL,
  file_hash            VARCHAR(128) NOT NULL,
  file_size            INT UNSIGNED,
  mime_type            VARCHAR(100),
  blockchain_record_id VARCHAR(128),
  blockchain_tx_hash   VARCHAR(128),
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
  file_hash          VARCHAR(128) NOT NULL,
  encrypted_filename VARCHAR(255) NOT NULL,
  blockchain_tx_hash VARCHAR(128),
  created_by         INT UNSIGNED,
  created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (record_id) REFERENCES medical_records(id) ON DELETE CASCADE,
  UNIQUE KEY uk_record_version (record_id, version_number)
);


-- ============================================================
--  006_create_access_management.sql
-- ============================================================
-- Migration 006: Create access management tables
USE medichain;

CREATE TABLE IF NOT EXISTS access_requests (
  id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  request_uuid       VARCHAR(128) NOT NULL UNIQUE,
  doctor_id          INT UNSIGNED NOT NULL,
  patient_id         INT UNSIGNED NOT NULL,
  status             ENUM('pending','approved','rejected','revoked') NOT NULL DEFAULT 'pending',
  is_emergency       TINYINT(1)   NOT NULL DEFAULT 0,
  reason             TEXT,
  blockchain_tx_hash VARCHAR(128),
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
  revoke_tx_hash VARCHAR(128),
  FOREIGN KEY (request_id) REFERENCES access_requests(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS emergency_access (
  id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  doctor_id          INT UNSIGNED NOT NULL,
  patient_id         INT UNSIGNED NOT NULL,
  reason             TEXT NOT NULL,
  approved_by        INT UNSIGNED,
  blockchain_tx_hash VARCHAR(128),
  expires_at         TIMESTAMP NOT NULL,
  created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (doctor_id)  REFERENCES doctors(id),
  FOREIGN KEY (patient_id) REFERENCES patients(id)
);


-- ============================================================
--  007_create_audit.sql
-- ============================================================
-- Migration 007: Create audit_logs and blockchain_transactions tables
USE medichain;

CREATE TABLE IF NOT EXISTS audit_logs (
  id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  event_type         VARCHAR(50)  NOT NULL,
  actor_user_id      INT UNSIGNED,
  subject_user_id    INT UNSIGNED,
  record_id          INT UNSIGNED,
  request_id         INT UNSIGNED,
  description        TEXT,
  metadata           JSON,
  blockchain_tx_hash VARCHAR(128),
  ip_address         VARCHAR(45),
  created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_event_type (event_type),
  INDEX idx_actor      (actor_user_id),
  INDEX idx_subject    (subject_user_id),
  INDEX idx_created    (created_at)
);

CREATE TABLE IF NOT EXISTS blockchain_transactions (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tx_hash          VARCHAR(128) NOT NULL UNIQUE,
  event_type       VARCHAR(50) NOT NULL,
  actor_address    VARCHAR(42),
  contract_address VARCHAR(42),
  block_number     INT UNSIGNED,
  gas_used         INT UNSIGNED,
  metadata         JSON,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_tx_hash (tx_hash),
  INDEX idx_actor   (actor_address)
);


-- ============================================================
--  008_create_notifications.sql
-- ============================================================
-- Migration 008: Create notifications table
USE medichain;

CREATE TABLE IF NOT EXISTS notifications (
  id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id            INT UNSIGNED NOT NULL,
  type               VARCHAR(50)  NOT NULL,
  title              VARCHAR(255) NOT NULL,
  message            TEXT NOT NULL,
  is_read            TINYINT(1)   NOT NULL DEFAULT 0,
  related_request_id INT UNSIGNED,
  related_record_id  INT UNSIGNED,
  created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_unread (user_id, is_read)
);


