// src/pages/DoctorDashboard.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router';
import { appointmentsAPI, notificationsAPI } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Calendar, Users, Video, Clock, CheckCircle, XCircle,
  TrendingUp, Activity, Bell, DollarSign
} from 'lucide-react';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [appointments,  setAppointments]  = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    Promise.all([
      appointmentsAPI.list({}),
      notificationsAPI.list(false),
    ])
      .then(([appts, notifs]) => {
        setAppointments(Array.isArray(appts) ? appts : []);
        setNotifications(notifs.notifications?.slice(0, 5) || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const pending   = appointments.filter(a => a.status === 'pending').length;
  const confirmed = appointments.filter(a => a.status === 'confirmed').length;
  const today     = appointments.filter(a => a.status === 'confirmed' || a.status === 'pending');

  const stats = [
    { title: 'Total Appointments', value: appointments.length, change: '+12%', icon: Calendar,    color: 'text-blue-600',   bg: 'bg-blue-50' },
    { title: 'Pending',            value: pending,             change: `+${pending}`,  icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { title: 'Confirmed',          value: confirmed,           change: '+8%',  icon: Users,       color: 'text-green-600',  bg: 'bg-green-50' },
    { title: 'Revenue',            value: '$0',                change: '+15%', icon: DollarSign,  color: 'text-primary',    bg: 'bg-primary/10' },
  ];

  const getStatusConfig = (status) => {
    const m = {
      confirmed: { label: 'Confirmed', cls: 'bg-green-100 text-green-700' },
      pending:   { label: 'Pending',   cls: 'bg-yellow-100 text-yellow-700' },
      cancelled: { label: 'Cancelled', cls: 'bg-red-100 text-red-700' },
      completed: { label: 'Completed', cls: 'bg-primary/10 text-primary' },
    };
    return m[status] || { label: status, cls: 'bg-gray-100 text-gray-600' };
  };

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold">Doctor Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, Dr. {user?.firstName || 'Doctor'}!
          {user?.doctorProfile?.isVerified === false && (
            <span className="ml-3 text-sm text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-full px-3 py-1">
              ⚠ Pending admin verification
            </span>
          )}
        </p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card
            key={stat.title}
            className="rounded-[28px] border-none shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-card to-muted/20"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <Badge variant="secondary" className="rounded-full text-xs">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {stat.change}
                </Badge>
              </div>
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.title}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Appointments Table */}
        <div className="lg:col-span-2">
          <Card className="rounded-[32px] border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg">
                <span>Today&apos;s Appointments</span>
                <Badge variant="secondary" className="rounded-full">{today.length} patients</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-6 text-muted-foreground">Loading…</div>
              ) : today.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No appointments for today.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {today.map((a) => {
                    const sc = getStatusConfig(a.status);
                    return (
                      <div
                        key={a._id}
                        className="flex items-center gap-4 p-4 rounded-3xl bg-muted/30 hover:bg-muted/50 transition-colors border border-border/50"
                      >
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-lg">
                          {(a.patientName || 'P').charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold">{a.patientName || 'Patient'}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <Clock className="w-3 h-3" />
                            {new Date(a.appointmentDate).toLocaleDateString()} · {a.startTime}
                            {a.specialization && <> · {a.specialization}</>}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className={`text-xs px-3 py-1 rounded-full font-semibold ${sc.cls}`}>{sc.label}</span>
                          <Button size="sm" variant="outline" className="rounded-full text-xs">
                            View
                          </Button>
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
        <div className="space-y-6">
          {/* AI Insights */}
          <Card className="rounded-[32px] border-none shadow-lg bg-gradient-to-br from-primary/10 to-accent/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="w-5 h-5 text-primary" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6 text-muted-foreground">
                <Activity className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No AI insights available</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="rounded-[32px] border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/telemedicine" className="block">
                <Button className="w-full rounded-3xl justify-start gap-3 py-6 h-auto">
                  <Video className="w-5 h-5" />
                  Start Telemedicine Session
                </Button>
              </Link>
              <Link to="/schedule" className="block">
                <Button variant="outline" className="w-full rounded-3xl justify-start gap-3 py-6 h-auto">
                  <Calendar className="w-5 h-5" />
                  View Schedule
                </Button>
              </Link>
              <Link to="/patients" className="block">
                <Button variant="outline" className="w-full rounded-3xl justify-start gap-3 py-6 h-auto">
                  <Users className="w-5 h-5" />
                  Patient Records
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="rounded-[32px] border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bell className="w-5 h-5 text-primary" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No notifications.</p>
              ) : (
                <div className="space-y-3">
                  {notifications.map((n) => (
                    <div
                      key={n._id}
                      className={`p-3 rounded-2xl text-sm ${!n.isRead ? 'bg-primary/5 border-l-4 border-primary' : 'bg-muted/30'}`}
                    >
                      <div className="font-semibold">{n.title}</div>
                      <div className="text-muted-foreground text-xs mt-0.5">{n.message}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
