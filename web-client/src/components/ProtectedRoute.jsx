import { Navigate } from 'react-router';
import { useAuth } from '../context/AuthContext';

/**
 * Wrap routes that require authentication.
 * Optionally pass `allowedRoles` to enforce role-based access.
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to the appropriate dashboard
    if (user.role === 'admin')       return <Navigate to="/admin"     replace />;
    if (user.role === 'doctor')      return <Navigate to="/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
}
