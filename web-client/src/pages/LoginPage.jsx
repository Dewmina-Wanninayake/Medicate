// src/pages/LoginPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { User, Stethoscope, Shield, Mail, Lock, AlertCircle } from 'lucide-react';
import Logo from '../assets/medicate-logo.png';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [loading, setLoading] = useState(false);

  const roles = [
    { type: 'patient', label: 'Patient', icon: User, description: 'Book appointments and consultations' },
    { type: 'doctor', label: 'Doctor', icon: Stethoscope, description: 'Manage patients and appointments' },
    { type: 'admin', label: 'Admin', icon: Shield, description: 'Platform administration' },
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setWarning(''); setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'doctor' && !user.doctorProfile?.isVerified) {
        setWarning('Your account is pending verification by an admin.');
      }
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'doctor') navigate('/dashboard');
      else navigate('/');
    } catch (err) {
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        setError(err.response.data.errors.map(e => e.msg).join('; '));
      } else {
        setError(err.response?.data?.message || err.response?.data?.error || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-background -z-10" />

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 justify-center">
            <img src={Logo} alt="Medicate Logo" className="h-28 w-auto" />
          </Link>
          <p className="text-muted-foreground mt-2">Healthcare Platform Login</p>
        </div>

        <Card className="rounded-[48px] border-none shadow-2xl bg-card/80 backdrop-blur-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">Select your role to continue</p>
          </CardHeader>

          <CardContent className="p-8">
            {/* Role Selection */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              {roles.map((role) => (
                <button
                  key={role.type}
                  id={`role-${role.type}`}
                  type="button"
                  onClick={() => setSelectedRole(role.type)}
                  className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 ${selectedRole === role.type
                      ? 'border-primary bg-primary/10 shadow-lg'
                      : 'border-border hover:border-primary/50 bg-card'
                    }`}
                >
                  <role.icon className={`w-6 h-6 ${selectedRole === role.type ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-xs font-semibold ${selectedRole === role.type ? 'text-primary' : 'text-muted-foreground'}`}>
                    {role.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Role description */}
            <div className="mb-6 p-4 bg-muted/50 rounded-3xl text-center">
              <p className="text-sm text-muted-foreground">
                {roles.find(r => r.type === selectedRole)?.description}
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Warning */}
            {warning && (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl">
                <p className="text-sm text-yellow-700">{warning}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="login-email"
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11 rounded-3xl bg-muted/30 border-border h-12"
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="login-password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 rounded-3xl bg-muted/30 border-border h-12"
                  required
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded accent-primary" />
                  <span className="text-muted-foreground">Remember me</span>
                </label>
                <a href="#" className="text-primary hover:underline">Forgot password?</a>
              </div>

              <Button
                id="login-submit"
                type="submit"
                disabled={loading}
                className="w-full rounded-3xl h-12 text-base mt-2"
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </Button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-border" />
              <span className="text-sm text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="text-primary font-semibold hover:underline">Sign up</Link>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
