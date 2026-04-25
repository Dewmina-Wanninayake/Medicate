// src/components/layout/Header.jsx
import { Menu, Search, Bell } from 'lucide-react';
import Logo from '../../assets/medicate-logo.png';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export default function Header({ toggleSidebar }) {
  const { user } = useAuth();

  const getUserInitials = () => {
    if (!user) return 'GU';
    const first = user.firstName || user.name?.split(' ')[0] || '';
    const last = user.lastName || user.name?.split(' ')[1] || '';
    const fi = first.charAt(0).toUpperCase();
    const li = last.charAt(0).toUpperCase();
    return li ? `${fi}${li}` : fi || 'U';
  };

  return (
    <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between shadow-sm z-10 gap-4">
      <div className="flex items-center gap-6 flex-1 min-w-0">
        <div className="flex items-center gap-3 flex-shrink-0">
          <Button variant="ghost" size="icon" onClick={toggleSidebar} aria-label="Toggle Menu" className="rounded-full">
            <Menu className="w-6 h-6 text-primary" />
          </Button>
          <Link to="/" className="flex items-center gap-2 ml-2">
            <img src={Logo} alt="Medicate Logo" className="h-20 w-auto -my-4" />
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="relative hidden lg:block w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search platform..."
            className="pl-10 rounded-full bg-muted/50 border-none focus-visible:ring-1"
          />
        </div>
        <Link to="/notifications">
          <Button variant="outline" size="icon" className="rounded-full relative border-border">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
          </Button>
        </Link>
        <Link
          to="/profile"
          className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold shadow-sm cursor-pointer hover:opacity-90 transition-opacity text-sm"
          title={user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.email || 'User'}
        >
          {getUserInitials()}
        </Link>
      </div>
    </header>
  );
}
