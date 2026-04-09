import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Calendar, Clock, Search, Filter } from 'lucide-react';
import { mockAppointments } from '../data/mockData';

export default function AppointmentsPage() {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Live':
        return 'bg-red-500 text-white';
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Appointments</h1>
          <p className="text-muted-foreground">Manage all patient appointments</p>
        </div>
        <Button className="rounded-3xl bg-primary hover:bg-accent gap-2">
          <Calendar className="w-4 h-4" />
          New Appointment
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search appointments..."
            className="pl-10 rounded-3xl bg-card"
          />
        </div>
        <Button variant="outline" className="rounded-3xl gap-2">
          <Filter className="w-4 h-4" />
          Filter
        </Button>
      </div>

      <Card className="rounded-[32px] border-none shadow-lg">
        <CardHeader>
          <CardTitle>All Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4">Patient</th>
                  <th className="text-left py-4 px-4">Date & Time</th>
                  <th className="text-left py-4 px-4">Specialty</th>
                  <th className="text-left py-4 px-4">Symptoms</th>
                  <th className="text-left py-4 px-4">Status</th>
                  <th className="text-left py-4 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockAppointments.map((appointment) => (
                  <tr
                    key={appointment.id}
                    className="border-b border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                          {appointment.patientName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold">
                            {appointment.patientName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {appointment.patientAge} years
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-3 h-3" />
                          {appointment.date}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {appointment.time}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant="secondary" className="rounded-full">
                        {appointment.specialty}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      {appointment.symptoms && (
                        <div className="flex flex-wrap gap-1 max-w-xs">
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
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={`rounded-full ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <Button size="sm" variant="outline" className="rounded-full">
                        View
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
