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
  blockchain_tx_hash VARCHAR(66),
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
  tx_hash          VARCHAR(66) NOT NULL UNIQUE,
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
