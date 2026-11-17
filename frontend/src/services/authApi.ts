import { api } from './api';

export const authApi = {
  getNonce: (walletAddress: string) =>
    api.post('/api/auth/nonce', { walletAddress }),

  verify: (walletAddress: string, signature: string, nonce: string) =>
    api.post('/api/auth/verify', { walletAddress, signature, nonce }),

  getProfile: () =>
    api.get('/api/users/profile'),

  register: (role: string, data: Record<string, unknown>) =>
    api.post(`/api/auth/register/${role}`, data),
};
