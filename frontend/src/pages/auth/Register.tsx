import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useWallet } from '../../hooks/useWallet';
import api from '../../services/api';
import { Activity, Wallet, Shield, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export const Register: React.FC = () => {
  const { address, isConnected, isConnecting, connectWallet, error: walletError } = useWallet();
  const navigate = useNavigate();

  const [role, setRole] = useState<'patient' | 'doctor' | 'hospital'>('patient');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [patientForm, setPatientForm] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '1990-01-01',
    gender: 'male',
    bloodType: 'O+',
    phone: '',
    address: '',
    emergencyContact: '',
  });

  const [doctorForm, setDoctorForm] = useState({
    firstName: '',
    lastName: '',
    licenseNumber: '',
    specialization: 'Cardiology',
    qualification: 'MD, MBBS',
    phone: '',
  });

  const [hospitalForm, setHospitalForm] = useState({
    name: '',
    registrationNumber: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    specialtyAreas: 'Emergency, Oncology, Cardiology',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) {
      await connectWallet();
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let profileData = {};
      if (role === 'patient') profileData = patientForm;
      if (role === 'doctor') profileData = doctorForm;
      if (role === 'hospital') profileData = hospitalForm;

      const res = await api.post('/api/users/register', {
        walletAddress: address,
        role,
        profileData,
      });

      setSuccess(res.data.message || 'Registration successful!');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 py-12 px-6 flex flex-col justify-center items-center font-sans">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl p-8 border border-slate-100">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-teal-500 flex items-center justify-center text-slate-950 font-bold mb-3 shadow-lg shadow-teal-500/20">
            <Activity className="w-7 h-7 text-slate-950" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Create MediChain Profile</h2>
          <p className="text-xs text-slate-500 mt-1">
            Register your Web3 identity to access or share medical records
          </p>
        </div>

        {(error || walletError) && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error || walletError}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{success} Redirecting to login...</span>
          </div>
        )}

        {/* Role Selector Tabs */}
        <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
          {(['patient', 'doctor', 'hospital'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg capitalize transition ${
                role === r
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Wallet check */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-600">
              <Wallet className="w-4 h-4 text-teal-600" />
              <span>Wallet Address:</span>
            </div>
            {isConnected && address ? (
              <span className="font-mono text-slate-900 font-semibold truncate max-w-[200px]">
                {address}
              </span>
            ) : (
              <button
                type="button"
                onClick={connectWallet}
                disabled={isConnecting}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 disabled:opacity-60"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin text-teal-400" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <span>Connect MetaMask</span>
                )}
              </button>
            )}
          </div>

          {/* Patient Form */}
          {role === 'patient' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">First Name</label>
                  <input
                    required
                    type="text"
                    value={patientForm.firstName}
                    onChange={(e) => setPatientForm({ ...patientForm, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-teal-500"
                    placeholder="Jane"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Last Name</label>
                  <input
                    required
                    type="text"
                    value={patientForm.lastName}
                    onChange={(e) => setPatientForm({ ...patientForm, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-teal-500"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={patientForm.dateOfBirth}
                    onChange={(e) => setPatientForm({ ...patientForm, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Gender</label>
                  <select
                    value={patientForm.gender}
                    onChange={(e) => setPatientForm({ ...patientForm, gender: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-teal-500 bg-white"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Blood Type</label>
                  <select
                    value={patientForm.bloodType}
                    onChange={(e) => setPatientForm({ ...patientForm, bloodType: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-teal-500 bg-white"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={patientForm.phone}
                    onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-teal-500"
                    placeholder="+1 555-0199"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Emergency Contact</label>
                  <input
                    type="text"
                    value={patientForm.emergencyContact}
                    onChange={(e) => setPatientForm({ ...patientForm, emergencyContact: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-teal-500"
                    placeholder="Spouse / Parent (+1 555-0188)"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Residential Address</label>
                <input
                  type="text"
                  value={patientForm.address}
                  onChange={(e) => setPatientForm({ ...patientForm, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-teal-500"
                  placeholder="123 Health Ave, Medical City, MC 10001"
                />
              </div>
            </div>
          )}

          {/* Doctor Form */}
          {role === 'doctor' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">First Name</label>
                  <input
                    required
                    type="text"
                    value={doctorForm.firstName}
                    onChange={(e) => setDoctorForm({ ...doctorForm, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-teal-500"
                    placeholder="Dr. Gregory"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Last Name</label>
                  <input
                    required
                    type="text"
                    value={doctorForm.lastName}
                    onChange={(e) => setDoctorForm({ ...doctorForm, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-teal-500"
                    placeholder="House"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Medical License Number</label>
                  <input
                    required
                    type="text"
                    value={doctorForm.licenseNumber}
                    onChange={(e) => setDoctorForm({ ...doctorForm, licenseNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-teal-500"
                    placeholder="MED-LIC-99214"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Specialization</label>
                  <input
                    required
                    type="text"
                    value={doctorForm.specialization}
                    onChange={(e) => setDoctorForm({ ...doctorForm, specialization: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-teal-500"
                    placeholder="Infectious Diseases / Nephrology"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Qualifications</label>
                  <input
                    type="text"
                    value={doctorForm.qualification}
                    onChange={(e) => setDoctorForm({ ...doctorForm, qualification: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-teal-500"
                    placeholder="MD, PhD, FACP"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={doctorForm.phone}
                    onChange={(e) => setDoctorForm({ ...doctorForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-teal-500"
                    placeholder="+1 555-0144"
                  />
                </div>
              </div>

              <p className="text-[11px] text-amber-600 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                Doctor accounts require Administrator verification before gaining access to patient records.
              </p>
            </div>
          )}

          {/* Hospital Form */}
          {role === 'hospital' && (
            <div className="space-y-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Hospital / Clinic Name</label>
                <input
                  required
                  type="text"
                  value={hospitalForm.name}
                  onChange={(e) => setHospitalForm({ ...hospitalForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-teal-500"
                  placeholder="Princeton-Plainsboro Teaching Hospital"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Registration / Accreditation No.</label>
                  <input
                    required
                    type="text"
                    value={hospitalForm.registrationNumber}
                    onChange={(e) => setHospitalForm({ ...hospitalForm, registrationNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-teal-500"
                    placeholder="HOSP-REG-8812"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Official Phone</label>
                  <input
                    type="text"
                    value={hospitalForm.phone}
                    onChange={(e) => setHospitalForm({ ...hospitalForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-teal-500"
                    placeholder="+1 555-0100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Official Email</label>
                  <input
                    type="email"
                    value={hospitalForm.email}
                    onChange={(e) => setHospitalForm({ ...hospitalForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-teal-500"
                    placeholder="contact@hospital.org"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Website</label>
                  <input
                    type="text"
                    value={hospitalForm.website}
                    onChange={(e) => setHospitalForm({ ...hospitalForm, website: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-teal-500"
                    placeholder="https://hospital.org"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Address</label>
                <input
                  type="text"
                  value={hospitalForm.address}
                  onChange={(e) => setHospitalForm({ ...hospitalForm, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-teal-500"
                  placeholder="100 University Plaza, Princeton, NJ"
                />
              </div>

              <p className="text-[11px] text-amber-600 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                Hospital accounts require Administrator approval before hospital administrators can manage doctors and upload reports.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !isConnected}
            className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 px-4 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-sm font-semibold transition shadow-md shadow-teal-600/20 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Registering Profile...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                Complete {role.toUpperCase()} Registration
              </>
            )}
          </button>
        </form>

        <div className="pt-4 mt-6 border-t border-slate-100 text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-teal-600 hover:text-teal-700">
            Sign In with Wallet
          </Link>
        </div>
      </div>
    </div>
  );
};

