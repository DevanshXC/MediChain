import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import {
  User as UserIcon,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Wallet,
  Shield,
  Stethoscope,
  Building2,
  Heart,
  Phone,
  MapPin,
  Mail,
  Globe,
  BadgeCheck,
  Fingerprint,
  Calendar,
  Droplets,
  UserCog,
} from 'lucide-react';

interface ProfileData {
  [key: string]: any;
}

export const ProfileSettings: React.FC = () => {
  const { user, loadProfile } = useAuth();
  const [profile, setProfile] = useState<ProfileData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/users/profile');
      setProfile(res.data.data || {});
    } catch {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleChange = (key: string, value: string) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
    setSuccess(null);
    setError(null);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const payload: Record<string, any> = {};

      if (user?.role === 'patient') {
        payload.firstName = profile.first_name || '';
        payload.lastName = profile.last_name || '';
        payload.phone = profile.phone || '';
        payload.address = profile.address || '';
        payload.gender = profile.gender || '';
        payload.bloodType = profile.blood_type || '';
        payload.emergencyContact = profile.emergency_contact || '';
        payload.dateOfBirth = profile.date_of_birth || '';
      } else if (user?.role === 'doctor') {
        payload.firstName = profile.first_name || '';
        payload.lastName = profile.last_name || '';
        payload.phone = profile.phone || '';
        payload.specialization = profile.specialization || '';
        payload.qualification = profile.qualification || '';
      } else if (user?.role === 'hospital') {
        payload.name = profile.name || '';
        payload.phone = profile.phone || '';
        payload.email = profile.email || '';
        payload.address = profile.address || '';
        payload.website = profile.website || '';
        payload.specialtyAreas = profile.specialty_areas || '';
      }

      const res = await api.patch('/api/users/profile', payload);
      setProfile(res.data.data || profile);
      setSuccess('Profile updated successfully!');
      await loadProfile(); // Refresh auth context
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
          <p className="text-sm text-slate-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  const roleBadge = {
    patient: { label: 'Patient', icon: Heart, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    doctor: { label: 'Doctor', icon: Stethoscope, color: 'bg-blue-50 text-blue-700 border-blue-200' },
    hospital: { label: 'Hospital', icon: Building2, color: 'bg-purple-50 text-purple-700 border-purple-200' },
    admin: { label: 'Administrator', icon: Shield, color: 'bg-amber-50 text-amber-700 border-amber-200' },
  }[user?.role || 'patient'] || { label: 'User', icon: UserIcon, color: 'bg-slate-50 text-slate-700 border-slate-200' };

  const RoleIcon = roleBadge.icon;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <UserCog className="w-5 h-5 text-white" />
            </div>
            Profile Settings
          </h1>
          <p className="text-sm text-slate-500 mt-1 ml-[52px]">Manage your account information and preferences</p>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${roleBadge.color}`}>
          <RoleIcon className="w-3.5 h-3.5" />
          {roleBadge.label}
        </span>
      </div>

      {/* Identity Card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-teal-500/30">
            {(profile.first_name || profile.name || user?.role || 'M').charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-bold">
              {profile.full_name || profile.name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User'}
            </p>
            <p className="text-xs text-teal-300 font-medium">
              {profile.patient_code || profile.doctor_code || profile.hospital_code || 'MediChain ID'}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Wallet className="w-3.5 h-3.5 text-teal-400" />
            <span className="font-mono truncate">{profile.wallet_address || user?.walletAddress || '—'}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Fingerprint className="w-3.5 h-3.5 text-teal-400" />
            <span>User ID: #{profile.id || user?.id}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <BadgeCheck className="w-3.5 h-3.5 text-teal-400" />
            <span className="capitalize">Status: {profile.status || user?.status}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Shield className="w-3.5 h-3.5 text-teal-400" />
            <span className="capitalize">Role: {profile.role || user?.role}</span>
          </div>
        </div>
      </div>

      {/* Feedback */}
      {success && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span className="font-medium">{success}</span>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Editable Fields */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-sm font-semibold text-slate-900">Personal Information</h2>
          <p className="text-xs text-slate-500 mt-0.5">Update your name and contact details</p>
        </div>
        <div className="p-6 space-y-5">
          {/* Patient fields */}
          {user?.role === 'patient' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <InputField icon={UserIcon} label="First Name" value={profile.first_name || ''} onChange={(v) => handleChange('first_name', v)} />
                <InputField icon={UserIcon} label="Last Name" value={profile.last_name || ''} onChange={(v) => handleChange('last_name', v)} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <InputField icon={Phone} label="Phone" value={profile.phone || ''} onChange={(v) => handleChange('phone', v)} />
                <InputField icon={Calendar} label="Date of Birth" value={profile.date_of_birth ? profile.date_of_birth.split('T')[0] : ''} onChange={(v) => handleChange('date_of_birth', v)} type="date" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <SelectField icon={UserIcon} label="Gender" value={profile.gender || ''} onChange={(v) => handleChange('gender', v)} options={['male', 'female', 'other']} />
                <SelectField icon={Droplets} label="Blood Type" value={profile.blood_type || ''} onChange={(v) => handleChange('blood_type', v)} options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']} />
              </div>
              <InputField icon={MapPin} label="Address" value={profile.address || ''} onChange={(v) => handleChange('address', v)} />
              <InputField icon={Phone} label="Emergency Contact" value={profile.emergency_contact || ''} onChange={(v) => handleChange('emergency_contact', v)} />
            </>
          )}

          {/* Doctor fields */}
          {user?.role === 'doctor' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <InputField icon={UserIcon} label="First Name" value={profile.first_name || ''} onChange={(v) => handleChange('first_name', v)} />
                <InputField icon={UserIcon} label="Last Name" value={profile.last_name || ''} onChange={(v) => handleChange('last_name', v)} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <InputField icon={Phone} label="Phone" value={profile.phone || ''} onChange={(v) => handleChange('phone', v)} />
                <InputField icon={Stethoscope} label="Specialization" value={profile.specialization || ''} onChange={(v) => handleChange('specialization', v)} />
              </div>
              <InputField icon={BadgeCheck} label="Qualification" value={profile.qualification || ''} onChange={(v) => handleChange('qualification', v)} />
            </>
          )}

          {/* Hospital fields */}
          {user?.role === 'hospital' && (
            <>
              <InputField icon={Building2} label="Hospital Name" value={profile.name || ''} onChange={(v) => handleChange('name', v)} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <InputField icon={Phone} label="Phone" value={profile.phone || ''} onChange={(v) => handleChange('phone', v)} />
                <InputField icon={Mail} label="Email" value={profile.email || ''} onChange={(v) => handleChange('email', v)} />
              </div>
              <InputField icon={MapPin} label="Address" value={profile.address || ''} onChange={(v) => handleChange('address', v)} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <InputField icon={Globe} label="Website" value={profile.website || ''} onChange={(v) => handleChange('website', v)} />
                <InputField icon={Stethoscope} label="Specialty Areas" value={profile.specialty_areas || ''} onChange={(v) => handleChange('specialty_areas', v)} />
              </div>
            </>
          )}

          {/* Admin - read only */}
          {user?.role === 'admin' && (
            <div className="text-center py-8 text-sm text-slate-500">
              <Shield className="w-10 h-10 mx-auto mb-3 text-slate-300" />
              <p className="font-medium text-slate-700">Administrator Account</p>
              <p className="mt-1">Admin profiles are managed through the system configuration.</p>
            </div>
          )}
        </div>

        {/* Save button */}
        {user?.role !== 'admin' && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-teal-600/20 transition disabled:opacity-60 disabled:cursor-wait"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* Reusable Input */
const InputField: React.FC<{
  icon: React.ElementType;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}> = ({ icon: Icon, label, value, onChange, type = 'text' }) => (
  <div>
    <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-1.5">
      <Icon className="w-3.5 h-3.5 text-slate-400" />
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition"
    />
  </div>
);

/* Reusable Select */
const SelectField: React.FC<{
  icon: React.ElementType;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}> = ({ icon: Icon, label, value, onChange, options }) => (
  <div>
    <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-1.5">
      <Icon className="w-3.5 h-3.5 text-slate-400" />
      {label}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition appearance-none"
    >
      <option value="">Select {label}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);
