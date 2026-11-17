import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Check, X, Building2, Stethoscope, Clock, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { formatDate, formatAddress } from '../../utils/format';

export const PendingApprovals: React.FC = () => {
  const [data, setData] = useState<{ doctors: any[]; hospitals: any[] }>({ doctors: [], hospitals: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'doctors' | 'hospitals'>('doctors');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/admin/pending');
      setData(res.data.data || { doctors: [], hospitals: [] });
    } catch (err) {
      console.error('Failed to load pending approvals', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApproveDoctor = async (doctorId: number, userId: number) => {
    try {
      setActionLoading(`doc-${doctorId}`);
      await api.post('/api/admin/approve-doctor', { doctorId, userId });
      setFeedback({ type: 'success', text: 'Doctor account approved and granted clinical access.' });
      fetchPending();
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.response?.data?.error || 'Approval failed' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveHospital = async (hospitalId: number, userId: number) => {
    try {
      setActionLoading(`hosp-${hospitalId}`);
      await api.post('/api/admin/approve-hospital', { hospitalId, userId });
      setFeedback({ type: 'success', text: 'Hospital facility approved and activated.' });
      fetchPending();
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.response?.data?.error || 'Approval failed' });
    } finally {
      setActionLoading(null);
    }
  };

  const currentList = activeTab === 'doctors' ? data.doctors : data.hospitals;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Pending Professional Approvals</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Verify credentials of registered healthcare providers before activating full privileges
        </p>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <span>{feedback.text}</span>
          <button onClick={() => setFeedback(null)} className="font-bold underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('doctors')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'doctors'
              ? 'border-teal-600 text-teal-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span>Pending Doctors ({data.doctors.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('hospitals')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'hospitals'
              ? 'border-teal-600 text-teal-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Pending Hospitals ({data.hospitals.length})</span>
        </button>
      </div>

      <Card>
        {loading ? (
          <div className="py-12 flex justify-center items-center text-xs text-slate-400 gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
            Loading pending approvals...
          </div>
        ) : currentList.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            <span>All {activeTab} registrations are up to date. No pending approvals.</span>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {activeTab === 'doctors' &&
              data.doctors.map((doc) => (
                <div key={doc.doctor_id} className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 text-sm">{doc.full_name}</span>
                      <span className="text-slate-500 font-medium">({doc.specialization})</span>
                      <StatusBadge status="pending" />
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 font-mono">
                      <span>License: <strong className="text-slate-700">{doc.license_number}</strong></span>
                      <span>&bull;</span>
                      <span>Wallet: {formatAddress(doc.wallet_address)}</span>
                      <span>&bull;</span>
                      <span>Registered: {formatDate(doc.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleApproveDoctor(doc.doctor_id, doc.user_id)}
                      disabled={actionLoading === `doc-${doc.doctor_id}`}
                      className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Approve Doctor
                    </button>
                  </div>
                </div>
              ))}

            {activeTab === 'hospitals' &&
              data.hospitals.map((hosp) => (
                <div key={hosp.hospital_id} className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 text-sm">{hosp.name}</span>
                      <span className="text-slate-500 font-mono">({hosp.hospital_code})</span>
                      <StatusBadge status="pending" />
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 font-mono">
                      <span>Accreditation: <strong className="text-slate-700">{hosp.registration_number}</strong></span>
                      <span>&bull;</span>
                      <span>Wallet: {formatAddress(hosp.wallet_address)}</span>
                      <span>&bull;</span>
                      <span>Registered: {formatDate(hosp.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleApproveHospital(hosp.hospital_id, hosp.user_id)}
                      disabled={actionLoading === `hosp-${hosp.hospital_id}`}
                      className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Approve Hospital
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </Card>
    </div>
  );
};

