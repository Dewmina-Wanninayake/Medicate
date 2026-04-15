import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import {
  Calendar, Video, Clock, Shield, FileText, Pill, Activity,
  AlertCircle, RefreshCw, Plus, ChevronRight, Stethoscope, TrendingUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { appointmentAPI, clinicalAPI } from '../services/api';
import AdminTools from '../components/admin/AdminTools';
import BookingModal from '../components/BookingModal';

const STATUS_MAP = {
  Live:      { cls: 'bg-red-500 text-white animate-pulse' },
  Scheduled: { cls: 'bg-blue-500 text-white' },
  Completed: { cls: 'bg-green-500 text-white' },
  Pending:   { cls: 'bg-yellow-500 text-white' },
  Cancelled: { cls: 'bg-gray-400 text-white' },
};

export default function PatientDashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const patientId = user?._id || user?.id || '';

  const [activeMainTab, setActiveMainTab] = useState('health');

  // Data
  const [appointments, setAppointments]   = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [records, setRecords]             = useState([]);
  const [doctors, setDoctors]             = useState([]);
  const [loading, setLoading]             = useState(true);

  // AI
  const [symptomText, setSymptomText]     = useState('');
  const [aiResults, setAiResults]         = useState(null);
  const [isAiLoading, setIsAiLoading]     = useState(false);

  // Booking
  const [showBooking, setShowBooking]     = useState(false);
  const [bookingDoctor, setBookingDoctor] = useState(null);

  // ── Data fetching ─────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [aptsRes, doctors] = await Promise.allSettled([
        appointmentAPI.list({}),
        clinicalAPI.listDoctors({ verified: true }),
      ]);

      if (aptsRes.status === 'fulfilled') {
        const all = aptsRes.value.data.appointments || aptsRes.value.data.data || [];
        const mine = all.filter(a =>
          !a.patientId || a.patientId === patientId
        );
        setAppointments(mine);
      }

      if (doctors.status === 'fulfilled') {
        setDoctors(doctors.value.data.data || []);
      }

      // Clinical data
      if (patientId) {
        const [presRes, recRes] = await Promise.allSettled([
          clinicalAPI.getPatientPrescriptions(patientId),
          clinicalAPI.getPatientRecords(patientId),
        ]);
        if (presRes.status === 'fulfilled') setPrescriptions(presRes.value.data.data || []);
        if (recRes.status === 'fulfilled')  setRecords(recRes.value.data.data || []);
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── AI Symptom Checker ────────────────────────────────────────────
  const handleSymptomCheck = async () => {
    if (!symptomText.trim()) return;
    setIsAiLoading(true);
    setAiResults(null);
    try {
      const res = await clinicalAPI.aiSymptomCheck({
        symptoms: symptomText,
        age:    user?.age || undefined,
        gender: user?.gender || undefined,
      });
      setAiResults(res.data.data);
    } catch (err) {
      setAiResults({ rawResponse: `Based on your symptoms, we recommend consulting a general practitioner. (AI service: ${err?.response?.status === 401 ? 'authentication required' : 'currently offline'})` });
    } finally {
      setIsAiLoading(false);
    }
  };

  // ── Filtered view ─────────────────────────────────────────────────
  const upcoming  = appointments.filter(a => ['Scheduled','Pending','Live'].includes(a.status));
  const liveApts  = appointments.filter(a => a.status === 'Live');

  const quickStatsData = [
    { label: 'Upcoming', value: upcoming.length, color: 'text-blue-600', bg: 'bg-blue-50', icon: Calendar, href: '/dashboard/appointments' },
    { label: 'Prescriptions', value: prescriptions.length, color: 'text-green-600', bg: 'bg-green-50', icon: Pill, href: '/dashboard/prescriptions' },
    { label: 'Records', value: records.length, color: 'text-purple-600', bg: 'bg-purple-50', icon: FileText, href: '/dashboard/records' },
    { label: 'Completed', value: appointments.filter(a => a.status === 'Completed').length, color: 'text-primary', bg: 'bg-primary/10', icon: Activity, href: '/dashboard/appointments' },
  ];

  // ── AI result renderer ────────────────────────────────────────────
  const renderAiResults = () => {
    if (!aiResults) return null;
    if (aiResults.rawResponse) {
      return <p className="text-sm text-muted-foreground">{aiResults.rawResponse}</p>;
    }
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold">Urgency:</span>
          <Badge className={`rounded-full ${
            aiResults.urgencyLevel === 'high' ? 'bg-red-500 text-white' :
            aiResults.urgencyLevel === 'medium' ? 'bg-yellow-500 text-white' : 'bg-green-500 text-white'
          }`}>
            {aiResults.urgencyLevel?.toUpperCase()}
          </Badge>
          <span className="text-sm text-muted-foreground">— {aiResults.urgencyReason}</span>
        </div>
        {aiResults.possibleConditions?.length > 0 && (
          <div>
            <span className="text-sm font-bold block mb-2">Possible Conditions:</span>
            <div className="flex flex-wrap gap-2">
              {aiResults.possibleConditions.map((c, i) => (
                <Badge key={i} variant="outline" className="rounded-full px-3">{c}</Badge>
              ))}
            </div>
          </div>
        )}
        {aiResults.recommendedSpecialty && (
          <div className="flex items-center gap-2 text-sm">
            <Stethoscope className="w-4 h-4 text-primary" />
            <span className="font-bold">Recommended Specialist:</span>
            <span className="text-primary font-semibold">{aiResults.recommendedSpecialty}</span>
          </div>
        )}
        {aiResults.generalAdvice && (
          <div className="p-3 bg-blue-50 rounded-2xl text-sm text-blue-800 border border-blue-200">
            <span className="font-bold">Advice: </span>{aiResults.generalAdvice}
          </div>
        )}
        <p className="text-[11px] text-muted-foreground italic">
          ⚠️ This is not a medical diagnosis. Always consult a qualified doctor.
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Admin tab switcher */}
      {isAdmin && (
        <div className="flex gap-4 border-b border-border pb-2">
          <button
            onClick={() => setActiveMainTab('health')}
            className={`pb-2 px-1 text-sm font-bold transition-all ${activeMainTab === 'health' ? 'border-b-4 border-primary text-primary' : 'text-muted-foreground'}`}
          >
            Patient Overview
          </button>
          <button
            onClick={() => setActiveMainTab('admin')}
            className={`pb-2 px-1 text-sm font-bold transition-all ${activeMainTab === 'admin' ? 'border-b-4 border-primary text-primary' : 'text-muted-foreground'}`}
          >
            Admin Management
          </button>
        </div>
      )}

      {activeMainTab === 'admin' && isAdmin ? (
        <AdminTools />
      ) : (
        <>
          {/* LIVE banner */}
          {liveApts.length > 0 && (
            <div className="flex items-center justify-between p-5 bg-red-500 text-white rounded-3xl shadow-lg shadow-red-200 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-white rounded-full animate-ping" />
                <div>
                  <div className="font-black text-lg">Live Consultation in Progress!</div>
                  <div className="text-sm text-red-100">Dr. {liveApts[0].doctorName} is waiting for you</div>
                </div>
              </div>
              <Link to={`/telemedicine/${liveApts[0]._id || liveApts[0].id}`}>
                <Button className="rounded-full bg-white text-red-500 hover:bg-red-50 font-bold gap-2 shadow-lg">
                  <Video className="w-4 h-4" /> Join Now
                </Button>
              </Link>
            </div>
          )}

          {/* Welcome + AI Section */}
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Welcome card */}
              <Card className="rounded-[32px] border-none shadow-lg bg-gradient-to-br from-primary/10 to-accent/10">
                <CardContent className="p-8">
                  <h2 className="text-3xl font-bold mb-1">
                    Welcome back, {user?.name?.split(' ')[0] || 'Patient'}! 👋
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Here's your health overview for today.
                  </p>

                  {/* AI Symptom Checker */}
                  <div className="bg-card/60 backdrop-blur-sm p-6 rounded-[24px] shadow-sm">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-primary" />
                      AI Symptom Checker
                    </h3>
                    <div className="flex gap-3">
                      <Input
                        placeholder="Describe your symptoms (e.g. headache and fever)..."
                        value={symptomText}
                        onChange={e => setSymptomText(e.target.value)}
                        className="rounded-3xl bg-white border-primary/20"
                        onKeyDown={e => e.key === 'Enter' && handleSymptomCheck()}
                      />
                      <Button
                        className="rounded-3xl px-6 bg-primary hover:bg-accent shrink-0"
                        onClick={handleSymptomCheck}
                        disabled={isAiLoading || !symptomText.trim()}
                      >
                        {isAiLoading ? (
                          <><RefreshCw className="w-4 h-4 animate-spin mr-2" />Analyzing...</>
                        ) : 'Analyze'}
                      </Button>
                    </div>
                    {aiResults && (
                      <div className="mt-4 p-4 bg-muted/80 rounded-3xl border border-primary/20">
                        {renderAiResults()}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Appointments */}
              <Card className="rounded-[32px] border-none shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between">
                    <span>Upcoming Appointments</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="rounded-full">{upcoming.length}</Badge>
                      <Link to="/dashboard/appointments">
                        <Button size="sm" variant="ghost" className="rounded-full text-xs gap-1">
                          View All <ChevronRight className="w-3 h-3" />
                        </Button>
                      </Link>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="py-8 text-center text-muted-foreground">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                      Loading...
                    </div>
                  ) : upcoming.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p className="mb-4">You have no upcoming appointments.</p>
                      <Button
                        className="rounded-3xl bg-primary hover:bg-accent gap-2"
                        onClick={() => setShowBooking(true)}
                      >
                        <Plus className="w-4 h-4" /> Book an Appointment
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3 pt-2">
                      {upcoming.slice(0, 3).map(apt => (
                        <div
                          key={apt._id || apt.id}
                          className="flex items-center gap-4 p-4 rounded-3xl bg-muted/30 hover:bg-muted/50 transition-colors border border-border/50"
                        >
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary text-lg">
                            {(apt.doctorName || 'D').charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold">Dr. {apt.doctorName || 'Assigned Doctor'}</h4>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {apt.date ? new Date(apt.date).toLocaleDateString() : '—'} {apt.time || ''}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={`rounded-full ${(STATUS_MAP[apt.status] || STATUS_MAP.Pending).cls}`}>
                              {apt.status}
                            </Badge>
                            {apt.status === 'Live' && (
                              <Link to={`/telemedicine/${apt._id || apt.id}`}>
                                <Button size="sm" className="rounded-full bg-red-500 hover:bg-red-600 gap-1.5 text-white">
                                  <Video className="w-4 h-4" /> Join
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      ))}
                      {upcoming.length > 3 && (
                        <Link to="/dashboard/appointments">
                          <button className="w-full text-center text-sm text-primary font-semibold py-2 hover:underline">
                            +{upcoming.length - 3} more appointments →
                          </button>
                        </Link>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3">
                {quickStatsData.map(stat => (
                  <Link key={stat.label} to={stat.href}>
                    <Card className={`rounded-[24px] border-none shadow-md hover:shadow-lg transition-all cursor-pointer ${stat.bg} group`}>
                      <CardContent className="p-4 text-center">
                        <div className={`w-10 h-10 mx-auto rounded-full ${stat.bg} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                          <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                        <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
                        <div className="text-xs font-bold text-muted-foreground">{stat.label}</div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              {/* Quick Actions */}
              <Card className="rounded-[32px] border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="text-base">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    className="w-full rounded-3xl justify-start gap-3 bg-primary hover:bg-accent text-white py-6"
                    onClick={() => setShowBooking(true)}
                  >
                    <Calendar className="w-5 h-5" />
                    Book New Appointment
                  </Button>
                  <Link to="/dashboard/telemedicine" className="block">
                    <Button variant="outline" className="w-full rounded-3xl justify-start gap-3 py-6">
                      <Video className="w-5 h-5 text-primary" />
                      Join Waiting Room
                    </Button>
                  </Link>
                  <Link to="/dashboard/records" className="block">
                    <Button variant="outline" className="w-full rounded-3xl justify-start gap-3 py-5">
                      <FileText className="w-5 h-5 text-blue-500" />
                      My Medical Records
                    </Button>
                  </Link>
                  <Link to="/dashboard/prescriptions" className="block">
                    <Button variant="outline" className="w-full rounded-3xl justify-start gap-3 py-5">
                      <Pill className="w-5 h-5 text-green-500" />
                      My Prescriptions
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Recent Prescriptions */}
              {prescriptions.length > 0 && (
                <Card className="rounded-[32px] border-none shadow-lg">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Pill className="w-4 h-4 text-green-500" /> Recent Prescriptions
                      </span>
                      <Link to="/dashboard/prescriptions">
                        <Button size="sm" variant="ghost" className="rounded-full text-xs">View all</Button>
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {prescriptions.slice(0, 2).map(p => (
                      <div key={p._id} className="p-3 rounded-2xl bg-green-50 border border-green-100">
                        <div className="font-semibold text-sm text-green-800 truncate">{p.diagnosis}</div>
                        <div className="text-xs text-green-600 mt-0.5">
                          Dr. {p.doctorName} · {(p.medications || []).length} med(s)
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* BookingModal for doctor selection */}
          {showBooking && !bookingDoctor && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowBooking(false)}>
              <div className="bg-card rounded-[40px] shadow-2xl max-w-lg w-full max-h-[75vh] overflow-y-auto p-8" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-black mb-5">Choose a Doctor</h2>
                {doctors.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No doctors available at the moment.</div>
                ) : (
                  <div className="space-y-3">
                    {doctors.map(doc => (
                      <button
                        key={doc._id}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
                        onClick={() => setBookingDoctor({
                          id: doc._id,
                          name: doc.name || 'Doctor',
                          specialty: doc.specialization || 'General Practice',
                          rating: doc.rating || 4.5,
                          reviewCount: doc.reviewCount || 0,
                          experience: doc.experience || 0,
                          imageUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name || 'D')}&background=6366f1&color=fff&size=80`,
                          consultationFee: doc.consultationFee || 50,
                        })}
                      >
                        <img
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name || 'D')}&background=6366f1&color=fff&size=80`}
                          alt={doc.name}
                          className="w-12 h-12 rounded-xl"
                        />
                        <div>
                          <div className="font-bold">Dr. {doc.name}</div>
                          <div className="text-sm text-muted-foreground">{doc.specialization || 'General Practice'}</div>
                        </div>
                        <Badge variant="secondary" className="rounded-full ml-auto">${doc.consultationFee || 50}</Badge>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <BookingModal
            open={showBooking && !!bookingDoctor}
            onClose={() => { setShowBooking(false); setBookingDoctor(null); fetchAll(); }}
            doctor={bookingDoctor}
          />
        </>
      )}
    </div>
  );
}
