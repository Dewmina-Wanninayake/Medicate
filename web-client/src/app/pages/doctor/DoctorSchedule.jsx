import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Calendar as CalendarIcon, Clock, Plus, Trash2, Save, Loader2, RefreshCw } from 'lucide-react';
import { clinicalAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function DoctorSchedule() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // For adding new slot
  const [newSlot, setNewSlot] = useState({ day: 'Monday', startTime: '09:00', endTime: '17:00' });

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await clinicalAPI.listDoctors({ userId: user?.userId || user?._id });
      if (res.data.data && res.data.data.length > 0) {
        const doc = res.data.data[0];
        setProfile(doc);
        setAvailability(doc.availability || []);
      }
    } catch (err) {
      console.error('Failed to fetch doctor profile:', err);
      toast.error('Could not load your availability');
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
      await clinicalAPI.updateAvailability(profile._id, { availability });
      toast.success('Schedule updated successfully');
    } catch (err) {
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const addSlot = () => {
    setAvailability([...availability, { ...newSlot, isAvailable: true }]);
  };

  const removeSlot = (index) => {
    setAvailability(availability.filter((_, i) => i !== index));
  };

  if (loading) return (
    <div className="min-h-[400px] flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Availability & Schedule</h1>
          <p className="text-muted-foreground mt-1">Configure your weekly working hours and time slots.</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={saving} 
          className="rounded-full px-8 bg-primary hover:bg-accent gap-2 shadow-lg"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </Button>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          {/* Add New Slot Control */}
          <Card className="rounded-3xl border-dashed border-2 bg-muted/20">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-end gap-4">
                <div className="space-y-2 flex-1 min-w-[150px]">
                  <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Day</label>
                  <select 
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                    value={newSlot.day}
                    onChange={e => setNewSlot({...newSlot, day: e.target.value})}
                  >
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="space-y-2 flex-1 min-w-[120px]">
                  <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Start</label>
                  <Input 
                    type="time" 
                    value={newSlot.startTime} 
                    onChange={e => setNewSlot({...newSlot, startTime: e.target.value})}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2 flex-1 min-w-[120px]">
                  <label className="text-xs font-bold uppercase text-muted-foreground ml-1">End</label>
                  <Input 
                    type="time" 
                    value={newSlot.endTime} 
                    onChange={e => setNewSlot({...newSlot, endTime: e.target.value})}
                    className="rounded-xl"
                  />
                </div>
                <Button onClick={addSlot} className="rounded-xl gap-2 px-6">
                  <Plus className="w-4 h-4" /> Add Slot
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Grouped by Day */}
          {DAYS.map(day => {
            const daySlots = availability.filter(s => s.day === day);
            return (
              <Card key={day} className="rounded-[28px] border-none shadow-md overflow-hidden bg-card">
                <div className="bg-primary/5 px-6 py-4 flex items-center justify-between border-b border-primary/10">
                  <span className="font-bold text-lg">{day}</span>
                  <Badge variant="secondary" className="rounded-full">
                    {daySlots.length} slots
                  </Badge>
                </div>
                <CardContent className="p-6">
                  <div className="flex flex-wrap gap-3">
                    {daySlots.map((slot, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-white border border-border px-4 py-2 rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">{slot.startTime} - {slot.endTime}</span>
                        <button 
                          onClick={() => removeSlot(availability.indexOf(slot))}
                          className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {daySlots.length === 0 && (
                      <p className="text-sm text-muted-foreground italic py-2">No availability set for {day}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="space-y-6">
          <Card className="rounded-[32px] border-none shadow-lg bg-primary text-primary-foreground p-1">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Auto-Scheduler
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm opacity-90">AI detects your most active hours and suggests optimal gaps for paperwork.</p>
              <Button variant="secondary" className="w-full rounded-2xl font-bold">
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-[32px] border-none shadow-lg outline outline-2 outline-primary/20">
            <CardHeader>
              <CardTitle className="text-xl">Help</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>Patients will only be able to book slots within the ranges you define here.</p>
              <p>Make sure to leave at least 15 minutes between slots for better time management.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
