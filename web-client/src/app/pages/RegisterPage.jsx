import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { User, Stethoscope, Mail, Lock, AlertCircle, Phone } from 'lucide-react';
import { authAPI } from '../services/api';

export default function RegisterPage() {
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState('patient');
  const [firstName, setFirstName]       = useState('');
  const [lastName, setLastName]         = useState('');
  const [email, setEmail]               = useState('');
  const [phoneNumber, setPhoneNumber]   = useState('');
  const [password, setPassword]         = useState('');
  const [error, setError]               = useState('');
  const [loading, setLoading]           = useState(false);

  const roles = [
    { type: 'patient', label: 'Patient',  icon: User,        description: 'Book appointments and view your records' },
    { type: 'doctor',  label: 'Doctor',   icon: Stethoscope, description: 'Manage patients and consultations' },
  ];

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let parsedCountryCode = '+94';
      let parsedNumber = phoneNumber.replace(/[^0-9]/g, '');

      // If user typed +, try to extract the country code
      if (phoneNumber.startsWith('+')) {
        const match = phoneNumber.match(/^(\+\d{1,4})(\d{7,15})$/);
        if (match) {
          parsedCountryCode = match[1];
          parsedNumber = match[2];
        }
      }

      const payload = {
        firstName,
        lastName,
        email,
        password,
        role: selectedRole,
        phone: {
          countryCode: parsedCountryCode,
          number: parsedNumber
        }
      };
      
      // For doctor, maybe API expects doctorProfile
      if (selectedRole === 'doctor') {
        payload.doctorProfile = { specialty: 'General Practice' }; // Defaulting, can be updated later
      }

      await authAPI.register(payload);
      
      // Auto-redirect to login with a success message (or just redirect)
      navigate('/login');
    } catch (err) {
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const errorMsgs = err.response.data.errors.map(e => e.msg).join('; ');
        setError(errorMsgs);
      } else {
        setError(err.response?.data?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 mt-12 mb-12">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-background -z-10"></div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/">
            <h1 className="text-4xl font-bold text-primary mb-2">Medicate</h1>
          </Link>
          <p className="text-muted-foreground">Create a New Account</p>
        </div>

        <Card className="rounded-[48px] border-none shadow-2xl bg-card/80 backdrop-blur-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl">Sign Up</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">I am registering as a</p>
          </CardHeader>

          <CardContent className="p-8">
            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-3 mb-8">
               {roles.map((role) => (
                <button
                  key={role.type}
                  type="button"
                  onClick={() => setSelectedRole(role.type)}
                  className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 ${
                    selectedRole === role.type
                      ? 'border-primary bg-primary/10 shadow-lg'
                      : 'border-border hover:border-primary/50 bg-card'
                  }`}
                >
                  <role.icon className={`w-6 h-6 ${selectedRole === role.type ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-sm font-semibold ${selectedRole === role.type ? 'text-primary' : 'text-muted-foreground'}`}>
                    {role.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="rounded-3xl bg-muted/30 border-border h-12"
                  required
                />
                <Input
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="rounded-3xl bg-muted/30 border-border h-12"
                  required
                />
              </div>

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

              <div className="relative flex items-center">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground font-medium text-sm">+94</span>
                </div>
                <Input
                  type="tel"
                  placeholder="Phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                  className="pl-20 rounded-3xl bg-muted/30 border-border h-12"
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
                  minLength={8}
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full rounded-3xl h-12 bg-primary hover:bg-accent text-lg mt-4"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-border"></div>
              <span className="text-sm text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border"></div>
            </div>

            {/* Login Link */}
            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-semibold hover:underline">
                Sign in
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