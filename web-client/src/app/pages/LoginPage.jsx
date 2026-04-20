import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { User, Stethoscope, Shield, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate   = useNavigate();

  const [selectedRole, setSelectedRole] = useState('patient');
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [error, setError]               = useState('');
  const [loading, setLoading]           = useState(false);
  const [warning, setWarning]           = useState('');

  const roles = [
    { type: 'patient', label: 'Patient',  icon: User,        description: 'Book appointments and consultations' },
    { type: 'doctor',  label: 'Doctor',   icon: Stethoscope, description: 'Manage patients and appointments' },
    { type: 'admin',   label: 'Admin',    icon: Shield,       description: 'Platform administration' },
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setWarning('');
    setLoading(true);

    try {
      const user = await login(email, password);

      // Show warning for unverified doctors but still let them in
      if (user.role === 'doctor' && !user.doctorProfile?.isVerified) {
        setWarning('Your account is pending verification by an admin.');
      }

      // Redirect based on role
      if (user.role === 'admin')       navigate('/admin');
      else if (user.role === 'doctor') navigate('/dashboard');
      else                             navigate('/');

    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-background -z-10"></div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/">
            <h1 className="text-4xl font-bold text-primary mb-2">Medicate</h1>
          </Link>
          <p className="text-muted-foreground">Healthcare Platform Login</p>
        </div>

        <Card className="rounded-[48px] border-none shadow-2xl bg-card/80 backdrop-blur-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">Select your role to continue</p>
          </CardHeader>

          <CardContent className="p-8">
            {/* Role Selection */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              {roles.map((role) => (
                <button
                  key={role.type}
                  onClick={() => setSelectedRole(role.type)}
                  className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 ${
                    selectedRole === role.type
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

            {/* Role Description */}
            <div className="mb-6 p-4 bg-muted/50 rounded-3xl text-center">
              <p className="text-sm text-muted-foreground">
                {roles.find(r => r.type === selectedRole)?.description}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Warning Message */}
            {warning && (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl">
                <p className="text-sm text-yellow-700">{warning}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
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
                  <input type="checkbox" className="rounded" />
                  <span className="text-muted-foreground">Remember me</span>
                </label>
                <a href="#" className="text-primary hover:underline">Forgot password?</a>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full rounded-3xl h-12 bg-primary hover:bg-accent text-lg"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-border"></div>
              <span className="text-sm text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border"></div>
            </div>

            {/* Sign Up Link */}
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-semibold hover:underline">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}