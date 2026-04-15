import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Calendar as CalendarIcon, Clock, Plus, Trash2 } from 'lucide-react';

const initialTimeSlots = [
  { day: 'Monday', slots: ['09:00 AM - 12:00 PM', '02:00 PM - 05:00 PM'] },
  { day: 'Tuesday', slots: ['09:00 AM - 12:00 PM', '01:00 PM - 04:00 PM'] },
  { day: 'Wednesday', slots: ['10:00 AM - 01:00 PM'] },
];

export default function DoctorSchedule() {
  const [schedule, setSchedule] = useState(initialTimeSlots);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Availability & Schedule</h1>
        <p className="text-muted-foreground mt-1">Configure your weekly working hours and time slots.</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          {schedule.map((day) => (
            <Card key={day.day} className="rounded-[28px] border-none shadow-md overflow-hidden">
              <div className="bg-primary/5 px-6 py-4 flex items-center justify-between border-b border-primary/10">
                <span className="font-bold text-lg">{day.day}</span>
                <Button size="sm" variant="ghost" className="rounded-full gap-2 text-primary">
                  <Plus className="w-4 h-4" /> Add Slot
                </Button>
              </div>
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-3">
                  {day.slots.map((slot, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-card border border-border px-4 py-2 rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">{slot}</span>
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {day.slots.length === 0 && <p className="text-sm text-muted-foreground italic">No slots defined</p>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          <Card className="rounded-[32px] border-none shadow-lg bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="text-xl">Auto-Scheduler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm opacity-90">Let AI optimize your breaks and appointment density based on past performance.</p>
              <Button className="w-full rounded-2xl bg-white text-primary hover:bg-white/90">
                Enable Intelligence
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-[32px] border-none shadow-lg outline outline-2 outline-primary/20">
            <CardHeader>
              <CardTitle className="text-xl">Holiday Mode</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Block all appointments for a specific date range.</p>
              <div className="p-3 bg-muted rounded-2xl text-xs font-mono text-center">
                Apr 20 - Apr 25
              </div>
              <Button variant="outline" className="w-full rounded-2xl">Manage Holidays</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
