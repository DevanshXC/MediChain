-- Seed 006: Access Requests, Permissions, Emergency Access, Notifications
USE medichain;

-- Access Requests
INSERT INTO access_requests (id, request_uuid, doctor_id, patient_id, status, is_emergency, reason, blockchain_tx_hash, block_number, requested_at, responded_at) VALUES
(1, '0xREQ001a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f',
  1, 1, 'approved', 0, 'Ongoing cardiology care and medication management.',
  '0x1a1a2b2b3c3c4d4d5e5e6f6f7a7a8b8b9c9c0d0d1e1e2f2f3a3a4b4b5c5c6d6d',
  1024002, '2024-01-10 09:00:00', '2024-01-10 10:30:00'),

(2, '0xREQ002b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a',
  2, 2, 'approved', 0, 'Neurological assessment and MRI review for chronic headaches.',
  '0x2b2b3c3c4d4d5e5e6f6f7a7a8b8b9c9c0d0d1e1e2f2f3a3a4b4b5c5c6d6d7e7e',
  1024016, '2024-01-15 11:00:00', '2024-01-15 14:00:00'),

(3, '0xREQ003c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
  3, 3, 'approved', 0, 'Post-operative orthopedic assessment for knee pain.',
  '0x3c3c4d4d5e5e6f6f7a7a8b8b9c9c0d0d1e1e2f2f3a3a4b4b5c5c6d6d7e7e8f8f',
  1024031, '2024-02-01 08:30:00', '2024-02-01 09:00:00'),

(4, '0xREQ004d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c',
  1, 4, 'pending', 0, 'Cardiac evaluation requested for diabetic patient.',
  NULL, NULL, '2024-03-05 13:00:00', NULL),

(5, '0xREQ005e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d',
  2, 5, 'rejected', 0, 'Second opinion on thyroid diagnosis.',
  '0x5e5e6f6f7a7a8b8b9c9c0d0d1e1e2f2f3a3a4b4b5c5c6d6d7e7e8f8f9a9a0b0b',
  1024062, '2024-02-20 10:00:00', '2024-02-21 08:45:00'),

(6, '0xREQ006f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e',
  5, 10, 'approved', 0, 'Oncology follow-up and treatment monitoring.',
  '0x6f6f7a7a8b8b9c9c0d0d1e1e2f2f3a3a4b4b5c5c6d6d7e7e8f8f9a9a0b0b1c1c',
  1024091, '2024-01-25 14:00:00', '2024-01-25 15:30:00'),

(7, '0xREQ007a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f',
  3, 7, 'revoked', 0, 'Sports injury assessment and physiotherapy coordination.',
  '0x7a7a8b8b9c9c0d0d1e1e2f2f3a3a4b4b5c5c6d6d7e7e8f8f9a9a0b0b1c1c2d2d',
  1024106, '2024-02-10 09:30:00', '2024-02-10 11:00:00'),

(8, '0xREQ008b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a',
  2, 8, 'pending', 1, 'Emergency neurological assessment - patient reported sudden severe headache.',
  NULL, NULL, '2024-03-10 22:15:00', NULL);

-- Permissions (for approved requests: 1, 2, 3, 6)
INSERT INTO permissions (id, request_id, granted_at, expires_at, revoked_at, revoke_tx_hash) VALUES
(1, 1, '2024-01-10 10:30:00', '2025-01-10 10:30:00', NULL,                  NULL),
(2, 2, '2024-01-15 14:00:00', '2025-01-15 14:00:00', NULL,                  NULL),
(3, 3, '2024-02-01 09:00:00', '2025-02-01 09:00:00', NULL,                  NULL),
(4, 6, '2024-01-25 15:30:00', '2025-01-25 15:30:00', NULL,                  NULL),
-- Revoked permission for request 7
(5, 7, '2024-02-10 11:00:00', '2025-02-10 11:00:00', '2024-03-01 08:00:00', '0x8b8b9c9c0d0d1e1e2f2f3a3a4b4b5c5c6d6d7e7e8f8f9a9a0b0b1c1c2d2d3e3e');

-- Emergency Access
INSERT INTO emergency_access (id, doctor_id, patient_id, reason, approved_by, blockchain_tx_hash, expires_at) VALUES
(1, 2, 8, 'Patient presented to ER with sudden onset severe headache, vomiting, and photophobia. Emergency neuro consult required.', 1,
  '0x9c9c0d0d1e1e2f2f3a3a4b4b5c5c6d6d7e7e8f8f9a9a0b0b1c1c2d2d3e3e4f4f',
  DATE_ADD(NOW(), INTERVAL 24 HOUR));

-- Notifications
INSERT INTO notifications (id, user_id, type, title, message, is_read, related_request_id, related_record_id) VALUES
-- Alice (user_id=2, patient_id=1)
(1,  2, 'access_request',  'New Access Request',         'Dr. Sarah Johnson has requested access to your medical records for cardiology care.',   1, 1,  NULL),
(2,  2, 'access_approved', 'Access Granted',             'You have approved Dr. Sarah Johnson''s request to view your records.',                  1, 1,  NULL),
(3,  2, 'record_added',    'New Record Available',       'A new ECG report has been added to your medical records by Dr. Sarah Johnson.',         1, NULL, 1),
(4,  2, 'record_added',    'Prescription Added',         'A new prescription has been added to your records. Please review.',                     0, NULL, 2),
-- Benjamin (user_id=3, patient_id=2)
(5,  3, 'access_request',  'New Access Request',         'Dr. Michael Chen has requested access to your records for neurological assessment.',    1, 2,  NULL),
(6,  3, 'access_approved', 'Access Granted',             'You have approved Dr. Michael Chen''s access request.',                                 1, 2,  NULL),
(7,  3, 'record_added',    'Lab Report Ready',           'Your MRI brain report is now available in your MediChain records.',                     0, NULL, 3),
-- David (user_id=5, patient_id=4)
(8,  5, 'access_request',  'New Access Request',         'Dr. Sarah Johnson has requested access to your records for cardiac evaluation.',         0, 4,  NULL),
-- Eva (user_id=6, patient_id=5)
(9,  6, 'access_rejected', 'Access Request Declined',    'You have declined Dr. Michael Chen''s request for a second opinion.',                   1, 5,  NULL),
(10, 6, 'record_added',    'Diagnosis Report Added',     'A new diagnosis report for hypothyroidism has been added to your records.',              0, NULL, 9),
-- James (user_id=11, patient_id=10)
(11, 11,'access_approved', 'Access Granted',             'You have approved Dr. Lisa Martinez''s oncology follow-up access request.',             1, 6,  NULL),
(12, 11,'record_added',    'Oncology Record Updated',    'Your oncology consultation record has been updated. Prescription also added.',          0, NULL, 14),
-- Henry (user_id=9, patient_id=8) - emergency notification
(13, 9, 'emergency_access','Emergency Access Alert',     'Dr. Michael Chen has been granted emergency access to your records. Duration: 24 hours.', 0, 8, NULL),
-- Grace (user_id=8, patient_id=7)
(14, 8, 'access_revoked',  'Access Revoked',             'Dr. Emily Davis''s access to your records has been revoked as requested.',              1, 7,  NULL);
