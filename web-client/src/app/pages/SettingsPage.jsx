import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  User, Bell, Lock, Palette, Moon, Sun, Globe,
  Save, AlertCircle, CheckCircle2, Eye, EyeOff, RefreshCw
} from 'lucide-react';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const TABS = [
  { id: 'profile',    label: 'Profile',       icon: User },
  { id: 'security',   label: 'Security',      icon: Lock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance',    icon: Palette },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  // Profile state
  const [name, setName]   = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio]     = useState(user?.bio || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg]       = useState(null); // {type, text}

  // Security state
  const [currentPw, setCurrentPw]     = useState('');
  const [newPw, setNewPw]             = useState('');
  const [confirmPw, setConfirmPw]     = useState('');
  const [showPw, setShowPw]           = useState(false);
  const [pwSaving, setPwSaving]       = useState(false);
  const [pwMsg, setPwMsg]             = useState(null);

  // Notifications state
  const [notifPrefs, setNotifPrefs] = useState({
    appointmentReminders: true,
    prescriptionReady:    true,
    systemUpdates:        false,
    emailNotifs:          true,
    smsNotifs:            false,
  });

  // Appearance state
  const [theme, setTheme] = useState(
    document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  );

  // ── Save profile ─────────────────────────────────────────────────
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg(null);
    try {
      await userAPI.updateProfile({ name: name.trim(), phone: phone.trim(), bio: bio.trim() });
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err?.response?.data?.message || 'Failed to update profile. Please try again.' });
    } finally {
      setProfileSaving(false);
    }
  };

  // ── Change password ──────────────────────────────────────────────
  const handleChangePw = async (e) => {
    e.preventDefault();
    if (newPw !== confirmPw) {
      setPwMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (newPw.length < 8) {
      setPwMsg({ type: 'error', text: 'Password must be at least 8 characters.' });
      return;
    }
    setPwSaving(true);
    setPwMsg(null);
    try {
      await userAPI.changePassword({ currentPassword: currentPw, newPassword: newPw });
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
      setPwMsg({ type: 'success', text: 'Password changed successfully!' });
    } catch (err) {
      setPwMsg({ type: 'error', text: err?.response?.data?.message || 'Failed to change password. Check your current password.' });
    } finally {
      setPwSaving(false);
    }
  };

  // ── Toggle theme ─────────────────────────────────────────────────
  const toggleTheme = (t) => {
    setTheme(t);
    if (t === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const MsgBanner = ({ msg }) => msg ? (
    <div className={`flex items-center gap-2 p-3 rounded-2xl text-sm ${
      msg.type === 'success'
        ? 'bg-green-50 text-green-700 border border-green-200'
        : 'bg-red-50 text-red-700 border border-red-200'
    }`}>
      {msg.type === 'success'
        ? <CheckCircle2 className="w-4 h-4 shrink-0" />
        : <AlertCircle className="w-4 h-4 shrink-0" />
      }
      {msg.text}
    </div>
  ) : null;

  const PwInput = ({ label, value, onChange, placeholder }) => (
    <div>
      <label className="text-sm font-bold mb-1.5 block">{label}</label>
      <div className="relative">
        <Input
          type={showPw ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="rounded-2xl pr-12"
          required
        />
        <button
          type="button"
          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          onClick={() => setShowPw(!showPw)}
        >
          {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black tracking-tight text-primary">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your account preferences and security settings.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:w-56 space-y-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-6">
          {/* ── Profile ── */}
          {activeTab === 'profile' && (
            <Card className="rounded-[32px] border-none shadow-xl">
              <CardHeader className="px-8 pt-8 pb-4">
                <CardTitle className="text-xl flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" /> Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                {/* Avatar */}
                <div className="flex items-center gap-5 mb-8 p-5 bg-muted/30 rounded-3xl">
                  <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl font-black text-primary">
                    {(user?.name || 'U').charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-lg">{user?.name}</div>
                    <div className="text-sm text-muted-foreground">{user?.email}</div>
                    <Badge variant="secondary" className="rounded-full capitalize mt-1 text-xs">{user?.role}</Badge>
                  </div>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="text-sm font-bold mb-1.5 block">Full Name</label>
                      <Input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Your full name"
                        className="rounded-2xl"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold mb-1.5 block">Email</label>
                      <Input
                        value={user?.email || ''}
                        disabled
                        className="rounded-2xl bg-muted/50 cursor-not-allowed opacity-60"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold mb-1.5 block">Phone Number</label>
                      <Input
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="+94 77 123 4567"
                        type="tel"
                        className="rounded-2xl"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-bold mb-1.5 block">Bio (optional)</label>
                    <textarea
                      value={bio}
                      onChange={e => setBio(e.target.value)}
                      placeholder="A brief description about yourself…"
                      className="w-full min-h-[80px] px-4 py-3 rounded-2xl border border-input bg-background text-sm resize-none"
                    />
                  </div>
                  <MsgBanner msg={profileMsg} />
                  <Button type="submit" className="rounded-full bg-primary hover:bg-accent px-8 font-bold gap-2" disabled={profileSaving}>
                    {profileSaving ? <><RefreshCw className="w-4 h-4 animate-spin" /> Saving…</> : <><Save className="w-4 h-4" /> Save Changes</>}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* ── Security ── */}
          {activeTab === 'security' && (
            <Card className="rounded-[32px] border-none shadow-xl">
              <CardHeader className="px-8 pt-8 pb-4">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" /> Change Password
                </CardTitle>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <form onSubmit={handleChangePw} className="space-y-5 max-w-md">
                  <PwInput
                    label="Current Password"
                    value={currentPw}
                    onChange={e => setCurrentPw(e.target.value)}
                    placeholder="Enter your current password"
                  />
                  <PwInput
                    label="New Password"
                    value={newPw}
                    onChange={e => setNewPw(e.target.value)}
                    placeholder="At least 8 characters"
                  />
                  <PwInput
                    label="Confirm New Password"
                    value={confirmPw}
                    onChange={e => setConfirmPw(e.target.value)}
                    placeholder="Re-enter new password"
                  />
                  <MsgBanner msg={pwMsg} />
                  <Button type="submit" className="rounded-full bg-primary hover:bg-accent px-8 font-bold gap-2" disabled={pwSaving}>
                    {pwSaving ? <><RefreshCw className="w-4 h-4 animate-spin" /> Updating…</> : <><Lock className="w-4 h-4" /> Change Password</>}
                  </Button>
                </form>

                {/* Security info */}
                <div className="mt-8 p-5 bg-blue-50 border border-blue-200 rounded-3xl text-sm text-blue-800">
                  <div className="font-bold mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> Security Tips
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-blue-700">
                    <li>Use a strong password with at least 8 characters</li>
                    <li>Include numbers, uppercase letters, and special characters</li>
                    <li>Never share your password with anyone</li>
                    <li>Change your password regularly</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Notifications ── */}
          {activeTab === 'notifications' && (
            <Card className="rounded-[32px] border-none shadow-xl">
              <CardHeader className="px-8 pt-8 pb-4">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" /> Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="px-8 pb-8 space-y-4">
                {[
                  { key: 'appointmentReminders', label: 'Appointment Reminders', desc: 'Get notified 24 hours before your appointments' },
                  { key: 'prescriptionReady',    label: 'Prescription Ready',    desc: 'Be notified when a doctor issues a prescription for you' },
                  { key: 'systemUpdates',        label: 'System Updates',        desc: 'Receive updates about new platform features' },
                  { key: 'emailNotifs',          label: 'Email Notifications',   desc: 'Receive notifications via email' },
                  { key: 'smsNotifs',            label: 'SMS Notifications',     desc: 'Receive text message notifications (charges may apply)' },
                ].map(pref => (
                  <div key={pref.key} className="flex items-center justify-between p-5 rounded-3xl bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div>
                      <div className="font-bold text-sm">{pref.label}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{pref.desc}</div>
                    </div>
                    <button
                      onClick={() => setNotifPrefs(prev => ({ ...prev, [pref.key]: !prev[pref.key] }))}
                      className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                        notifPrefs[pref.key] ? 'bg-primary' : 'bg-muted-foreground/30'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${
                          notifPrefs[pref.key] ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                ))}

                <div className="pt-4">
                  <Button className="rounded-full bg-primary hover:bg-accent px-8 font-bold gap-2">
                    <Save className="w-4 h-4" /> Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Appearance ── */}
          {activeTab === 'appearance' && (
            <Card className="rounded-[32px] border-none shadow-xl">
              <CardHeader className="px-8 pt-8 pb-4">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Palette className="w-5 h-5 text-primary" /> Appearance
                </CardTitle>
              </CardHeader>
              <CardContent className="px-8 pb-8 space-y-6">
                <div>
                  <label className="text-sm font-bold mb-3 block">Theme</label>
                  <div className="grid grid-cols-2 gap-4 max-w-sm">
                    {[
                      { val: 'light', label: 'Light Mode', Icon: Sun },
                      { val: 'dark',  label: 'Dark Mode',  Icon: Moon },
                    ].map(({ val, label, Icon }) => (
                      <button
                        key={val}
                        onClick={() => toggleTheme(val)}
                        className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-3 transition-all ${
                          theme === val
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-border hover:border-primary/40 text-muted-foreground'
                        }`}
                      >
                        <Icon className="w-8 h-8" />
                        <span className="text-sm font-bold">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-5 bg-muted/30 rounded-3xl text-sm text-muted-foreground">
                  <Globe className="w-5 h-5 mb-2 text-primary" />
                  <div className="font-bold text-foreground mb-1">Language & Region</div>
                  <p>Currently set to <strong>English (US)</strong>. Additional languages coming soon.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
