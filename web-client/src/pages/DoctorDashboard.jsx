// src/pages/DoctorDashboard.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { appointmentsAPI, notificationsAPI } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Calendar, Users, Video, Clock, CheckCircle, XCircle,
  TrendingUp, Activity, Bell, DollarSign, ChevronRight
} from 'lucide-react';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [appointments,  setAppointments]  = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appts, notifs] = await Promise.all([
          appointmentsAPI.list({}),
          notificationsAPI.list(false),
        ]);
        setAppointments(Array.isArray(appts) ? appts : []);
        setNotifications(notifs.notifications?.slice(0, 5) || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const pending   = appointments.filter(a => a.status === 'pending').length;
  const confirmed = appointments.filter(a => a.status === 'confirmed').length;
  const todayAppts = appointments.filter(a => {
    const d = new Date(a.appointmentDate);
    const now = new Date();
    return d.toDateString() === now.toDateString() && a.status !== 'cancelled';
  });

  const stats = [
    { title: 'Total Appointments', value: appointments.length, change: '+12%', icon: Calendar,    color: 'text-blue-600',   bg: 'bg-blue-50' },
    { title: 'Pending Approval',   value: pending,             change: `+${pending}`,  icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { title: 'Today\'s Sessions',  value: todayAppts.length,   change: 'Live',  icon: Users,       color: 'text-green-600',  bg: 'bg-green-50' },
    { title: 'Consultation Fee',   value: `$${user?.consultationFee || 0}`, change: 'Per Session', icon: DollarSign,  color: 'text-primary',    bg: 'bg-primary/10' },
  ];

  const getStatusConfig = (status) => {
    const m = {
      confirmed: { label: 'Confirmed', cls: 'bg-green-100 text-green-700' },
      pending:   { label: 'Pending',   cls: 'bg-yellow-100 text-yellow-700' },
      cancelled: { label: 'Cancelled', cls: 'bg-red-100 text-red-700' },
      completed: { label: 'Completed', cls: 'bg-blue-100 text-blue-700' },
    };
    return m[status] || { label: status, cls: 'bg-gray-100 text-gray-600' };
  };

  return (
    <div className="space-y-8 p-1">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-primary tracking-tight">Clinical Overview</h1>
          <p className="text-muted-foreground mt-2 text-lg font-medium">
            Welcome back, Dr. {user?.name?.split(' ').pop() || 'Doctor'}! You have {todayAppts.length} sessions today.
          </p>
        </div>
        {user?.isVerified === false && (
          <Badge className="bg-yellow-500 hover:bg-yellow-500 text-white px-4 py-2 rounded-full font-black text-xs">
            PENDING VERIFICATION
          </Badge>
        )}
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card
            key={stat.title}
            className="rounded-[32px] border-none shadow-xl hover:shadow-2xl transition-all bg-white overflow-hidden group"
          >
            <CardContent className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center transition-transform group-hover:scale-110`}>
                  <stat.icon className={`w-7 h-7 ${stat.color}`} />
                </div>
                <Badge variant="secondary" className="rounded-full text-[10px] font-black uppercase tracking-widest px-3 py-1">
                  {stat.change}
                </Badge>
              </div>
              <div className="text-4xl font-black text-primary mb-1">{stat.value}</div>
              <div className="text-sm font-black text-muted-foreground uppercase tracking-widest">{stat.title}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Appointments Table */}
        <div className="lg:col-span-2">
          <Card className="rounded-[40px] border-none shadow-xl bg-white overflow-hidden h-full">
            <CardHeader className="p-8 border-b border-border/50 bg-muted/20">
              <CardTitle className="flex items-center justify-between text-2xl font-black text-primary">
                <span>Today's Schedule</span>
                <Badge className="rounded-full bg-primary h-8 px-4 font-black">{todayAppts.length} SESSIONS</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="text-center py-20">
                  <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                  <p className="font-bold text-muted-foreground">Syncing appointments...</p>
                </div>
              ) : todayAppts.length === 0 ? (
                <div className="text-center py-24 text-muted-foreground">
                  <Calendar className="w-16 h-16 mx-auto mb-4 opacity-10" />
                  <p className="text-xl font-bold">No active sessions for today.</p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {todayAppts.map((a) => {
                    const sc = getStatusConfig(a.status);
                    return (
                      <div
                        key={a._id}
                        className="flex items-center gap-6 p-8 hover:bg-primary/[0.02] transition-colors"
                      >
                        <div className="w-16 h-16 rounded-[24px] bg-primary/10 flex items-center justify-center font-black text-primary text-2xl">
                          P
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-black text-xl text-primary capitalize">Patient Record</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2 font-bold">
                            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {a.startTime}</span>
                            <span className="flex items-center gap-1"><Activity className="w-4 h-4" /> {a.specialization}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full border ${sc.cls}`}>{sc.label}</span>
                          {a.status === 'confirmed' && (
                            <Link to={`/telemedicine?id=${a._id}`}>
                              <Button className="rounded-full bg-primary hover:bg-accent font-black shadow-lg px-6">JOIN</Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right panel */}
        <div className="space-y-8">
          {/* AI Insights */}
          <Card className="rounded-[40px] border-none shadow-xl bg-gradient-to-br from-primary to-accent p-1 overflow-hidden">
             <div className="bg-white/95 backdrop-blur-xl rounded-[38px] h-full p-8">
                <CardHeader className="p-0 mb-6">
                  <CardTitle className="flex items-center gap-3 text-2xl font-black text-primary">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Activity className="w-6 h-6 text-primary" />
                    </div>
                    AI Insights
                  </CardTitle>
                </CardHeader>
                <div className="space-y-4">
                  <div className="p-5 rounded-3xl bg-muted/30 border border-primary/5">
                    <p className="text-sm font-bold text-primary/80 leading-relaxed italic">
                      "You have a higher volume of Cardiac consultations this week. Consider reviewing the latest ESC guidelines."
                    </p>
                  </div>
                </div>
             </div>
          </Card>

          {/* Quick Actions */}
          <Card className="rounded-[40px] border-none shadow-xl bg-white p-8">
            <CardHeader className="p-0 mb-8">
              <CardTitle className="text-2xl font-black text-primary">Quick Controls</CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              <Link to="/appointments" className="block group">
                <Button className="w-full rounded-[24px] justify-between px-8 py-8 h-auto bg-primary hover:bg-accent shadow-lg shadow-primary/20 group-hover:scale-[1.02] transition-transform">
                  <div className="flex items-center gap-4">
                    <Calendar className="w-6 h-6" />
                    <span className="text-lg font-black uppercase tracking-widest">Schedule</span>
                  </div>
                  <TrendingUp className="w-5 h-5 opacity-50" />
                </Button>
              </Link>
              <Link to="/patients" className="block group">
                <Button variant="outline" className="w-full rounded-[24px] justify-between px-8 py-8 h-auto border-muted text-primary hover:bg-muted/30 group-hover:scale-[1.02] transition-transform">
                  <div className="flex items-center gap-4">
                    <Users className="w-6 h-6" />
                    <span className="text-lg font-black uppercase tracking-widest">Patients</span>
                  </div>
                  <ChevronRight className="w-5 h-5 opacity-30" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
