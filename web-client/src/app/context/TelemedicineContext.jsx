import React, { createContext, useContext, useState } from 'react';
import { Home, Calendar, MessageSquare, Activity, FileText, Search, Heart, Pill, Users, Shield, BarChart3 } from 'lucide-react';

const TelemedicineContext = createContext();

export function TelemedicineProvider({ children }) {
  const [role, setRole] = useState('doctor');
  const [doctorView, setDoctorView] = useState('dashboard');
  const [patientView, setPatientView] = useState('find-doctor');
  const [adminView, setAdminView] = useState('doctors');

  const doctorNavItems = [
    { id: 'dashboard', label: 'Lobby', icon: Home },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'monitoring', label: 'Monitoring', icon: Activity },
    { id: 'prescriptions', label: 'Prescriptions', icon: FileText }
  ];

  const patientNavItems = [
    // Removed 'profile' item as requested
    { id: 'find-doctor', label: 'Find Doctor', icon: Search },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'health-tracking', label: 'Health Tracking', icon: Heart },
    { id: 'pharmacy-labs', label: 'Pharmacy & Labs', icon: Pill }
  ];

  const adminNavItems = [
    { id: 'doctors', label: 'Doctors', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'compliance', label: 'Compliance & CMS', icon: Shield }
  ];

  const value = {
    role,
    setRole,
    doctorView,
    setDoctorView,
    patientView,
    setPatientView,
    adminView,
    setAdminView,
    doctorNavItems,
    patientNavItems,
    adminNavItems
  };

  return (
    <TelemedicineContext.Provider value={value}>
      {children}
    </TelemedicineContext.Provider>
  );
}

export function useTelemedicine() {
  const context = useContext(TelemedicineContext);
  if (!context) {
    throw new Error('useTelemedicine must be used within a TelemedicineProvider');
  }
  return context;
}
