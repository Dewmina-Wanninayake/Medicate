import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Search, Filter, FileText, Phone, Mail } from 'lucide-react';
import { mockPatientRecords } from '../data/mockData';

export default function PatientRecordsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Patient Records</h1>
          <p className="text-muted-foreground">View and manage patient information</p>
        </div>
        <Button className="rounded-3xl bg-primary hover:bg-accent gap-2">
          <FileText className="w-4 h-4" />
          Add Patient
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search patients..."
            className="pl-10 rounded-3xl bg-card"
          />
        </div>
        <Button variant="outline" className="rounded-3xl gap-2">
          <Filter className="w-4 h-4" />
          Filter
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {mockPatientRecords.map((patient) => (
          <Card
            key={patient.id}
            className="rounded-[32px] border-none shadow-lg hover:shadow-xl transition-shadow"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl font-semibold text-primary">
                    {patient.name.charAt(0)}
                  </div>
                  <div>
                    <CardTitle>{patient.name}</CardTitle>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                      <span>{patient.age} years</span>
                      <span>•</span>
                      <span>{patient.gender}</span>
                      <span>•</span>
                      <Badge variant="secondary" className="rounded-full">
                        {patient.bloodType}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold mb-2">Allergies</h4>
                <div className="flex flex-wrap gap-2">
                  {patient.allergies.map((allergy, idx) => (
                    <Badge
                      key={idx}
                      variant="destructive"
                      className="rounded-full"
                    >
                      {allergy}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2">Conditions</h4>
                <div className="flex flex-wrap gap-2">
                  {patient.conditions.map((condition, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="rounded-full"
                    >
                      {condition}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Last visit: {patient.lastVisit}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="rounded-full">
                    <Phone className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="outline" className="rounded-full">
                    <Mail className="w-3 h-3" />
                  </Button>
                  <Button size="sm" className="rounded-full bg-primary hover:bg-accent">
                    View Full Record
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
