import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { 
  FileText, 
  Upload, 
  Search, 
  Filter, 
  Download, 
  MoreVertical, 
  CheckCircle,
  Clock,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { mockReports } from '../data/mockDashboardData';
import { useAuth } from '../context/AuthContext';

export default function ReportsPage() {
  const { user } = useAuth();
  const isDoctor = user?.role === 'doctor';
  const [searchTerm, setSearchTerm] = useState('');
  const [reports, setReports] = useState(mockReports);

  const filteredReports = reports.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.patient.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-primary">Medical Reports</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            {isDoctor ? "Review and manage patient-uploaded medical results." : "Access and upload your clinical records and lab results."}
          </p>
        </div>
        {!isDoctor && (
          <Button className="rounded-full bg-primary hover:bg-accent h-14 px-8 text-lg font-bold shadow-lg shadow-primary/20 gap-3 group">
            <Upload className="w-5 h-5 group-hover:-translate-y-1 transition-transform" /> 
            Upload New Report
          </Button>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-[32px] border-none shadow-md bg-white/50 backdrop-blur-sm p-6 flex items-center gap-6">
           <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary">
              <FileText className="w-8 h-8" />
           </div>
           <div>
              <div className="text-3xl font-black text-primary">{reports.length}</div>
              <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Total Records</div>
           </div>
        </Card>
        <Card className="rounded-[32px] border-none shadow-md bg-white/50 backdrop-blur-sm p-6 flex items-center gap-6">
           <div className="w-16 h-16 rounded-3xl bg-yellow-400/10 flex items-center justify-center text-yellow-600">
              <Clock className="w-8 h-8" />
           </div>
           <div>
              <div className="text-3xl font-black text-yellow-600">{reports.filter(r => r.status === 'Pending').length}</div>
              <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Pending Review</div>
           </div>
        </Card>
        <Card className="rounded-[32px] border-none shadow-md bg-white/50 backdrop-blur-sm p-6 flex items-center gap-6">
           <div className="w-16 h-16 rounded-3xl bg-green-500/10 flex items-center justify-center text-green-600">
              <CheckCircle className="w-8 h-8" />
           </div>
           <div>
              <div className="text-3xl font-black text-green-600">{reports.filter(r => r.status === 'Reviewed').length}</div>
              <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Completed</div>
           </div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        <div className="flex gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder={isDoctor ? "Search by patient name or report type..." : "Search your reports..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-16 rounded-full bg-white border-none shadow-sm focus-visible:ring-2 focus-visible:ring-primary/50 transition-all text-lg"
            />
          </div>
          <Button variant="outline" className="h-16 w-16 rounded-full border-none bg-white shadow-sm hover:bg-muted">
            <Filter className="w-6 h-6" />
          </Button>
        </div>

        <div className="grid gap-4">
          {filteredReports.map((report) => (
            <Card key={report.id} className="rounded-[40px] border-none shadow-lg hover:shadow-2xl transition-all duration-300 group overflow-hidden bg-white">
              <div className="p-1.5 flex flex-col md:flex-row md:items-center gap-6">
                <div className="p-6 md:p-8 flex-1 flex items-center gap-8">
                  <div className="w-20 h-20 rounded-[30px] bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <FileText className="w-10 h-10" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                       <h3 className="text-2xl font-black tracking-tight truncate">{report.title}</h3>
                       <Badge variant="secondary" className="rounded-full px-4 py-1 text-xs font-bold bg-muted text-muted-foreground">{report.type}</Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-muted-foreground">
                       <span className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-primary" />
                          Issued by {report.doctor}
                       </span>
                       <span className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {report.date}
                       </span>
                       {isDoctor && (
                         <span className="flex items-center gap-2 bg-primary/5 text-primary px-3 py-1 rounded-full text-xs font-bold">
                           Patient: {report.patient}
                         </span>
                       )}
                    </div>
                  </div>
                </div>

                <div className="px-8 pb-8 md:pb-0 md:border-l border-border/50 flex flex-row md:flex-col items-center justify-center gap-3 min-w-[200px]">
                   <Badge className={`rounded-xl px-4 py-1.5 text-xs font-black w-full text-center ${
                     report.status === 'Reviewed' ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-yellow-400/10 text-yellow-700 border-yellow-400/20'
                   } border`}>
                     {report.status}
                   </Badge>
                   <div className="flex gap-2 w-full">
                      <Button variant="ghost" size="icon" className="flex-1 h-12 rounded-2xl bg-muted/30 hover:bg-muted transition-colors">
                        <Download className="w-5 h-5" />
                      </Button>
                      <Button className="flex-[2] h-12 rounded-2xl bg-primary hover:bg-accent font-bold gap-2">
                        {isDoctor && report.status === 'Pending' ? "Review" : "View"} <ChevronRight className="w-4 h-4" />
                      </Button>
                   </div>
                </div>
              </div>
            </Card>
          ))}
          {filteredReports.length === 0 && (
            <div className="py-32 text-center bg-muted/10 rounded-[48px] border-4 border-dashed border-border/50">
               <Upload className="w-20 h-20 mx-auto mb-6 text-muted-foreground/20" />
               <h3 className="text-2xl font-bold text-muted-foreground/50">No reports found matching your search.</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
