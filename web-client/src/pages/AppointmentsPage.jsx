import { useState, useEffect } from 'react';
import { appointmentsAPI, doctorsAPI, paymentsAPI } from '../services/api';
import {
  Activity, Plus, Search, Clock, Video, MapPin, MoreVertical,
  Calendar as CalendarIcon, Check, X, User, CreditCard,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Link } from 'react-router-dom';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogTrigger, DialogFooter, DialogDescription,
} from '../components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../components/ui/select';
import { Calendar } from '../components/ui/calendar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { useAuth } from '../context/AuthContext';
import StripePaymentModal from '../components/StripePaymentModal';

// Default consultation fee per appointment (in cents)
const CONSULTATION_FEE_CENTS = 10000; // $100.00

export default function AppointmentsPage() {
  const { user } = useAuth();
  const isDoctor = user?.role === 'doctor';

  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [doctorAvailability, setDoctorAvailability] = useState([]);

  // Booking dialog
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState('form'); // 'form' | 'paying'
  const [newBooking, setNewBooking] = useState({
    doctorId: '',
    appointmentDate: new Date(),
    startTime: '09:00',
    specialization: '',
    reasonForVisit: '',
    consultationType: 'video',
  });

  // Stripe payment state
  const [paymentClientSecret, setPaymentClientSecret] = useState('');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [currentPaymentData, setCurrentPaymentData] = useState(null);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);

  // Details dialog
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const data = await appointmentsAPI.list({});
      const sorted = [...data].sort((a, b) => {
        if (a.status === 'cancelled' && b.status !== 'cancelled') return 1;
        if (a.status !== 'cancelled' && b.status === 'cancelled') return -1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      setAppointments(sorted);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const data = await doctorsAPI.listPublic();
      setDoctors(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDoctorAvailability = async (doctorId) => {
    if (!doctorId) return;
    try {
      const data = await appointmentsAPI.getDoctorAvailability(doctorId);
      setDoctorAvailability(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAppointments();
    if (!isDoctor) fetchDoctors();
  }, [isDoctor]);

  // ── Booking + Payment flow ─────────────────────────────────────────────────

  const handleBook = async () => {
    if (!newBooking.doctorId || !newBooking.appointmentDate || !newBooking.startTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsCreatingPayment(true);

    try {
      // Step 1: Create the appointment
      const appointment = await appointmentsAPI.book({
        ...newBooking,
        appointmentDate: newBooking.appointmentDate.toISOString(),
        patientEmail: user?.email || '',
        patientPhone: user?.phone || '',
      });

      const selectedDoctor = doctors.find(d => d._id === newBooking.doctorId);
      const doctorName = selectedDoctor?.name || '';

      // Step 2: Create Stripe payment intent
      const intentData = await paymentsAPI.createIntent({
        appointmentId: appointment._id,
        doctorId: newBooking.doctorId,
        amount: CONSULTATION_FEE_CENTS,
        currency: 'usd',
        description: `Consultation with Dr. ${doctorName.replace(/^(dr\.?\s*)+/gi, '')} – ${new Date(newBooking.appointmentDate).toLocaleDateString()}`,
        patientEmail: user?.email || '',
        patientPhone: user?.phone || '',
        doctorName,
        appointmentDate: newBooking.appointmentDate.toISOString(),
        startTime: newBooking.startTime,
      });

      // Step 3: Close booking dialog, open payment modal
      setBookingDialogOpen(false);
      setPaymentClientSecret(intentData.clientSecret);
      setCurrentPaymentData({
        paymentId: intentData.paymentId,
        amount: intentData.amount,
        currency: intentData.currency,
        doctorName: doctorName.replace(/^(dr\.?\s*)+/gi, ''),
        appointmentDate: newBooking.appointmentDate,
        patientEmail: user?.email || '',
      });
      setPaymentModalOpen(true);

    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to create booking';
      toast.error(msg);
    } finally {
      setIsCreatingPayment(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntent) => {
    setPaymentModalOpen(false);
    toast.success('Payment confirmed! Your appointment is booked.', { duration: 5000 });

    // Sync payment status on our backend (belt-and-suspenders, webhook may already have done it)
    try {
      if (currentPaymentData?.paymentId) {
        await paymentsAPI.confirm(currentPaymentData.paymentId);
      }
    } catch (_) { /* non-critical */ }

    fetchAppointments();
    // Reset booking form
    setNewBooking({
      doctorId: '', appointmentDate: new Date(), startTime: '09:00',
      specialization: '', reasonForVisit: '', consultationType: 'video',
    });
    setPaymentClientSecret('');
    setCurrentPaymentData(null);
  };

  const handlePaymentModalClose = (open) => {
    if (!open) {
      setPaymentModalOpen(false);
      // Payment was abandoned — refresh so the pending appointment shows
      fetchAppointments();
      toast.info('Booking saved. Complete payment from the Payments tab.', { duration: 5000 });
    }
  };

  // ── Other handlers ─────────────────────────────────────────────────────────

  const handleStatusUpdate = async (id, status) => {
    try {
      await appointmentsAPI.updateStatus(id, status);
      toast.success(`Appointment ${status}`);
      fetchAppointments();
    } catch (err) {
      toast.error(`Failed to ${status} appointment`);
    }
  };

  const handleCancel = async (id) => {
    try {
      await appointmentsAPI.cancel(id, 'User cancelled');
      toast.success('Appointment cancelled');
      fetchAppointments();
    } catch (err) {
      toast.error('Failed to cancel appointment');
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const filteredAppointments = appointments.filter(a => {
    const q = searchTerm.toLowerCase();
    return (a.specialization || '').toLowerCase().includes(q) ||
      (a.status || '').toLowerCase().includes(q);
  });

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8 p-1 max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tight text-primary">
            {isDoctor ? 'Clinic Schedule' : 'My Appointments'}
          </h1>
          <p className="text-muted-foreground mt-2 text-xl font-medium">
            {isDoctor
              ? 'Manage your patient consultations and daily clinical slots.'
              : 'View and manage your upcoming medical consultations.'}
          </p>
        </div>

        {!isDoctor && (
          <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full bg-primary hover:bg-accent h-16 px-10 text-xl font-bold shadow-xl shadow-primary/20 gap-3">
                <Plus className="w-6 h-6" /> Book Session
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[1000px] rounded-[48px] p-0 overflow-hidden border-none shadow-2xl">
              <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
                <div className="flex-1 p-12 space-y-10 overflow-y-auto bg-white">
                  <DialogHeader className="space-y-4">
                    <DialogTitle className="text-4xl font-black text-primary tracking-tight">
                      New Appointment
                    </DialogTitle>
                    <DialogDescription className="text-xl font-medium text-muted-foreground/80">
                      Reserve your expert medical consultation.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-8">
                    {/* Doctor select */}
                    <div className="space-y-3">
                      <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Specialist</label>
                      <Select onValueChange={(val) => {
                        const doc = doctors.find(d => d._id === val);
                        setNewBooking({ ...newBooking, doctorId: val, specialization: doc?.specialization || '' });
                        fetchDoctorAvailability(val);
                      }}>
                        <SelectTrigger className="h-16 rounded-2xl border-muted/20 bg-muted/5 text-lg font-bold">
                          <SelectValue placeholder="Choose a doctor…" />
                        </SelectTrigger>
                        <SelectContent className="rounded-3xl border-none shadow-2xl p-2">
                          {doctors.map(d => (
                            <SelectItem key={d._id} value={d._id} className="h-14 text-lg rounded-2xl">
                              Dr. {d.name.replace(/^(dr\.?\s*)+/gi, '')} — <span className="text-primary font-bold">{d.specialization}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Date + Mode */}
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Date</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full h-16 rounded-2xl border-muted/20 bg-muted/5 justify-start text-left font-bold text-lg">
                              <CalendarIcon className="mr-3 h-6 w-6 text-primary" />
                              {newBooking.appointmentDate
                                ? newBooking.appointmentDate.toLocaleDateString()
                                : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 rounded-[32px] shadow-2xl border-none" align="start">
                            <Calendar
                              mode="single"
                              selected={newBooking.appointmentDate}
                              onSelect={(date) => setNewBooking({ ...newBooking, appointmentDate: date })}
                              className="p-6"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Mode</label>
                        <Select onValueChange={(val) => setNewBooking({ ...newBooking, consultationType: val })} defaultValue="video">
                          <SelectTrigger className="h-16 rounded-2xl border-muted/20 bg-muted/5 text-lg font-bold">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-[2rem] border-none shadow-2xl p-2">
                            <SelectItem value="video" className="rounded-xl h-12">Video Call</SelectItem>
                            <SelectItem value="in_person" className="rounded-xl h-12">Clinic Visit</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Time */}
                    <div className="space-y-3">
                      <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Time Slot</label>
                      <Input
                        type="time"
                        className="h-16 rounded-2xl border-muted/20 bg-muted/5 text-lg font-bold"
                        value={newBooking.startTime}
                        onChange={(e) => setNewBooking({ ...newBooking, startTime: e.target.value })}
                      />
                    </div>

                    {/* Reason */}
                    <div className="space-y-3">
                      <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Reason</label>
                      <Input
                        placeholder="e.g., Annual checkup"
                        className="h-16 rounded-2xl border-muted/20 bg-muted/5 text-lg font-medium"
                        value={newBooking.reasonForVisit}
                        onChange={(e) => setNewBooking({ ...newBooking, reasonForVisit: e.target.value })}
                      />
                    </div>

                    {/* Fee notice */}
                    <div className="flex items-center gap-4 p-5 rounded-3xl bg-primary/5 border border-primary/10">
                      <CreditCard className="w-6 h-6 text-primary shrink-0" />
                      <div>
                        <div className="font-black text-primary">Consultation Fee: $100.00</div>
                        <div className="text-xs text-muted-foreground font-medium mt-0.5">
                          Secure Stripe payment required to confirm your appointment.
                        </div>
                      </div>
                    </div>
                  </div>

                  <DialogFooter className="flex gap-6 pt-4">
                    <Button variant="ghost" onClick={() => setBookingDialogOpen(false)} className="rounded-full h-16 flex-1 font-black text-lg">
                      Cancel
                    </Button>
                    <Button
                      onClick={handleBook}
                      disabled={isCreatingPayment}
                      className="rounded-full bg-primary h-16 flex-1 font-black text-xl shadow-2xl gap-3"
                    >
                      {isCreatingPayment ? (
                        <><span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> Processing…</>
                      ) : (
                        <><CreditCard className="w-5 h-5" /> Book & Pay</>
                      )}
                    </Button>
                  </DialogFooter>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Appointments table */}
      <Card className="rounded-[48px] border-none shadow-2xl overflow-hidden bg-white">
        <CardContent className="p-0">
          <div className="p-10 border-b border-border/50 flex flex-col md:flex-row gap-6 bg-muted/20">
            <div className="relative flex-1">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
              <Input
                placeholder="Search appointments…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-16 h-16 rounded-full border-none bg-white shadow-lg text-xl"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/10 text-left text-sm font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                  <th className="py-8 px-10">{isDoctor ? 'Patient' : 'Specialist'}</th>
                  <th className="py-8 px-10">Schedule</th>
                  <th className="py-8 px-10">Mode</th>
                  <th className="py-8 px-10">Status</th>
                  <th className="py-8 px-10 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {loading ? (
                  <tr><td colSpan="5" className="py-24 text-center font-bold text-muted-foreground">Loading…</td></tr>
                ) : filteredAppointments.length === 0 ? (
                  <tr><td colSpan="5" className="py-24 text-center font-bold text-muted-foreground">No appointments found.</td></tr>
                ) : (
                  filteredAppointments.map((a) => (
                    <tr key={a._id} className="hover:bg-primary/[0.02] transition-all group">
                      <td className="py-8 px-10">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            {isDoctor ? <User className="w-7 h-7" /> : <Activity className="w-7 h-7" />}
                          </div>
                          <div>
                            <div className="font-black text-xl text-primary">
                              {isDoctor
                                ? 'Patient Record'
                                : `Dr. ${(doctors.find(d => d._id === a.doctorId)?.name || 'Specialist').replace(/^(dr\.?\s*)+/gi, '')}`}
                            </div>
                            <div className="text-xs text-muted-foreground font-black uppercase tracking-widest mt-1">
                              {a.specialization || 'Consultation'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-8 px-10">
                        <div className="space-y-1">
                          <div className="font-black text-lg flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5 text-primary/60" />
                            {new Date(a.appointmentDate).toLocaleDateString()}
                          </div>
                          <div className="text-base text-muted-foreground font-bold flex items-center gap-2">
                            <Clock className="w-5 h-5 opacity-40" /> {a.startTime}
                          </div>
                        </div>
                      </td>
                      <td className="py-8 px-10">
                        <Badge variant="outline" className="rounded-full px-5 py-2 gap-3 font-black uppercase tracking-widest text-[10px] border-primary/20 bg-primary/5 text-primary">
                          {a.consultationType === 'video' ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                          {a.consultationType?.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="py-8 px-10">
                        <div className={`inline-flex items-center px-5 py-2 rounded-full border font-black uppercase tracking-widest text-[10px] ${getStatusColor(a.status)}`}>
                          {a.status}
                        </div>
                      </td>
                      <td className="py-8 px-10 text-right">
                        <div className="flex items-center justify-end gap-3">
                          {isDoctor && a.status === 'pending' && (
                            <>
                              <Button size="icon" className="rounded-full bg-green-500 hover:bg-green-600" onClick={() => handleStatusUpdate(a._id, 'confirmed')}>
                                <Check className="w-5 h-5" />
                              </Button>
                              <Button size="icon" variant="destructive" className="rounded-full" onClick={() => handleStatusUpdate(a._id, 'cancelled')}>
                                <X className="w-5 h-5" />
                              </Button>
                            </>
                          )}
                          {a.status === 'confirmed' && (
                            <Link to={`/telemedicine?id=${a._id}`}>
                              <Button className="rounded-full bg-primary h-10 px-6 font-bold shadow-lg shadow-primary/20">Join</Button>
                            </Link>
                          )}
                          {isDoctor && a.status === 'confirmed' && (
                            <Button variant="outline" className="rounded-full h-10 px-6 font-bold" onClick={() => handleStatusUpdate(a._id, 'completed')}>
                              Complete
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="rounded-full"><MoreVertical className="w-5 h-5" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-2xl border-none shadow-xl p-2 min-w-[200px]">
                              <DropdownMenuItem className="rounded-xl h-12 text-lg font-bold cursor-pointer" onClick={() => { setSelectedAppointment(a); setDetailsDialogOpen(true); }}>
                                Details
                              </DropdownMenuItem>
                              {!isDoctor && (a.status === 'pending' || a.status === 'confirmed') && (
                                <DropdownMenuItem className="rounded-xl h-12 text-lg font-bold text-red-500 cursor-pointer" onClick={() => handleCancel(a._id)}>
                                  Cancel
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Details dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[48px] p-10 border-none shadow-2xl">
          <DialogTitle className="text-3xl font-black text-primary">Session Brief</DialogTitle>
          {selectedAppointment && (
            <div className="space-y-6 py-6">
              <div className="bg-muted/20 p-6 rounded-3xl space-y-4">
                <div className="flex justify-between text-sm uppercase tracking-widest font-black text-muted-foreground">
                  <span>Status</span><span className="text-primary">{selectedAppointment.status}</span>
                </div>
                <div className="flex justify-between text-sm uppercase tracking-widest font-black text-muted-foreground">
                  <span>Mode</span><span className="text-primary">{selectedAppointment.consultationType}</span>
                </div>
                <div className="flex justify-between text-sm uppercase tracking-widest font-black text-muted-foreground">
                  <span>Time</span><span className="text-primary">{selectedAppointment.startTime}</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Reason for Visit</p>
                <p className="font-medium text-lg leading-relaxed italic">
                  "{selectedAppointment.reasonForVisit || 'No description provided'}"
                </p>
              </div>
            </div>
          )}
          <Button onClick={() => setDetailsDialogOpen(false)} className="rounded-full w-full h-14 text-xl font-black shadow-xl shadow-primary/20">Close</Button>
        </DialogContent>
      </Dialog>

      {/* Stripe Payment Modal */}
      {paymentModalOpen && currentPaymentData && (
        <StripePaymentModal
          open={paymentModalOpen}
          onClose={handlePaymentModalClose}
          clientSecret={paymentClientSecret}
          amount={currentPaymentData.amount}
          currency={currentPaymentData.currency}
          doctorName={currentPaymentData.doctorName}
          appointmentDate={currentPaymentData.appointmentDate}
          patientEmail={currentPaymentData.patientEmail}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
