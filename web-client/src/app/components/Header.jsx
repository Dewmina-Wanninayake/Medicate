import { Menu, Search, Bell, Activity, Stethoscope, Video, FileText, User as UserIcon } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Link, useLocation } from "react-router";
import { useTelemedicine } from "../context/TelemedicineContext";
import { useAuth } from "../context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "./ui/dialog";
import PatientProfileModal from "./PatientProfileModal";

export default function Header({ toggleSidebar }) {
  const location = useLocation();
  const { user } = useAuth();
  const { 
    role, setRole, 
    doctorView, setDoctorView, 
    patientView, setPatientView, 
    adminView, setAdminView,
    doctorNavItems, patientNavItems, adminNavItems
  } = useTelemedicine();

  const getInitials = (user) => {
    if (!user) return "??";
    return `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || "U";
  };

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
      return (
        <>
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-muted font-medium rounded-full" asChild>
            <Link to="/patients"><FileText className="w-4 h-4 mr-2" /> Patients</Link>
          </Button>
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-muted font-medium rounded-full" asChild>
             <Link to="/dashboard">Overview</Link>
          </Button>
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
        
        <Dialog>
          <DialogTrigger asChild>
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold shadow-sm cursor-pointer hover:opacity-90 transition-opacity">
              {getInitials(user)}
            </div>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] rounded-[32px]">
            <PatientProfileModal user={user} />
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
}
