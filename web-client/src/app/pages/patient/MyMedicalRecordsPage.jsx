import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  FileText, Upload, Search, Filter, Download, Trash2,
  AlertCircle, CheckCircle, Clock, RefreshCw, Plus, X, Image, File
} from 'lucide-react';
import { clinicalAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const CATEGORIES = ['all', 'lab', 'radiology', 'prescription', 'report', 'other'];

const CATEGORY_COLORS = {
  lab:          'bg-blue-100 text-blue-700',
  radiology:    'bg-purple-100 text-purple-700',
  prescription: 'bg-green-100 text-green-700',
  report:       'bg-orange-100 text-orange-700',
  other:        'bg-gray-100 text-gray-700',
};

export default function MyMedicalRecordsPage() {
  const { user } = useAuth();
  const patientId = user?._id || user?.id || '';

  const [records, setRecords]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [search, setSearch]         = useState('');
  const [category, setCategory]     = useState('all');
  const [showUpload, setShowUpload] = useState(false);
  const [deleting, setDeleting]     = useState(null);

  // Upload form state
  const [uploadFile, setUploadFile]   = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDesc, setUploadDesc]   = useState('');
  const [uploadCat, setUploadCat]     = useState('other');
  const [uploading, setUploading]     = useState(false);
  const [uploadErr, setUploadErr]     = useState('');
  const [dragOver, setDragOver]       = useState(false);
  const fileInputRef = useRef();

  // ── Fetch records ─────────────────────────────────────────────────
  const fetchRecords = useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    setError('');
    try {
      const res = await clinicalAPI.getPatientRecords(patientId);
      setRecords(res.data.data || []);
    } catch (err) {
      console.error('Records fetch failed:', err);
      setError('Could not load records. Please check your connection or try again.');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  // ── Upload handler ────────────────────────────────────────────────
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile || !uploadTitle.trim()) {
      setUploadErr('Please provide a title and select a file.');
      return;
    }
    setUploading(true);
    setUploadErr('');
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('title', uploadTitle.trim());
      formData.append('description', uploadDesc.trim());
      formData.append('category', uploadCat);
      formData.append('patientId', patientId);
      await clinicalAPI.uploadRecord(formData);
      setShowUpload(false);
      setUploadFile(null);
      setUploadTitle('');
      setUploadDesc('');
      setUploadCat('other');
      fetchRecords();
    } catch (err) {
      setUploadErr(err?.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // ── Delete handler ────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await clinicalAPI.deleteRecord(id);
      setRecords(prev => prev.filter(r => r._id !== id));
    } catch {
      alert('Failed to delete record. You can only delete records you uploaded.');
    } finally {
      setDeleting(null);
    }
  };

  // ── Drag-and-drop ─────────────────────────────────────────────────
  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) setUploadFile(file);
  };

  // ── Filtered records ──────────────────────────────────────────────
  const filtered = records.filter(r => {
    const matchSearch = (r.title || '').toLowerCase().includes(search.toLowerCase()) ||
                        (r.description || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'all' || r.category === category;
    return matchSearch && matchCat;
  });

  const fileIcon = (type) =>
    type === 'image' ? <Image className="w-8 h-8" /> : <FileText className="w-8 h-8" />;

  // ── Stats ─────────────────────────────────────────────────────────
  const stats = {
    total: records.length,
    lab:   records.filter(r => r.category === 'lab').length,
    radiology: records.filter(r => r.category === 'radiology').length,
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-primary">Medical Records</h1>
          <p className="text-muted-foreground mt-2">
            Your uploaded lab results, radiology scans, prescriptions and clinical reports.
          </p>
        </div>
        <Button
          className="rounded-full bg-primary hover:bg-accent h-13 px-7 font-bold shadow-lg shadow-primary/20 gap-2 group"
          onClick={() => { setShowUpload(true); setUploadErr(''); }}
        >
          <Upload className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
          Upload Record
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Records', value: stats.total, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Lab Results',   value: stats.lab,   color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Radiology',     value: stats.radiology, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map(s => (
          <Card key={s.label} className="rounded-[28px] border-none shadow-md">
            <CardContent className={`p-5 flex items-center gap-4 ${s.bg} rounded-[28px]`}>
              <div>
                <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-0.5">{s.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
          <Button variant="ghost" size="sm" className="ml-auto" onClick={fetchRecords}>
            <RefreshCw className="w-4 h-4 mr-1" /> Retry
          </Button>
        </div>
      )}

      {/* Search & Category filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search records by title or description…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-11 h-12 rounded-full bg-card border-none shadow-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border-2 capitalize ${
                category === c
                  ? 'bg-primary text-white border-primary'
                  : 'border-border text-muted-foreground hover:border-primary/40'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Records grid */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your records…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-28 text-center border-4 border-dashed border-border/40 rounded-[48px] bg-muted/10">
          <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground/20" />
          <h3 className="text-xl font-bold text-muted-foreground/50 mb-3">
            {search || category !== 'all' ? 'No records match your search' : 'No records uploaded yet'}
          </h3>
          <Button
            className="rounded-full bg-primary hover:bg-accent px-8 gap-2"
            onClick={() => { setShowUpload(true); setUploadErr(''); }}
          >
            <Plus className="w-4 h-4" /> Upload Your First Record
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map(record => (
            <Card key={record._id} className="rounded-[36px] border-none shadow-lg hover:shadow-2xl transition-all duration-300 group">
              <div className="flex flex-col md:flex-row md:items-center gap-6 p-6 md:p-8">
                {/* Icon */}
                <div className="w-16 h-16 rounded-[20px] bg-primary/8 flex items-center justify-center text-primary flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  {fileIcon(record.fileType)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-1">
                    <h3 className="text-xl font-black tracking-tight truncate">{record.title}</h3>
                    <Badge className={`rounded-full px-3 py-0.5 text-xs font-bold capitalize ${CATEGORY_COLORS[record.category] || CATEGORY_COLORS.other}`}>
                      {record.category}
                    </Badge>
                    <Badge variant={record.fileType === 'pdf' ? 'outline' : 'secondary'} className="rounded-full text-[10px] px-2 uppercase font-bold">
                      {record.fileType}
                    </Badge>
                  </div>
                  {record.description && (
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-1">{record.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      {new Date(record.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-xs">
                      {record.fileName}
                      {record.fileSize && ` • ${(record.fileSize / 1024).toFixed(1)} KB`}
                    </span>
                    {record.uploaderRole === 'doctor' && (
                      <Badge variant="outline" className="rounded-full px-2 py-0 text-[10px] border-green-400 text-green-600">
                        Uploaded by Doctor
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <a href={record.fileUrl} target="_blank" rel="noreferrer">
                    <Button size="sm" variant="outline" className="rounded-full h-10 w-10 p-0 hover:bg-primary hover:text-white transition-colors">
                      <Download className="w-4 h-4" />
                    </Button>
                  </a>
                  {record.uploadedBy === patientId && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full h-10 w-10 p-0 hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors"
                      disabled={deleting === record._id}
                      onClick={() => handleDelete(record._id)}
                    >
                      {deleting === record._id
                        ? <RefreshCw className="w-4 h-4 animate-spin" />
                        : <Trash2 className="w-4 h-4" />
                      }
                    </Button>
                  )}
                  <a href={record.fileUrl} target="_blank" rel="noreferrer">
                    <Button size="sm" className="rounded-full bg-primary hover:bg-accent px-6 font-bold">
                      View
                    </Button>
                  </a>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowUpload(false)}>
          <div className="bg-card rounded-[40px] shadow-2xl max-w-lg w-full p-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black">Upload Medical Record</h2>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setShowUpload(false)}>
                <X />
              </Button>
            </div>

            <form onSubmit={handleUpload} className="space-y-5">
              {/* Title */}
              <div>
                <label className="text-sm font-bold mb-1.5 block">Record Title *</label>
                <Input
                  placeholder="e.g. Blood Test – April 2025"
                  value={uploadTitle}
                  onChange={e => setUploadTitle(e.target.value)}
                  className="rounded-2xl"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-sm font-bold mb-1.5 block">Category</label>
                <select
                  value={uploadCat}
                  onChange={e => setUploadCat(e.target.value)}
                  className="w-full h-10 px-4 rounded-2xl border border-input bg-background text-sm"
                >
                  {CATEGORIES.filter(c => c !== 'all').map(c => (
                    <option key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-bold mb-1.5 block">Description (optional)</label>
                <textarea
                  value={uploadDesc}
                  onChange={e => setUploadDesc(e.target.value)}
                  placeholder="Brief notes about this record…"
                  className="w-full min-h-[80px] px-4 py-3 rounded-2xl border border-input bg-background text-sm resize-none"
                />
              </div>

              {/* File Drop Zone */}
              <div
                className={`relative border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
                  dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                }`}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={e => setUploadFile(e.target.files?.[0] || null)}
                />
                {uploadFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <File className="w-8 h-8 text-primary" />
                    <div className="text-left">
                      <div className="font-bold text-sm">{uploadFile.name}</div>
                      <div className="text-xs text-muted-foreground">{(uploadFile.size / 1024).toFixed(1)} KB</div>
                    </div>
                    <button
                      type="button"
                      className="ml-2 text-muted-foreground hover:text-red-500"
                      onClick={e => { e.stopPropagation(); setUploadFile(null); }}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                    <p className="font-semibold text-sm">Drop file here or click to browse</p>
                    <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG – up to 10MB</p>
                  </>
                )}
              </div>

              {uploadErr && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-xl">
                  <AlertCircle className="w-4 h-4" /> {uploadErr}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1 rounded-full" onClick={() => setShowUpload(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 rounded-full bg-primary hover:bg-accent font-bold" disabled={uploading}>
                  {uploading ? (
                    <><RefreshCw className="w-4 h-4 animate-spin mr-2" /> Uploading…</>
                  ) : (
                    <><Upload className="w-4 h-4 mr-2" /> Upload</>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
