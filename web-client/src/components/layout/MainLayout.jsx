// src/components/layout/MainLayout.jsx
import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, Users, Bell, User,
  Shield, Activity, Settings, Home, FileText,
  FolderOpen, Pill, DollarSign, Video, Clock, Search
} from 'lucide-react';
import Header from './Header';
import Sidebar from './Sidebar';
import TelemedicinePiP from '../telemedicine/TelemedicinePiP';
import { useAuth } from '../../context/AuthContext';

const patientNav = [
  { name: 'Home',           href: '/',                 icon: Home },
  { name: 'Dashboard',      href: '/dashboard',        icon: LayoutDashboard },
  { name: 'Find Doctors',   href: '/find-doctors',     icon: Search },
  { name: 'Appointments',   href: '/appointments',     icon: Calendar },
  { name: 'Check Symptoms', href: '/symptoms',         icon: Shield },
  { name: 'My Records',     href: '/records',          icon: FolderOpen },
  { name: 'Prescriptions',  href: '/prescriptions',    icon: Pill },
  { name: 'Reports',        href: '/reports',          icon: FileText },
  { name: 'Payments',       href: '/payments',         icon: DollarSign },
  { name: 'Settings',       href: '/settings',         icon: Settings },
];

const doctorNav = [
  { name: 'Overview',       href: '/dashboard',        icon: LayoutDashboard },
  { name: 'Appointments',   href: '/appointments',     icon: Calendar },
  { name: 'Patients',       href: '/patients',         icon: Users },
  { name: 'Prescriptions',  href: '/prescriptions',    icon: Pill },
  { name: 'Telemedicine',   href: '/telemedicine',     icon: Video },
  { name: 'Payments',       href: '/payments',         icon: DollarSign },
  { name: 'Schedule',       href: '/schedule',         icon: Clock },
  { name: 'Messages',       href: '/messages',         icon: Home },
  { name: 'Profile',        href: '/profile',          icon: Settings },
];

const adminNav = [
  { name: 'Dashboard',      href: '/admin',            icon: LayoutDashboard },
  { name: 'Settings',       href: '/settings',         icon: Settings },
];

export default function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  const navigation =
    user?.role === 'doctor' ? doctorNav :
    user?.role === 'admin'  ? adminNav  :
    patientNav;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden font-sans">
      <Header toggleSidebar={() => setIsSidebarExpanded(p => !p)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isExpanded={isSidebarExpanded}
          navigation={navigation}
          onLogout={handleLogout}
        />
        <main className="flex-1 bg-muted/20 p-6 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      <TelemedicinePiP />
    </div>
  );
}
