import { Navigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import DoctorDashboard from './DoctorDashboard';
import PatientDashboard from './PatientDashboard';
import AdminDashboard from './AdminDashboard';

export default function DashboardRouter() {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'doctor':
      return <DoctorDashboard />;
    case 'patient':
      return <PatientDashboard />;
    case 'admin':
      // Admin might have its own layout, but we will render it here if inside MainLayout
      return <AdminDashboard />;
    default:
      return <Navigate to="/" replace />;
  }
}
