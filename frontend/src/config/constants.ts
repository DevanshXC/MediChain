export const CHAIN_ID = 31337;
export const CHAIN_NAME = 'Hardhat Local';
export const RPC_URL = 'http://127.0.0.1:8545';
export const API_BASE_URL = 'http://localhost:5000';

export const RECORD_CATEGORIES = [
  'diagnosis',
  'prescription',
  'lab_report',
  'medical_history',
  'consultation',
  'discharge_summary',
];

export const CATEGORY_LABELS: Record<string, string> = {
  diagnosis: 'Diagnosis',
  prescription: 'Prescription',
  lab_report: 'Lab Report',
  medical_history: 'Medical History',
  consultation: 'Consultation',
  discharge_summary: 'Discharge Summary',
};

export const STATUS_COLORS: Record<string, string> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
  revoked: 'default',
  active: 'success',
  suspended: 'error',
  inactive: 'default',
};
