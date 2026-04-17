import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { User, Mail, Camera, Save, MapPin, Briefcase, Loader2, Award, DollarSign } from 'lucide-react';
import { clinicalAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

export default function DoctorProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    bio: '',
    experience: 0,
    consultationFee: 0,
    phone: ''
  });

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await clinicalAPI.listDoctors({ userId: user?.userId || user?._id });
      if (res.data.data && res.data.data.length > 0) {
        const doc = res.data.data[0];
        setProfile(doc);
        setFormData({
          name: doc.name || '',
          specialization: doc.specialization || '',
          bio: doc.bio || '',
          experience: doc.experience || 0,
          consultationFee: doc.consultationFee || 0,
          phone: doc.phone || ''
        });
      }
    } catch (err) {
      console.error('Failed to fetch doctor profile:', err);
      toast.error('Could not load professional profile');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchProfile();
  }, [user, fetchProfile]);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      await clinicalAPI.updateDoctorProfile(profile._id, formData);
      setProfile({ ...profile, ...formData });
      setIsEditing(false);
      toast.success('Professional profile updated');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-[400px] flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Professional Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your public medical profile seen by patients.</p>
        </div>
        <div className="flex gap-3">
          {isEditing && (
            <Button variant="ghost" onClick={() => setIsEditing(false)} className="rounded-full">Cancel</Button>
          )}
          <Button 
            variant={isEditing ? "default" : "outline"} 
            className="rounded-full gap-2 shadow-md"
            onClick={isEditing ? handleSave : () => setIsEditing(true)}
            disabled={saving}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : isEditing ? <Save className="w-4 h-4" /> : null}
            {isEditing ? "Save Changes" : "Edit Profile"}
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <Card className="md:col-span-1 rounded-[40px] border-none shadow-xl overflow-hidden h-fit bg-card">
          <div className="h-32 bg-gradient-to-br from-primary to-accent relative">
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
              <div className="w-24 h-24 rounded-3xl border-4 border-card bg-muted flex items-center justify-center relative overflow-hidden group shadow-2xl">
                {profile?.profileImage ? (
                  <img src={profile.profileImage} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-muted-foreground" />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
          <CardContent className="pt-14 text-center pb-8 px-6">
            <h3 className="text-xl font-black">{profile?.name || user?.name}</h3>
            <p className="text-sm font-bold text-primary mb-4">{profile?.specialization || 'Healthcare Provider'}</p>
            <div className="flex flex-wrap justify-center gap-2">
              <Badge variant={profile?.isVerified ? "default" : "secondary"} className="rounded-full bg-green-500/10 text-green-700 border-none">
                {profile?.isVerified ? 'Verified Specialist' : 'Pending Verification'}
              </Badge>
              <Badge variant="secondary" className="rounded-full font-bold">{formData.experience}+ Years</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Info Form */}
        <Card className="md:col-span-2 rounded-[40px] border-none shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl">Career Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-muted-foreground ml-1">Display Name</label>
                <Input 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  disabled={!isEditing} 
                  className="rounded-2xl border-none bg-muted/50 h-12 font-semibold" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-muted-foreground ml-1">Specialty</label>
                <Input 
                  value={formData.specialization} 
                  onChange={e => setFormData({...formData, specialization: e.target.value})}
                  disabled={!isEditing} 
                  className="rounded-2xl border-none bg-muted/50 h-12 font-semibold" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-muted-foreground ml-1">Years of Experience</label>
                <div className="flex items-center gap-3 bg-muted/30 p-1.5 rounded-2xl">
                  <div className="bg-primary/10 p-2 rounded-xl"><Award className="w-5 h-5 text-primary" /></div>
                  <Input 
                    type="number"
                    value={formData.experience} 
                    onChange={e => setFormData({...formData, experience: parseInt(e.target.value) || 0})}
                    disabled={!isEditing} 
                    className="border-none bg-transparent focus-visible:ring-0 h-10 font-bold" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-muted-foreground ml-1">Consultation Fee ($)</label>
                <div className="flex items-center gap-3 bg-muted/30 p-1.5 rounded-2xl">
                  <div className="bg-green-500/10 p-2 rounded-xl"><DollarSign className="w-5 h-5 text-green-600" /></div>
                  <Input 
                    type="number"
                    value={formData.consultationFee} 
                    onChange={e => setFormData({...formData, consultationFee: parseInt(e.target.value) || 0})}
                    disabled={!isEditing} 
                    className="border-none bg-transparent focus-visible:ring-0 h-10 font-bold" 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
               <label className="text-xs font-black uppercase tracking-wider text-muted-foreground ml-1">About / Biography</label>
               <textarea 
                 value={formData.bio}
                 onChange={e => setFormData({...formData, bio: e.target.value})}
                 disabled={!isEditing} 
                 className="w-full rounded-2xl border-none bg-muted/50 p-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 min-h-[120px] outline-none transition-all"
                 placeholder="Describe your medical background and approach to patient care..."
               />
            </div>

            {profile?.isVerified && (
              <div className="p-4 bg-green-50 rounded-3xl border border-green-100 flex items-center gap-3">
                <Award className="w-10 h-10 text-green-600 shrink-0" />
                <div className="text-xs text-green-800">
                  <p className="font-bold">Your profile is verified.</p>
                  <p>Changes to display name or specialty might trigger a re-verification process by the admin team.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
