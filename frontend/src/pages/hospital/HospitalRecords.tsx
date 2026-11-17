import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { FileText, Download, CheckCircle, Search, Loader2 } from 'lucide-react';
import { formatDate } from '../../utils/format';
import { Link } from 'react-router-dom';

export const HospitalRecords: React.FC = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // In hospital context, fetch all records through admin/audit or patient routes
    api.get('/api/records/patient/1')
      .then((res) => setRecords(res.data.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Hospital Clinical Archive</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Encrypted record archives and integrity audits created across hospital departments
        </p>
      </div>

      <Card>
        {loading ? (
          <div className="py-12 flex justify-center items-center text-xs text-slate-400 gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
            Loading hospital records...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Document Title</th>
                  <th className="pb-3">Physician</th>
                  <th className="pb-3 font-mono">SHA-256 Digest</th>
                  <th className="pb-3 text-right">Integrity Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 text-slate-500">{formatDate(rec.created_at)}</td>
                    <td className="py-3">
                      <StatusBadge status={rec.category} />
                    </td>
                    <td className="py-3 font-medium text-slate-800">{rec.original_filename}</td>
                    <td className="py-3 text-slate-600">{rec.doctor_name || 'Staff Physician'}</td>
                    <td className="py-3 font-mono text-slate-400 text-[11px]">
                      {rec.file_hash ? `${rec.file_hash.slice(0, 12)}...` : '0x...'}
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        to="/patient/verify"
                        state={{ recordId: rec.record_uuid || rec.id }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg text-xs font-semibold transition"
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
                        Verify
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
  );
};

