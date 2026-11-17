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
