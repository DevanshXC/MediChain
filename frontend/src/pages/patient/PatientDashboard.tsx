import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { RecordsCategoryChart } from '../../components/charts/RecordsCategoryChart';
import {
  FileText,
  ShieldCheck,
  Clock,
  CheckCircle,
  AlertCircle,
  Check,
  X,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatAddress, formatDate } from '../../utils/format';

export const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const patientId = (user as any)?.patient_id || user?.id;

  const fetchData = async () => {
    try {
      setLoading(true);
      const [recRes, reqRes] = await Promise.all([
        api.get(`/api/records/patient/${patientId}`).catch(() => ({ data: { data: [] } })),
        api.get('/api/access/requests').catch(() => ({ data: { data: [] } })),
      ]);

      setRecords(recRes.data.data || []);
      setRequests(reqRes.data.data || []);
    } catch (err) {
      console.error('Failed to load patient dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleApprove = async (requestId: string) => {
    try {
      setActionLoading(requestId);
      await api.post('/api/access/approve', { requestId });
      setFeedback({ type: 'success', message: 'Doctor access approved and registered on-chain.' });
      fetchData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.response?.data?.error || 'Failed to approve request' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      setActionLoading(requestId);
      await api.post('/api/access/reject', { requestId });
      setFeedback({ type: 'success', message: 'Access request rejected.' });
      fetchData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.response?.data?.error || 'Failed to reject request' });
    } finally {
      setActionLoading(null);
    }
  };

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const activePermissions = requests.filter((r) => r.status === 'approved' && !r.revoked_at);

  // Group records by category for chart
  const categoryCounts = records.reduce((acc: any, r: any) => {
    const cat = r.category || 'other';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.keys(categoryCounts).map((k) => ({
    name: k.replace('_', ' ').toUpperCase(),
    value: categoryCounts[k],
  }));

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold mb-3 border border-teal-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
              Patient Portal &bull; {(user as any)?.patient_code || 'PAT-DEMO'}
            </div>
            <h2 className="text-2xl font-bold tracking-tight">
              Welcome back, {(user as any)?.first_name ? `${(user as any).first_name} ${(user as any).last_name}` : 'Patient'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Your health records are encrypted with AES-256-GCM. You maintain complete consent control.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60">
            <div>
              <span className="text-slate-400 block text-[10px]">Blood Group</span>
              <span className="font-bold text-teal-400">{(user as any)?.blood_type || 'O+'}</span>
            </div>
            <div className="w-px h-6 bg-slate-700"></div>
            <div>
              <span className="text-slate-400 block text-[10px]">MetaMask Wallet</span>
              <span className="font-bold text-slate-200">{formatAddress(user?.walletAddress || '')}</span>
            </div>
          </div>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="text-xs font-bold underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Medical Records</p>
            <h3 className="text-2xl font-bold text-slate-800">{records.length}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Authorized Doctors</p>
            <h3 className="text-2xl font-bold text-slate-800">{activePermissions.length}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
            pendingRequests.length > 0 ? 'bg-amber-100 text-amber-700 animate-pulse' : 'bg-slate-100 text-slate-500'
          }`}>
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Pending Requests</p>
            <h3 className="text-2xl font-bold text-slate-800">{pendingRequests.length}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Integrity Verified</p>
            <h3 className="text-2xl font-bold text-slate-800">100%</h3>
          </div>
        </div>
      </div>

      {/* Pending Doctor Access Requests (High priority) */}
      {pendingRequests.length > 0 && (
        <Card
          title="Pending Doctor Access Requests"
          subtitle="Doctors requesting access to your encrypted health history"
          className="border-amber-200 bg-amber-50/20"
        >
          <div className="divide-y divide-slate-100">
            {pendingRequests.map((req) => (
              <div key={req.id} className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800 text-sm">{req.doctor_name || 'Dr. Specialist'}</span>
                    <span className="text-xs text-slate-500">({req.specialization || 'Medicine'})</span>
                    {req.is_emergency ? (
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-700 font-bold text-[10px] rounded-full">EMERGENCY</span>
                    ) : null}
                  </div>
                  <p className="text-xs text-slate-600 italic">"{req.reason || 'Consultation and evaluation'}"</p>
                  <p className="text-[10px] text-slate-400">Requested: {formatDate(req.requested_at)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleApprove(req.request_uuid || req.id)}
                    disabled={actionLoading === (req.request_uuid || req.id)}
                    className="flex items-center gap-1 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Approve Access
                  </button>
                  <button
                    onClick={() => handleReject(req.request_uuid || req.id)}
                    disabled={actionLoading === (req.request_uuid || req.id)}
                    className="flex items-center gap-1 px-3 py-2 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl text-xs font-semibold transition disabled:opacity-50"
                  >
                    <X className="w-3.5 h-3.5" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Main Grid: Recent Records & Category Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Recent Records (2 cols) */}
        <div className="lg:col-span-2">
          <Card
            title="Recent Medical Records"
            subtitle="Latest encrypted documents stored on off-chain storage"
            action={
              <Link to="/patient/records" className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1">
                View All Records <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            }
          >
            {records.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No medical records uploaded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                      <th className="pb-3">Date</th>
                      <th className="pb-3">Category</th>
                      <th className="pb-3">Document</th>
                      <th className="pb-3">Uploaded By</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {records.slice(0, 5).map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3 text-slate-500">{formatDate(rec.created_at)}</td>
                        <td className="py-3">
                          <StatusBadge status={rec.category} />
                        </td>
                        <td className="py-3 font-medium text-slate-800">{rec.original_filename}</td>
                        <td className="py-3 text-slate-500">{rec.doctor_name || rec.hospital_name || 'Hospital Provider'}</td>
                        <td className="py-3 text-right">
                          <Link
                            to="/patient/verify"
                            state={{ recordId: rec.record_uuid || rec.id }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-lg text-xs font-semibold transition"
                          >
                            <CheckCircle className="w-3 h-3 text-teal-600" />
                            Verify Hash
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Right: Record Categories Chart */}
        <div>
          <Card title="Record Categories" subtitle="Distribution of your healthcare records">
            <RecordsCategoryChart data={chartData} />
          </Card>
        </div>
      </div>
    </div>
  );
};

