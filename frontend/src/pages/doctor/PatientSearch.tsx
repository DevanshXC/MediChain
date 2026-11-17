import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { Search, ShieldAlert, ShieldCheck, Clock, UserPlus, Loader2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PatientSearch: React.FC = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Request Access Modal
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [reason, setReason] = useState('Comprehensive medical consultation and evaluation');
  const [durationDays, setDurationDays] = useState(14);
  const [isEmergency, setIsEmergency] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/patients');
      setPatients(res.data.data || []);
    } catch (err) {
      console.error('Failed to load patients', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const openRequestModal = (patient: any) => {
    setSelectedPatient(patient);
    setIsEmergency(false);
    setRequestModalOpen(true);
  };

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    try {
      setSubmitting(true);
      setFeedback(null);

      await api.post('/api/access/request', {
        patientId: selectedPatient.id,
        isEmergency,
        reason,
        durationDays: Number(durationDays),
      });

      setFeedback({
        type: 'success',
        text: `Access request submitted to ${selectedPatient.full_name}. Recorded on-chain with pending patient consent.`,
      });

      setRequestModalOpen(false);
      fetchPatients();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: err?.response?.data?.error || err.message || 'Failed to submit access request',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = patients.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      (p.full_name || '').toLowerCase().includes(q) ||
      (p.patient_code || '').toLowerCase().includes(q) ||
      (p.phone || '').includes(q) ||
      (p.blood_type || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Patient Directory & Access Requests</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Find patients by code or name and request smart contract-governed access permissions
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

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by patient name, patient code (e.g. PAT-001), or blood group..."
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs focus:outline-teal-500 shadow-sm"
        />
      </div>

      {/* Patient List Card */}
      <Card>
        {loading ? (
          <div className="py-12 flex justify-center items-center text-xs text-slate-400 gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
            Loading patients directory...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No patients match your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                  <th className="pb-3">Code</th>
                  <th className="pb-3">Full Name</th>
                  <th className="pb-3">Gender / Blood Type</th>
                  <th className="pb-3">Phone</th>
                  <th className="pb-3">Access State</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((pat) => (
                  <tr key={pat.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 font-mono font-semibold text-teal-700">{pat.patient_code}</td>
                    <td className="py-3 font-medium text-slate-800">{pat.full_name}</td>
                    <td className="py-3 text-slate-600 capitalize">
                      {pat.gender || 'N/A'} &bull; <strong className="text-slate-700">{pat.blood_type || 'N/A'}</strong>
                    </td>
                    <td className="py-3 text-slate-500">{pat.phone || 'N/A'}</td>
                    <td className="py-3">
                      {pat.hasAccess ? (
                        <StatusBadge status="approved" />
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                          No Access
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      {pat.hasAccess ? (
                        <Link
                          to={`/doctor/upload?patientId=${pat.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg text-xs font-semibold transition"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                          Authorized
                        </Link>
                      ) : (
                        <button
                          onClick={() => openRequestModal(pat)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition shadow-sm"
                        >
                          <UserPlus className="w-3.5 h-3.5 text-teal-400" />
                          Request Access
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Request Access Modal */}
      <Modal
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        title={`Request Record Access — ${selectedPatient?.full_name}`}
      >
        <form onSubmit={handleSendRequest} className="space-y-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Patient Identifier</span>
            <span className="font-semibold text-slate-800">{selectedPatient?.full_name} ({selectedPatient?.patient_code})</span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Clinical Reason / Purpose</label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-teal-500"
              placeholder="Explain the clinical context for requesting access..."
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Access Duration (Days)</label>
            <select
              value={durationDays}
              onChange={(e) => setDurationDays(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-teal-500 bg-white"
            >
              <option value={7}>7 Days (Routine follow-up)</option>
              <option value={14}>14 Days (Standard care)</option>
              <option value={30}>30 Days (Ongoing therapy)</option>
              <option value={90}>90 Days (Chronic care)</option>
            </select>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2.5">
            <input
              type="checkbox"
              id="isEmergency"
              checked={isEmergency}
              onChange={(e) => setIsEmergency(e.target.checked)}
              className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
            />
            <label htmlFor="isEmergency" className="text-amber-900 cursor-pointer">
              <span className="font-bold flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
                Emergency Break-Glass Access Request
              </span>
              <span className="block text-[11px] text-amber-700 mt-0.5">
                Check only if this is an urgent clinical scenario requiring immediate attention. Emergency requests are flagged in audit logs.
              </span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setRequestModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold shadow-md transition disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Submitting to Smart Contract...
                </>
              ) : (
                'Submit Access Request'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

