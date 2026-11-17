import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Stethoscope, Search, Loader2 } from 'lucide-react';
import { formatAddress } from '../../utils/format';

export const ManageDoctors: React.FC = () => {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/api/doctors')
      .then((res) => setDoctors(res.data.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = doctors.filter((d) =>
    (d.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (d.specialization || '').toLowerCase().includes(search.toLowerCase()) ||
    (d.license_number || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Manage Hospital Doctors</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          View and audit credentials of affiliated physicians and clinical specialists
        </p>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search doctors by name, license number, or specialization..."
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs focus:outline-teal-500 shadow-sm"
        />
      </div>

      <Card>
        {loading ? (
          <div className="py-12 flex justify-center items-center text-xs text-slate-400 gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
            Loading doctors directory...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                  <th className="pb-3">Doctor Code</th>
                  <th className="pb-3">Name</th>
                  <th className="pb-3">License Number</th>
                  <th className="pb-3">Specialization</th>
                  <th className="pb-3">Wallet Address</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((doc) => (
                  <tr key={doc.doctor_id || doc.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 font-mono font-semibold text-teal-700">{doc.doctor_code || 'DOC'}</td>
                    <td className="py-3 font-medium text-slate-800">{doc.full_name}</td>
                    <td className="py-3 text-slate-600">{doc.license_number}</td>
                    <td className="py-3 text-slate-600">{doc.specialization}</td>
                    <td className="py-3 font-mono text-slate-400">{formatAddress(doc.wallet_address || '')}</td>
                    <td className="py-3 text-right">
                      <StatusBadge status={doc.status} />
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

