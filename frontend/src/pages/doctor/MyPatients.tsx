import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { Users, FileText, Upload, Download, CheckCircle, ShieldCheck, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/format';

export const MyPatients: React.FC = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // View records modal
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [patientRecords, setPatientRecords] = useState<any[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  useEffect(() => {
    const fetchAuthorized = async () => {
      try {
        setLoading(true);
        const res = await api.get('/api/patients');
        const allPatients: any[] = res.data.data || [];
        setPatients(allPatients.filter((p) => p.hasAccess));
      } catch (err) {
        console.error('Failed to load authorized patients', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAuthorized();
  }, []);

  const handleOpenRecords = async (patient: any) => {
    try {
      setSelectedPatient(patient);
      setViewModalOpen(true);
      setRecordsLoading(true);
      const res = await api.get(`/api/records/patient/${patient.id}`);
      setPatientRecords(res.data.data || []);
    } catch (err: any) {
      alert('Could not load patient records: ' + (err?.response?.data?.error || err.message));
    } finally {
      setRecordsLoading(false);
    }
  };

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Authorized Patients</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Patients who have approved your access requests through verified smart contracts
        </p>
      </div>

      <Card>
        {loading ? (
          <div className="py-12 flex justify-center items-center text-xs text-slate-400 gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
            Loading authorized patients...
          </div>
        ) : patients.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No authorized patients found.{' '}
            <Link to="/doctor/search" className="text-teal-600 font-semibold underline">
              Search the directory to request patient access.
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                  <th className="pb-3">Code</th>
                  <th className="pb-3">Patient Name</th>
                  <th className="pb-3">DOB & Gender</th>
                  <th className="pb-3">Blood Type</th>
                  <th className="pb-3">Permission Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patients.map((pat) => (
                  <tr key={pat.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 font-mono font-semibold text-teal-700">{pat.patient_code}</td>
                    <td className="py-3 font-medium text-slate-800">{pat.full_name}</td>
                    <td className="py-3 text-slate-600">
                      {pat.date_of_birth ? formatDate(pat.date_of_birth) : 'N/A'} &bull;{' '}
                      <span className="capitalize">{pat.gender || 'other'}</span>
                    </td>
                    <td className="py-3 font-bold text-slate-700">{pat.blood_type || 'N/A'}</td>
                    <td className="py-3">
                      <StatusBadge status="approved" />
                    </td>
                    <td className="py-3 text-right space-x-2">
                      <button
                        onClick={() => handleOpenRecords(pat)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                        View Records
                      </button>
                      <Link
                        to={`/doctor/upload?patientId=${pat.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Upload
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Patient Records View Modal */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title={`Medical Records — ${selectedPatient?.full_name}`}
        maxWidth="max-w-2xl"
      >
        {recordsLoading ? (
          <div className="py-12 flex justify-center items-center text-xs text-slate-400 gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
            Loading encrypted records...
          </div>
        ) : patientRecords.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No medical records uploaded for this patient yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {patientRecords.map((rec) => (
              <div key={rec.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={rec.category} />
                    <span className="font-semibold text-slate-800">{rec.original_filename}</span>
                  </div>
                  {rec.notes && <p className="text-slate-500 text-[11px] mt-1">{rec.notes}</p>}
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">
                    Date: {formatDate(rec.created_at)} &bull; Hash: {rec.file_hash?.slice(0, 12)}...
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleDownload(rec)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </button>
                  <Link
                    to="/doctor/verify"
                    state={{ recordId: rec.record_uuid || rec.id }}
                    className="flex items-center gap-1 px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg text-xs font-semibold transition"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
                    Verify
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};

