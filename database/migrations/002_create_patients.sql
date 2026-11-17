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
