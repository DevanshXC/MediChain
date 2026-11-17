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
