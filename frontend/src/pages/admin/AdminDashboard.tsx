import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card } from '../../components/common/Card';
import { RecordsCategoryChart } from '../../components/charts/RecordsCategoryChart';
import { ActivityChart } from '../../components/charts/ActivityChart';
import {
  Users,
  Building2,
  Clock,
  FileText,
  ShieldCheck,
  Layers,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/admin/stats')
      .then((res) => setStats(res.data.data))
      .catch((err) => console.error('Failed to load admin stats', err))
      .finally(() => setLoading(false));
  }, []);

  const usersCount = stats?.users || {};
  const totalUsers = usersCount.total_users || 0;
  const pendingApprovals = usersCount.pending_approvals || 0;
  const totalRecords = stats?.records?.total_records || 0;
  const activePermissions = stats?.access?.active_permissions || 0;

  const categoryChartData = (Array.isArray(stats?.categories) ? stats.categories : []).map((c: any) => ({
    name: c.category ? String(c.category).toUpperCase() : 'OTHER',
    value: Number(c.count) || 1,
  }));

  return (
    <div className="space-y-8">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-blue-900/30">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-cyan-300 text-xs font-semibold mb-3 border border-blue-500/30">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            Platform Root Administration
          </div>
          <h2 className="text-2xl font-bold tracking-tight">System Overview & Governance</h2>
          <p className="text-xs text-slate-400 mt-1">
            Hardhat Blockchain Node &bull; Smart Contract Verification &bull; Multi-role Access Control
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/approvals"
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-md transition ${
              pendingApprovals > 0
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold animate-pulse'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/25'
            }`}
          >
            <Clock className="w-4 h-4" />
            {pendingApprovals} Pending Approvals
          </Link>
          <Link
            to="/admin/blockchain"
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 transition"
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            Ledger Activity
          </Link>
        </div>
      </div>

      {/* 4 Key Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Users</p>
            <h3 className="text-2xl font-bold text-slate-800">{totalUsers}</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {usersCount.total_patients || 0} pts &bull; {usersCount.total_doctors || 0} docs &bull; {usersCount.total_hospitals || 0} hosps
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
            pendingApprovals > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
          }`}>
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Pending Approvals</p>
            <h3 className="text-2xl font-bold text-slate-800">{pendingApprovals}</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Hospitals & Doctors</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Medical Records</p>
            <h3 className="text-2xl font-bold text-slate-800">{totalRecords}</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">AES-256-GCM Encrypted</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Active Consents</p>
            <h3 className="text-2xl font-bold text-slate-800">{activePermissions}</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Smart Contract Enforced</p>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Record Categories" subtitle="Distribution across encrypted document types">
          <RecordsCategoryChart data={categoryChartData} />
        </Card>

        <Card title="Platform Activity Trends" subtitle="Weekly transaction and access volume">
          <ActivityChart />
        </Card>
      </div>
    </div>
  );
};

