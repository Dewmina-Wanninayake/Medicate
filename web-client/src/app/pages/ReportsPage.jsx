import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import {
  FileText, Upload, Search, Filter, Download, CheckCircle,
  Clock, AlertCircle, RefreshCw, Plus, X, Image, Trash2, File
} from 'lucide-react';
import { clinicalAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CATEGORY_COLORS = {
  lab:          'bg-blue-100 text-blue-700',
  radiology:    'bg-purple-100 text-purple-700',
  prescription: 'bg-green-100 text-green-700',
  report:       'bg-orange-100 text-orange-700',
  other:        'bg-gray-100 text-gray-700',
};

export default function ReportsPage() {
  const { user } = useAuth();
  const isDoctor  = user?.role === 'doctor';
  const patientId = user?._id || user?.id || '';

  const [records, setRecords]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [search, setSearch]         = useState('');
  const [category, setCategory]     = useState('all');
  const [showUpload, setShowUpload] = useState(false);
  const [deleting, setDeleting]     = useState(null);

  // Upload form
  const [uploadFile, setUploadFile]   = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDesc, setUploadDesc]   = useState('');
  const [uploadCat, setUploadCat]     = useState('report');
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
      setError('Could not load records. The clinical service may be offline.');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  // ── Upload ────────────────────────────────────────────────────────
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile || !uploadTitle.trim()) {
      setUploadErr('Please enter a title and choose a file.');
      return;
    }
    setUploading(true);
    setUploadErr('');
    try {
      const form = new FormData();
      form.append('file', uploadFile);
      form.append('title', uploadTitle.trim());
      form.append('description', uploadDesc.trim());
      form.append('category', uploadCat);
      form.append('patientId', patientId);
      await clinicalAPI.uploadRecord(form);
      setShowUpload(false);
      setUploadFile(null);
      setUploadTitle('');
      setUploadDesc('');
      fetchRecords();
    } catch (err) {
      setUploadErr(err?.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record permanently?')) return;
    setDeleting(id);
    try {
      await clinicalAPI.deleteRecord(id);
      setRecords(prev => prev.filter(r => r._id !== id));
    } catch {
      alert('Could not delete this record. You can only delete records you uploaded.');
    } finally {
      setDeleting(null);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) setUploadFile(file);
  };

  // ── Filter ────────────────────────────────────────────────────────
  const CATEGORIES = ['all', 'lab', 'radiology', 'prescription', 'report', 'other'];

  const filtered = records.filter(r => {
    const matchSearch = (r.title || '').toLowerCase().includes(search.toLowerCase()) ||
                        (r.description || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'all' || r.category === category;
    return matchSearch && matchCat;
  });

  const reviewed = records.filter(r => r.uploaderRole === 'doctor').length;
  const pending  = records.filter(r => r.uploaderRole !== 'doctor').length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-primary">Medical Reports</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            {isDoctor
              ? 'Patient-uploaded clinical records and lab results.'
              : 'Access and upload your clinical records and lab results.'}
          </p>
        </div>
        {!isDoctor && (
          <Button
            className="rounded-full bg-primary hover:bg-accent h-14 px-8 font-bold shadow-lg shadow-primary/20 gap-3 group"
            onClick={() => { setShowUpload(true); setUploadErr(''); }}
          >
            <Upload className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
            Upload New Report
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Records', value: records.length, color: 'text-primary', bg: 'bg-primary/10', Icon: FileText },
          { label: 'Doctor Uploaded', value: reviewed, color: 'text-green-600', bg: 'bg-green-50', Icon: CheckCircle },
          { label: 'Self Uploaded', value: pending, color: 'text-yellow-600', bg: 'bg-yellow-50', Icon: Clock },
        ].map(s => (
          <Card key={s.label} className="rounded-[32px] border-none shadow-md">
            <CardContent className={`p-6 flex items-center gap-6 ${s.bg} rounded-[32px]`}>
              <div className={`w-16 h-16 rounded-3xl ${s.bg} flex items-center justify-center`}>
                <s.Icon className={`w-8 h-8 ${s.color}`} />
              </div>
              <div>
                <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
                <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{s.label}</div>
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

      {/* Search + Category filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search by title or description…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-12 h-16 rounded-full bg-white border-none shadow-sm text-lg"
          />
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-4 py-2 h-10 rounded-full text-sm font-semibold transition-all border-2 capitalize ${
                category === c
                  ? 'bg-primary text-white border-primary shadow'
                  : 'border-border text-muted-foreground hover:border-primary/40'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Records */}
      <div className="grid gap-4">
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading records…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-32 text-center bg-muted/10 rounded-[48px] border-4 border-dashed border-border/50">
            <Upload className="w-20 h-20 mx-auto mb-6 text-muted-foreground/20" />
            <h3 className="text-2xl font-bold text-muted-foreground/50 mb-3">
              {search || category !== 'all' ? 'No records match your search.' : 'No records uploaded yet.'}
            </h3>
            {!isDoctor && !search && category === 'all' && (
              <Button
                className="rounded-full bg-primary hover:bg-accent px-8 gap-2 mt-2"
                onClick={() => { setShowUpload(true); setUploadErr(''); }}
              >
                <Plus className="w-4 h-4" /> Upload Your First Record
              </Button>
            )}
          </div>
        ) : (
          filtered.map(record => (
            <Card key={record._id} className="rounded-[40px] border-none shadow-lg hover:shadow-2xl transition-all duration-300 group overflow-hidden bg-white">
              <div className="p-1.5 flex flex-col md:flex-row md:items-center gap-6">
                <div className="p-6 md:p-8 flex-1 flex items-center gap-8">
                  {/* Icon */}
                  <div className="w-20 h-20 rounded-[30px] bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 shrink-0">
                    {record.fileType === 'image'
                      ? <Image className="w-10 h-10" />
                      : <FileText className="w-10 h-10" />
                    }
                  </div>

                  {/* Info */}
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="text-2xl font-black tracking-tight truncate">{record.title}</h3>
                      <Badge className={`rounded-full px-3 py-0.5 text-xs font-bold capitalize ${CATEGORY_COLORS[record.category] || CATEGORY_COLORS.other}`}>
                        {record.category}
                      </Badge>
                      <Badge variant="outline" className="rounded-full text-[10px] px-2 uppercase font-bold">
                        {record.fileType}
                      </Badge>
                    </div>
                    {record.description && (
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-1">{record.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-muted-foreground">
                      <span className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        {record.uploaderRole === 'doctor' ? `Uploaded by Doctor` : 'Self-uploaded'}
                      </span>
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {new Date(record.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-8 pb-8 md:pb-0 md:border-l border-border/50 flex flex-row md:flex-col items-center justify-center gap-3 min-w-[180px]">
                  <Badge className={`rounded-xl px-4 py-1.5 text-xs font-black w-full text-center border ${
                    record.uploaderRole === 'doctor'
                      ? 'bg-green-500/10 text-green-600 border-green-500/20'
                      : 'bg-yellow-400/10 text-yellow-700 border-yellow-400/20'
                  }`}>
                    {record.uploaderRole === 'doctor' ? 'From Doctor' : 'Uploaded by You'}
                  </Badge>
                  <div className="flex gap-2 w-full">
                    <a href={record.fileUrl} target="_blank" rel="noreferrer" className="flex-1">
                      <Button variant="ghost" size="icon" className="w-full h-12 rounded-2xl bg-muted/30 hover:bg-muted transition-colors">
                        <Download className="w-5 h-5" />
                      </Button>
                    </a>
                    {record.uploadedBy === patientId && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-12 w-12 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-colors"
                        disabled={deleting === record._id}
                        onClick={() => handleDelete(record._id)}
                      >
                        {deleting === record._id
                          ? <RefreshCw className="w-4 h-4 animate-spin" />
                          : <Trash2 className="w-4 h-4" />
                        }
                      </Button>
                    )}
                    <a href={record.fileUrl} target="_blank" rel="noreferrer" className="flex-[2]">
                      <Button className="w-full h-12 rounded-2xl bg-primary hover:bg-accent font-bold gap-2">
                        View
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowUpload(false)}>
          <div className="bg-card rounded-[40px] shadow-2xl max-w-lg w-full p-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black">Upload Medical Report</h2>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setShowUpload(false)}>
                <X />
              </Button>
            </div>
            <form onSubmit={handleUpload} className="space-y-5">
              <div>
                <label className="text-sm font-bold mb-1.5 block">Title *</label>
                <Input value={uploadTitle} onChange={e => setUploadTitle(e.target.value)} placeholder="e.g. Blood Test – April 2025" className="rounded-2xl" required />
              </div>
              <div>
                <label className="text-sm font-bold mb-1.5 block">Category</label>
                <select
                  value={uploadCat}
                  onChange={e => setUploadCat(e.target.value)}
                  className="w-full h-10 px-4 rounded-2xl border border-input bg-background text-sm"
                >
                  {['lab','radiology','prescription','report','other'].map(c => (
                    <option key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase()+c.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-bold mb-1.5 block">Description (optional)</label>
                <textarea value={uploadDesc} onChange={e => setUploadDesc(e.target.value)} placeholder="Brief notes…" className="w-full min-h-[70px] px-4 py-3 rounded-2xl border border-input bg-background text-sm resize-none" />
              </div>
              <div
                className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={e => setUploadFile(e.target.files?.[0] || null)} />
                {uploadFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <File className="w-8 h-8 text-primary" />
                    <div className="text-left">
                      <div className="font-bold text-sm">{uploadFile.name}</div>
                      <div className="text-xs text-muted-foreground">{(uploadFile.size/1024).toFixed(1)} KB</div>
                    </div>
                    <button type="button" className="ml-2 text-muted-foreground hover:text-red-500" onClick={e => { e.stopPropagation(); setUploadFile(null); }}>
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
                <Button type="button" variant="outline" className="flex-1 rounded-full" onClick={() => setShowUpload(false)}>Cancel</Button>
                <Button type="submit" className="flex-1 rounded-full bg-primary hover:bg-accent font-bold" disabled={uploading}>
                  {uploading ? <><RefreshCw className="w-4 h-4 animate-spin mr-2" />Uploading…</> : <><Upload className="w-4 h-4 mr-2" />Upload</>}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
