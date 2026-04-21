import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, usersAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Rehydrate user from token on mount
  useEffect(() => {
    if (token) {
      usersAPI
        .getMe()
        .then((u) => setUser(u))
        .catch(() => {
          localStorage.removeItem('token');
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = useCallback(async (email, password) => {
    const data = await authAPI.login(email, password);
    localStorage.setItem('token', data.token);
    setToken(data.token);

    // Normalize the user shape coming from the backend
    // The backend returns { token, user: { ...fields } }
    const u = data.user;

    // Map backend fields → frontend expected shape
    const normalized = {
      ...u,
      // Support both flat (name) and split (firstName/lastName) name fields
      firstName: u.firstName || (u.name ? u.name.split(' ')[0] : ''),
      lastName:  u.lastName  || (u.name ? u.name.split(' ').slice(1).join(' ') : ''),
      // Wrap isVerified in doctorProfile shape expected by the LoginPage
      doctorProfile: u.role === 'doctor'
        ? { isVerified: u.isVerified ?? false, specialty: u.specialization }
        : undefined,
    };

    setUser(normalized);
    return normalized;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((prev) => ({ ...prev, ...updates }));
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
