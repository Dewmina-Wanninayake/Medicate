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
  FileText,
  Pill,
  ClipboardList,
  MessageSquare,
  UserCircle,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";

export default function MainLayout() {
  const { user } = useAuth();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const location = useLocation();

  // ── Patient navigation ─────────────────────────────────────────
  const patientNav = [
    { name: "Home",           href: "/dashboard",                  icon: Home },
    { name: "My Dashboard",   href: "/dashboard/dashboard",        icon: LayoutDashboard },
    { name: "Appointments",   href: "/dashboard/my-appointments",  icon: Calendar },
    { name: "Medical Records",href: "/dashboard/records",          icon: FileText },
    { name: "Prescriptions",  href: "/dashboard/prescriptions",    icon: Pill },
    { name: "Reports",        href: "/dashboard/reports",          icon: ClipboardList },
    { name: "Telemedicine",   href: "/dashboard/telemedicine",     icon: Video },
    { name: "Payments",       href: "/dashboard/payments",         icon: DollarSign },
    { name: "Settings",       href: "/dashboard/settings",         icon: Settings },
  ];

  // ── Doctor navigation ──────────────────────────────────────────
  const doctorNav = [
    { name: "Overview",       href: "/dashboard",                     icon: LayoutDashboard },
    { name: "Appointments",   href: "/dashboard/doctor/appointments",  icon: Calendar },
    { name: "Patient Records",href: "/dashboard/patients",            icon: Users },
    { name: "Telemedicine",   href: "/dashboard/telemedicine",        icon: Video },
    { name: "Schedule",       href: "/dashboard/doctor/schedule",      icon: Clock },
    { name: "Messages",       href: "/dashboard/doctor/messages",      icon: MessageSquare },
    { name: "Profile",        href: "/dashboard/doctor/profile",       icon: UserCircle },
  ];

  // ── Admin navigation ───────────────────────────────────────────
  const adminNav = [
    { name: "Home",           href: "/dashboard",                  icon: Home },
    { name: "Dashboard",      href: "/dashboard/dashboard",        icon: LayoutDashboard },
    { name: "Appointments",   href: "/dashboard/appointments",     icon: Calendar },
    { name: "Patient Records",href: "/dashboard/patients",         icon: Users },
    { name: "Reports",        href: "/dashboard/reports",          icon: FileText },
    { name: "Telemedicine",   href: "/dashboard/telemedicine",     icon: Video },
    { name: "Payments",       href: "/dashboard/payments",         icon: DollarSign },
    { name: "Settings",       href: "/dashboard/settings",         icon: Settings },
  ];

  const navigation =
    user?.role === "doctor" ? doctorNav :
    user?.role === "admin"  ? adminNav  :
    patientNav;

  const toggleSidebar = () => setIsSidebarExpanded(!isSidebarExpanded);
  const isTelemedicine = location.pathname.startsWith("/telemedicine");

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden font-sans">
      {/* Top Header */}
      <Header toggleSidebar={toggleSidebar} />

      <div className="flex flex-1 overflow-hidden">
        {/* Collapsible Sidebar */}
        <Sidebar isExpanded={isSidebarExpanded} navigation={navigation} />

        {/* Main Content */}
        <main
          className={`flex-1 bg-muted/20 ${
            isTelemedicine ? "p-0 overflow-hidden" : "p-6 md:p-8 overflow-y-auto"
          }`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
