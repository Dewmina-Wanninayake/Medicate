import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { User, Mail, Phone, Lock, Camera, CheckCircle, AlertCircle, Shield } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || 'User Name',
    email: user?.email || 'user@example.com',
    phone: user?.phone || 'Not set',
  });
  const [success, setSuccess] = useState('');

  const handleUpdate = (e) => {
    e.preventDefault();
    setSuccess('Profile updated successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-1">
      <div className="flex items-center gap-6 p-8 bg-gradient-to-r from-primary/10 to-accent/10 rounded-[40px]">
        <div className="relative group">
          <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center border-4 border-white shadow-xl overflow-hidden">
            {user?.name ? (
              <span className="text-3xl font-bold text-primary">{user.name.charAt(0)}</span>
            ) : (
              <User className="w-12 h-12 text-primary" />
            )}
          </div>
          <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center border-2 border-white shadow-lg hover:scale-110 transition-transform">
            <Camera className="w-4 h-4" />
          </button>
        </div>
        <div>
          <h1 className="text-3xl font-black">{form.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="rounded-full capitalize">{user?.role || 'Patient'}</Badge>
            {user?.role === 'doctor' && (
              <Badge className="bg-green-100 text-green-700 border-green-200 rounded-full">
                <Shield className="w-3 h-3 mr-1" /> Verified Professional
              </Badge>
            )}
          </div>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-2 text-green-600">
          <CheckCircle className="w-4 h-4" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <Card className="rounded-[32px] border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="pl-10 rounded-xl h-12" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input value={form.email} disabled className="pl-10 rounded-xl h-12 bg-muted/50" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} className="pl-10 rounded-xl h-12" />
                  </div>
                </div>
                <Button type="submit" className="w-full rounded-full h-12 bg-primary hover:bg-accent font-bold">
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="rounded-[32px] border-none shadow-lg overflow-hidden">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-lg">Security</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground">Update your password to keep your account secure.</p>
              <Button variant="outline" className="w-full rounded-2xl h-12 gap-2">
                <Lock className="w-4 h-4" /> Change Password
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Badge({ children, variant, className }) {
  const variants = {
    secondary: 'bg-primary/10 text-primary border-transparent',
    default: 'bg-primary text-primary-foreground border-transparent'
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variants[variant] || variants.default} ${className}`}>
      {children}
    </span>
  );
}
