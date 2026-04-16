import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Calendar, Clock, Search, Filter, Plus } from 'lucide-react';
import { appointmentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AppointmentsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdminOrDoctor = ['admin', 'doctor'].includes(user?.role);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await appointmentAPI.list({});
        setAppointments(res.data.appointments || []);
      } catch (err) {
        console.error("Failed to fetch appointments:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Live': return 'bg-red-500 text-white';
      case 'Scheduled': return 'bg-blue-500 text-white';
      case 'Completed': return 'bg-green-500 text-white';
      case 'Pending': return 'bg-yellow-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isAdminOrDoctor ? "Appointments Management" : "My Appointments"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isAdminOrDoctor ? "Manage all patient consultations" : "View and manage your upcoming consultations"}
          </p>
        </div>
        {!isAdminOrDoctor && (
          <Button 
            onClick={() => navigate('/')}
            className="rounded-full bg-primary hover:bg-accent gap-2 px-6"
          >
            <Plus className="w-5 h-5" /> Book New Appointment
          </Button>
        )}
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by date or doctor..."
            className="pl-10 rounded-full bg-card/50 border-none h-12"
          />
        </div>
        <Button variant="outline" className="rounded-full h-12 px-6 gap-2">
          <Filter className="w-4 h-4" /> Filter
        </Button>
      </div>

      <Card className="rounded-[40px] border-none shadow-xl overflow-hidden">
        <CardHeader className="bg-muted/30 px-8 py-6">
          <CardTitle>{isAdminOrDoctor ? "All Appointments" : "Upcoming Sessions"}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50 text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
                  <th className="text-left py-6 px-8">{isAdminOrDoctor ? "Patient" : "Doctor"}</th>
                  <th className="text-left py-6 px-8">Date & Time</th>
                  <th className="text-left py-6 px-8">Specialty</th>
                  <th className="text-left py-6 px-8">Status</th>
                  <th className="text-right py-6 px-8">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {loading ? (
                  <tr><td colSpan="5" className="text-center py-20 opacity-50">Loading sessions...</td></tr>
                ) : appointments.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-20">
                    <div className="flex flex-col items-center opacity-40">
                      <Calendar className="w-12 h-12 mb-2" />
                      <p>No appointments found</p>
                    </div>
                  </td></tr>
                ) : appointments.map((appointment) => (
                  <tr key={appointment._id || appointment.id} className="hover:bg-muted/10 transition-colors group">
                    <td className="py-6 px-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary group-hover:scale-110 transition-transform">
                          {(isAdminOrDoctor ? (appointment.patientName || 'P') : (appointment.doctorName || 'D')).charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-lg">
                            {isAdminOrDoctor ? (appointment.patientName || 'Unknown Patient') : (appointment.doctorName || 'Dr. Sarah Adams')}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {isAdminOrDoctor ? `${appointment.patientAge || 'N/A'} years` : appointment.specialty || 'General Practitioner'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-8">
                      <div className="space-y-1">
                        <div className="font-medium flex items-center gap-2">
                           <Calendar className="w-3 h-3 text-primary" />
                           {new Date(appointment.date).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                           <Clock className="w-3 h-3" /> {appointment.time}
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-8">
                      <Badge variant="secondary" className="rounded-full px-4">{appointment.specialty || 'General'}</Badge>
                    </td>
                    <td className="py-6 px-8">
                      <Badge className={`rounded-full px-4 py-1 ${getStatusColor(appointment.status)}`}>
                        {appointment.status || 'Pending'}
                      </Badge>
                    </td>
                    <td className="py-6 px-8 text-right">
                      <Button size="sm" variant="outline" className="rounded-full px-6 hover:bg-primary hover:text-white transition-colors">
                        {appointment.status === 'Live' ? 'Join Call' : 'Details'}
                      </Button>
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
