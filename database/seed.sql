-- ============================================================
--  MediChain Seed Data
--  Combined seed file — run after schema.sql.
--  Generated: 2026-11-12
-- ============================================================

-- ============================================================
--  001_seed_users.sql
-- ============================================================
-- Seed 001: Users
-- Hardhat accounts (well-known test addresses)
USE medichain;

INSERT INTO users (id, wallet_address, role, status, email) VALUES
-- Admin (Hardhat account 0)
(1,  '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 'admin',    'approved', 'admin@medichain.io'),
-- Patients (Hardhat accounts 1, 2 + 8 fictional)
(2,  '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', 'patient',  'approved', 'alice.nguyen@email.com'),
(3,  '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', 'patient',  'approved', 'ben.okafor@email.com'),
(4,  '0xA1B2C3D4E5F6a7b8c9d0e1f2a3b4c5d6e7f8a9b0', 'patient', 'approved', 'carla.reyes@email.com'),
(5,  '0xB2C3D4E5F6A7b8C9d0e1f2a3b4C5d6E7f8A9b0C1', 'patient','approved', 'david.kim@email.com'),
(6,  '0xC3D4E5F6A7B8c9D0e1F2a3B4c5D6e7F8a9B0c1D2', 'patient','approved', 'eva.patel@email.com'),
(7,  '0xD4E5F6A7B8C9d0E1f2A3b4C5d6E7f8A9b0C1d2E3', 'patient','approved', 'frank.lopes@email.com'),
(8,  '0xE5F6A7B8C9D0e1F2a3B4c5D6e7F8a9B0c1D2e3F4', 'patient','approved', 'grace.wu@email.com'),
(9,  '0xF6A7B8C9D0E1f2A3b4C5d6E7f8A9b0C1d2E3f4A5', 'patient','pending',  'henry.osei@email.com'),
(10, '0xA7B8C9D0E1F2a3B4c5D6e7F8a9B0c1D2e3F4a5B6', 'patient','approved', 'iris.tanaka@email.com'),
(11, '0xB8C9D0E1F2A3b4C5d6E7f8A9b0C1d2E3f4A5b6C7', 'patient','approved', 'james.obi@email.com'),
-- Doctors (Hardhat accounts 3, 4 + 3 fictional)
(12, '0x90F79bf6EB2c4f870365E785982E1f101E93b906', 'doctor',   'approved', 'sarah.johnson@medichain.io'),
(13, '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65', 'doctor',   'approved', 'michael.chen@medichain.io'),
(14, '0xC9D0E1F2A3B4c5D6e7F8a9B0c1D2e3F4a5B6c7D8', 'doctor', 'approved', 'emily.davis@medichain.io'),
(15, '0xD0E1F2A3B4C5d6E7f8A9b0C1d2E3f4A5b6C7d8E9', 'doctor', 'pending',  'robert.wilson@medichain.io'),
(16, '0xE1F2A3B4C5D6e7F8a9B0c1D2e3F4a5B6c7D8e9F0', 'doctor', 'pending',  'lisa.martinez@medichain.io'),
-- Hospitals (Hardhat accounts 5, 6, 7)
(17, '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc', 'hospital', 'approved', 'info@citygeneral.com'),
(18, '0x976EA74026E726554dB657fA54763abd0C3a0aa9', 'hospital', 'approved', 'admin@metromedical.com'),
(19, '0x14dC79964da2C08b23698B3D3cc7Ca32193d9955', 'hospital', 'approved', 'contact@stlukes.com');


-- ============================================================
--  002_seed_patients.sql
-- ============================================================
-- Seed 002: Patients
USE medichain;

INSERT INTO patients (id, user_id, patient_code, first_name, last_name, date_of_birth, gender, blood_type, phone, address, emergency_contact) VALUES
(1,  2,  'PAT001', 'Alice',   'Nguyen',   '1988-03-15', 'female', 'O+',  '+1-555-0101', '12 Maple St, Springfield, IL 62701', 'Tom Nguyen: +1-555-0102'),
(2,  3,  'PAT002', 'Benjamin','Okafor',   '1975-07-22', 'male',   'A+',  '+1-555-0103', '45 Oak Ave, Chicago, IL 60601',       'Linda Okafor: +1-555-0104'),
(3,  4,  'PAT003', 'Carla',   'Reyes',    '1992-11-08', 'female', 'B-',  '+1-555-0105', '78 Pine Rd, Peoria, IL 61602',        'Marco Reyes: +1-555-0106'),
(4,  5,  'PAT004', 'David',   'Kim',      '1984-05-30', 'male',   'AB+', '+1-555-0107', '33 Elm Blvd, Aurora, IL 60505',       'Mia Kim: +1-555-0108'),
(5,  6,  'PAT005', 'Eva',     'Patel',    '1996-09-14', 'female', 'A-',  '+1-555-0109', '90 Cedar Lane, Rockford, IL 61101',   'Raj Patel: +1-555-0110'),
(6,  7,  'PAT006', 'Frank',   'Lopes',    '1963-12-01', 'male',   'O-',  '+1-555-0111', '55 Birch Way, Joliet, IL 60432',      'Ana Lopes: +1-555-0112'),
(7,  8,  'PAT007', 'Grace',   'Wu',       '2001-02-28', 'female', 'B+',  '+1-555-0113', '17 Walnut Ct, Naperville, IL 60540',  'Wei Wu: +1-555-0114'),
(8,  9,  'PAT008', 'Henry',   'Osei',     '1979-06-17', 'male',   'A+',  '+1-555-0115', '62 Spruce Dr, Evanston, IL 60201',    'Abena Osei: +1-555-0116'),
(9,  10, 'PAT009', 'Iris',    'Tanaka',   '1990-04-05', 'female', 'AB-', '+1-555-0117', '28 Ash St, Waukegan, IL 60085',       'Ken Tanaka: +1-555-0118'),
(10, 11, 'PAT010', 'James',   'Obi',      '1955-10-19', 'male',   'O+',  '+1-555-0119', '44 Poplar Ave, Decatur, IL 62521',    'Ngozi Obi: +1-555-0120');


-- ============================================================
--  003_seed_doctors.sql
-- ============================================================
-- Seed 003: Doctors
USE medichain;

INSERT INTO doctors (id, user_id, hospital_id, doctor_code, first_name, last_name, license_number, specialization, qualification, phone, blockchain_tx_hash, approved_at) VALUES
(1, 12, 1, 'DOC001', 'Sarah',   'Johnson',  'LIC-IL-CARD-10041', 'Cardiology',    'MD, FACC - Johns Hopkins University',          '+1-555-0201', '0xaaaa1111bbbb2222cccc3333dddd4444eeee5555ffff6666aaaa1111bbbb2222', NOW()),
(2, 13, 2, 'DOC002', 'Michael', 'Chen',     'LIC-IL-NEUR-20072', 'Neurology',     'MD, PhD - Stanford University School of Med',  '+1-555-0202', '0xbbbb2222cccc3333dddd4444eeee5555ffff6666aaaa1111bbbb2222cccc3333', NOW()),
(3, 14, 1, 'DOC003', 'Emily',   'Davis',    'LIC-IL-ORTH-30083', 'Orthopedics',   'MD, FAAOS - University of Chicago Pritzker',   '+1-555-0203', '0xcccc3333dddd4444eeee5555ffff6666aaaa1111bbbb2222cccc3333dddd4444', NOW()),
(4, 15, 3, 'DOC004', 'Robert',  'Wilson',   'LIC-IL-PEDS-40094', 'Pediatrics',    'MD, FAAP - Northwestern University Feinberg',  '+1-555-0204', NULL, NULL),
(5, 16, 2, 'DOC005', 'Lisa',    'Martinez', 'LIC-IL-ONCO-50105', 'Oncology',      'MD, FASCO - University of Illinois Chicago',   '+1-555-0205', NULL, NULL);


-- ============================================================
--  004_seed_hospitals.sql
-- ============================================================
-- Seed 004: Hospitals
USE medichain;

INSERT INTO hospitals (id, user_id, hospital_code, name, registration_number, address, phone, email, website, specialty_areas, blockchain_tx_hash, approved_at) VALUES
(1, 17, 'HOSP001', 'City General Hospital',
  'REG-IL-2010-00147',
  '500 N Michigan Ave, Chicago, IL 60611',
  '+1-312-555-0300',
  'info@citygeneral.com',
  'https://www.citygeneral.com',
  'Cardiology,Orthopedics,Emergency Medicine,Internal Medicine',
  '0xdddd4444eeee5555ffff6666aaaa1111bbbb2222cccc3333dddd4444eeee5555',
  NOW()),
(2, 18, 'HOSP002', 'Metro Medical Center',
  'REG-IL-2008-00293',
  '1200 W Harrison St, Chicago, IL 60607',
  '+1-312-555-0301',
  'admin@metromedical.com',
  'https://www.metromedical.com',
  'Neurology,Oncology,Radiology,Surgery',
  '0xeeee5555ffff6666aaaa1111bbbb2222cccc3333dddd4444eeee5555ffff6666',
  NOW()),
(3, 19, 'HOSP003', 'St. Luke''s Healthcare',
  'REG-IL-2015-00581',
  '1801 W Taylor St, Chicago, IL 60612',
  '+1-312-555-0302',
  'contact@stlukes.com',
  'https://www.stlukes.com',
  'Pediatrics,Obstetrics,Family Medicine,Rehabilitation',
  '0xffff6666aaaa1111bbbb2222cccc3333dddd4444eeee5555ffff6666aaaa1111',
  NOW());


-- ============================================================
--  005_seed_records.sql
-- ============================================================
-- Seed 005: Medical Records
USE medichain;

INSERT INTO medical_records (id, record_uuid, patient_id, doctor_id, hospital_id, category, original_filename, encrypted_filename, file_hash, file_size, mime_type, blockchain_record_id, blockchain_tx_hash, block_number, notes) VALUES
-- Patient 1 (Alice Nguyen) - Cardiology records
(1,  '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
  1, 1, 1, 'diagnosis',
  'alice_ecg_report_2024.pdf', 'enc_a1b2c3d4_alice_ecg_report_2024.pdf',
  'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
  245760, 'application/pdf',
  '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
  '0x1111aaaa2222bbbb3333cccc4444dddd5555eeee6666ffff1111aaaa2222bbbb33',
  1024001,
  'Patient presents with mild hypertension. ECG shows normal sinus rhythm. Recommend lifestyle modifications.'),

(2,  '0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c',
  1, 1, 1, 'prescription',
  'alice_prescription_lisinopril_2024.pdf', 'enc_b2c3d4e5_alice_prescription_2024.pdf',
  'b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3',
  51200, 'application/pdf',
  '0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1',
  '0x2222bbbb3333cccc4444dddd5555eeee6666ffff1111aaaa2222bbbb3333cccc44',
  1024015,
  'Prescribed Lisinopril 10mg once daily. Follow up in 4 weeks.'),

-- Patient 2 (Benjamin Okafor) - Neurology records
(3,  '0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d',
  2, 2, 2, 'lab_report',
  'benjamin_mri_brain_2024.pdf', 'enc_c3d4e5f6_benjamin_mri_2024.pdf',
  'c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4',
  2097152, 'application/pdf',
  '0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2',
  '0x3333cccc4444dddd5555eeee6666ffff1111aaaa2222bbbb3333cccc4444dddd55',
  1024030,
  'MRI brain without contrast. No acute intracranial abnormality detected. Small white matter changes consistent with age.'),

(4,  '0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e',
  2, 2, 2, 'consultation',
  'benjamin_neurology_consult_2024.pdf', 'enc_d4e5f6a7_benjamin_consult_2024.pdf',
  'd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5',
  128000, 'application/pdf',
  '0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3',
  '0x4444dddd5555eeee6666ffff1111aaaa2222bbbb3333cccc4444dddd5555eeee66',
  1024045,
  'Patient referred for recurring headaches. Tension-type headaches likely. Prescribed topiramate prophylaxis.'),

-- Patient 3 (Carla Reyes) - Orthopedics
(5,  '0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f',
  3, 3, 1, 'lab_report',
  'carla_xray_knee_2024.pdf', 'enc_e5f6a7b8_carla_xray_2024.pdf',
  'e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6',
  3145728, 'application/pdf',
  '0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4',
  '0x5555eeee6666ffff1111aaaa2222bbbb3333cccc4444dddd5555eeee6666ffff11',
  1024060,
  'X-Ray right knee. Mild patellofemoral arthritis. No fracture or dislocation.'),

(6,  '0x6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a',
  3, 3, 1, 'prescription',
  'carla_prescription_nsaid_2024.pdf', 'enc_f6a7b8c9_carla_prescription_2024.pdf',
  'f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7',
  40960, 'application/pdf',
  '0x6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5',
  '0x6666ffff1111aaaa2222bbbb3333cccc4444dddd5555eeee6666ffff1111aaaa22',
  1024075,
  'Prescribed Naproxen 500mg twice daily with food. Physical therapy referral given.'),

-- Patient 4 (David Kim)
(7,  '0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b',
  4, 1, 1, 'medical_history',
  'david_medical_history_2024.pdf', 'enc_a7b8c9d0_david_history_2024.pdf',
  'a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8',
  512000, 'application/pdf',
  '0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6',
  '0x7777aaaa1111bbbb2222cccc3333dddd4444eeee5555ffff7777aaaa1111bbbb22',
  1024090,
  'Comprehensive medical history. Known type 2 diabetes, well-controlled on Metformin. No known drug allergies.'),

(8,  '0x8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c',
  4, 1, 1, 'lab_report',
  'david_hba1c_labs_2024.pdf', 'enc_b8c9d0e1_david_labs_2024.pdf',
  'b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9',
  98304, 'application/pdf',
  '0x8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7',
  '0x8888bbbb2222cccc3333dddd4444eeee5555ffff8888bbbb2222cccc3333dddd44',
  1024105,
  'HbA1c: 6.8% (target met). Creatinine: 0.9 mg/dL. eGFR: 88 mL/min. Lipid panel within normal limits.'),

-- Patient 5 (Eva Patel)
(9,  '0x9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d',
  5, 2, 2, 'diagnosis',
  'eva_thyroid_diagnosis_2024.pdf', 'enc_c9d0e1f2_eva_diagnosis_2024.pdf',
  'c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0',
  163840, 'application/pdf',
  '0x9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8',
  '0x9999cccc3333dddd4444eeee5555ffff9999cccc3333dddd4444eeee5555ffff33',
  1024120,
  'Hypothyroidism confirmed. TSH: 7.2 mIU/L. Free T4: 0.6 ng/dL. Starting levothyroxine 50mcg.'),

-- Patient 6 (Frank Lopes)
(10, '0xa0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1',
  6, 1, 1, 'discharge_summary',
  'frank_discharge_summary_2024.pdf', 'enc_d0e1f2a3_frank_discharge_2024.pdf',
  'd0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1',
  307200, 'application/pdf',
  '0xa0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9',
  '0xaaaadddd4444eeee5555ffff6666aaaa1111bbbb2222cccc3333dddd4444eeee55',
  1024135,
  'Discharged after 3-day admission for community-acquired pneumonia. Completed IV antibiotics. Prescribed oral amoxicillin 875mg for 7 days. Follow up in 1 week.'),

-- Patient 7 (Grace Wu)
(11, '0xb1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2',
  7, 3, 1, 'consultation',
  'grace_sports_consult_2024.pdf', 'enc_e1f2a3b4_grace_consult_2024.pdf',
  'e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2',
  204800, 'application/pdf',
  '0xb1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0',
  '0xbbbbeeee5555ffff6666aaaa1111bbbb2222cccc3333dddd4444eeee5555ffff66',
  1024150,
  'Sports injury consultation. Grade II ankle sprain. RICE protocol. Physiotherapy recommended. Expected recovery 4-6 weeks.'),

-- Patient 8 (Henry Osei)
(12, '0xc2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3',
  8, 2, 2, 'lab_report',
  'henry_blood_panel_2024.pdf', 'enc_f2a3b4c5_henry_labs_2024.pdf',
  'f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3',
  122880, 'application/pdf',
  '0xc2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1',
  '0xccccffff6666aaaa1111bbbb2222cccc3333dddd4444eeee5555ffff6666aaaa11',
  1024165,
  'Complete blood count normal. PSA: 1.4 ng/mL (within normal range for age). Cholesterol: 195 mg/dL.'),

-- Patient 9 (Iris Tanaka)
(13, '0xd3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4',
  9, 1, 1, 'diagnosis',
  'iris_cardio_stress_test_2024.pdf', 'enc_a3b4c5d6_iris_diagnosis_2024.pdf',
  'a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4',
  184320, 'application/pdf',
  '0xd3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2',
  '0xddddaaaa1111bbbb2222cccc3333dddd4444eeee5555ffff6666aaaa1111bbbb22',
  1024180,
  'Stress echocardiogram: normal wall motion. No significant coronary artery disease. Exercise capacity good.'),

-- Patient 10 (James Obi)
(14, '0xe4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5',
  10, 5, 2, 'diagnosis',
  'james_oncology_consult_2024.pdf', 'enc_b4c5d6e7_james_oncology_2024.pdf',
  'b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5',
  409600, 'application/pdf',
  '0xe4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3',
  '0xeeeebbbbb2222cccc3333dddd4444eeee5555ffff6666aaaa1111bbbb2222cccc33',
  1024195,
  'Follow-up oncology visit. Stage II CRC. Completed adjuvant chemotherapy. CEA within normal limits. Next colonoscopy in 12 months.'),

(15, '0xf5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6',
  10, 5, 2, 'prescription',
  'james_maintenance_prescription_2024.pdf', 'enc_c5d6e7f8_james_prescription_2024.pdf',
  'c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6',
  61440, 'application/pdf',
  '0xf5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4',
  '0xffffcccc3333dddd4444eeee5555ffff6666aaaa1111bbbb2222cccc3333dddd44',
  1024210,
  'Maintenance therapy: Aspirin 81mg daily, Calcium 600mg + Vitamin D3 1000IU daily.');


-- ============================================================
--  006_seed_access.sql
-- ============================================================
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


