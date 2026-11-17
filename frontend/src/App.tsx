import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { WalletProvider } from './context/WalletContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/layout/Layout';

// Public pages
import { Landing } from './pages/Landing';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';

// Patient pages
import { PatientDashboard } from './pages/patient/PatientDashboard';
import { MyRecords } from './pages/patient/MyRecords';
import { AccessRequests } from './pages/patient/AccessRequests';
import { VerifyDocument } from './pages/patient/VerifyDocument';
import { AuditHistory } from './pages/patient/AuditHistory';

// Doctor pages
import { DoctorDashboard } from './pages/doctor/DoctorDashboard';
import { PatientSearch } from './pages/doctor/PatientSearch';
import { MyPatients } from './pages/doctor/MyPatients';
import { UploadRecord } from './pages/doctor/UploadRecord';
import { DoctorVerify } from './pages/doctor/DoctorVerify';

// Hospital pages
import { HospitalDashboard } from './pages/hospital/HospitalDashboard';
import { ManageDoctors } from './pages/hospital/ManageDoctors';
import { ManagePatients } from './pages/hospital/ManagePatients';
import { HospitalRecords } from './pages/hospital/HospitalRecords';

// Admin pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { PendingApprovals } from './pages/admin/PendingApprovals';
import { UserManagement } from './pages/admin/UserManagement';
import { BlockchainMonitor } from './pages/admin/BlockchainMonitor';
import { AuditMonitor } from './pages/admin/AuditMonitor';

// Shared pages
import { ProfileSettings } from './pages/shared/ProfileSettings';

// Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-900 text-slate-400 text-xs font-mono">
        Authenticating Web3 Identity...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return <>{children}</>;
};

export function App() {
  return (
    <Router>
      <WalletProvider>
        <AuthProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Patient routes */}
            <Route
              path="/patient"
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<PatientDashboard />} />
              <Route path="records" element={<MyRecords />} />
              <Route path="access" element={<AccessRequests />} />
              <Route path="verify" element={<VerifyDocument />} />
              <Route path="audit" element={<AuditHistory />} />
              <Route path="settings" element={<ProfileSettings />} />
            </Route>

            {/* Doctor routes */}
            <Route
              path="/doctor"
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<DoctorDashboard />} />
              <Route path="search" element={<PatientSearch />} />
              <Route path="patients" element={<MyPatients />} />
              <Route path="upload" element={<UploadRecord />} />
              <Route path="verify" element={<DoctorVerify />} />
              <Route path="settings" element={<ProfileSettings />} />
            </Route>

            {/* Hospital routes */}
            <Route
              path="/hospital"
              element={
                <ProtectedRoute allowedRoles={['hospital']}>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<HospitalDashboard />} />
              <Route path="doctors" element={<ManageDoctors />} />
              <Route path="patients" element={<ManagePatients />} />
              <Route path="records" element={<HospitalRecords />} />
              <Route path="settings" element={<ProfileSettings />} />
            </Route>

            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="approvals" element={<PendingApprovals />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="blockchain" element={<BlockchainMonitor />} />
              <Route path="audit" element={<AuditMonitor />} />
              <Route path="settings" element={<ProfileSettings />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </WalletProvider>
    </Router>
  );
}

export default App;

