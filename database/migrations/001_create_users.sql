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
