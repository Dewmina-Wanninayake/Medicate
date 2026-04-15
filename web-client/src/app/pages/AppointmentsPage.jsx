import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';

/**
 * AppointmentsPage acts as a smart router:
 * - Patients are redirected to /dashboard/my-appointments (patient-specific view)
 * - Doctors & Admins see the full appointments management table (rendered inline below)
 */
import { useState } from 'react';
import { Link } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Calendar, Clock, Search, Filter, Video, AlertCircle, RefreshCw } from 'lucide-react';
import { appointmentAPI } from '../services/api';

function AdminDoctorAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [search, setSearch]             = useState('');

  const fetchAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await appointmentAPI.list({});
      setAppointments(res.data.appointments || res.data.data || []);
    } catch (err) {
      console.error('Appointments fetch failed:', err);
      setError('Could not load appointments. The service may be offline.');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Live':      return 'bg-red-500 text-white';
      case 'Scheduled': return 'bg-blue-500 text-white';
      case 'Completed': return 'bg-green-500 text-white';
      case 'Pending':   return 'bg-yellow-500 text-white';
      default:          return 'bg-gray-500 text-white';
    }
  };

  const filtered = appointments.filter(a =>
    (a.patientName || '').toLowerCase().includes(search.toLowerCase()) ||
    (a.doctorName  || '').toLowerCase().includes(search.toLowerCase()) ||
    (a.specialty   || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments Management</h1>
          <p className="text-muted-foreground mt-1">Manage and monitor all patient consultations</p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by patient, doctor or specialty..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 rounded-full bg-card/50 border-none h-12"
          />
        </div>
        <Button variant="outline" className="rounded-full h-12 px-6 gap-2">
          <Filter className="w-4 h-4" /> Filter
        </Button>
        <Button variant="outline" className="rounded-full h-12 px-4" onClick={fetchAppointments}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
          <Button variant="ghost" size="sm" className="ml-auto" onClick={fetchAppointments}>
            <RefreshCw className="w-4 h-4 mr-1" /> Retry
          </Button>
        </div>
      )}

      <Card className="rounded-[40px] border-none shadow-xl overflow-hidden">
        <CardHeader className="bg-muted/30 px-8 py-6">
          <CardTitle className="flex items-center gap-2">
            All Appointments
            <Badge variant="secondary" className="rounded-full ml-2">{filtered.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50 text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
                  <th className="text-left py-6 px-8">Patient</th>
                  <th className="text-left py-6 px-8">Doctor</th>
                  <th className="text-left py-6 px-8">Date & Time</th>
                  <th className="text-left py-6 px-8">Specialty</th>
                  <th className="text-left py-6 px-8">Status</th>
                  <th className="text-right py-6 px-8">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {loading ? (
                  <tr><td colSpan="6" className="text-center py-20 opacity-50">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    Loading appointments…
                  </td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-20">
                    <div className="flex flex-col items-center opacity-40">
                      <Calendar className="w-12 h-12 mb-2" />
                      <p>No appointments found</p>
                    </div>
                  </td></tr>
                ) : filtered.map(appointment => (
                  <tr key={appointment._id || appointment.id} className="hover:bg-muted/10 transition-colors group">
                    <td className="py-6 px-8">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary group-hover:scale-110 transition-transform">
                          {(appointment.patientName || 'P').charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold">{appointment.patientName || 'Unknown Patient'}</div>
                          <div className="text-xs text-muted-foreground">{appointment.patientAge ? `${appointment.patientAge} years` : ''}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-8">
                      <div className="font-medium">Dr. {appointment.doctorName || '—'}</div>
                    </td>
                    <td className="py-6 px-8">
                      <div className="space-y-0.5">
                        <div className="font-medium flex items-center gap-2">
                          <Calendar className="w-3 h-3 text-primary" />
                          {appointment.date ? new Date(appointment.date).toLocaleDateString() : '—'}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Clock className="w-3 h-3" /> {appointment.time || '—'}
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
                      {appointment.status === 'Live' ? (
                        <Link to={`/telemedicine/${appointment._id || appointment.id}`}>
                          <Button size="sm" className="rounded-full bg-red-500 hover:bg-red-600 text-white gap-2 px-5">
                            <Video className="w-4 h-4" /> Join
                          </Button>
                        </Link>
                      ) : (
                        <Button size="sm" variant="outline" className="rounded-full px-6 hover:bg-primary hover:text-white transition-colors">
                          Details
                        </Button>
                      )}
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

export default function AppointmentsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Patients should use their dedicated, personal appointments page
    if (user?.role === 'patient') {
      navigate('/dashboard/my-appointments', { replace: true });
    }
  }, [user, navigate]);

  // Doctor/Admin view the management table
  if (['doctor', 'admin'].includes(user?.role)) {
    return <AdminDoctorAppointments />;
  }

  return null; // redirect happening
}
