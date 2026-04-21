// src/pages/PatientDashboard.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { appointmentsAPI, notificationsAPI } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Calendar, Bell, Shield, FileText, Pill, Video,
  Clock, CheckCircle, XCircle, TrendingUp
} from 'lucide-react';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appointments,   setAppointments]   = useState([]);
  const [notifications,  setNotifications]  = useState([]);
  const [loading,        setLoading]        = useState(true);

  useEffect(() => {
    Promise.all([
      appointmentsAPI.list({ status: 'confirmed' }),
      notificationsAPI.list(false),
    ])
      .then(([appts, notifs]) => {
        setAppointments(appts.slice(0, 5));
        setNotifications(notifs.notifications?.slice(0, 5) || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statusIcon = (status) => {
    if (status === 'confirmed') return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (status === 'cancelled' || status === 'rejected') return <XCircle className="w-4 h-4 text-red-500" />;
    return <Clock className="w-4 h-4 text-yellow-500" />;
  };

  const statusBadge = (status) => {
    const map = { confirmed:'confirmed', cancelled:'cancelled', rejected:'cancelled', pending:'pending', completed:'completed' };
    return map[status] || 'default';
  };

  const quickActions = [
    { icon: Calendar, label: 'Book Appointment',  color: 'text-primary',   bg: 'bg-primary/10',  href: '/appointments' },
    { icon: Video,    label: 'Join Waiting Room', color: 'text-blue-600',  bg: 'bg-blue-50',     href: '/telemedicine' },
    { icon: FileText, label: 'My Records',        color: 'text-purple-600',bg: 'bg-purple-50',   href: '/records' },
    { icon: Pill,     label: 'Prescriptions',     color: 'text-green-600', bg: 'bg-green-50',    href: '/prescriptions' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome card */}
      <Card className="rounded-[32px] border-none shadow-lg bg-gradient-to-br from-primary/10 to-accent/10">
        <CardContent className="p-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-3xl font-bold mb-2">Welcome Back, {user?.firstName || 'Patient'}! 👋</h2>
              <p className="text-muted-foreground">Here's your health overview for today.</p>
            </div>
            <Shield className="w-12 h-12 text-primary opacity-30" />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {quickActions.map((qa) => (
              <Link
                key={qa.label}
                to={qa.href}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card/60 backdrop-blur-sm hover:bg-card/80 transition-all shadow-sm border border-border/50 text-center cursor-pointer"
              >
                <div className={`w-10 h-10 rounded-full ${qa.bg} flex items-center justify-center`}>
                  <qa.icon className={`w-5 h-5 ${qa.color}`} />
                </div>
                <span className="text-sm font-medium">{qa.label}</span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Appointments */}
        <div className="lg:col-span-2">
          <Card className="rounded-[32px] border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg">
                <span>Upcoming Appointments</span>
                <Badge variant="secondary" className="rounded-full">
                  {appointments.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-6 text-muted-foreground">Loading…</div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No upcoming appointments.</p>
                  <Button className="mt-4 rounded-3xl" variant="outline">Book an Appointment</Button>
                </div>
              ) : (
                <div className="space-y-4 pt-2">
                  {appointments.map((a) => (
                    <div
                      key={a._id}
                      className="flex items-center gap-4 p-4 rounded-3xl bg-muted/30 hover:bg-muted/50 transition-colors border border-border/50"
                    >
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                        👨‍⚕️
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold">
                          {new Date(a.appointmentDate).toLocaleDateString()} · {a.startTime}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {a.specialization || 'General'} · {a.consultationType}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {statusIcon(a.status)}
                        <Badge variant={statusBadge(a.status)} className="rounded-full">
                          {a.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  <Link to="/appointments" className="block mt-2">
                    <Button variant="ghost" className="rounded-3xl text-primary">View all →</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Notifications + Stats */}
        <div className="space-y-6">
          {/* Stats card */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Total Visits',    value: appointments.length, icon: Calendar, bg: 'bg-primary/10',  color: 'text-primary' },
              { label: 'Notifications',  value: notifications.length, icon: Bell,     bg: 'bg-blue-50',     color: 'text-blue-600' },
            ].map((s) => (
              <Card key={s.label} className="rounded-[24px] border-none shadow-md bg-gradient-to-br from-card to-muted/20">
                <CardContent className="p-6 text-center">
                  <div className={`w-10 h-10 mx-auto rounded-full ${s.bg} flex items-center justify-center mb-3`}>
                    <s.icon className={`w-5 h-5 ${s.color}`} />
                  </div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Notifications */}
          <Card className="rounded-[32px] border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Recent Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm">No notifications yet.</div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((n) => (
                    <div
                      key={n._id}
                      className={`flex gap-3 p-3 rounded-2xl ${!n.isRead ? 'bg-primary/5 border-l-4 border-primary' : 'bg-muted/30'}`}
                    >
                      <Bell className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-semibold">{n.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{n.message}</div>
                      </div>
                    </div>
                  ))}
                  <Link to="/notifications">
                    <Button variant="ghost" className="rounded-3xl text-primary w-full text-sm">View all →</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
