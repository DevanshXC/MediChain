import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, FileCheck, Users, Activity, ArrowRight } from 'lucide-react';

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#070D1E] text-slate-100 flex flex-col font-sans relative overflow-hidden">
      {/* Background ambient sapphire glow orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-blue-600/[0.12] blur-[140px]" />
        <div className="absolute -bottom-40 -right-40 w-[550px] h-[550px] rounded-full bg-cyan-500/[0.08] blur-[140px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-indigo-600/[0.06] blur-[120px]" />
      </div>

      {/* Navbar */}
      <header className="h-20 border-b border-slate-800/80 px-8 flex items-center justify-between max-w-7xl w-full mx-auto relative z-10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/25">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white">MediChain</span>
            <span className="block text-[10px] text-cyan-400 font-semibold tracking-widest uppercase">Decentralized Healthcare</span>
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
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-500/25 transition active:scale-[0.99]"
          >
            Create Account
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-8 py-20 flex flex-col items-center text-center justify-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-cyan-400 text-xs font-semibold mb-8 backdrop-blur-sm">
          <Shield className="w-3.5 h-3.5 text-blue-400" />
          Tamper-Evident Healthcare Records Powered by Smart Contracts
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight max-w-4xl leading-tight mb-6">
          Patient-Controlled Health Records &{' '}
          <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-cyan-300 bg-clip-text text-transparent">
            Consent Management
          </span>
        </h1>

        <p className="text-lg text-slate-300 max-w-2xl mb-10 leading-relaxed">
          MediChain stores encrypted medical documents off-chain while enforcing doctor access permissions and document integrity hashes immutably on the blockchain.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <Link
            to="/login"
            className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition text-sm active:scale-[0.99]"
          >
            Launch MediChain App
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/register"
            className="px-6 py-3.5 bg-slate-800/80 hover:bg-slate-700 text-white font-semibold rounded-xl border border-slate-700/80 transition text-sm backdrop-blur-sm"
          >
            Register as Doctor or Patient
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full text-left">
          <div className="p-6 bg-slate-800/40 border border-slate-800 rounded-2xl hover:border-blue-500/40 transition backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-cyan-400 mb-4 border border-blue-500/20">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">AES-256-GCM Off-Chain</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Medical records are encrypted before storage. Zero private health data is ever exposed in plaintext or stored on-chain.
            </p>
          </div>

          <div className="p-6 bg-slate-800/40 border border-slate-800 rounded-2xl hover:border-blue-500/40 transition backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-cyan-400 mb-4 border border-blue-500/20">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">Granular Consent</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Patients approve, reject, or revoke doctor access requests. Smart contracts enforce permission checks before record delivery.
            </p>
          </div>

          <div className="p-6 bg-slate-800/40 border border-slate-800 rounded-2xl hover:border-blue-500/40 transition backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-cyan-400 mb-4 border border-blue-500/20">
              <FileCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">Integrity Verification</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cryptographic SHA-256 hashes registered in smart contracts detect any post-upload document tampering instantly.
            </p>
          </div>

          <div className="p-6 bg-slate-800/40 border border-slate-800 rounded-2xl hover:border-blue-500/40 transition backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-cyan-400 mb-4 border border-blue-500/20">
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
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500 relative z-10">
        MediChain Decentralized Healthcare System &bull; Local Hardhat Network &bull; Solidity ^0.8.24
      </footer>
    </div>
  );
};
