import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Calendar, Clock, Check, X, ArrowRight } from 'lucide-react';

const mockDoctorAppointments = [
  { id: 1, patient: "Alice Thompson", date: "2024-04-16", time: "09:00 AM", type: "Telemedicine", status: "Pending" },
  { id: 2, patient: "Robert Miller", date: "2024-04-16", time: "10:30 AM", type: "In-Person", status: "Pending" },
  { id: 3, patient: "James Anderson", date: "2024-04-17", time: "02:00 PM", type: "Follow-up", status: "Confirmed" },
];

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState(mockDoctorAppointments);

  const handleStatusChange = (id, newStatus) => {
    setAppointments(appointments.map(a => a.id === id ? { ...a, status: newStatus } : a));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments Management</h1>
          <p className="text-muted-foreground mt-1">Review and manage your daily schedule.</p>
        </div>
        <Button className="rounded-full gap-2">
          <Calendar className="w-4 h-4" /> View Full Calendar
        </Button>
      </div>

      <Card className="rounded-[32px] border-none shadow-lg">
        <CardHeader>
          <CardTitle>Upcoming Appointment Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {appointments.map((apt) => (
              <div key={apt.id} className="flex items-center gap-4 p-5 rounded-3xl bg-muted/20 border border-border/50 hover:bg-muted/30 transition-all">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                  {apt.patient.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-lg">{apt.patient}</div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {apt.date}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {apt.time}</span>
                    <Badge variant="outline" className="rounded-full">{apt.type}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {apt.status === 'Pending' ? (
                    <>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="rounded-full text-destructive hover:bg-destructive/10"
                        onClick={() => handleStatusChange(apt.id, 'Rejected')}
                      >
                        <X className="w-5 h-5" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="rounded-full border-primary/20 hover:bg-primary/5"
                        onClick={() => handleStatusChange(apt.id, 'Rescheduled')}
                      >
                        Reschedule
                      </Button>
                      <Button 
                        size="sm" 
                        className="rounded-full bg-primary hover:bg-accent"
                        onClick={() => handleStatusChange(apt.id, 'Confirmed')}
                      >
                        <Check className="w-4 h-4 mr-1" /> Accept
                      </Button>
                    </>
                  ) : (
                    <Badge className={`rounded-full px-4 py-1 ${apt.status === 'Confirmed' ? 'bg-green-500' : 'bg-destructive'}`}>
                      {apt.status}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
