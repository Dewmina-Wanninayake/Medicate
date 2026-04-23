import { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { FileText, Search, Download, Eye, ChevronRight, Activity, Calendar, Trash2, Edit2, Loader2, Upload, X } from 'lucide-react';
import { recordsAPI } from '../services/api';
import { toast } from 'sonner';

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      // Filter for lab reports or scans specifically
      const data = await recordsAPI.list();
      const onlyReports = data.filter(r => ['lab_report', 'imaging'].includes(r.recordType));
      setReports(onlyReports);
    } catch (err) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    try {
      await recordsAPI.delete(id);
      setReports(prev => prev.filter(r => r._id !== id));
      toast.success('Report deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const filteredReports = reports.filter(r =>
    r.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 p-1 animate-in fade-in duration-1000">
      <Card className="rounded-[48px] border-none shadow-lg bg-card/80 backdrop-blur-lg">
        <CardContent className="p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-3xl bg-primary/10 flex items-center justify-center">
                <Activity className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Clinical Reports</h1>
                <p className="text-muted-foreground mt-1 text-sm">Laboratory results and imaging analysis</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1 max-w-2xl">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="Filter by test name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 rounded-full bg-muted/50 border-none h-12 w-full focus-visible:ring-primary/20"
                />
              </div>
              <Button onClick={() => setIsUploadOpen(true)} className="rounded-full bg-primary hover:bg-accent h-12 px-8 shadow-xl shadow-primary/20 gap-2 font-bold">
                <Upload className="w-4 h-4" /> New Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-muted-foreground font-medium animate-pulse">Syncing with lab systems...</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="text-center py-32 bg-muted/5 rounded-[48px] border-2 border-dashed border-muted-foreground/10">
          <FileText className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">No clinical reports found</h2>
          <p className="text-muted-foreground max-w-xs mx-auto">Upload your first lab result to see it here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((r) => (
            <Card key={r._id} className="rounded-[40px] border-none shadow-lg hover:shadow-2xl transition-all overflow-hidden bg-gradient-to-br from-card to-muted/20 group">
              <CardContent className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileText className="w-7 h-7 text-primary" />
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => { setSelectedReport(r); setIsEditOpen(true); }} className="rounded-full h-10 w-10 hover:bg-primary/10 hover:text-primary">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(r._id)} className="rounded-full h-10 w-10 hover:bg-destructive/10 hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <h3 className="font-bold text-xl mb-2 truncate" title={r.title}>{r.title}</h3>

                <div className="flex flex-wrap items-center gap-2 mb-8">
                  <Badge className="rounded-full bg-green-100 text-green-700 px-3 border-none text-[9px] font-black uppercase tracking-widest">
                    Available
                  </Badge>
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                    {new Date(r.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                <div className="flex gap-2 pt-6 border-t border-border/50">
                  <Button variant="ghost" size="icon" className="rounded-2xl h-12 w-12 bg-muted/30 hover:bg-primary/10 hover:text-primary" onClick={() => window.open(r.fileUrl || '#', '_blank')}>
                    <Download className="w-5 h-5" />
                  </Button>
                  <Button
                    onClick={() => { setSelectedReport(r); setIsViewOpen(true); }}
                    className="flex-1 rounded-2xl h-12 bg-primary hover:bg-accent font-black gap-2 shadow-lg shadow-primary/10"
                  >
                    Details <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* View Modal */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="rounded-[48px] border-none shadow-2xl max-w-2xl p-10 bg-background">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black flex items-center gap-3">
              <FileText className="w-8 h-8 text-primary" />
              {selectedReport?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-8 mt-6">
              <Card className="rounded-[32px] bg-muted/30 border-none p-8">
                <div className="grid grid-cols-2 gap-6 text-sm">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Date Issued</p>
                    <p className="font-bold">{new Date(selectedReport.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Category</p>
                    <p className="font-bold uppercase tracking-tight">{selectedReport.recordType.replace('_', ' ')}</p>
                  </div>
                  <div className="col-span-2 pt-6 border-t border-border/50">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Findings Summary</p>
                    <p className="italic text-muted-foreground leading-relaxed">
                      This is an automated summary for the clinical document "{selectedReport.title}".
                      The results have been logged in your patient file. For a detailed clinical interpretation,
                      please consult with your referring physician.
                    </p>
                  </div>
                </div>
              </Card>
              <div className="flex gap-4">
                <Button variant="ghost" onClick={() => setIsViewOpen(false)} className="flex-1 rounded-2xl h-14 font-bold text-muted-foreground">Close</Button>
                <Button className="flex-1 rounded-2xl h-14 bg-primary hover:bg-accent font-black gap-2 shadow-xl shadow-primary/20" onClick={() => window.open(selectedReport.fileUrl || '#', '_blank')}>
                  <Download className="w-5 h-5" /> View Full PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Upload/Edit Modals would follow the same structure as RecordsPage */}
      <UploadDialog isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} onSuccess={fetchReports} />
      <EditDialog isOpen={isEditOpen} record={selectedReport} onClose={() => { setIsEditOpen(false); setSelectedReport(null); }} onSuccess={fetchReports} />
    </div>
  );
}

function UploadDialog({ isOpen, onClose, onSuccess }) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('lab_report');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('recordType', type);
      await recordsAPI.upload(formData);
      toast.success('Report added');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-[40px] p-10">
        <DialogHeader><DialogTitle className="text-2xl font-black">Add New Report</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Report Title</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Lipoprotein Profile" className="h-12 rounded-xl bg-muted/50 border-none" required />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="h-12 rounded-xl bg-muted/50 border-none"><SelectValue /></SelectTrigger>
              <SelectContent className="rounded-xl border-none shadow-xl">
                <SelectItem value="lab_report">Lab Report</SelectItem>
                <SelectItem value="imaging">Imaging (X-Ray/Scan)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">File</Label>
            {!file ? (
              <div className="border-2 border-dashed border-muted-foreground/10 rounded-2xl p-8 hover:bg-muted/30 transition-all text-center">
                <input type="file" id="report-up" className="hidden" onChange={e => setFile(e.target.files[0])} />
                <label htmlFor="report-up" className="cursor-pointer block">
                  <Upload className="w-10 h-10 text-primary mx-auto mb-2 opacity-50" />
                  <span className="text-sm font-bold">Select Clinical Document</span>
                </label>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl border border-primary/10">
                <span className="text-sm font-bold truncate max-w-[200px]">{file.name}</span>
                <Button variant="ghost" size="icon" onClick={() => setFile(null)}><X className="w-4 h-4" /></Button>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1 rounded-xl h-12 font-bold">Cancel</Button>
            <Button type="submit" disabled={loading} className="flex-1 rounded-xl h-12 bg-primary hover:bg-accent font-black">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Upload Report'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditDialog({ isOpen, record, onClose, onSuccess }) {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (record) setTitle(record.title); }, [record]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await recordsAPI.update(record._id, { title });
      toast.success('Report updated');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error('Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-[40px] p-10">
        <DialogHeader><DialogTitle className="text-2xl font-black">Edit Report</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Title</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} className="h-12 rounded-xl bg-muted/50 border-none" required />
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1 rounded-xl h-12 font-bold">Cancel</Button>
            <Button type="submit" disabled={loading} className="flex-1 rounded-xl h-12 bg-primary hover:bg-accent font-black">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
