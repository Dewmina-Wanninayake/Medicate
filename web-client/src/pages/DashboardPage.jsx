// src/pages/DashboardPage.jsx
import { useAuth } from '../context/AuthContext';
import PatientDashboard from './PatientDashboard';
import DoctorDashboard from './DoctorDashboard';

export default function DashboardPage() {
  const { user } = useAuth();
  
  if (user?.role === 'doctor') {
    return <DoctorDashboard />;
  }
  
  return <PatientDashboard />;
}
