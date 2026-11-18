import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Building2, Stethoscope, Users, FileText, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/format';

export const HospitalDashboard: React.FC = () => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [docRes, patRes] = await Promise.all([
          api.get('/api/doctors').catch(() => ({ data: { data: [] } })),
          api.get('/api/patients').catch(() => ({ data: { data: [] } })),
        ]);
        setDoctors(docRes.data.data || []);
        setPatients(patRes.data.data || []);
      } catch (err) {
        console.error('Failed to load hospital dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  return (
    <div className="space-y-8">
      {/* Hospital Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-blue-900/30">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-cyan-300 text-xs font-semibold mb-3 border border-blue-500/30">
            <Building2 className="w-3.5 h-3.5 text-cyan-400" />
            Hospital Administration &bull; {(user as any)?.hospital_code || 'HOS-DEMO'}
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            {(user as any)?.name || 'Healthcare Facility Dashboard'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Reg: {(user as any)?.registration_number || 'REG-ACCREDITED'} &bull; Address: {(user as any)?.address || 'Medical Center Blvd'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/hospital/doctors"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/25 transition"
          >
            <Stethoscope className="w-4 h-4" />
            Manage Doctors
          </Link>
          <Link
            to="/hospital/records"
            className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 transition"
          >
            <FileText className="w-4 h-4 text-cyan-400" />
            Hospital Records
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Active Doctors</p>
            <h3 className="text-2xl font-bold text-slate-800">{doctors.length}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Registered Patients</p>
            <h3 className="text-2xl font-bold text-slate-800">{patients.length}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Integrity Health</p>
            <h3 className="text-2xl font-bold text-slate-800">100%</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Facility Status</p>
            <h3 className="text-2xl font-bold text-slate-800">Accredited</h3>
          </div>
        </div>
      </div>

      {/* Grid: Doctors & Patients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card
          title="Affiliated Medical Staff"
          subtitle="Doctors registered under this facility"
          action={
            <Link to="/hospital/doctors" className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1">
              All Doctors <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          }
        >
          <div className="divide-y divide-slate-100">
            {doctors.slice(0, 5).map((doc) => (
              <div key={doc.doctor_id || doc.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-800 block">{doc.full_name}</span>
                  <span className="text-[11px] text-slate-500">{doc.specialization} &bull; {doc.license_number}</span>
                </div>
                <StatusBadge status={doc.status} />
              </div>
            ))}
          </div>
        </Card>

        <Card
          title="Registered Patients"
          subtitle="Directory of patients receiving care"
          action={
            <Link to="/hospital/patients" className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1">
              All Patients <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          }
        >
          <div className="divide-y divide-slate-100">
            {patients.slice(0, 5).map((pat) => (
              <div key={pat.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-800 block">{pat.full_name}</span>
                  <span className="text-[11px] text-slate-500 font-mono">{pat.patient_code} &bull; {pat.blood_type || 'N/A'}</span>
                </div>
                <span className="text-[11px] text-slate-400 capitalize">{pat.gender || 'other'}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

