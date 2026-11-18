import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BrowserProvider, ethers } from 'ethers';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (walletAddress: string, provider: BrowserProvider) => Promise<User>;
  loginWithPrivateKey: (privateKey: string) => Promise<User>;
  logout: () => void;
  loadProfile: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('medichain_token'));
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('medichain_token');
    if (!stored) return null;
    try {
      const parts = stored.split('.');
      if (parts[1]) {
        const decoded = JSON.parse(atob(parts[1]));
        return {
          id: decoded.id,
          walletAddress: decoded.walletAddress,
          role: decoded.role,
          status: decoded.status,
        } as User;
      }
    } catch {
      return null;
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    return !!localStorage.getItem('medichain_token') && !user;
  });
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    const storedToken = localStorage.getItem('medichain_token');
    if (!storedToken) return;
    try {
      setIsLoading(true);
      const response = await api.get('/api/users/profile', {
        headers: { Authorization: `Bearer ${storedToken}` },
      });
      const profile = response.data.data || response.data.user || response.data;
      setUser(profile);
    } catch {
      localStorage.removeItem('medichain_token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      loadProfile();
    }
  }, [token, loadProfile]);

  const login = useCallback(async (walletAddress: string, provider: BrowserProvider): Promise<User> => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Get challenge nonce
      const nonceRes = await api.post('/api/auth/nonce', { walletAddress });
      const nonceData = nonceRes.data.data || nonceRes.data;
      const nonce = nonceData.nonce;
      const messageToSign = nonceData.message || `Sign this message to authenticate with MediChain.\nNonce: ${nonce}`;
      
      // 2. Request MetaMask signature
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(messageToSign);
      
      // 3. Verify signature and obtain JWT
      const verifyRes = await api.post('/api/auth/verify', { walletAddress, signature, nonce });
      const verifyData = verifyRes.data.data || verifyRes.data;
      const jwt = verifyData.token;
      const userData: User = verifyData.user;
      
      localStorage.setItem('medichain_token', jwt);
      setToken(jwt);
      setUser(userData);
      return userData;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string; message?: string } }; message?: string };
      const msg = e.response?.data?.error || e.response?.data?.message || e.message || 'Login failed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithPrivateKey = useCallback(async (privateKey: string): Promise<User> => {
    setIsLoading(true);
    setError(null);
    try {
      const wallet = new ethers.Wallet(privateKey);
      const walletAddress = wallet.address;

      // 1. Get challenge nonce
      const nonceRes = await api.post('/api/auth/nonce', { walletAddress });
      const nonceData = nonceRes.data.data || nonceRes.data;
      const nonce = nonceData.nonce;
      const messageToSign = nonceData.message || `Sign this message to authenticate with MediChain.\nNonce: ${nonce}`;

      // 2. Sign message using the wallet
      const signature = await wallet.signMessage(messageToSign);

      // 3. Verify signature and obtain JWT
      const verifyRes = await api.post('/api/auth/verify', { walletAddress, signature, nonce });
      const verifyData = verifyRes.data.data || verifyRes.data;
      const jwt = verifyData.token;
      const userData: User = verifyData.user;

      localStorage.setItem('medichain_token', jwt);
      setToken(jwt);
      setUser(userData);
      return userData;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string; message?: string } }; message?: string };
      const msg = e.response?.data?.error || e.response?.data?.message || e.message || 'Demo Login failed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('medichain_token');
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isLoading,
      isAuthenticated: !!user && !!token,
      login,
      loginWithPrivateKey,
      logout,
      loadProfile,
      error,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
