import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { User, Mail, Phone, Lock, CheckCircle, AlertCircle, LogOut } from 'lucide-react';

export default function ProfilePage() {
  const { user, logout } = useAuth();

  const [profile, setProfile]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [success, setSuccess]       = useState('');
  const [error, setError]           = useState('');

  const [form, setForm] = useState({
    firstName: '',
    lastName:  '',
    countryCode: '+94',
    phoneNumber: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword:     '',
    confirmPassword: '',
  });

  useEffect(() => {
    userAPI.getProfile()
      .then((res) => {
        const u = res.data.data.user;
        setProfile(u);
        setForm({
          firstName:   u.firstName,
          lastName:    u.lastName,
          countryCode: u.phone?.countryCode || '+94',
          phoneNumber: u.phone?.number || '',
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setSaving(true);
    try {
      await userAPI.updateProfile({
        firstName: form.firstName,
        lastName:  form.lastName,
        phone: { countryCode: form.countryCode, number: form.phoneNumber },
      });
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return setError('New passwords do not match');
    }
    setSaving(true);
    try {
      await userAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword:     passwordForm.newPassword,
      });
      setSuccess('Password changed! Please log in again.');
      setTimeout(() => logout(), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Password change failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Loading profile...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card px-6 py-4 flex items-center justify-between">
        <Link to="/">
          <h1 className="text-xl font-bold text-primary">Medicate</h1>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground capitalize">{user?.role}</span>
          <Button variant="outline" onClick={logout} className="rounded-full gap-2">
            <LogOut className="w-4 h-4" /> Logout
          </Button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Profile Info Card */}
        <div className="flex items-center gap-4 p-6 bg-primary/5 rounded-3xl">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{profile?.firstName} {profile?.lastName}</h2>
            <p className="text-muted-foreground capitalize">{profile?.role}</p>
            {profile?.role === 'doctor' && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                profile.doctorProfile?.isVerified
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {profile.doctorProfile?.isVerified ? '✓ Verified' : '⏳ Pending Verification'}
              </span>
            )}
          </div>
        </div>

        {/* Feedback Messages */}
        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Edit Profile */}
        <Card className="rounded-3xl border-none shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> Edit Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="First name"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className="rounded-2xl bg-muted/30 h-12"
                  required
                />
                <Input
                  placeholder="Last name"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className="rounded-2xl bg-muted/30 h-12"
                  required
                />
              </div>

              {/* Email (read only) */}
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={profile?.email}
                  className="pl-11 rounded-2xl bg-muted/50 h-12"
                  disabled
                />
              </div>

              {/* Phone */}
              <div className="flex gap-2">
                <select
                  value={form.countryCode}
                  onChange={(e) => setForm({ ...form, countryCode: e.target.value })}
                  className="rounded-2xl bg-muted/30 border border-border h-12 px-3 text-sm"
                >
                  {['+94', '+1', '+44', '+91', '+61'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <div className="relative flex-1">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder="Phone number"
                    value={form.phoneNumber}
                    onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                    className="pl-11 rounded-2xl bg-muted/30 h-12"
                  />
                </div>
              </div>

              <Button type="submit" disabled={saving} className="w-full rounded-2xl h-12 bg-primary hover:bg-accent">
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card className="rounded-3xl border-none shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" /> Change Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              {['currentPassword', 'newPassword', 'confirmPassword'].map((field) => (
                <div key={field} className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder={field === 'currentPassword' ? 'Current password' : field === 'newPassword' ? 'New password' : 'Confirm new password'}
                    value={passwordForm[field]}
                    onChange={(e) => setPasswordForm({ ...passwordForm, [field]: e.target.value })}
                    className="pl-11 rounded-2xl bg-muted/30 h-12"
                    required
                  />
                </div>
              ))}
              <Button type="submit" disabled={saving} variant="outline" className="w-full rounded-2xl h-12">
                {saving ? 'Changing...' : 'Change Password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}