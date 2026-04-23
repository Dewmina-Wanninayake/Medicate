import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TelemedicineProvider } from './context/TelemedicineContext';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'sonner';

// Layouts and Pages
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboard from './pages/AdminDashboard';
import AppointmentsPage from './pages/AppointmentsPage';
import RecordsPage from './pages/RecordsPage';
import PrescriptionsPage from './pages/PrescriptionsPage';
import ReportsPage from './pages/ReportsPage';
import PaymentsPage from './pages/PaymentsPage';
import SettingsPage from './pages/SettingsPage';
import PatientsPage from './pages/PatientsPage';
import TelemedicinePage from './pages/TelemedicinePage';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import FindDoctorsPage from './pages/FindDoctorsPage';
import PlaceholderPage from './pages/PlaceholderPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TelemedicineProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected routes wrapped in MainLayout */}
            <Route element={<MainLayout />}>
              {/* Public but with layout */}
              <Route path="/" element={<HomePage />} />

              {/* Patient / Doctor dashboard */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['patient', 'doctor']}>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* Navigation items */}
              <Route path="/appointments" element={<ProtectedRoute><AppointmentsPage /></ProtectedRoute>} />
              <Route path="/records" element={<ProtectedRoute><RecordsPage /></ProtectedRoute>} />
              <Route path="/prescriptions" element={<ProtectedRoute><PrescriptionsPage /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
              <Route path="/payments" element={<ProtectedRoute><PaymentsPage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              <Route path="/patients" element={<ProtectedRoute><PatientsPage /></ProtectedRoute>} />
              <Route path="/telemedicine" element={<ProtectedRoute><TelemedicinePage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
              <Route path="/find-doctors" element={<ProtectedRoute><FindDoctorsPage /></ProtectedRoute>} />

              <Route path="/schedule" element={<ProtectedRoute><PlaceholderPage /></ProtectedRoute>} />
              <Route path="/messages" element={<ProtectedRoute><PlaceholderPage /></ProtectedRoute>} />

              {/* Admin dashboard */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/doctors"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </TelemedicineProvider>
      </AuthProvider>
      <Toaster position="top-right" richColors />
    </BrowserRouter>
  );
}
