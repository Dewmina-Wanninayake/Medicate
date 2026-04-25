import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { User, Mail, Phone, Lock, Camera, CheckCircle, AlertCircle, Shield } from 'lucide-react';
import { usersAPI } from '../services/api';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    // Patient fields
    dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
    bloodGroup: user?.bloodGroup || '',
    address: user?.address || '',
    // Doctor fields
    specialization: user?.specialization || '',
    licenseNumber: user?.licenseNumber || '',
    experience: user?.experience || '',
    consultationFee: user?.consultationFee || '',
    bio: user?.bio || '',
  });
  
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const updatedUser = await usersAPI.updateMe(form);
      updateUser(updatedUser);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-1">
      <div className="flex items-center gap-6 p-8 bg-gradient-to-r from-primary/10 to-accent/10 rounded-[40px]">
        <div className="relative group">
          <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center border-4 border-white shadow-xl overflow-hidden">
            {user?.name ? (
              <span className="text-3xl font-bold text-primary">{user.name.charAt(0).toUpperCase()}</span>
            ) : (
              <User className="w-12 h-12 text-primary" />
            )}
          </div>
          <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center border-2 border-white shadow-lg hover:scale-110 transition-transform">
            <Camera className="w-4 h-4" />
          </button>
        </div>
        <div>
          <h1 className="text-3xl font-black">{form.name || 'User Name'}</h1>
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
      
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
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
                    <Input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="pl-10 rounded-xl h-12" required />
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

                {/* Patient specific fields */}
                {user?.role === 'patient' && (
                  <>
                    <div className="space-y-2">
                      <Label>Date of Birth</Label>
                      <Input type="date" value={form.dateOfBirth} onChange={(e) => setForm({...form, dateOfBirth: e.target.value})} className="rounded-xl h-12" />
                    </div>
                    <div className="space-y-2">
                      <Label>Blood Group</Label>
                      <Input value={form.bloodGroup} onChange={(e) => setForm({...form, bloodGroup: e.target.value})} placeholder="e.g. O+, A-, B+" className="rounded-xl h-12" />
                    </div>
                    <div className="space-y-2">
                      <Label>Address</Label>
                      <Input value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} placeholder="123 Main St..." className="rounded-xl h-12" />
                    </div>
                  </>
                )}

                {/* Doctor specific fields */}
                {user?.role === 'doctor' && (
                  <>
                    <div className="space-y-2">
                      <Label>Specialization</Label>
                      <Select value={form.specialization} onValueChange={(val) => setForm({...form, specialization: val})}>
                        <SelectTrigger className="rounded-xl h-12">
                          <SelectValue placeholder="Select specialization" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Cardiology">Cardiology</SelectItem>
                          <SelectItem value="Dermatology">Dermatology</SelectItem>
                          <SelectItem value="General Medicine">General Medicine</SelectItem>
                          <SelectItem value="Neurology">Neurology</SelectItem>
                          <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                          <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                          <SelectItem value="Psychiatry">Psychiatry</SelectItem>
                          <SelectItem value="Radiology">Radiology</SelectItem>
                          <SelectItem value="Surgery">Surgery</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>License Number</Label>
                      <Input value={form.licenseNumber} onChange={(e) => setForm({...form, licenseNumber: e.target.value})} className="rounded-xl h-12" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Experience (Years)</Label>
                        <Input type="number" min="0" value={form.experience} onChange={(e) => setForm({...form, experience: e.target.value})} className="rounded-xl h-12" />
                      </div>
                      <div className="space-y-2">
                        <Label>Consultation Fee ($)</Label>
                        <Input type="number" min="0" value={form.consultationFee} onChange={(e) => setForm({...form, consultationFee: e.target.value})} className="rounded-xl h-12" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Bio</Label>
                      <Input value={form.bio} onChange={(e) => setForm({...form, bio: e.target.value})} placeholder="Tell patients about yourself" className="rounded-xl h-12" />
                    </div>
                  </>
                )}

                <Button type="submit" disabled={loading} className="w-full rounded-full h-12 bg-primary hover:bg-accent font-bold">
                  {loading ? 'Saving...' : 'Save Changes'}
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
