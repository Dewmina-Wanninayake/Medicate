import { useState } from 'react';
import { Link } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  Calendar, 
  Users, 
  DollarSign, 
  Video, 
  TrendingUp,
  Activity,
  Clock
} from 'lucide-react';
import { mockAppointments } from '../data/mockData';

export default function DoctorDashboard() {
  const stats = [
    {
      title: 'Total Appointments',
      value: '142',
      change: '+12%',
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Pending Consultations',
      value: '8',
      change: '+3',
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Total Patients',
      value: '1,248',
      change: '+8%',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Revenue',
      value: '$12,450',
      change: '+15%',
      icon: DollarSign,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    }
  ];

  const todayAppointments = mockAppointments.filter(
    apt => apt.status === 'Live' || apt.status === 'Scheduled'
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Live':
        return 'bg-red-500 text-white animate-pulse';
      case 'Scheduled':
        return 'bg-blue-500 text-white';
      case 'Completed':
        return 'bg-green-500 text-white';
      case 'Pending':
        return 'bg-yellow-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card
            key={stat.title}
            className="rounded-[28px] border-none shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-card to-muted/20"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <Badge variant="secondary" className="rounded-full">
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
              <CardTitle className="flex items-center justify-between">
                <span>Today's Appointments</span>
                <Badge variant="secondary" className="rounded-full">
                  {todayAppointments.length} patients
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todayAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center gap-4 p-4 rounded-3xl bg-muted/30 hover:bg-muted/50 transition-colors border border-border/50"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                      {appointment.patientName.charAt(0)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{appointment.patientName}</h4>
                        <span className="text-sm text-muted-foreground">
                          • {appointment.patientAge}y
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {appointment.time}
                        </span>
                        <span>•</span>
                        <span>{appointment.specialty}</span>
                      </div>
                      {appointment.symptoms && (
                        <div className="flex gap-2 mt-2">
                          {appointment.symptoms.map((symptom, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="rounded-full text-xs"
                            >
                              {symptom}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge className={`rounded-full ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </Badge>
                      
                      {appointment.status === 'Live' && (
                        <Link to={`/telemedicine/${appointment.id}`}>
                          <Button
                            size="sm"
                            className="rounded-full bg-primary hover:bg-accent gap-2"
                          >
                            <Video className="w-4 h-4" />
                            Join Call
                          </Button>
                        </Link>
                      )}
                      
                      {appointment.status === 'Scheduled' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full"
                        >
                          View Details
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights Panel */}
        <div className="space-y-6">
          <Card className="rounded-[32px] border-none shadow-lg bg-gradient-to-br from-primary/10 to-accent/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {todayAppointments
                .filter(apt => apt.aiInsights)
                .slice(0, 2)
                .map((appointment) => (
                  <div
                    key={appointment.id}
                    className="p-4 rounded-3xl bg-card border border-border"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                        {appointment.patientName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-sm">
                          {appointment.patientName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {appointment.time}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {appointment.aiInsights}
                    </p>
                  </div>
                ))}

              {todayAppointments.filter(apt => apt.aiInsights).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No AI insights available</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[32px] border-none shadow-lg">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full rounded-3xl justify-start gap-3 bg-primary hover:bg-accent">
                <Video className="w-5 h-5" />
                Start Telemedicine Session
              </Button>
              <Button
                variant="outline"
                className="w-full rounded-3xl justify-start gap-3"
              >
                <Calendar className="w-5 h-5" />
                View Schedule
              </Button>
              <Button
                variant="outline"
                className="w-full rounded-3xl justify-start gap-3"
              >
                <Users className="w-5 h-5" />
                Patient Records
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
