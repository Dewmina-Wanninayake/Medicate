import { Link, useLocation } from "react-router";
import { LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "../context/AuthContext";

export default function Sidebar({ isExpanded, navigation }) {
  const location = useLocation();
  const { logout, user } = useAuth();

  return (
    <aside
      className={`bg-card border-r border-border flex flex-col shadow-lg transition-all duration-300 ease-in-out ${
        isExpanded ? "w-64" : "w-20"
      }`}
    >
      {/* User mini-card at top (expanded) */}
      {isExpanded && user && (
        <div className="mx-3 mt-4 p-3 rounded-2xl bg-primary/5 border border-primary/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
              {(user.name || 'U').split(' ').map(n => n.charAt(0)).slice(0, 2).join('').toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold truncate">{user.name}</div>
              <div className="text-xs text-muted-foreground capitalize">{user.role}</div>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto mt-3">
        {navigation.map((item) => {
          const isActive =
            location.pathname === item.href ||
            (item.href !== "/dashboard" &&
              item.href !== "/" &&
              location.pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              to={item.href}
              title={!isExpanded ? item.name : undefined}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all whitespace-nowrap ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              } ${isExpanded ? "justify-start" : "justify-center"}`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {isExpanded && <span className="font-medium text-sm">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <Button
          variant="outline"
          className={`w-full rounded-2xl transition-all text-red-500 border-red-100 hover:bg-red-50 hover:border-red-200 ${
            isExpanded ? "justify-start gap-3" : "justify-center px-0"
          }`}
          onClick={logout}
          title={!isExpanded ? "Sign Out" : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {isExpanded && <span>Sign Out</span>}
        </Button>
      </div>
    </aside>
  );
}
