import { useState } from 'react';
import { Link } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { User, Stethoscope, Shield, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const roles = [
    {
      type: 'patient',
      label: 'Patient',
      icon: User,
      description: 'Book appointments and consultations'
    },
    {
      type: 'doctor',
      label: 'Doctor',
      icon: Stethoscope,
      description: 'Manage patients and appointments'
    },
    {
      type: 'admin',
      label: 'Admin',
      icon: Shield,
      description: 'Platform administration'
    }
  ];

  const handleLogin = (e) => {
    e.preventDefault();
    // Mock login - redirect based on role
    if (selectedRole === 'doctor' || selectedRole === 'admin') {
      window.location.href = '/dashboard';
    } else {
      window.location.href = '/';
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

        {/* Login Card */}
        <Card className="rounded-[48px] border-none shadow-2xl bg-card/80 backdrop-blur-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Select your role to continue
            </p>
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
                  <role.icon
                    className={`w-6 h-6 ${
                      selectedRole === role.type ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  />
                  <span
                    className={`text-xs font-semibold ${
                      selectedRole === role.type ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
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
                <a href="#" className="text-primary hover:underline">
                  Forgot password?
                </a>
              </div>

              <Button
                type="submit"
                className="w-full rounded-3xl h-12 bg-primary hover:bg-accent text-lg"
              >
                Sign In
              </Button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-border"></div>
              <span className="text-sm text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border"></div>
            </div>

            {/* Social Login */}
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full rounded-3xl h-12 justify-start gap-3"
              >
                <img
                  src="https://www.google.com/favicon.ico"
                  alt="Google"
                  className="w-5 h-5"
                />
                Continue with Google
              </Button>
            </div>

            {/* Sign Up Link */}
            <div className="mt-8 text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <a href="#" className="text-primary font-semibold hover:underline">
                Sign up
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
