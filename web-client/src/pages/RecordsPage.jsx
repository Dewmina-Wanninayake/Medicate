import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { FileText, Upload, Trash2, Download, AlertCircle, X, FileUp, FolderOpen, ExternalLink } from 'lucide-react';

const RECORD_TYPES = [
  { label: 'Lab Report', value: 'lab_report' },
  { label: 'Imaging (X-Ray/MRI)', value: 'imaging' },
  { label: 'Prescription', value: 'prescription' },
  { label: 'Consultation Note', value: 'consultation_note' },
  { label: 'Uploaded Document', value: 'uploaded_document' },
  { label: 'Other', value: 'other' }
];

const SAMPLE_RECORDS = [
  {
    _id: '1',
    title: 'Blood Test Results',
    recordType: 'lab_report',
    createdAt: '2026-03-15T10:00:00Z',
    fileName: 'blood_test_march.pdf',
  },
  {
    _id: '2',
    title: 'Chest X-Ray',
    recordType: 'imaging',
    createdAt: '2026-02-10T14:30:00Z',
    fileName: 'chest_xray.jpg',
  },
  {
    _id: '3',
    title: 'Annual Physical',
    recordType: 'consultation_note',
    createdAt: '2026-01-20T11:15:00Z',
    fileName: 'consultation_summary.pdf',
  }
];

const RecordCard = ({ record, onDelete, onDownload }) => (
  <Card className="rounded-[32px] border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 bg-gradient-to-br from-card to-muted/20">
    <CardContent className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          <FileText className="w-6 h-6 text-primary" />
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={() => onDownload(record.fileUrl, record.fileName)}>
            <Download className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 text-destructive" onClick={() => onDelete(record._id)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <h3 className="font-bold text-lg mb-1 truncate" title={record.title}>{record.title}</h3>
      <div className="flex items-center gap-2 mb-4">
        <Badge variant="secondary" className="rounded-full text-[10px] uppercase tracking-wider px-2">
          {record.recordType.replace('_', ' ')}
        </Badge>
        <span className="text-xs text-muted-foreground">{new Date(record.createdAt).toLocaleDateString()}</span>
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-border/50">
        <span className="text-xs text-muted-foreground truncate max-w-full italic">{record.fileName}</span>
      </div>
    </CardContent>
  </Card>
);

const EmptyState = ({ onUpload }) => (
  <Card className="rounded-[48px] border-dashed border-2 border-muted-foreground/20 bg-muted/5 py-20">
    <CardContent className="flex flex-col items-center justify-center text-center p-8">
      <div className="w-24 h-24 rounded-full bg-primary/5 flex items-center justify-center mb-6">
        <FolderOpen className="w-12 h-12 text-primary/40" />
      </div>
      <h2 className="text-2xl font-bold mb-2">No records found</h2>
      <p className="text-muted-foreground max-w-sm mb-8">
        You haven't uploaded any medical records yet. Keep all your health documents in one secure place.
      </p>
      <Button onClick={onUpload} className="rounded-full bg-primary hover:bg-accent h-12 px-8 shadow-lg">
        <Upload className="w-4 h-4 mr-2" />
        Upload Your First Record
      </Button>
    </CardContent>
  </Card>
);

const UploadDialog = ({ isOpen, onClose, onUpload }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Other');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !file) return;
    
    setLoading(true);
    // Mock upload delay
    setTimeout(() => {
      onUpload({
        title,
        recordType: type,
        fileName: file.name,
        fileUrl: URL.createObjectURL(file),
        createdAt: new Date().toISOString()
      });
      setLoading(false);
      onClose();
      setTitle('');
      setFile(null);
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-[32px] border-none shadow-2xl p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Upload Medical Record</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Document Title</Label>
            <Input 
              id="title" 
              placeholder="e.g. June Blood Test" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-xl border-border/50 h-12"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Document Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="rounded-xl border-border/50 h-12">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {RECORD_TYPES.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>File Upload</Label>
            {!file ? (
              <div className="border-2 border-dashed border-muted-foreground/20 rounded-2xl p-8 transition-all hover:bg-muted/30 group">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files[0])}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <label htmlFor="file-upload" className="flex flex-col items-center justify-center cursor-pointer gap-2">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-sm font-medium">Click to upload or drag and drop</span>
                  <span className="text-xs text-muted-foreground">PDF, JPG, PNG (max 10MB)</span>
                </label>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setFile(null)}
                  className="rounded-full h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-xl h-12">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 rounded-xl h-12 bg-primary hover:bg-accent" disabled={loading}>
              {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Upload Record'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default function RecordsPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState(() => {
    const saved = sessionStorage.getItem('medicalRecords');
    return saved ? JSON.parse(saved) : SAMPLE_RECORDS;
  });
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    sessionStorage.setItem('medicalRecords', JSON.stringify(records));
  }, [records]);

  const handleDelete = (recordId) => {
    if (confirm('Are you sure you want to delete this record?')) {
      setRecords(prev => prev.filter(r => r._id !== recordId));
      setSuccess('Record deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleDownload = (fileUrl, fileName) => {
    if (fileUrl === '#') {
      alert('This is a sample record. In a real app, this would download the file.');
      return;
    }
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName || 'record';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 p-1">
      <Card className="rounded-[48px] border-none shadow-lg bg-card/80 backdrop-blur-lg">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                Medical Records
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage your health documents and test results
              </p>
            </div>
            <div className="flex gap-3">
              <Link to="/reports">
                <Button variant="outline" className="rounded-full h-12 px-6 gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Reports
                </Button>
              </Link>
              <Button onClick={() => setIsUploadOpen(true)} className="rounded-full bg-primary hover:bg-accent h-12 px-8 shadow-lg shadow-primary/20">
                <Upload className="w-4 h-4 mr-2" />
                Upload Record
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-2xl text-green-600 text-sm">
          {success}
        </div>
      )}

      {records.length === 0 ? (
        <EmptyState onUpload={() => setIsUploadOpen(true)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {records.map((record) => (
            <RecordCard
              key={record._id}
              record={record}
              onDelete={handleDelete}
              onDownload={handleDownload}
            />
          ))}
        </div>
      )}

      <UploadDialog
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={(newRecord) => {
          const record = { ...newRecord, _id: `id-${Date.now()}` };
          setRecords(prev => [record, ...prev]);
          setSuccess('Record uploaded successfully');
          setTimeout(() => setSuccess(''), 3000);
        }}
      />
    </div>
  );
}
