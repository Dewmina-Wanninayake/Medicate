import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Pill, Search, Download, Calendar, User, AlertCircle, RefreshCw,
  ChevronDown, ChevronUp, Stethoscope, Clock, ClipboardList
} from 'lucide-react';
import { clinicalAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function MyPrescriptionsPage() {
  const { user } = useAuth();
  const patientId = user?._id || user?.id || '';

  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [search, setSearch]               = useState('');
  const [expanded, setExpanded]           = useState(null);

  // ── Fetch prescriptions ───────────────────────────────────────────
  const fetchPrescriptions = useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    setError('');
    try {
      const res = await clinicalAPI.getPatientPrescriptions(patientId);
      setPrescriptions(res.data.data || []);
    } catch (err) {
      console.error('Prescriptions fetch failed:', err);
      setError('Could not load prescriptions. Services may be offline.');
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => { fetchPrescriptions(); }, [fetchPrescriptions]);

  // ── Filtered prescriptions ────────────────────────────────────────
  const filtered = prescriptions.filter(p =>
    (p.diagnosis || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.doctorName || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.medications || []).some(m =>
      (m.name || '').toLowerCase().includes(search.toLowerCase())
    )
  );

  const activePrescriptions  = filtered.filter(p => !p.followUpDate || new Date(p.followUpDate) > new Date());
  const expiredPrescriptions = filtered.filter(p => p.followUpDate && new Date(p.followUpDate) <= new Date());

  // ── Print handler ─────────────────────────────────────────────────
  const handlePrint = (p) => {
    const content = `
      <html><body style="font-family: sans-serif; padding: 32px; max-width: 720px; margin: auto;">
        <h1 style="color: #333">Prescription</h1>
        <hr/>
        <p><b>Doctor:</b> Dr. ${p.doctorName}</p>
        <p><b>Date:</b> ${new Date(p.createdAt).toLocaleDateString()}</p>
        <p><b>Diagnosis:</b> ${p.diagnosis}</p>
        ${p.followUpDate ? `<p><b>Follow-up:</b> ${new Date(p.followUpDate).toLocaleDateString()}</p>` : ''}
        <h2 style="color:#555; margin-top: 24px;">Medications</h2>
        <table border="1" cellpadding="8" cellspacing="0" style="width:100%; border-collapse: collapse;">
          <thead style="background:#f0f0f0">
            <tr><th>Medication</th><th>Dosage</th><th>Frequency</th><th>Duration</th><th>Instructions</th></tr>
          </thead>
          <tbody>
            ${(p.medications || []).map(m => `
              <tr>
                <td>${m.name}</td><td>${m.dosage}</td><td>${m.frequency}</td>
                <td>${m.duration || '—'}</td><td>${m.instructions || '—'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        ${p.notes ? `<p style="margin-top:16px"><b>Notes:</b> ${p.notes}</p>` : ''}
      </body></html>
    `;
    const w = window.open('', '_blank');
    w.document.write(content);
    w.document.close();
    w.print();
  };

  const PrescriptionCard = ({ p }) => {
    const isExpanded = expanded === p._id;
    const isExpired  = p.followUpDate && new Date(p.followUpDate) <= new Date();

    return (
      <Card className="rounded-[32px] border-none shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
        {/* Header row */}
        <div
          className="flex flex-col sm:flex-row sm:items-center gap-4 p-6 sm:p-8 cursor-pointer"
          onClick={() => setExpanded(isExpanded ? null : p._id)}
        >
          {/* Icon */}
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${isExpired ? 'bg-gray-100 text-gray-400' : 'bg-primary/10 text-primary'}`}>
            <Pill className="w-7 h-7" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="text-lg font-black tracking-tight">{p.diagnosis}</h3>
              <Badge className={`rounded-full px-3 py-0.5 text-xs font-bold ${isExpired ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700'}`}>
                {isExpired ? 'Expired' : 'Active'}
              </Badge>
              <Badge variant="secondary" className="rounded-full px-3 py-0.5 text-xs">
                {(p.medications || []).length} medication{(p.medications || []).length !== 1 ? 's' : ''}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-primary" />
                Dr. {p.doctorName}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                {new Date(p.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
              {p.followUpDate && (
                <span className={`flex items-center gap-1.5 ${isExpired ? 'text-red-500' : ''}`}>
                  <Clock className="w-3.5 h-3.5" />
                  Follow-up: {new Date(p.followUpDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              )}
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="outline"
              className="rounded-full h-10 w-10 p-0 hover:bg-primary hover:text-white hover:border-primary transition-colors"
              onClick={e => { e.stopPropagation(); handlePrint(p); }}
              title="Print prescription"
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" className="rounded-full">
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Expanded medications table */}
        {isExpanded && (
          <div className="px-6 sm:px-8 pb-8 border-t border-border/40 pt-6 space-y-6">
            <h4 className="text-sm font-black uppercase tracking-widest text-primary/70 flex items-center gap-2">
              <ClipboardList className="w-4 h-4" /> Prescribed Medications
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50">
                    <th className="text-left pb-3 pr-4">Medication</th>
                    <th className="text-left pb-3 pr-4">Dosage</th>
                    <th className="text-left pb-3 pr-4">Frequency</th>
                    <th className="text-left pb-3 pr-4">Duration</th>
                    <th className="text-left pb-3">Instructions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {(p.medications || []).map((m, idx) => (
                    <tr key={idx} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 pr-4 font-bold">{m.name}</td>
                      <td className="py-3 pr-4">
                        <Badge variant="outline" className="rounded-full px-2 text-xs">{m.dosage}</Badge>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">{m.frequency}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{m.duration || '—'}</td>
                      <td className="py-3 text-muted-foreground">{m.instructions || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {p.notes && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-sm text-amber-800">
                <span className="font-bold">Doctor's Notes: </span>{p.notes}
              </div>
            )}
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black tracking-tight text-primary">My Prescriptions</h1>
        <p className="text-muted-foreground mt-2">
          View all prescriptions issued by your doctors. Print or download them as needed.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', value: prescriptions.length, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Active', value: prescriptions.filter(p => !p.followUpDate || new Date(p.followUpDate) > new Date()).length, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Expired', value: prescriptions.filter(p => p.followUpDate && new Date(p.followUpDate) <= new Date()).length, color: 'text-gray-500', bg: 'bg-gray-50' },
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
          <Button variant="ghost" size="sm" className="ml-auto" onClick={fetchPrescriptions}>
            <RefreshCw className="w-4 h-4 mr-1" /> Retry
          </Button>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by diagnosis, doctor, or medication…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-11 h-12 rounded-full bg-card border-none shadow-sm"
        />
      </div>

      {/* Prescriptions */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your prescriptions…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-28 text-center border-4 border-dashed border-border/40 rounded-[48px] bg-muted/10">
          <Pill className="w-16 h-16 mx-auto mb-4 text-muted-foreground/20" />
          <h3 className="text-xl font-bold text-muted-foreground/50 mb-2">
            {search ? 'No prescriptions match your search' : 'No prescriptions yet'}
          </h3>
          <p className="text-sm text-muted-foreground">
            Prescriptions from your doctors will appear here after your consultations.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {activePrescriptions.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-black uppercase tracking-widest text-green-600 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                Active Prescriptions
              </h2>
              {activePrescriptions.map(p => <PrescriptionCard key={p._id} p={p} />)}
            </div>
          )}
          {expiredPrescriptions.length > 0 && (
            <div className="space-y-4 opacity-70">
              <h2 className="text-lg font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />
                Past Prescriptions
              </h2>
              {expiredPrescriptions.map(p => <PrescriptionCard key={p._id} p={p} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
