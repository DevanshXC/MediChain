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
  blockchain_tx_hash  VARCHAR(66),
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
  blockchain_tx_hash VARCHAR(66),
  approved_at        TIMESTAMP NULL,
  created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)      REFERENCES users(id)      ON DELETE CASCADE,
  FOREIGN KEY (hospital_id)  REFERENCES hospitals(id)  ON DELETE SET NULL,
  INDEX idx_license  (license_number),
  INDEX idx_hospital (hospital_id)
);
