import { useState } from "react";
import { Outlet } from "react-router";
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
  { name: 'Home', href: '/', icon: Home },
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Appointments', href: '/appointments', icon: Calendar },
  { name: 'Patient Records', href: '/patients', icon: Users },
  { name: 'Telemedicine', href: '/telemedicine', icon: Video },
  { name: 'Payments', href: '/payments', icon: DollarSign },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function MainLayout() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  const toggleSidebar = () => setIsSidebarExpanded(!isSidebarExpanded);

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Top Header Navigation */}
      <Header toggleSidebar={toggleSidebar} />

      <div className="flex flex-1 overflow-hidden">
        {/* Collapsible Sidebar */}
        <Sidebar isExpanded={isSidebarExpanded} navigation={navigation} />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-muted/20">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
