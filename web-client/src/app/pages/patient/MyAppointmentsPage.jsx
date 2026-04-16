import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Calendar, Clock, Search, Plus, Video, X, ChevronRight,
  AlertCircle, CheckCircle2, RefreshCw, Star, User
} from 'lucide-react';
import { appointmentAPI, clinicalAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import BookingModal from '../../components/BookingModal';

const STATUS_MAP = {
  Live:      { cls: 'bg-red-500 text-white animate-pulse', label: 'Live Now' },
  Scheduled: { cls: 'bg-blue-500 text-white', label: 'Scheduled' },
  Completed: { cls: 'bg-green-500 text-white', label: 'Completed' },
  Pending:   { cls: 'bg-yellow-500 text-white', label: 'Pending' },
  Cancelled: { cls: 'bg-gray-400 text-white', label: 'Cancelled' },
};

export default function MyAppointmentsPage() {
  const { user } = useAuth();

  // Data state
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [cancelling, setCancelling]     = useState(null);
  const [error, setError]               = useState('');

  // UI state
  const [search, setSearch]             = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [bookingDoctor, setBookingDoctor] = useState(null);
  const [showBooking, setShowBooking]   = useState(false);

  // ── Fetch appointments ────────────────────────────────────────────
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await appointmentAPI.list({});
      const all = res.data.appointments || res.data.data || [];
      // Filter only this patient's appointments
      const mine = all.filter(a =>
        !a.patientId || a.patientId === user?._id || a.patientId === user?.id
      );
      setAppointments(mine);
    } catch (err) {
      console.error('Appointments fetch failed:', err);
      setError('Could not load appointments. Services may be offline.');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // ── Fetch doctors for booking ─────────────────────────────────────
  const fetchDoctors = useCallback(async () => {
    try {
      const res = await clinicalAPI.listDoctors({ verified: true });
      setDoctors(res.data.data || []);
    } catch {
      setDoctors([]);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
  }, [fetchAppointments, fetchDoctors]);

  // ── Cancel appointment ────────────────────────────────────────────
  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    setCancelling(id);
    try {
      await appointmentAPI.cancel(id);
      setAppointments(prev =>
        prev.map(a =>
          (a._id || a.id) === id ? { ...a, status: 'Cancelled' } : a
        )
      );
    } catch (err) {
      alert('Failed to cancel appointment. Please try again.');
    } finally {
      setCancelling(null);
    }
  };

  // ── Open booking with doctor ──────────────────────────────────────
  const openBooking = (doc) => {
    setBookingDoctor(doc);
    setShowBooking(true);
  };

  // ── Filtered list ─────────────────────────────────────────────────
  const filtered = appointments.filter(a => {
    const matchSearch =
      (a.doctorName || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.specialty  || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      filterStatus === 'all' || a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const upcoming  = appointments.filter(a => ['Scheduled','Pending','Live'].includes(a.status)).length;
  const completed = appointments.filter(a => a.status === 'Completed').length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-primary">My Appointments</h1>
          <p className="text-muted-foreground mt-2">
            Manage your upcoming, past and telemedicine consultations.
          </p>
        </div>
        <Button
          className="rounded-full bg-primary hover:bg-accent h-13 px-7 text-base font-bold shadow-lg shadow-primary/20 gap-2 group"
          onClick={() => setShowBooking(true)}
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          Book Appointment
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: appointments.length, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Upcoming', value: upcoming, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Completed', value: completed, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Cancelled', value: appointments.filter(a=>a.status==='Cancelled').length, color: 'text-gray-500', bg: 'bg-gray-50' },
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

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
          <Button variant="ghost" size="sm" className="ml-auto" onClick={fetchAppointments}>
            <RefreshCw className="w-4 h-4" /> Retry
          </Button>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by doctor name or specialty…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-11 h-12 rounded-full bg-card border-none shadow-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all','Scheduled','Pending','Live','Completed','Cancelled'].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border-2 ${
                filterStatus === s
                  ? 'bg-primary text-white border-primary'
                  : 'border-border text-muted-foreground hover:border-primary/40'
              }`}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Appointments List */}
      <Card className="rounded-[40px] border-none shadow-xl overflow-hidden">
        <CardHeader className="bg-muted/30 px-8 py-6">
          <CardTitle className="flex items-center justify-between">
            <span>{filterStatus === 'all' ? 'All Appointments' : `${filterStatus} Appointments`}</span>
            <Badge variant="secondary" className="rounded-full">
              {filtered.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-24 text-center">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading your appointments…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-24 text-center">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground/20" />
              <h3 className="text-xl font-bold text-muted-foreground/60 mb-2">No appointments found</h3>
              <p className="text-sm text-muted-foreground mb-6">
                {search || filterStatus !== 'all'
                  ? 'Try adjusting your search or filter.'
                  : "You haven't booked any appointments yet."}
              </p>
              <Button
                className="rounded-full bg-primary hover:bg-accent px-8 gap-2"
                onClick={() => setShowBooking(true)}
              >
                <Plus className="w-4 h-4" /> Book Your First Appointment
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {filtered.map(apt => {
                const id = apt._id || apt.id;
                const status = STATUS_MAP[apt.status] || STATUS_MAP.Pending;
                const canCancel = ['Scheduled', 'Pending'].includes(apt.status);
                return (
                  <div key={id} className="flex flex-col sm:flex-row sm:items-center gap-5 px-8 py-6 hover:bg-muted/10 transition-colors group">
                    {/* Doctor Avatar */}
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl shrink-0 group-hover:scale-105 transition-transform">
                      {(apt.doctorName || 'D').charAt(0)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-lg">Dr. {apt.doctorName || 'Assigned Doctor'}</div>
                      <div className="text-sm text-muted-foreground font-medium">{apt.specialty || 'General Practice'}</div>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-primary" />
                          {apt.date ? new Date(apt.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-primary" />
                          {apt.time || '—'}
                        </span>
                      </div>
                    </div>

                    {/* Status + Actions */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge className={`rounded-full px-4 py-1 text-xs font-bold ${status.cls}`}>
                        {status.label}
                      </Badge>

                      {apt.status === 'Live' && (
                        <Link to={`/telemedicine/${id}`}>
                          <Button size="sm" className="rounded-full bg-red-500 hover:bg-red-600 text-white gap-2 shadow-lg shadow-red-200 animate-pulse">
                            <Video className="w-4 h-4" /> Join Now
                          </Button>
                        </Link>
                      )}

                      {apt.status === 'Completed' && (
                        <Button size="sm" variant="outline" className="rounded-full gap-2 px-5">
                          <CheckCircle2 className="w-4 h-4 text-green-500" /> Details
                        </Button>
                      )}

                      {canCancel && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full text-red-500 border-red-200 hover:bg-red-50 gap-1.5"
                          disabled={cancelling === id}
                          onClick={() => handleCancel(id)}
                        >
                          <X className="w-3.5 h-3.5" />
                          {cancelling === id ? 'Cancelling…' : 'Cancel'}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Doctor Selection Sheet when no specific doctor picked */}
      {showBooking && !bookingDoctor && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowBooking(false)}>
          <div className="bg-card rounded-[40px] shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black">Choose a Doctor</h2>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setShowBooking(false)}>
                <X />
              </Button>
            </div>

            {doctors.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <User className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No doctors available at the moment. Please try again later.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {doctors.map(doc => (
                  <button
                    key={doc._id}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
                    onClick={() => openBooking({
                      id: doc._id,
                      name: doc.name || 'Doctor',
                      specialty: doc.specialization || 'General Practice',
                      rating: doc.rating || 4.5,
                      reviewCount: doc.reviewCount || 0,
                      experience: doc.experience || 0,
                      imageUrl: doc.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name || 'D')}&background=6366f1&color=fff&size=80`,
                      consultationFee: doc.consultationFee || 50,
                    })}
                  >
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name || 'D')}&background=6366f1&color=fff&size=80`}
                      alt={doc.name}
                      className="w-14 h-14 rounded-xl object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-base">Dr. {doc.name}</div>
                      <div className="text-sm text-muted-foreground">{doc.specialization || 'General Practice'}</div>
                      <div className="flex items-center gap-1 mt-1 text-sm">
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{doc.rating || '4.5'}</span>
                        <span className="text-muted-foreground">• {doc.experience || '5'}+ yrs exp</span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="rounded-full shrink-0">
                      ${doc.consultationFee || 50}
                    </Badge>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* BookingModal */}
      <BookingModal
        open={showBooking && !!bookingDoctor}
        onClose={() => { setShowBooking(false); setBookingDoctor(null); fetchAppointments(); }}
        doctor={bookingDoctor}
      />
    </div>
  );
}
