import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { AuthGuard } from './components/AuthGuard';
import { DashboardLayout } from './components/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { DoctorApplications } from './pages/DoctorApplications';
import { DoctorApplication } from './pages/DoctorApplication';
import { Doctors } from './pages/Doctors';
import { DoctorProfile } from './pages/DoctorProfile';
import { Appointments } from './pages/Appointments';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <AuthGuard>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/admin"
            element={
              <AuthGuard allowedRoles={['admin']}>
                <DashboardLayout>
                  <AdminDashboard />
                </DashboardLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/doctor-applications"
            element={
              <AuthGuard allowedRoles={['admin']}>
                <DashboardLayout>
                  <DoctorApplications />
                </DashboardLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/apply-doctor"
            element={
              <AuthGuard>
                <DashboardLayout>
                  <DoctorApplication />
                </DashboardLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/doctors"
            element={
              <AuthGuard>
                <DashboardLayout>
                  <Doctors />
                </DashboardLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/doctors/:id"
            element={
              <AuthGuard>
                <DashboardLayout>
                  <DoctorProfile />
                </DashboardLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/appointments"
            element={
              <AuthGuard>
                <DashboardLayout>
                  <Appointments />
                </DashboardLayout>
              </AuthGuard>
            }
          />
        </Routes>
        <Toaster position="top-right" />
      </AuthProvider>
    </Router>
  );
}

export default App