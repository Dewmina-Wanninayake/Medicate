import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Pill, Calendar, Clock, Download, Scan, Trash2, Camera, X, FileText, Loader2, Eye } from 'lucide-react';
import { prescriptionsAPI, recordsAPI } from '../services/api';
import { toast } from 'sonner';

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [scannedPrescriptions, setScannedPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [scanFile, setScanFile] = useState(null);
  const [scanPreview, setScanPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewRecord, setPreviewRecord] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [presData, recordsData] = await Promise.all([
        prescriptionsAPI.list(),
        recordsAPI.list()
      ]);
      setPrescriptions(presData);
      setScannedPrescriptions(recordsData.filter(r => r.recordType === 'prescription'));
    } catch (err) {
      toast.error('Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleImageScan = (e) => {
    const file = e.target.files[0];
    if (file) {
      setScanFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setScanPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUploadScan = async () => {
    if (!scanFile) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', scanFile);
      formData.append('title', `Scanned Prescription - ${new Date().toLocaleDateString()}`);
      formData.append('recordType', 'prescription');
      
      await recordsAPI.upload(formData);
      toast.success('Prescription scanned and uploaded successfully');
      setScanModalOpen(false);
      setScanFile(null);
      setScanPreview(null);
      fetchData();
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteScanned = async (id) => {
    if (!confirm('Delete this scanned prescription?')) return;
    try {
      await recordsAPI.delete(id);
      setScannedPrescriptions(prev => prev.filter(p => p._id !== id));
      toast.success('Deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleDeletePrescription = async (id) => {
    if (!confirm('Delete this digital prescription?')) return;
    try {
      await prescriptionsAPI.delete(id);
      setPrescriptions(prev => prev.filter(p => p._id !== id));
      toast.success('Deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="space-y-8 p-1 animate-in fade-in duration-700">
      <Card className="rounded-[48px] border-none shadow-lg bg-card/80 backdrop-blur-lg">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-3xl bg-primary/10 flex items-center justify-center">
                <Pill className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">My Prescriptions</h1>
                <p className="text-muted-foreground mt-1 text-sm">
                  Manage digital prescriptions and scanned copies
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => setScanModalOpen(true)} className="rounded-full bg-primary hover:bg-accent h-12 px-8 shadow-xl shadow-primary/20 gap-2 font-bold">
                <Scan className="w-4 h-4" /> Scan Paper Prescription
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Render Digital Prescriptions */}
          {prescriptions.map((p) => (
            <Card key={p._id} className="rounded-[32px] border-none shadow-lg overflow-hidden bg-gradient-to-br from-card to-muted/10">
              <CardHeader className="bg-muted/30 border-b border-border/50 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Pill className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold">Digital Prescription</CardTitle>
                      <p className="text-xs text-muted-foreground font-bold tracking-wider uppercase mt-1">
                        {new Date(p.issuedAt || p.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3 mb-6">
                  {p.medications?.map((m, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-muted/20 border border-border/50">
                      <h4 className="font-bold text-base">{m.name} <span className="text-muted-foreground font-normal text-sm">({m.dosage})</span></h4>
                      <p className="text-sm font-medium mt-2 flex flex-wrap gap-4">
                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-primary" /> {m.frequency}</span>
                        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-primary" /> {m.duration}</span>
                      </p>
                    </div>
                  ))}
                  {p.diagnosis && (
                    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 text-sm">
                      <span className="font-bold text-primary">Diagnosis:</span> {p.diagnosis}
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-border/50">
                  <Badge variant="secondary" className="rounded-full px-3 py-1 text-[10px] font-black uppercase">Digital</Badge>
                  <Button variant="ghost" size="icon" onClick={() => handleDeletePrescription(p._id)} className="rounded-full text-destructive hover:bg-destructive/10">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Render Scanned Prescriptions */}
          {scannedPrescriptions.map((r) => (
            <Card key={r._id} className="rounded-[32px] border-none shadow-lg overflow-hidden bg-gradient-to-br from-card to-muted/10 group">
              <CardContent className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileText className="w-7 h-7 text-accent" />
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteScanned(r._id)} className="rounded-full text-destructive hover:bg-destructive/10">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <h3 className="font-bold text-xl mb-2">{r.title}</h3>
                <div className="flex items-center gap-3 mb-8">
                  <Badge className="rounded-full bg-accent/20 text-accent hover:bg-accent/30 border-none px-3 py-1 text-[10px] font-black uppercase">
                    Scanned
                  </Badge>
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex gap-3 pt-6 border-t border-border/50">
                  <Button variant="ghost" size="icon" className="rounded-2xl h-12 w-12 bg-muted/30 hover:bg-accent/10 hover:text-accent" onClick={() => window.open(r.fileUrl || '#', '_blank')}>
                    <Download className="w-5 h-5" />
                  </Button>
                  <Button className="flex-1 rounded-2xl h-12 bg-accent hover:bg-accent/90 font-black gap-2 shadow-lg shadow-accent/20 text-white" onClick={() => { setPreviewRecord(r); setPreviewOpen(true); }}>
                    Preview Scan <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {!loading && prescriptions.length === 0 && scannedPrescriptions.length === 0 && (
            <div className="col-span-1 lg:col-span-2 text-center py-24 bg-muted/5 rounded-[48px] border-2 border-dashed border-muted-foreground/10">
              <Pill className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
              <h2 className="text-2xl font-black mb-2">No active prescriptions</h2>
              <p className="text-muted-foreground max-w-sm mx-auto font-medium">Digital prescriptions from your doctors or your scanned paper prescriptions will appear here.</p>
            </div>
          )}
        </div>
      )}

      {/* Scan Modal */}
      {scanModalOpen && (
        <Dialog open={scanModalOpen} onOpenChange={() => { setScanModalOpen(false); setScanPreview(null); setScanFile(null); }}>
          <DialogContent className="rounded-[48px] border-none shadow-2xl max-w-xl p-10 bg-background overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-accent" />
            <DialogHeader className="mb-6">
              <DialogTitle className="text-3xl font-black flex items-center gap-3">
                <Scan className="w-8 h-8 text-accent" /> Scan Prescription
              </DialogTitle>
            </DialogHeader>
            {!scanPreview ? (
              <div
                className="border-4 border-dashed border-muted-foreground/20 rounded-[32px] p-12 text-center hover:border-accent/50 hover:bg-accent/5 transition-all cursor-pointer"
                onClick={() => document.getElementById('scan-input').click()}
              >
                <input id="scan-input" type="file" accept="image/*,.pdf" onChange={handleImageScan} className="hidden" />
                <div className="w-24 h-24 mx-auto mb-6 rounded-[24px] bg-accent/10 flex items-center justify-center">
                  <Camera className="w-12 h-12 text-accent" />
                </div>
                <h3 className="text-2xl font-black mb-2">Tap to Scan or Upload</h3>
                <p className="text-muted-foreground font-medium">JPG, PNG, PDF up to 10MB</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="relative rounded-[32px] overflow-hidden shadow-lg border border-border bg-muted/10 p-4">
                  {scanFile?.type.includes('pdf') ? (
                    <div className="flex flex-col items-center py-10">
                      <FileText className="w-16 h-16 text-accent mb-4" />
                      <p className="font-bold">{scanFile.name}</p>
                    </div>
                  ) : (
                    <img src={scanPreview} alt="Preview" className="w-full max-h-[400px] object-contain rounded-2xl" />
                  )}
                </div>
                <div className="flex gap-4">
                  <Button variant="ghost" onClick={() => { setScanPreview(null); setScanFile(null); }} className="flex-1 rounded-2xl h-14 font-bold text-muted-foreground">Retake</Button>
                  <Button onClick={handleUploadScan} disabled={uploading} className="flex-1 rounded-2xl h-14 bg-accent hover:bg-accent/90 text-white font-black shadow-xl shadow-accent/20">
                    {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Save Prescription'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* Preview Modal for Scanned Prescriptions */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-8 rounded-[48px] bg-background border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black truncate pr-8 flex items-center gap-3">
              <FileText className="w-8 h-8 text-accent" />
              {previewRecord?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 bg-muted/10 border-2 border-dashed border-muted/30 rounded-3xl overflow-hidden mt-6 relative flex items-center justify-center">
            {previewRecord && (
              (previewRecord.mimeType?.startsWith('image/') || previewRecord.fileName?.match(/\.(jpg|jpeg|png)$/i)) ? (
                <img src={previewRecord.fileUrl} alt={previewRecord.title} className="max-w-full max-h-full object-contain p-4" />
              ) : (
                <iframe src={previewRecord.fileUrl} className="w-full h-full border-none bg-white rounded-2xl" title={previewRecord.title} />
              )
            )}
          </div>
          <div className="flex justify-end gap-4 mt-8">
            <Button variant="ghost" onClick={() => setPreviewOpen(false)} className="rounded-2xl h-14 px-8 font-bold text-muted-foreground">Close</Button>
            <Button onClick={() => window.open(previewRecord?.fileUrl || '#', '_blank')} className="rounded-2xl h-14 px-8 bg-accent hover:bg-accent/90 text-white font-black gap-2 shadow-xl shadow-accent/20">
              <Download className="w-5 h-5" /> Download Original
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
