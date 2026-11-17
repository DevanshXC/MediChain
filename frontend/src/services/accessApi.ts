import { api } from './api';

export const accessApi = {
  getMyRequests: (status?: string) =>
    api.get('/api/access/my', { params: status ? { status } : {} }),

  createRequest: (data: {
    patientId: number;
    reason: string;
    durationDays: number;
    isEmergency: boolean;
  }) => api.post('/api/access/request', data),

  approveRequest: (requestId: number) =>
    api.post(`/api/access/${requestId}/approve`),

  rejectRequest: (requestId: number) =>
    api.post(`/api/access/${requestId}/reject`),

  revokeAccess: (requestId: number) =>
    api.post(`/api/access/${requestId}/revoke`),

  getPatientRequests: () =>
    api.get('/api/access/patient/requests'),

  getDoctorRequests: () =>
    api.get('/api/access/doctor/requests'),

  checkAccess: (patientId: number) =>
    api.get(`/api/access/check/${patientId}`),
};
