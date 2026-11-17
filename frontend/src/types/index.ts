export interface User {
  id: number;
  walletAddress: string;
  role: 'patient' | 'doctor' | 'hospital' | 'admin';
  status: string;
}

export interface Patient {
  id: number;
  userId: number;
  patientCode: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: string;
  bloodType?: string;
  phone?: string;
  address?: string;
}

export interface Doctor {
  id: number;
  userId: number;
  hospitalId?: number;
  doctorCode: string;
  firstName: string;
  lastName: string;
  licenseNumber: string;
  specialization: string;
  qualification?: string;
  phone?: string;
  hospital?: Hospital;
}

export interface Hospital {
  id: number;
  userId: number;
  hospitalCode: string;
  name: string;
  registrationNumber: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  specialtyAreas?: string;
}

export interface MedicalRecord {
  id: number;
  recordUuid: string;
  patientId: number;
  doctorId?: number;
  hospitalId?: number;
  category: string;
  originalFilename: string;
  fileHash: string;
  blockchainTxHash?: string;
  notes?: string;
  createdAt: string;
  doctor?: Doctor;
  hospital?: Hospital;
  patient?: Patient;
}

export interface AccessRequest {
  id: number;
  requestUuid: string;
  doctorId: number;
  patientId: number;
  status: 'pending' | 'approved' | 'rejected' | 'revoked';
  isEmergency: boolean;
  reason?: string;
  requestedAt: string;
  respondedAt?: string;
  expiresAt?: string;
  doctor?: Doctor;
  patient?: Patient;
}

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: number;
  eventType: string;
  actorId?: number;
  actorAddress?: string;
  description?: string;
  blockchainTxHash?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface WalletState {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
}

export interface DashboardStats {
  totalRecords?: number;
  authorizedDoctors?: number;
  pendingRequests?: number;
  totalPatients?: number;
  totalUsers?: number;
  totalHospitals?: number;
  totalBlockchainTx?: number;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}
