import { api } from './api';

export const recordsApi = {
  getMyRecords: (params?: Record<string, string>) =>
    api.get('/api/records/my', { params }),

  getPatientRecords: (patientId: number) =>
    api.get(`/api/records/patient/${patientId}`),

  uploadRecord: (formData: FormData) =>
    api.post('/api/records/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  verifyRecord: (recordId: string) =>
    api.get(`/api/records/verify/${recordId}`),

  verifyByHash: (fileHash: string) =>
    api.post('/api/records/verify-hash', { fileHash }),

  getHospitalRecords: (params?: Record<string, string>) =>
    api.get('/api/records/hospital', { params }),

  getDashboardStats: () =>
    api.get('/api/records/stats'),
};
