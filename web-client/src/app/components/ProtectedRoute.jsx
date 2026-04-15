import { Navigate } from 'react-router';
import { useAuth } from '../context/AuthContext';

// ── Redirects to /login if not authenticated ─────────────────────
export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user)   return <Navigate to="/login" replace />;
  return children;
};

// ── Redirects to / if role not allowed ───────────────────────────
export const RoleRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user)              return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};