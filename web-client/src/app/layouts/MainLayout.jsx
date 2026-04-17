import { useState } from "react";
import { Outlet, useLocation } from "react-router";
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Video, 
  DollarSign, 
  Settings,
  Home,
  Clock,
  FileText
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

import { useAuth } from "../context/AuthContext";

export default function MainLayout() {
  const { user } = useAuth();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const location = useLocation();

  const patientNav = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'Dashboard', href: '/dashboard/dashboard', icon: LayoutDashboard },
    { name: 'Appointments', href: '/dashboard/appointments', icon: Calendar },
    { name: 'Reports', href: '/dashboard/reports', icon: FileText },
    { name: 'Payments', href: '/dashboard/payments', icon: DollarSign },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const doctorNav = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Appointments', href: '/dashboard/doctor/appointments', icon: Calendar },
    { name: 'Patient Records', href: '/dashboard/patients', icon: Users },
    { name: 'Telemedicine', href: '/dashboard/telemedicine', icon: Video },
    { name: 'Schedule', href: '/dashboard/doctor/schedule', icon: Clock },
    { name: 'Messages', href: '/dashboard/doctor/messages', icon: Home },
    { name: 'Profile', href: '/dashboard/doctor/profile', icon: Settings },
  ];

  const navigation = user?.role === 'doctor' ? doctorNav : patientNav;

  const toggleSidebar = () => setIsSidebarExpanded(!isSidebarExpanded);

  const isTelemedicine = location.pathname.startsWith('/telemedicine');

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden font-sans">
      {/* Top Header Navigation */}
      <Header toggleSidebar={toggleSidebar} />

      <div className="flex flex-1 overflow-hidden">
        {/* Collapsible Sidebar */}
        <Sidebar isExpanded={isSidebarExpanded} navigation={navigation} />

        {/* Main Content Area */}
        <main className={`flex-1 bg-muted/20 ${isTelemedicine ? 'p-0 overflow-hidden' : 'p-6 md:p-8 overflow-y-auto'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
