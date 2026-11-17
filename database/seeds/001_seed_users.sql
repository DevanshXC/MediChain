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
