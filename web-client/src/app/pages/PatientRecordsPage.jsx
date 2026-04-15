import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Search, Filter, FileText, Phone, Mail, ChevronRight, CheckCircle, Clock } from 'lucide-react';
import { mockPatientRecords } from '../data/mockData';
import { mockReports } from '../data/mockDashboardData';

export default function PatientRecordsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patient Records</h1>
          <p className="text-muted-foreground mt-1">View and manage clinical information and reports</p>
        </div>
        <Button className="rounded-full bg-primary hover:bg-accent gap-2 px-6">
          <FileText className="w-4 h-4" />
          Add New Patient
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search patients by name or ID..."
            className="pl-10 rounded-full bg-card/50 border-none h-12"
          />
        </div>
        <Button variant="outline" className="rounded-full h-12 px-6 gap-2">
          <Filter className="w-4 h-4" />
          Filter
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {mockPatientRecords.map((patient) => {
          const patientReports = mockReports.filter(r => r.patient === patient.name);
          
          return (
            <Card
              key={patient.id}
              className="rounded-[40px] border-none shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden bg-card group"
            >
              <CardHeader className="p-8 pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[24px] bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary group-hover:scale-110 transition-transform">
                      {patient.name.charAt(0)}
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold">{patient.name}</CardTitle>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1 font-medium">
                        <span>{patient.age} years</span>
                        <span>•</span>
                        <span>{patient.gender}</span>
                        <span>•</span>
                        <Badge variant="secondary" className="rounded-full px-3">
                          {patient.bloodType}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-8 pt-4 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-3xl bg-muted/30 border border-border/50">
                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Allergies</h4>
                    <div className="flex flex-wrap gap-1">
                      {patient.allergies.map((allergy, idx) => (
                        <Badge key={idx} variant="destructive" className="rounded-full text-[10px] px-2">
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 rounded-3xl bg-muted/30 border border-border/50">
                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Primary Conditions</h4>
                    <div className="flex flex-wrap gap-1">
                      {patient.conditions.map((condition, idx) => (
                        <Badge key={idx} variant="outline" className="rounded-full text-[10px] px-2 border-primary/30 text-primary">
                          {condition}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Patient Reports Preview */}
                <div className="space-y-3">
                  <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary/70">
                    <FileText className="w-4 h-4" /> Medical Reports ({patientReports.length})
                  </h4>
                  <div className="space-y-2">
                    {patientReports.length > 0 ? (
                      patientReports.map((report) => (
                        <div key={report.id} className="flex items-center justify-between p-3 rounded-2xl bg-white border border-border/40 hover:border-primary/50 transition-colors shadow-sm cursor-pointer group/report">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover/report:bg-primary group-hover/report:text-white transition-colors">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div>
                               <div className="text-sm font-bold truncate max-w-[150px]">{report.title}</div>
                               <div className="text-[10px] text-muted-foreground">{report.date}</div>
                            </div>
                          </div>
                          <Badge className={`rounded-full px-2 py-0 text-[8px] uppercase font-black ${
                            report.status === 'Reviewed' ? 'bg-green-500/10 text-green-600' : 'bg-yellow-400/10 text-yellow-600'
                          }`}>
                            {report.status}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 bg-muted/20 rounded-2xl border border-dashed border-border/50">
                        <p className="text-xs text-muted-foreground font-medium italic">No reports uploaded yet.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-6 border-t border-border/50 flex items-center justify-between">
                  <div className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    Last visit: <span className="text-foreground">{patient.lastVisit}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="rounded-full w-10 h-10 p-0 hover:bg-primary hover:text-white transition-colors">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="rounded-full w-10 h-10 p-0 hover:bg-primary hover:text-white transition-colors">
                      <Mail className="w-4 h-4" />
                    </Button>
                    <Button className="rounded-full px-6 bg-primary hover:bg-accent font-bold text-sm shadow-lg shadow-primary/20">
                      Full Record
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
