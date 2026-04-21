import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Calendar, Clock, Search, Filter, Video, MapPin, MoreVertical, Plus, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router';

const SAMPLE_APPOINTMENTS = [
  {
    _id: '1',
    doctorName: 'Dr. Sarah Adams',
    specialty: 'Cardiologist',
    date: '2026-04-22',
    time: '10:00 AM',
    type: 'Telemedicine',
    status: 'Confirmed'
  },
  {
    _id: '2',
    doctorName: 'Dr. John Smith',
    specialty: 'Orthopedic',
    date: '2026-04-25',
    time: '02:30 PM',
    type: 'In-Person',
    status: 'Pending'
  },
  {
    _id: '3',
    doctorName: 'Dr. Michael Chen',
    specialty: 'Dermatologist',
    date: '2026-03-15',
    time: '11:15 AM',
    type: 'Telemedicine',
    status: 'Completed'
  }
];

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState(SAMPLE_APPOINTMENTS);
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusColor = (status) => {
    switch(status) {
      case 'Confirmed': return 'bg-green-100 text-green-700 border-green-200';
      case 'Pending':   return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Completed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-8 p-1">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-primary">Appointments</h1>
          <p className="text-muted-foreground mt-2 text-lg">Schedule and manage your consultations with our experts.</p>
        </div>
        <Button className="rounded-full bg-primary hover:bg-accent h-14 px-8 text-lg font-bold shadow-lg shadow-primary/20 gap-3">
          <Plus className="w-5 h-5" /> Book New Appointment
        </Button>
      </div>

      <Card className="rounded-[40px] border-none shadow-lg overflow-hidden bg-white/50 backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="p-8 border-b border-border/50 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                placeholder="Search by doctor or specialty..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-14 rounded-full border-none bg-white shadow-sm text-lg" 
              />
            </div>
            <Button variant="outline" className="h-14 rounded-full px-6 gap-2 border-none bg-white shadow-sm">
              <Filter className="w-5 h-5" /> Filters
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/30 text-left text-sm font-bold uppercase tracking-widest text-muted-foreground">
                  <th className="py-6 px-8">Doctor</th>
                  <th className="py-6 px-8">Date & Time</th>
                  <th className="py-6 px-8">Type</th>
                  <th className="py-6 px-8">Status</th>
                  <th className="py-6 px-8 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {appointments.map((a) => (
                  <tr key={a._id} className="hover:bg-primary/5 transition-colors group">
                    <td className="py-6 px-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {a.doctorName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-black text-lg">{a.doctorName}</div>
                          <div className="text-sm text-muted-foreground">{a.specialty}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-8">
                      <div className="space-y-1">
                        <div className="font-bold flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-primary" /> {a.date}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Clock className="w-4 h-4" /> {a.time}
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-8">
                      <Badge variant="outline" className="rounded-full px-4 py-1 gap-2 border-primary/20 bg-primary/5">
                        {a.type === 'Telemedicine' ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                        {a.type}
                      </Badge>
                    </td>
                    <td className="py-6 px-8">
                      <Badge className={`rounded-full px-4 py-1 border ${getStatusColor(a.status)}`}>
                        {a.status}
                      </Badge>
                    </td>
                    <td className="py-6 px-8 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {a.status === 'Confirmed' && a.type === 'Telemedicine' && (
                          <Link to="/telemedicine">
                            <Button size="sm" className="rounded-full bg-green-500 hover:bg-green-600 gap-2">
                              <Video className="w-4 h-4" /> Join
                            </Button>
                          </Link>
                        )}
                        <Button variant="ghost" size="icon" className="rounded-full">
                          <MoreVertical className="w-5 h-5 text-muted-foreground" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
