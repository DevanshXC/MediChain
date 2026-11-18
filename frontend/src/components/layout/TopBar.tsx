import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { WalletConnect } from '../common/WalletConnect';
import { NetworkIndicator } from '../common/NetworkIndicator';
import { NotificationCenter } from './NotificationCenter';
import { StatusBadge } from '../common/StatusBadge';
import { Shield, Stethoscope, Building2, Heart, Loader2 } from 'lucide-react';

const DEMO_ROLES = [
  {
    role: 'patient',
    label: 'Patient',
    icon: Heart,
    key: '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
    route: '/patient/dashboard',
    activeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold shadow-xs',
  },
  {
    role: 'doctor',
    label: 'Doctor',
    icon: Stethoscope,
    key: '0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6',
    route: '/doctor/dashboard',
    activeClass: 'bg-blue-100 text-blue-800 border-blue-300 font-bold shadow-xs',
  },
  {
    role: 'hospital',
    label: 'Hospital',
    icon: Building2,
    key: '0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba',
    route: '/hospital/dashboard',
    activeClass: 'bg-purple-100 text-purple-800 border-purple-300 font-bold shadow-xs',
  },
  {
    role: 'admin',
    label: 'Admin',
    icon: Shield,
    key: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    route: '/admin/dashboard',
    activeClass: 'bg-amber-100 text-amber-900 border-amber-300 font-bold shadow-xs',
  },
];

export const TopBar: React.FC = () => {
  const { user, loginWithPrivateKey } = useAuth();
  const navigate = useNavigate();
  const [switching, setSwitching] = useState<string | null>(null);

  const handleSwitchRole = async (item: (typeof DEMO_ROLES)[0]) => {
    if (user?.role === item.role || switching) return;
    try {
      setSwitching(item.role);
      await loginWithPrivateKey(item.key);
      navigate(item.route);
    } catch (err) {
      console.error('Failed to switch role', err);
    } finally {
      setSwitching(null);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-100 px-6 flex items-center justify-between z-10 shrink-0 gap-4">
      {/* Left Portal Indicator */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          {user?.role ? `${user.role} Portal` : 'Portal'}
        </span>
        {user?.status && <StatusBadge status={user.status} />}
      </div>

      {/* Middle: 1-Click Demo Portal Switcher */}
      <div className="hidden md:flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/60">
        <span className="text-[10px] uppercase font-bold text-slate-600 px-2 tracking-wider">
          Switch Portal:
        </span>
        {DEMO_ROLES.map((item) => {
          const isActive = user?.role === item.role;
          const isCurrentLoading = switching === item.role;
          const Icon = item.icon;
          return (
            <button
              key={item.role}
              type="button"
              disabled={!!switching}
              onClick={() => handleSwitchRole(item)}
              title={`Switch to ${item.label} Portal`}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition border ${
                isActive
                  ? item.activeClass
                  : 'border-transparent text-slate-700 hover:text-slate-900 hover:bg-white/80'
              } disabled:opacity-50`}
            >
              {isCurrentLoading ? (
                <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
              ) : (
                <Icon className={`w-3.5 h-3.5 ${isActive ? '' : 'text-slate-500'}`} />
              )}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        <NetworkIndicator />
        <div className="h-5 w-px bg-slate-200"></div>
        <NotificationCenter />
        <div className="h-5 w-px bg-slate-200"></div>
        <WalletConnect />
      </div>
    </header>
  );
};
