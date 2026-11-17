-- Migration 004: Additional hospital indexes
USE medichain;

ALTER TABLE hospitals ADD INDEX idx_hospital_code (hospital_code);
