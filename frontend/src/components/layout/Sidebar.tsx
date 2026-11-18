import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Activity,
  FileText,
  ShieldCheck,
  CheckCircle,
  History,
  Users,
  Search,
  Upload,
  Building2,
  Stethoscope,
  Layers,
  LogOut,
  UserCheck,
  Settings,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getLinks = () => {
    switch (user?.role) {
      case 'patient':
        return [
          { to: '/patient/dashboard', label: 'Dashboard', icon: Activity },
          { to: '/patient/records', label: 'My Records', icon: FileText },
          { to: '/patient/access', label: 'Access Requests', icon: ShieldCheck },
          { to: '/patient/verify', label: 'Verify Document', icon: CheckCircle },
          { to: '/patient/audit', label: 'Audit History', icon: History },
          { to: '/patient/settings', label: 'Profile Settings', icon: Settings },
        ];
      case 'doctor':
        return [
          { to: '/doctor/dashboard', label: 'Dashboard', icon: Activity },
          { to: '/doctor/search', label: 'Find Patients', icon: Search },
          { to: '/doctor/patients', label: 'My Patients', icon: Users },
          { to: '/doctor/upload', label: 'Upload Record', icon: Upload },
          { to: '/doctor/verify', label: 'Verify Document', icon: CheckCircle },
          { to: '/doctor/settings', label: 'Profile Settings', icon: Settings },
        ];
      case 'hospital':
        return [
          { to: '/hospital/dashboard', label: 'Dashboard', icon: Activity },
          { to: '/hospital/doctors', label: 'Manage Doctors', icon: Stethoscope },
          { to: '/hospital/patients', label: 'Patients Directory', icon: Users },
          { to: '/hospital/records', label: 'Hospital Records', icon: FileText },
          { to: '/hospital/settings', label: 'Profile Settings', icon: Settings },
        ];
      case 'admin':
        return [
          { to: '/admin/dashboard', label: 'Dashboard', icon: Activity },
          { to: '/admin/approvals', label: 'Pending Approvals', icon: UserCheck },
          { to: '/admin/users', label: 'User Directory', icon: Users },
          { to: '/admin/blockchain', label: 'Blockchain Ledger', icon: Layers },
          { to: '/admin/audit', label: 'Security & Audit', icon: History },
          { to: '/admin/settings', label: 'Profile Settings', icon: Settings },
        ];
      default:
        return [];
    }
  };

  const links = getLinks();

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between h-screen shrink-0 text-slate-300 select-none">
      <div>
        {/* Brand */}
        <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-blue-500/25 font-bold">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">MediChain</h1>
            <p className="text-[10px] text-cyan-400 font-medium uppercase tracking-wider">Healthcare Web3</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {user?.role ? `${user.role} workspace` : 'Navigation'}
          </div>
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-blue-500/10 text-cyan-400 font-semibold border border-blue-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile & Logout */}
      <div className="p-4 border-t border-slate-800">
        <div className="p-3 bg-slate-800/50 rounded-xl mb-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-blue-500/30 flex items-center justify-center text-cyan-400 font-bold text-xs uppercase">
            {user?.role?.slice(0, 2) || 'MC'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-white truncate capitalize">
              {(user as any)?.full_name || (user as any)?.name || user?.role || 'User'}
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              {user?.walletAddress ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}` : ''}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

