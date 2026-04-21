import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { FileText, Search, Download, FileUp, Filter, Eye, ChevronRight, Activity, Calendar } from 'lucide-react';

const SAMPLE_REPORTS = [
  {
    _id: '1',
    title: 'Complete Blood Count (CBC)',
    category: 'lab_report',
    status: 'Reviewed',
    patientName: 'Jane Doe',
    createdAt: '2026-03-15',
    size: '1.2 MB'
  },
  {
    _id: '2',
    title: 'Chest X-Ray Analysis',
    category: 'x_ray',
    status: 'Pending',
    patientName: 'Jane Doe',
    createdAt: '2026-03-10',
    size: '4.5 MB'
  },
  {
    _id: '3',
    title: 'MRI Brain Scan',
    category: 'scan',
    status: 'Reviewed',
    patientName: 'Jane Doe',
    createdAt: '2026-02-28',
    size: '12.8 MB'
  }
];

export default function ReportsPage() {
  const [reports, setReports] = useState(SAMPLE_REPORTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const filteredReports = reports.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 p-1">
      <Card className="rounded-[48px] border-none shadow-lg bg-card/80 backdrop-blur-lg">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-3xl bg-primary/10 flex items-center justify-center">
                <FileText className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Medical Reports</h1>
                <p className="text-muted-foreground mt-1">Access and download your clinical reports</p>
              </div>
            </div>
            <div className="flex flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-full bg-muted/50 border-none h-12"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((r) => (
          <Card key={r._id} className="rounded-[32px] border-none shadow-lg hover:shadow-xl transition-all overflow-hidden bg-gradient-to-br from-card to-muted/20">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <Badge className={`rounded-full ${r.status === 'Reviewed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {r.status}
                </Badge>
              </div>
              <h3 className="font-bold text-lg mb-2 truncate">{r.title}</h3>
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" /> {new Date(r.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Activity className="w-3 h-3" /> {r.category.replace('_', ' ').toUpperCase()}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="rounded-2xl h-12 w-12 bg-muted/30">
                  <Download className="w-5 h-5" />
                </Button>
                <Button 
                  onClick={() => { setSelectedReport(r); setIsViewOpen(true); }}
                  className="flex-1 rounded-2xl h-12 bg-primary hover:bg-accent font-bold gap-2"
                >
                  View <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="rounded-[32px] border-none shadow-2xl max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <Eye className="w-6 h-6 text-primary" />
              {selectedReport?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-6 mt-4">
              <Card className="rounded-2xl bg-muted/30 border-none p-6">
                <div className="font-mono text-sm space-y-4">
                  <p className="font-bold text-primary">REPORT SUMMARY</p>
                  <p>Patient: {selectedReport.patientName}</p>
                  <p>Date: {selectedReport.createdAt}</p>
                  <p>Category: {selectedReport.category.toUpperCase()}</p>
                  <div className="pt-4 border-t border-border/50">
                    <p className="italic text-muted-foreground">
                      This is a sample medical report summary for {selectedReport.title}. 
                      The clinical findings are within normal ranges for a patient of this age group.
                    </p>
                  </div>
                </div>
              </Card>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setIsViewOpen(false)} className="flex-1 rounded-xl h-12">Close</Button>
                <Button className="flex-1 rounded-xl h-12 bg-primary hover:bg-accent gap-2">
                  <Download className="w-4 h-4" /> Download Full PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
