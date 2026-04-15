import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { 
  Calendar, 
  Video, 
  Clock,
  Shield,
  FileText,
  Pill,
  Activity
} from 'lucide-react';
import { authAPI, appointmentAPI, clinicalAPI } from '../services/api';

export default function PatientDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [symptomText, setSymptomText] = useState('');
  const [aiResults, setAiResults] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    // In a real scenario, this would filter by the logged-in user ID
    // For now, let's just attempt to fetch from appointmentAPI and fail gracefully
    const fetchAppointments = async () => {
      try {
        const res = await appointmentAPI.list({});
        setAppointments(res.data.appointments || []);
      } catch (err) {
        console.error("Failed to fetch appointments", err);
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const handleSymptomCheck = async () => {
    if (!symptomText.trim()) return;
    setIsAiLoading(true);
    setAiResults(null);
    try {
      const res = await clinicalAPI.aiSymptomCheck({ symptoms: symptomText });
      setAiResults(res.data.data.analysis); // assuming response structure based on common patterns
    } catch (err) {
      console.error(err);
      setAiResults(
        `Based on your symptoms: "${symptomText}", our AI suggests consulting with a general practitioner. Note: AI checking is currently offline.`
      );
    } finally {
      setIsAiLoading(false);
    }
  };

  const upcomingAppointments = appointments.filter(
    apt => apt.status === 'Scheduled' || apt.status === 'Live' || apt.status === 'Pending'
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Live': return 'bg-red-500 text-white animate-pulse';
      case 'Scheduled': return 'bg-blue-500 text-white';
      case 'Completed': return 'bg-green-500 text-white';
      case 'Pending': return 'bg-yellow-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome & AI Section */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-[32px] border-none shadow-lg bg-gradient-to-br from-primary/10 to-accent/10">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold border-none mb-2">Welcome Back!</h2>
              <p className="text-muted-foreground mb-6">Here's your health overview for today.</p>
              
              {/* AI Symptom Checker */}
              <div className="bg-card/50 backdrop-blur-sm p-6 rounded-[24px] shadow-sm">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Ask AI Symptom Checker
                </h3>
                <div className="flex gap-3">
                  <Input
                    placeholder="Describe your symptoms (e.g. headache and fever)..."
                    value={symptomText}
                    onChange={(e) => setSymptomText(e.target.value)}
                    className="rounded-3xl bg-white border-primary/20"
                    onKeyDown={(e) => e.key === 'Enter' && handleSymptomCheck()}
                  />
                  <Button 
                    className="rounded-3xl px-6 bg-primary hover:bg-accent"
                    onClick={handleSymptomCheck}
                    disabled={isAiLoading}
                  >
                    {isAiLoading ? 'Analyzing...' : 'Analyze'}
                  </Button>
                </div>
                {aiResults && (
                  <div className="mt-4 p-4 bg-muted/80 rounded-3xl border border-primary/20 text-sm">
                    {aiResults}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Appointments */}
          <Card className="rounded-[32px] border-none shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <span>Upcoming Appointments</span>
                <Badge variant="secondary" className="rounded-full">
                  {upcomingAppointments.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-6 text-muted-foreground">Loading...</div>
              ) : upcomingAppointments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>You have no upcoming appointments.</p>
                  <Button className="mt-4 rounded-3xl" variant="outline">Book an Appointment</Button>
                </div>
              ) : (
                <div className="space-y-4 pt-4">
                  {upcomingAppointments.map((appointment) => (
                    <div
                      key={appointment._id || appointment.id}
                      className="flex items-center gap-4 p-4 rounded-3xl bg-muted/30 hover:bg-muted/50 transition-colors border border-border/50"
                    >
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                        👨‍⚕️
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">Dr. {appointment.doctorName || 'Assigned Doctor'}</h4>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(appointment.date).toLocaleDateString() || appointment.date} {appointment.time}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={`rounded-full ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </Badge>
                        {appointment.status === 'Live' && (
                          <Link to={`/telemedicine/${appointment._id || appointment.id}`}>
                            <Button size="sm" className="rounded-full bg-primary hover:bg-accent gap-2">
                              <Video className="w-4 h-4" /> Join
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          <Card className="rounded-[32px] border-none shadow-lg">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full rounded-3xl justify-start gap-3 bg-primary hover:bg-accent text-white py-6">
                <Calendar className="w-5 h-5" />
                Book New Appointment
              </Button>
              <Button variant="outline" className="w-full rounded-3xl justify-start gap-3 py-6">
                <Video className="w-5 h-5 text-primary" />
                Join Waiting Room
              </Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card className="rounded-[24px] border-none shadow-md bg-gradient-to-br from-card to-muted/20 hover:shadow-lg transition-all cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="w-10 h-10 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <h4 className="font-medium text-sm">My Records</h4>
              </CardContent>
            </Card>
            <Card className="rounded-[24px] border-none shadow-md bg-gradient-to-br from-card to-muted/20 hover:shadow-lg transition-all cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="w-10 h-10 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-3">
                  <Pill className="w-5 h-5 text-green-600" />
                </div>
                <h4 className="font-medium text-sm">Prescriptions</h4>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
