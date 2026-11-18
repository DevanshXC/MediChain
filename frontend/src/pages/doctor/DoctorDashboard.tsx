import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ActivityChart } from '../../components/charts/ActivityChart';
import {
  Users,
  ShieldCheck,
  Clock,
  Upload,
  Search,
  CheckCircle,
  FileText,
  ChevronRight,
  Stethoscope,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatAddress, formatDate } from '../../utils/format';

export const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [patRes, reqRes] = await Promise.all([
          api.get('/api/patients').catch(() => ({ data: { data: [] } })),
          api.get('/api/access/requests').catch(() => ({ data: { data: [] } })),
        ]);
        setPatients(patRes.data.data || []);
        setRequests(reqRes.data.data || []);
      } catch (err) {
        console.error('Failed to load doctor dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const authorizedPatients = patients.filter((p) => p.hasAccess);
  const pendingRequests = requests.filter((r) => r.status === 'pending');

  return (
    <div className="space-y-8">
      {/* Doctor Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-blue-900/30">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-cyan-300 text-xs font-semibold mb-3 border border-blue-500/30">
            <Stethoscope className="w-3.5 h-3.5 text-cyan-400" />
            Physician Portal &bull; {(user as any)?.doctor_code || 'DOC-DEMO'}
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            {(user as any)?.first_name ? `Dr. ${(user as any).first_name} ${(user as any).last_name}` : 'Doctor Dashboard'}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Specialization: <strong className="text-cyan-400">{(user as any)?.specialization || 'Cardiology / Internal Medicine'}</strong>
            {' '}&bull; License: {(user as any)?.license_number || 'LIC-VERIFIED'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/doctor/search"
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/25 transition"
          >
            <Search className="w-4 h-4" />
            Find Patients
          </Link>
          <Link
            to="/doctor/upload"
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 transition"
          >
            <Upload className="w-4 h-4 text-cyan-400" />
            Upload Record
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Registered Patients</p>
            <h3 className="text-2xl font-bold text-slate-800">{patients.length}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Authorized Patients</p>
            <h3 className="text-2xl font-bold text-slate-800">{authorizedPatients.length}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Pending Requests</p>
            <h3 className="text-2xl font-bold text-slate-800">{pendingRequests.length}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Platform Status</p>
            <h3 className="text-2xl font-bold text-slate-800">Active</h3>
          </div>
        </div>
      </div>

      {/* Grid: Authorized Patients & Activity Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card
            title="Authorized Patients"
            subtitle="Patients who have granted you permission to view and add medical records"
            action={
              <Link to="/doctor/patients" className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1">
                View All <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            }
          >
            {authorizedPatients.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                You do not have active access permissions for any patients yet.{' '}
                <Link to="/doctor/search" className="text-teal-600 font-semibold underline">
                  Search patients and request access
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                      <th className="pb-3">Code</th>
                      <th className="pb-3">Patient Name</th>
                      <th className="pb-3">Blood Type</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {authorizedPatients.slice(0, 5).map((pat) => (
                      <tr key={pat.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3 font-mono text-slate-500">{pat.patient_code}</td>
                        <td className="py-3 font-medium text-slate-800">{pat.full_name}</td>
                        <td className="py-3 text-slate-600">{pat.blood_type || 'N/A'}</td>
                        <td className="py-3">
                          <StatusBadge status="approved" />
                        </td>
                        <td className="py-3 text-right space-x-2">
                          <Link
                            to={`/doctor/upload?patientId=${pat.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg text-xs font-semibold transition"
                          >
                            <Upload className="w-3 h-3 text-teal-600" />
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
        </div>

        <div>
          <Card title="Consultation Activity" subtitle="Weekly patient consultation volume">
            <ActivityChart />
          </Card>
        </div>
      </div>
    </div>
  );
};

