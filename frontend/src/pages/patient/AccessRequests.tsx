import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Shield, Check, X, ShieldAlert, Clock, UserCheck, AlertCircle, Loader2 } from 'lucide-react';
import { formatDate, formatAddress } from '../../utils/format';

export const AccessRequests: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'revoked'>('pending');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/access/requests');
      setRequests(res.data.data || []);
    } catch (err) {
      console.error('Failed to load requests', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (requestId: string) => {
    try {
      setActionLoading(requestId);
      await api.post('/api/access/approve', { requestId });
      setMessage({ type: 'success', text: 'Access approved and recorded on smart contract.' });
      fetchRequests();
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.error || 'Failed to approve request' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      setActionLoading(requestId);
      await api.post('/api/access/reject', { requestId });
      setMessage({ type: 'success', text: 'Access request rejected.' });
      fetchRequests();
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.error || 'Failed to reject request' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRevoke = async (requestId: string) => {
    if (!confirm('Are you sure you want to revoke this doctor\'s access permission? They will no longer be able to view your records.')) {
      return;
    }

    try {
      setActionLoading(requestId);
      await api.post('/api/access/revoke', { requestId });
      setMessage({ type: 'success', text: 'Permission revoked on blockchain. Future access blocked.' });
      fetchRequests();
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.error || 'Failed to revoke access' });
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = requests.filter((r) => {
    if (activeTab === 'approved') return r.status === 'approved' && !r.revoked_at;
    if (activeTab === 'revoked') return r.status === 'revoked' || (r.status === 'approved' && r.revoked_at);
    return r.status === activeTab;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Consent & Access Management</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Control which doctors and healthcare providers can access your medical records
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="font-bold underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-semibold">
        {(['pending', 'approved', 'rejected', 'revoked'] as const).map((tab) => {
          const count = requests.filter((r) => {
            if (tab === 'approved') return r.status === 'approved' && !r.revoked_at;
            if (tab === 'revoked') return r.status === 'revoked' || (r.status === 'approved' && r.revoked_at);
            return r.status === tab;
          }).length;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 capitalize flex items-center gap-2 border-b-2 transition ${
                activeTab === tab
                  ? 'border-teal-600 text-teal-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <span>{tab} Requests</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] ${
                  activeTab === tab ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Requests List */}
      <Card>
        {loading ? (
          <div className="py-12 flex justify-center items-center text-xs text-slate-400 gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
            Loading access requests...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No {activeTab} access requests found.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((req) => (
              <div key={req.id} className="py-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-900 text-sm">{req.doctor_name || 'Dr. Specialist'}</span>
                    <span className="text-xs text-slate-500 font-medium">({req.specialization || 'General Practice'})</span>
                    <StatusBadge status={req.status} />
                    {req.is_emergency ? (
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-700 font-bold text-[10px] rounded-full flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" /> EMERGENCY
                      </span>
                    ) : null}
                  </div>

                  <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <strong className="text-slate-900 font-semibold">Purpose: </strong>
                    {req.reason || 'General medical review and consultation'}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 font-mono">
                    <span>License: {req.license_number || 'N/A'}</span>
                    <span>&bull;</span>
                    <span>Doctor Wallet: {formatAddress(req.doctor_wallet || '')}</span>
                    <span>&bull;</span>
                    <span>Requested: {formatDate(req.requested_at)}</span>
                    {req.expires_at && (
                      <>
                        <span>&bull;</span>
                        <span className="text-teal-600">Expires: {formatDate(req.expires_at)}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  {req.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(req.request_uuid || req.id)}
                        disabled={actionLoading === (req.request_uuid || req.id)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(req.request_uuid || req.id)}
                        disabled={actionLoading === (req.request_uuid || req.id)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl text-xs font-semibold transition disabled:opacity-50"
                      >
                        <X className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    </>
                  )}

                  {req.status === 'approved' && !req.revoked_at && (
                    <button
                      onClick={() => handleRevoke(req.request_uuid || req.id)}
                      disabled={actionLoading === (req.request_uuid || req.id)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition disabled:opacity-50"
                    >
                      <Shield className="w-3.5 h-3.5 text-rose-600" />
                      Revoke Access
                    </button>
                  )}

                  {req.status === 'revoked' && (
                    <span className="text-xs text-slate-400 italic">Access Permanently Revoked</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

