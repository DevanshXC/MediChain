-- Seed 003: Doctors
USE medichain;

INSERT INTO doctors (id, user_id, hospital_id, doctor_code, first_name, last_name, license_number, specialization, qualification, phone, blockchain_tx_hash, approved_at) VALUES
(1, 12, 1, 'DOC001', 'Sarah',   'Johnson',  'LIC-IL-CARD-10041', 'Cardiology',    'MD, FACC - Johns Hopkins University',          '+1-555-0201', '0xaaaa1111bbbb2222cccc3333dddd4444eeee5555ffff6666aaaa1111bbbb2222', NOW()),
(2, 13, 2, 'DOC002', 'Michael', 'Chen',     'LIC-IL-NEUR-20072', 'Neurology',     'MD, PhD - Stanford University School of Med',  '+1-555-0202', '0xbbbb2222cccc3333dddd4444eeee5555ffff6666aaaa1111bbbb2222cccc3333', NOW()),
(3, 14, 1, 'DOC003', 'Emily',   'Davis',    'LIC-IL-ORTH-30083', 'Orthopedics',   'MD, FAAOS - University of Chicago Pritzker',   '+1-555-0203', '0xcccc3333dddd4444eeee5555ffff6666aaaa1111bbbb2222cccc3333dddd4444', NOW()),
(4, 15, 3, 'DOC004', 'Robert',  'Wilson',   'LIC-IL-PEDS-40094', 'Pediatrics',    'MD, FAAP - Northwestern University Feinberg',  '+1-555-0204', NULL, NULL),
(5, 16, 2, 'DOC005', 'Lisa',    'Martinez', 'LIC-IL-ONCO-50105', 'Oncology',      'MD, FASCO - University of Illinois Chicago',   '+1-555-0205', NULL, NULL);
