import { Menu, Search, Bell, Activity, Stethoscope, Video, FileText, User, LogOut, Settings } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Link, useLocation } from "react-router";
import { useTelemedicine } from "../context/TelemedicineContext";
import { useAuth } from "../context/AuthContext";
import { useState, useRef, useEffect } from "react";

export default function Header({ toggleSidebar }) {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef();

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = (user?.name || 'U')
    .split(' ')
    .map(n => n.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const location = useLocation();
  const { 
    role, setRole, 
    doctorView, setDoctorView, 
    patientView, setPatientView, 
    adminView, setAdminView,
    doctorNavItems, patientNavItems, adminNavItems
  } = useTelemedicine();

  const isTelemedicinePage = location.pathname.startsWith('/telemedicine');

  const getNavItems = () => {
    if (role === 'doctor') return doctorNavItems;
    if (role === 'patient') return patientNavItems;
    return adminNavItems;
  };

  const getCurrentView = () => {
    if (role === 'doctor') return doctorView;
    if (role === 'patient') return patientView;
    return adminView;
  };

  const handleNavigate = (view) => {
    if (role === 'doctor') setDoctorView(view);
    else if (role === 'patient') setPatientView(view);
    else setAdminView(view);
  };

  const renderNavLinks = () => {
    if (isTelemedicinePage) {
      return (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {getNavItems().map(item => (
            <Button
              key={item.id}
              variant={getCurrentView() === item.id ? "default" : "ghost"}
              size="sm"
              onClick={() => handleNavigate(item.id)}
              className={`rounded-full flex items-center gap-2 px-4 ${
                getCurrentView() === item.id ? "shadow-md" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{item.label}</span>
            </Button>
          ))}
        </div>
      );
    }

    if (location.pathname === '/') {
      return (
        <>
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-muted font-medium rounded-full" asChild>
            <a href="#specialties"><Stethoscope className="w-4 h-4 mr-2" /> Specialties</a>
          </Button>
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-muted font-medium rounded-full" asChild>
            <a href="#doctors"><User className="w-4 h-4 mr-2" /> Doctors</a>
          </Button>
        </>
      );
    } else {
      // Show role-appropriate quick links in the header
      return (
        <>
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-muted font-medium rounded-full" asChild>
            <Link to="/dashboard">Overview</Link>
          </Button>
          {user?.role === 'patient' && (
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-muted font-medium rounded-full" asChild>
              <Link to="/dashboard/my-appointments"><FileText className="w-4 h-4 mr-2" /> Appointments</Link>
            </Button>
          )}
          {user?.role === 'doctor' && (
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-muted font-medium rounded-full" asChild>
              <Link to="/dashboard/patients"><User className="w-4 h-4 mr-2" /> Patients</Link>
            </Button>
          )}
        </>
      );
    }
  };

  return (
    <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between shadow-sm z-10 gap-4">
      <div className={`flex items-center min-w-0 flex-1 ${isTelemedicinePage ? 'gap-3' : 'gap-6'}`}>
        <div className="flex items-center gap-3 flex-shrink-0">
          <Button variant="ghost" size="icon" onClick={toggleSidebar} aria-label="Toggle Menu" className="rounded-full">
            <Menu className="w-6 h-6 text-primary" />
          </Button>
          <Link to="/" className="flex items-center gap-2">
            <Activity className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold text-primary tracking-tight hidden sm:inline">Medicate</span>
          </Link>
        </div>

        {/* Dynamic page-specific navigation buttons */}
        <nav className={`hidden md:flex items-center gap-4 border-l border-border flex-1 min-w-0 overflow-hidden ${isTelemedicinePage ? 'pl-3' : 'pl-6'}`}>
          {renderNavLinks()}
        </nav>
      </div>
      
      <div className="flex items-center gap-4 flex-shrink-0">
        <div className={`relative hidden lg:block transition-all ${isTelemedicinePage ? 'w-48' : 'w-64'}`}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search platform..." 
            className="pl-10 rounded-full bg-muted/50 border-none focus-visible:ring-1"
          />
        </div>
        
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full relative border-border"
        >
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
        </Button>
        
        {/* User avatar dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-sm hover:opacity-90 transition-opacity text-sm"
            onClick={() => setShowUserMenu(!showUserMenu)}
            title={user?.name}
          >
            {initials}
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-12 w-52 bg-card border border-border rounded-3xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-3 border-b border-border">
                <div className="font-bold text-sm truncate">{user?.name}</div>
                <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
                <div className="text-xs text-primary font-semibold capitalize mt-0.5">{user?.role}</div>
              </div>
              <div className="p-2">
                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium hover:bg-muted transition-colors"
                  onClick={() => setShowUserMenu(false)}
                >
                  <User className="w-4 h-4 text-muted-foreground" /> My Profile
                </Link>
                <Link
                  to="/dashboard/settings"
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium hover:bg-muted transition-colors"
                  onClick={() => setShowUserMenu(false)}
                >
                  <Settings className="w-4 h-4 text-muted-foreground" /> Settings
                </Link>
                <button
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  onClick={() => { setShowUserMenu(false); logout(); }}
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
