// src/components/layout/Sidebar.jsx
import { Link, useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { Button } from '../ui/button';

export default function Sidebar({ isExpanded, navigation, onLogout }) {
  const location = useLocation();

  return (
    <aside
      className={`bg-card border-r border-border flex flex-col shadow-lg transition-all duration-300 ease-in-out ${
        isExpanded ? 'w-64' : 'w-20'
      }`}
    >
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto mt-4">
        {navigation.map((item) => {
          const isExactMatch = location.pathname === item.href;
          const isSubRoute   = item.href !== '/' && item.href !== '/dashboard' && location.pathname.startsWith(item.href);
          const isDashboard  = item.href === '/dashboard' && location.pathname === '/dashboard';
          const isActive     = isExactMatch || isSubRoute || isDashboard;

          return (
            <Link
              key={item.name}
              to={item.href}
              title={!isExpanded ? item.name : undefined}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              } ${isExpanded ? 'justify-start' : 'justify-center'}`}
            >
              <item.icon className="w-6 h-6 flex-shrink-0" />
              {isExpanded && <span className="font-medium">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <Button
          variant="outline"
          className={`w-full rounded-2xl transition-all ${isExpanded ? 'justify-start gap-3' : 'justify-center px-0'}`}
          onClick={onLogout}
          title={!isExpanded ? 'Logout' : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {isExpanded && <span>Logout</span>}
        </Button>
      </div>
    </aside>
  );
}
