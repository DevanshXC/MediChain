import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { FileText, Download, CheckCircle, Search, Filter, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { formatDate } from '../../utils/format';

export const MyRecords: React.FC = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Verify modal state
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [verifying, setVerifying] = useState(false);
  const [activeRecord, setActiveRecord] = useState<any>(null);

  const patientId = (user as any)?.patient_id || user?.id;

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/records/patient/${patientId}`);
      setRecords(res.data.data || []);
    } catch (err) {
      console.error('Failed to load records', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [user]);

  const handleDownload = async (record: any) => {
    try {
      const response = await api.get(`/api/records/${record.record_uuid || record.id}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', record.original_filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      alert('Download failed: ' + (err?.response?.data?.error || err.message));
    }
  };

  const handleVerify = async (record: any) => {
    try {
      setActiveRecord(record);
      setVerifyResult(null);
      setVerifying(true);
      setVerifyModalOpen(true);

      const res = await api.post('/api/records/verify', {
        recordId: record.record_uuid || record.id,
      });

      setVerifyResult(res.data.data || res.data);
    } catch (err: any) {
      setVerifyResult({ status: 'ERROR', error: err.message });
    } finally {
      setVerifying(false);
    }
  };

  const filtered = records.filter((r) => {
    const matchesSearch =
      (r.original_filename || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.doctor_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.notes || '').toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'all' || r.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">My Medical Records</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Encrypted documents and verified blockchain integrity hashes
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search records by document name, doctor, or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-teal-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-teal-500 font-medium text-slate-700"
          >
            <option value="all">All Categories</option>
            <option value="diagnosis">Diagnosis</option>
            <option value="prescription">Prescription</option>
            <option value="lab_report">Lab Report</option>
            <option value="medical_history">Medical History</option>
            <option value="consultation">Consultation</option>
            <option value="discharge_summary">Discharge Summary</option>
          </select>
        </div>
      </div>

      {/* Records Table Card */}
      <Card>
        {loading ? (
          <div className="py-12 flex justify-center items-center text-xs text-slate-400 gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
            Loading medical records...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No medical records match your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">File Name</th>
                  <th className="pb-3">Attending Doctor</th>
                  <th className="pb-3 font-mono">SHA-256 Hash</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 text-slate-500">{formatDate(rec.created_at)}</td>
                    <td className="py-3">
                      <StatusBadge status={rec.category} />
                    </td>
                    <td className="py-3 font-medium text-slate-800 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>{rec.original_filename}</span>
                    </td>
                    <td className="py-3 text-slate-600">
                      {rec.doctor_name || rec.hospital_name || 'Hospital Staff'}
                    </td>
                    <td className="py-3 font-mono text-slate-400 text-[11px]">
                      {rec.file_hash ? `${rec.file_hash.slice(0, 10)}...${rec.file_hash.slice(-8)}` : '0x...'}
                    </td>
                    <td className="py-3 text-right space-x-2">
                      <button
                        onClick={() => handleDownload(rec)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                        title="Download decrypted file"
                      >
                        <Download className="w-3.5 h-3.5 text-slate-500" />
                        Download
                      </button>
                      <button
                        onClick={() => handleVerify(rec)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg text-xs font-semibold transition"
                        title="Verify document against smart contract"
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
                        Verify Hash
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Verification Modal */}
      <Modal
        isOpen={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
        title="Document Integrity Verification"
        maxWidth="max-w-xl"
      >
        {verifying ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            <p className="text-xs font-medium text-slate-600">
              Querying smart contract hash and computing SHA-256...
            </p>
          </div>
        ) : verifyResult ? (
          <div className="space-y-5 text-xs">
            <div
              className={`p-4 rounded-2xl border flex items-center gap-3 ${
                verifyResult.status === 'VERIFIED'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              {verifyResult.status === 'VERIFIED' ? (
                <CheckCircle className="w-8 h-8 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-8 h-8 text-rose-600 shrink-0" />
              )}
              <div>
                <h4 className="font-bold text-sm tracking-tight">
                  Status: {verifyResult.status}
                </h4>
                <p className="text-xs opacity-90 mt-0.5">
                  {verifyResult.status === 'VERIFIED'
                    ? 'The off-chain decrypted file matches the SHA-256 hash registered on the blockchain.'
                    : 'Discrepancy detected! The file has been modified or does not match the blockchain hash.'}
                </p>
              </div>
            </div>

            <div className="space-y-3 font-mono text-[11px] bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-sans">Document</span>
                <span className="font-semibold text-slate-800">{activeRecord?.original_filename}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-sans">Blockchain On-Chain Hash</span>
                <span className="break-all text-teal-700">{verifyResult.onChainHash || verifyResult.originalHash}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-sans">Computed File Hash</span>
                <span className="break-all text-slate-700">{verifyResult.currentHash}</span>
              </div>
              {verifyResult.txHash && (
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-sans">Registration Transaction</span>
                  <span className="break-all text-slate-500">{verifyResult.txHash}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setVerifyModalOpen(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition"
              >
                Close Verification
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

