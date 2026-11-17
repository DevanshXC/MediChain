import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, FileCheck, Users, Activity, ArrowRight, CheckCircle2 } from 'lucide-react';
import { WalletConnect } from '../components/common/WalletConnect';

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Navbar */}
      <header className="h-20 border-b border-slate-800 px-8 flex items-center justify-between max-w-7xl w-full mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-teal-500/20">
            <Activity className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white">MediChain</span>
            <span className="block text-[10px] text-teal-400 font-semibold tracking-widest uppercase">Decentralized Healthcare</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl text-sm font-semibold shadow-md shadow-teal-500/20 transition"
          >
            Create Account
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-8 py-20 flex flex-col items-center text-center justify-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold mb-8">
          <Shield className="w-3.5 h-3.5" />
          Tamper-Evident Healthcare Records Powered by Smart Contracts
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight max-w-4xl leading-tight mb-6">
          Patient-Controlled Health Records & Consent Management
        </h1>

        <p className="text-lg text-slate-400 max-w-2xl mb-10 leading-relaxed">
          MediChain stores encrypted medical documents off-chain while enforcing doctor access permissions and document integrity hashes immutably on the blockchain.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <Link
            to="/login"
            className="flex items-center gap-2 px-6 py-3.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-teal-500/25 transition text-sm"
          >
            Launch MediChain App
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/register"
            className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl border border-slate-700 transition text-sm"
          >
            Register as Doctor or Patient
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full text-left">
          <div className="p-6 bg-slate-800/50 border border-slate-800 rounded-2xl hover:border-teal-500/30 transition">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 mb-4">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">AES-256-GCM Off-Chain</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Medical records are encrypted before storage. Zero private health data is ever exposed in plaintext or stored on-chain.
            </p>
          </div>

          <div className="p-6 bg-slate-800/50 border border-slate-800 rounded-2xl hover:border-teal-500/30 transition">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 mb-4">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">Granular Consent</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Patients approve, reject, or revoke doctor access requests. Smart contracts enforce permission checks before record delivery.
            </p>
          </div>

          <div className="p-6 bg-slate-800/50 border border-slate-800 rounded-2xl hover:border-teal-500/30 transition">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 mb-4">
              <FileCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">Integrity Verification</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cryptographic SHA-256 hashes registered in smart contracts detect any post-upload document tampering instantly.
            </p>
          </div>

          <div className="p-6 bg-slate-800/50 border border-slate-800 rounded-2xl hover:border-teal-500/30 transition">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 mb-4">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">On-Chain Audit Trail</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Immutable logging of record creation, doctor access, approvals, and revocations provides total transparency.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        MediChain Decentralized Healthcare System &bull; Local Hardhat Network &bull; Solidity ^0.8.24
      </footer>
    </div>
  );
};

