import { Outlet, Link, useLocation } from "react-router";
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Video, 
  DollarSign, 
  Settings,
  Bell,
  Search,
  LogOut
} from "lucide-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Appointments', href: '/dashboard/appointments', icon: Calendar },
  { name: 'Patient Records', href: '/dashboard/patients', icon: Users },
  { name: 'Telemedicine', href: '/telemedicine/1', icon: Video },
  { name: 'Payments', href: '/dashboard/payments', icon: DollarSign },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout() {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col shadow-lg">
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl font-bold text-primary">Medicate</h1>
          <p className="text-sm text-muted-foreground mt-1">Healthcare Platform</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-3xl transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <Button 
            variant="outline" 
            className="w-full rounded-3xl justify-start gap-3"
            onClick={() => window.location.href = '/'}
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border px-8 py-4 flex items-center justify-between shadow-sm">
          <div>
            <h2 className="text-xl">Good Morning, Dr. Adams</h2>
            <p className="text-sm text-muted-foreground">Tuesday, April 7, 2026</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search patients, appointments..." 
                className="pl-10 rounded-3xl bg-muted/50 border-none"
              />
            </div>
            
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
            </Button>
            
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
              SA
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
