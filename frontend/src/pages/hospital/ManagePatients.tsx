import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Users, Search, Loader2 } from 'lucide-react';
import { formatDate } from '../../utils/format';

export const ManagePatients: React.FC = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/api/patients')
      .then((res) => setPatients(res.data.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = patients.filter((p) =>
    (p.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.patient_code || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.phone || '').includes(search)
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Hospital Patients Directory</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Review patient demographic profiles and clinical identifier mappings
        </p>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search patients by name, code, or contact..."
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs focus:outline-teal-500 shadow-sm"
        />
      </div>

      <Card>
        {loading ? (
          <div className="py-12 flex justify-center items-center text-xs text-slate-400 gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
            Loading patients...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                  <th className="pb-3">Patient Code</th>
                  <th className="pb-3">Full Name</th>
                  <th className="pb-3">DOB</th>
                  <th className="pb-3">Gender</th>
                  <th className="pb-3">Blood Type</th>
                  <th className="pb-3">Contact</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((pat) => (
                  <tr key={pat.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 font-mono font-semibold text-teal-700">{pat.patient_code}</td>
                    <td className="py-3 font-medium text-slate-800">{pat.full_name}</td>
                    <td className="py-3 text-slate-500">{pat.date_of_birth ? formatDate(pat.date_of_birth) : 'N/A'}</td>
                    <td className="py-3 text-slate-600 capitalize">{pat.gender || 'N/A'}</td>
                    <td className="py-3 font-bold text-slate-700">{pat.blood_type || 'N/A'}</td>
                    <td className="py-3 text-slate-500">{pat.phone || 'N/A'}</td>
                    <td className="py-3 text-right">
                      <StatusBadge status={pat.status || 'approved'} />
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

