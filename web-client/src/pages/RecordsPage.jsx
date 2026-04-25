import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { 
  FileText, Upload, Trash2, Download, 
  X, FolderOpen, ExternalLink, Edit2, 
  Loader2, Search, Filter, Eye
} from 'lucide-react';
import { recordsAPI } from '../services/api';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const RECORD_TYPES = [
  { label: 'Lab Report', value: 'lab_report' },
  { label: 'Imaging (X-Ray/MRI)', value: 'imaging' },
  { label: 'Prescription', value: 'prescription' },
  { label: 'Consultation Note', value: 'consultation_note' },
  { label: 'Uploaded Document', value: 'uploaded_document' },
  { label: 'Other', value: 'other' }
];

export default function RecordsPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewRecord, setPreviewRecord] = useState(null);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const data = await recordsAPI.list();
      setRecords(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load records');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      await recordsAPI.delete(id);
      setRecords(prev => prev.filter(r => r._id !== id));
      toast.success('Record deleted successfully');
    } catch (err) {
      toast.error('Failed to delete record');
    }
  };

  const filteredRecords = records.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.recordType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 p-1 animate-in fade-in duration-700">
      <Card className="rounded-[48px] border-none shadow-lg bg-card/80 backdrop-blur-lg">
        <CardContent className="p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-3xl bg-primary/10 flex items-center justify-center">
                <FileText className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Medical Records</h1>
                <p className="text-muted-foreground mt-1 text-sm">Centralized vault for all your clinical documentation</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div className="relative group flex-1 min-w-[280px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input 
                  placeholder="Search by title or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 rounded-full bg-muted/30 border-none h-12 focus-visible:ring-primary/20 w-full"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setIsUploadOpen(true)} className="rounded-full bg-primary hover:bg-accent h-12 px-8 shadow-xl shadow-primary/20 gap-2">
                  <Upload className="w-4 h-4" /> Upload
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-muted-foreground font-medium">Securing your clinical vault...</p>
        </div>
      ) : filteredRecords.length === 0 ? (
        <EmptyState onUpload={() => setIsUploadOpen(true)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecords.map((record) => (
            <RecordCard 
              key={record._id} 
              record={record} 
              onDelete={handleDelete}
              onEdit={() => { setEditingRecord(record); setIsEditOpen(true); }}
              onView={() => { setPreviewRecord(record); setIsPreviewOpen(true); }}
            />
          ))}
        </div>
      )}

      <UploadDialog 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
        onSuccess={fetchRecords} 
      />

      <EditDialog 
        isOpen={isEditOpen}
        record={editingRecord}
        onClose={() => { setIsEditOpen(false); setEditingRecord(null); }}
        onSuccess={fetchRecords}
      />

      <PreviewDialog 
        isOpen={isPreviewOpen}
        record={previewRecord}
        onClose={() => { setIsPreviewOpen(false); setPreviewRecord(null); }}
      />
    </div>
  );
}

function RecordCard({ record, onDelete, onEdit, onView }) {
  return (
    <Card className="rounded-[40px] border-none shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 group bg-gradient-to-br from-card to-muted/20 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-2 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardContent className="p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <FileText className="w-7 h-7 text-primary" />
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={onEdit} className="rounded-full h-10 w-10 hover:bg-primary/10 hover:text-primary">
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(record._id)} className="rounded-full h-10 w-10 hover:bg-destructive/10 hover:text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <h3 className="font-bold text-xl mb-2 truncate" title={record.title}>{record.title}</h3>
        
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <Badge variant="secondary" className="rounded-full text-[9px] font-black uppercase tracking-widest px-3 py-1">
            {record.recordType.replace('_', ' ')}
          </Badge>
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            {new Date(record.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-border/50">
          <div className="flex items-center gap-2 max-w-[70%]">
            <FolderOpen className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground truncate italic font-medium">{record.fileName || 'document.pdf'}</span>
          </div>
          <Button variant="outline" size="sm" className="rounded-full border-primary/20 hover:bg-primary/5 text-[10px] font-black uppercase tracking-widest px-4 h-8" onClick={onView}>
            Preview <Eye className="w-3 h-3 ml-1.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ onUpload }) {
  return (
    <Card className="rounded-[64px] border-dashed border-2 border-muted-foreground/10 bg-muted/5 py-24">
      <CardContent className="flex flex-col items-center justify-center text-center p-8">
        <div className="w-32 h-32 rounded-full bg-primary/5 flex items-center justify-center mb-8 relative">
          <FolderOpen className="w-16 h-16 text-primary/20" />
          <div className="absolute inset-0 border-2 border-primary/20 rounded-full animate-ping opacity-20" />
        </div>
        <h2 className="text-3xl font-black mb-4 tracking-tight">No Clinical Records Found</h2>
        <p className="text-muted-foreground max-w-sm mb-10 leading-relaxed font-medium">
          Start building your digital health history by uploading your first lab report or prescription.
        </p>
        <Button onClick={onUpload} className="rounded-full bg-primary hover:bg-accent h-16 px-12 text-lg font-black shadow-2xl shadow-primary/30 transition-all active:scale-95 gap-3">
          <Upload className="w-5 h-5" /> Upload Now
        </Button>
      </CardContent>
    </Card>
  );
}

function UploadDialog({ isOpen, onClose, onSuccess }) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('other');
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
      toast.success('Record uploaded successfully');
      onSuccess();
      onClose();
      setTitle('');
      setFile(null);
    } catch (err) {
      toast.error('Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-[48px] border-none shadow-2xl p-10 overflow-hidden bg-background">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-primary" />
        <DialogHeader>
          <DialogTitle className="text-3xl font-black tracking-tight mb-2">Upload Record</DialogTitle>
          <p className="text-sm text-muted-foreground">Select a file and provide clinical details</p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-8">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-60">Title</Label>
            <Input 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. June MRI Results" 
              className="rounded-2xl border-none bg-muted/50 h-14 font-medium px-6 focus-visible:ring-primary/20"
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-60">Category</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="rounded-2xl border-none bg-muted/50 h-14 px-6 font-medium">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-none shadow-xl">
                {RECORD_TYPES.map(t => (
                  <SelectItem key={t.value} value={t.value} className="rounded-xl my-1">{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-60">File Attachment</Label>
            {!file ? (
              <div className="border-2 border-dashed border-muted-foreground/10 rounded-3xl p-10 transition-all hover:bg-muted/30 group bg-muted/5">
                <input type="file" id="file-upload" className="hidden" onChange={(e) => setFile(e.target.files[0])} accept=".pdf,.jpg,.jpeg,.png" />
                <label htmlFor="file-upload" className="flex flex-col items-center justify-center cursor-pointer gap-3">
                  <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="w-7 h-7 text-primary" />
                  </div>
                  <span className="text-sm font-bold opacity-80">Click to browse documents</span>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">PDF, JPG, PNG up to 10MB</span>
                </label>
              </div>
            ) : (
              <div className="flex items-center justify-between p-5 bg-primary/5 rounded-3xl border border-primary/10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black truncate max-w-[180px]">{file.name}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => setFile(null)} className="rounded-full h-10 w-10 p-0 hover:bg-destructive/10 hover:text-destructive">
                  <X className="w-5 h-5" />
                </Button>
              </div>
            )}
          </div>
          <div className="flex gap-4 pt-6">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1 rounded-2xl h-14 font-bold text-muted-foreground">Cancel</Button>
            <Button type="submit" disabled={loading} className="flex-1 rounded-2xl h-14 bg-primary hover:bg-accent font-black shadow-lg shadow-primary/20">
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Confirm Upload'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditDialog({ isOpen, record, onClose, onSuccess }) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (record) {
      setTitle(record.title);
      setType(record.recordType);
    }
  }, [record]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await recordsAPI.update(record._id, { title, recordType: type });
      toast.success('Record updated');
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
      <DialogContent className="sm:max-w-md rounded-[48px] border-none p-10 bg-background">
        <DialogHeader>
          <DialogTitle className="text-3xl font-black mb-2">Edit Record</DialogTitle>
          <p className="text-sm text-muted-foreground">Update document metadata</p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-8">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-60">Title</Label>
            <Input 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-2xl border-none bg-muted/50 h-14 px-6 font-medium"
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-60">Category</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="rounded-2xl border-none bg-muted/50 h-14 px-6 font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-none shadow-xl">
                {RECORD_TYPES.map(t => (
                  <SelectItem key={t.value} value={t.value} className="rounded-xl my-1">{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-4 pt-6">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1 rounded-2xl h-14 font-bold text-muted-foreground">Cancel</Button>
            <Button type="submit" disabled={loading} className="flex-1 rounded-2xl h-14 bg-primary hover:bg-accent font-black shadow-lg">
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PreviewDialog({ isOpen, record, onClose }) {
  if (!record) return null;
  const isImage = record.mimeType?.startsWith('image/') || record.fileName?.match(/\.(jpg|jpeg|png)$/i);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-8 rounded-[48px] bg-background border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-black truncate pr-8 flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary" />
            {record.title}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 bg-muted/10 border-2 border-dashed border-muted/30 rounded-3xl overflow-hidden mt-6 relative flex items-center justify-center">
          {isImage ? (
            <img src={record.fileUrl} alt={record.title} className="max-w-full max-h-full object-contain p-4" />
          ) : (
            <iframe src={record.fileUrl} className="w-full h-full border-none bg-white rounded-2xl" title={record.title} />
          )}
        </div>
        <div className="flex justify-end gap-4 mt-8">
          <Button variant="ghost" onClick={onClose} className="rounded-2xl h-14 px-8 font-bold text-muted-foreground">Close</Button>
          <Button onClick={() => window.open(record.fileUrl || '#', '_blank')} className="rounded-2xl h-14 px-8 bg-primary hover:bg-accent font-black gap-2 shadow-xl shadow-primary/20">
            <Download className="w-5 h-5" /> Download Original
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
