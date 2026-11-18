import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useWallet } from '../../hooks/useWallet';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import {
  Activity,
  Wallet,
  Shield,
  AlertCircle,
  ArrowRight,
  Loader2,
  Sparkles,
  ExternalLink,
  Heart,
  Stethoscope,
  Building2,
  Lock,
  Zap,
  ChevronRight,
  UserCheck,
} from 'lucide-react';

const INITIAL_DEMO_ACCOUNTS = [
  {
    role: 'Patient',
    name: 'Devansh Saxena',
    code: 'PAT001',
    address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    privateKey: '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
    icon: Heart,
    gradient: 'from-emerald-500 to-green-600',
    lightBg: 'bg-emerald-500/10',
    textColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/20',
    hoverBorder: 'hover:border-emerald-400/50',
    btnBg: 'bg-emerald-500 hover:bg-emerald-400',
    targetRoute: '/patient/dashboard',
  },
  {
    role: 'Doctor',
    name: 'Dr. Sarah Johnson',
    code: 'Cardiology',
    address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    privateKey: '0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6',
    icon: Stethoscope,
    gradient: 'from-blue-500 to-indigo-600',
    lightBg: 'bg-blue-500/10',
    textColor: 'text-blue-400',
    borderColor: 'border-blue-500/20',
    hoverBorder: 'hover:border-blue-400/50',
    btnBg: 'bg-blue-500 hover:bg-blue-400',
    targetRoute: '/doctor/dashboard',
  },
  {
    role: 'Hospital',
    name: 'City General Hospital',
    code: 'HOSP001',
    address: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
    privateKey: '0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba',
    icon: Building2,
    gradient: 'from-purple-500 to-violet-600',
    lightBg: 'bg-purple-500/10',
    textColor: 'text-purple-400',
    borderColor: 'border-purple-500/20',
    hoverBorder: 'hover:border-purple-400/50',
    btnBg: 'bg-purple-500 hover:bg-purple-400',
    targetRoute: '/hospital/dashboard',
  },
  {
    role: 'Admin',
    name: 'Administrator',
    code: 'SYS',
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    icon: Shield,
    gradient: 'from-amber-500 to-orange-600',
    lightBg: 'bg-amber-500/10',
    textColor: 'text-amber-400',
    borderColor: 'border-amber-500/20',
    hoverBorder: 'hover:border-amber-400/50',
    btnBg: 'bg-amber-500 hover:bg-amber-400',
    targetRoute: '/admin/dashboard',
  },
];

export const Login: React.FC = () => {
  const {
    address,
    isConnected,
    isConnecting,
    connectWallet,
    provider,
    error: walletError,
    isMetaMaskAvailable,
  } = useWallet();
  const { login, loginWithPrivateKey, error: authError } = useAuth();
  const navigate = useNavigate();

  const [demoAccounts, setDemoAccounts] = useState(INITIAL_DEMO_ACCOUNTS);
  const [loading, setLoading] = useState(false);
  const [demoLoadingKey, setDemoLoadingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [walletInfo, setWalletInfo] = useState<{
    registered: boolean;
    name?: string;
    role?: string;
    status?: string;
    code?: string;
  } | null>(null);

  // Fetch live demo accounts from database so any changed name is reflected immediately
  useEffect(() => {
    let active = true;
    api
      .get('/api/auth/demo-accounts')
      .then((res) => {
        if (res.data.success && res.data.data && active) {
          const liveMap = res.data.data;
          setDemoAccounts((prev) =>
            prev.map((acc) => {
              const live = liveMap[acc.address.toLowerCase()];
              if (live) {
                return {
                  ...acc,
                  name: live.name || acc.name,
                  code: live.code || acc.code,
                };
              }
              return acc;
            })
          );
        }
      })
      .catch(() => {
        // Fall back gracefully to initial demo accounts
      });
    return () => {
      active = false;
    };
  }, []);

  // Fetch recognized profile info for currently connected MetaMask wallet
  useEffect(() => {
    if (!address) {
      setWalletInfo(null);
      return;
    }
    let active = true;
    api
      .get(`/api/auth/wallet-info/${address}`)
      .then((res) => {
        if (res.data.success && active) {
          setWalletInfo(res.data.data);
        }
      })
      .catch(() => {
        if (active) setWalletInfo(null);
      });
    return () => {
      active = false;
    };
  }, [address]);

  const displayError = error || authError || walletError;

  const handleSignIn = async () => {
    if (!address || !provider) {
      await connectWallet();
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const user = await login(address, provider);
      navigate(`/${user.role}/dashboard`);
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (account: (typeof INITIAL_DEMO_ACCOUNTS)[0]) => {
    try {
      setDemoLoadingKey(account.role);
      setError(null);
      const user = await loginWithPrivateKey(account.privateKey);
      navigate(account.targetRoute || `/${user.role}/dashboard`);
    } catch (err: any) {
      setError(err?.message || 'Demo login failed');
    } finally {
      setDemoLoadingKey(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] relative overflow-hidden flex font-sans">
      {/* Animated gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-teal-500/[0.07] blur-[120px] animate-pulse" />
        <div
          className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-blue-500/[0.05] blur-[120px] animate-pulse"
          style={{ animationDelay: '1s' }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-purple-500/[0.04] blur-[100px]" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Left Panel — Branding (hidden on small screens) */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[48%] relative flex-col justify-between p-12 z-10">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-14">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/25">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-white tracking-tight">MediChain</span>
              <span className="block text-[10px] text-teal-400 font-semibold tracking-[0.2em] uppercase">
                Decentralized Healthcare
              </span>
            </div>
          </div>

          {/* Tagline */}
          <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight tracking-tight mb-6">
            Your Health Data,
            <br />
            <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Your Rules.
            </span>
          </h1>
          <p className="text-base text-slate-400 leading-relaxed max-w-md mb-10">
            MediChain uses smart contracts and AES-256 encryption to put patients in control of who accesses their
            medical records — with tamper-proof audit trails on every interaction.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2.5">
            {[
              { icon: Lock, text: 'AES-256 Encrypted' },
              { icon: Shield, text: 'On-Chain Audit' },
              { icon: Zap, text: 'Instant Consent' },
            ].map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/[0.05] border border-white/[0.08] text-xs font-medium text-slate-300 backdrop-blur-sm"
              >
                <Icon className="w-3.5 h-3.5 text-teal-400" />
                {text}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom stats */}
        <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/[0.06]">
          {[
            { value: '256-bit', label: 'AES Encryption' },
            { value: 'SHA-256', label: 'Hash Verification' },
            { value: 'Solidity', label: 'Smart Contracts' },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-lg font-bold text-teal-400">{s.value}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="w-full lg:w-[55%] xl:w-[52%] flex items-center justify-center p-4 sm:p-8 md:p-10 z-10">
        <div className="w-full max-w-[500px] space-y-5">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/25">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">MediChain</span>
          </div>

          {/* Sign In Card */}
          <div className="bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/20">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-white tracking-tight">Welcome Back</h2>
              <p className="text-xs text-slate-400 mt-1.5">
                Authenticate with your MetaMask wallet to continue
              </p>
            </div>

            {/* Error */}
            {displayError && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1 min-w-0">
                  <p className="font-semibold text-rose-200">Connection Issue</p>
                  <p className="text-rose-300/80 leading-relaxed break-words">{displayError}</p>
                  {!isMetaMaskAvailable && (
                    <a
                      href="https://metamask.io/download/"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 mt-1 font-semibold text-rose-200 underline underline-offset-2 hover:text-white"
                    >
                      Install MetaMask <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* MetaMask Button & Wallet Recognition */}
            {!isConnected ? (
              <button
                type="button"
                onClick={connectWallet}
                disabled={isConnecting}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 active:scale-[0.99] text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-teal-500/20 disabled:opacity-70 disabled:cursor-wait"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Connecting to MetaMask...</span>
                  </>
                ) : (
                  <>
                    <Wallet className="w-4 h-4" />
                    <span>Connect MetaMask</span>
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-3.5">
                {/* Recognized Account Card */}
                {walletInfo?.registered ? (
                  <div className="p-3.5 bg-teal-500/10 border border-teal-500/20 rounded-2xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-teal-400 font-semibold">
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>{walletInfo.name}</span>
                      </div>
                      <span className="capitalize px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 font-bold text-[10px]">
                        {walletInfo.role}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>{address ? `${address.slice(0, 10)}...${address.slice(-6)}` : ''}</span>
                      <span className="capitalize text-teal-400/90">{walletInfo.status}</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-xs text-slate-300 font-mono flex items-center justify-between">
                    <span className="text-slate-400">Connected:</span>
                    <span className="font-semibold text-teal-400">
                      {address ? `${address.slice(0, 10)}...${address.slice(-6)}` : ''}
                    </span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 active:scale-[0.99] text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-teal-500/20 disabled:opacity-60 disabled:cursor-wait"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Signing Nonce...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      <span>Sign In with Wallet Signature</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </button>
              </div>
            )}

            <div className="mt-4 text-center">
              <p className="text-xs text-slate-500">
                Don't have an account?{' '}
                <Link to="/register" className="font-semibold text-teal-400 hover:text-teal-300 transition">
                  Register here
                </Link>
              </p>
            </div>
          </div>

          {/* Quick Demo Accounts */}
          <div className="bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl rounded-3xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Quick Demo Access</p>
                  <p className="text-[10px] text-slate-400">Live profiles from database</p>
                </div>
              </div>
              <span className="text-[9px] px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-400 font-bold border border-teal-500/20 uppercase tracking-wider">
                1-Click
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {demoAccounts.map((acc) => {
                const isAccLoading = demoLoadingKey === acc.role;
                const Icon = acc.icon;
                return (
                  <button
                    key={acc.role}
                    type="button"
                    disabled={isAccLoading || !!demoLoadingKey}
                    onClick={() => handleDemoLogin(acc)}
                    title={`${acc.name} (${acc.role})`}
                    className={`group relative flex items-center gap-3 p-3 rounded-2xl border ${acc.borderColor} ${acc.hoverBorder} bg-white/[0.02] hover:bg-white/[0.06] active:scale-[0.98] transition-all disabled:opacity-50 text-left`}
                  >
                    <div className={`w-9 h-9 rounded-xl ${acc.lightBg} flex items-center justify-center shrink-0`}>
                      <Icon className={`w-4 h-4 ${acc.textColor}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-white tracking-tight leading-snug truncate" title={acc.name}>
                        {acc.name}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{acc.code}</p>
                    </div>
                    <div className="shrink-0">
                      {isAccLoading ? (
                        <Loader2 className={`w-4 h-4 animate-spin ${acc.textColor}`} />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 transition" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-[10px] text-slate-600">
            Secured by Ethereum Smart Contracts • Hardhat Local Network • Solidity ^0.8.24
          </p>
        </div>
      </div>
    </div>
  );
};
