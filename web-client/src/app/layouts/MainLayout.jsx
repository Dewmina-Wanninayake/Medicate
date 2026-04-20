import { useState } from "react";
import { Outlet, useLocation } from "react-router";
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Video, 
  DollarSign, 
  Settings,
  Home
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

const navigation = [
  { name: 'Home', href: '/dashboard', icon: Home },
  { name: 'Dashboard', href: '/dashboard/dashboard', icon: LayoutDashboard },
  { name: 'Appointments', href: '/dashboard/appointments', icon: Calendar },
  { name: 'Patient Records', href: '/dashboard/patients', icon: Users },
  { name: 'Telemedicine', href: '/dashboard/telemedicine', icon: Video },
  { name: 'Payments', href: '/dashboard/payments', icon: DollarSign },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function MainLayout() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const location = useLocation();

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
