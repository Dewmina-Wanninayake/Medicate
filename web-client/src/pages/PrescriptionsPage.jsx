import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Pill, Calendar, Clock, Download, Plus, CheckCircle2, AlertCircle, Trash2, Camera, Scan, X, ImageIcon, FileImage } from 'lucide-react';

const SAMPLE_PRESCRIPTIONS = [
  {
    _id: '1',
    issuedAt: '2026-03-15T09:00:00Z',
    medications: [
      { name: 'Amoxicillin', dosage: '500mg', frequency: '3 times daily', duration: '7 days' },
      { name: 'Ibuprofen', dosage: '400mg', frequency: 'Every 6 hours as needed', duration: '5 days' }
    ],
  },
  {
    _id: '2',
    issuedAt: '2026-01-10T15:30:00Z',
    medications: [
      { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', duration: '30 days' }
    ],
  }
];

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState(SAMPLE_PRESCRIPTIONS);
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [scanPreview, setScanPreview] = useState(null);

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this prescription?')) {
      setPrescriptions(prev => prev.filter(p => p._id !== id));
    }
  };

  const handleImageScan = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScanPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8 p-1">
      <Card className="rounded-[48px] border-none shadow-lg bg-card/80 backdrop-blur-lg">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Pill className="w-6 h-6 text-primary" />
                </div>
                My Prescriptions
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage and track your active medications
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => setScanModalOpen(true)} variant="outline" className="rounded-full h-12 px-6 gap-2">
                <Scan className="w-4 h-4" />
                Scan Paper Prescription
              </Button>
              <Button className="rounded-full bg-primary hover:bg-accent h-12 px-8 shadow-lg">
                <Plus className="w-4 h-4 mr-2" />
                Add Manually
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {prescriptions.map((p) => (
          <Card key={p._id} className="rounded-[32px] border-none shadow-lg overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/50 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Pill className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Prescription #{p._id.slice(-4)}</CardTitle>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {new Date(p.issuedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {p.medications.map((m, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-muted/20 border border-border/50">
                    <div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center shrink-0 mt-1">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold">{m.name} ({m.dosage})</h4>
                      <p className="text-sm text-muted-foreground flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {m.frequency}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {m.duration}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-6 pt-6 border-t border-border/50">
                <Button variant="ghost" className="rounded-full text-primary gap-2">
                  <Download className="w-4 h-4" /> Download PDF
                </Button>
                <div className="flex-1" />
                <Button variant="ghost" size="icon" onClick={() => handleDelete(p._id)} className="rounded-full text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {scanModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="rounded-[32px] border-none shadow-2xl max-w-2xl w-full bg-gradient-to-br from-card to-muted/50 overflow-hidden">
            <CardHeader className="border-b border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
                    <Scan className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Scan Prescription</CardTitle>
                    <p className="text-muted-foreground text-sm">Upload paper prescription image</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => { setScanModalOpen(false); setScanPreview(null); }} className="rounded-full">
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              {!scanPreview ? (
                <div 
                  className="border-3 border-dashed border-border/60 rounded-3xl p-12 text-center hover:border-accent/50 hover:bg-accent/5 transition-all cursor-pointer"
                  onClick={() => document.getElementById('scan-input').click()}
                >
                  <input id="scan-input" type="file" accept="image/*" onChange={handleImageScan} className="hidden" />
                  <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <Camera className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Tap to Scan</h3>
                  <p className="text-muted-foreground">JPG, PNG, WebP (max 5MB)</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="relative rounded-2xl overflow-hidden shadow-lg border border-border">
                    <img src={scanPreview} alt="Preview" className="w-full max-h-[400px] object-contain bg-muted" />
                  </div>
                  <div className="flex gap-3 justify-end">
                    <Button variant="outline" onClick={() => setScanPreview(null)} className="rounded-full">Retake</Button>
                    <Button onClick={() => { 
                      const p = { _id: `p-${Date.now()}`, issuedAt: new Date().toISOString(), medications: [{ name: 'Scanned Meds', dosage: 'N/A', frequency: 'See image', duration: 'N/A' }] };
                      setPrescriptions([p, ...prescriptions]);
                      setScanModalOpen(false);
                      setScanPreview(null);
                    }} className="rounded-full bg-accent hover:bg-accent/90">Save Prescription</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
