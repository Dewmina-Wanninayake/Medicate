import { Menu, Search, Bell, Activity, Stethoscope, Video, FileText, User } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Link, useLocation } from "react-router";

export default function Header({ toggleSidebar }) {
  const location = useLocation();

  const renderNavLinks = () => {
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
    } else if (location.pathname.startsWith('/telemedicine')) {
      return (
        <>
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-muted font-medium rounded-full" asChild>
            <Link to="/telemedicine"><Activity className="w-4 h-4 mr-2" /> Telemedicine Hub</Link>
          </Button>
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-muted font-medium rounded-full" asChild>
            <Link to="/appointments"><Video className="w-4 h-4 mr-2" /> Active Sessions</Link>
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
    <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between shadow-sm z-10">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={toggleSidebar} aria-label="Toggle Menu" className="rounded-full">
            <Menu className="w-6 h-6 text-primary" />
          </Button>
          <Link to="/" className="flex items-center gap-2">
            <Activity className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold text-primary tracking-tight">Medicate</span>
          </Link>
        </div>

        {/* Dynamic page-specific navigation buttons */}
        <nav className="hidden md:flex items-center gap-2 border-l border-border pl-6">
          {renderNavLinks()}
        </nav>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative hidden lg:block w-72">
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
        
        <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold shadow-sm cursor-pointer hover:opacity-90 transition-opacity">
          SA
        </div>
      </div>
    </header>
  );
}
