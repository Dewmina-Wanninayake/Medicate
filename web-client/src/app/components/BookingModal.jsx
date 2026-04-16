import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import {
  Calendar,
  CreditCard,
  CheckCircle2,
  Star,
  Loader2,
  DollarSign,
  Clock,
  Stethoscope,
} from 'lucide-react';
import { appointmentAPI, paymentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StripePaymentWrapper from './booking/StripePaymentWrapper';
import PaymentForm from './booking/PaymentForm';
import { toast } from 'sonner';

export default function BookingModal({ open, onClose, doctor }) {
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [appointmentId, setAppointmentId] = useState('');
  const [consultationFee, setConsultationFee] = useState(null); // stored in cents

  if (!doctor) return null;

  const availableTimes = [
    '09:00 AM', '10:00 AM', '11:00 AM',
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
  ];

  /**
   * Formats the fee for display.
   * The backend stores consultationFee in cents (e.g. 5000 = $50.00).
   * Falls back to the doctor card value if the booking hasn't been created yet.
   */
  const getDisplayFee = () => {
    // After booking: use the server-returned cents value
    if (consultationFee != null) {
      return (consultationFee / 100).toFixed(2);
    }
    // Before booking: use the doctor card value (assume dollars if <500, else cents)
    const raw = doctor.consultationFee;
    if (raw == null) return '50.00';
    const num = Number(raw);
    return num > 500 ? (num / 100).toFixed(2) : num.toFixed(2);
  };

  const displayFee = getDisplayFee();

  // ── Step 2 → 3: Book appointment then create Stripe intent ────────
  const handleNextToPayment = async () => {
    setLoading(true);
    try {
      // 1. Convert 12-hour AM/PM time → ISO start time
      const [hourMinute, ampm] = selectedTime.split(' ');
      let [hours, minutes] = hourMinute.split(':');
      if (ampm === 'PM' && hours !== '12') hours = String(parseInt(hours) + 12);
      if (ampm === 'AM' && hours === '12') hours = '00';
      const startTime = new Date(
        `${selectedDate}T${String(hours).padStart(2, '0')}:${minutes}:00`
      );

      // 2. Create a PENDING appointment in the appointment service.
      //    This endpoint no longer calls Stripe — it just persists the appointment.
      const bookRes = await appointmentAPI.book({
        doctorId: doctor.id || doctor._id,
        startTime,
        notes,
        appointmentType: 'telemedicine',
      });

      const apptId = bookRes.data.data._id;
      const amountCents = bookRes.data.consultationFee || 5000;

      setAppointmentId(apptId);
      setConsultationFee(amountCents);

      // 3. Create Stripe PaymentIntent via the transaction-notify-service.
      //    The frontend calls this directly with the user's own Bearer token,
      //    which carries the verified email — no service-to-service auth needed.
      const intentRes = await paymentAPI.createIntent({
        amount: amountCents,
        currency: 'usd',
        patientId: user._id || user.id,
        patientEmail: user.email,
        patientName: user.name || user.firstName || 'Patient',
        doctorId: doctor._id || doctor.id,
        appointmentId: apptId,
        description: `Consultation with Dr. ${doctor.name}`,
      });

      setClientSecret(intentRes.data.data.clientSecret);
      setStep(3);
    } catch (error) {
      const msg =
        error.response?.data?.errors?.[0]?.msg ||
        error.response?.data?.error ||
        'Failed to initiate booking. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── After Stripe confirms payment ──────────────────────────────────
  const handlePaymentSuccess = async () => {
    // Flip appointment status to 'scheduled'.
    // This is a reliable client-side fallback for dev/Docker where Stripe
    // webhooks can't reach localhost. The webhook will also fire in production.
    try {
      await appointmentAPI.updateStatus({
        appointmentId,
        status: 'scheduled',
      });
    } catch (err) {
      // Non-critical — the appointment will be confirmed via webhook in production
      console.warn('[BookingModal] Appointment status update failed (non-critical):', err.message);
    }
    setStep(4);
  };

  const resetAndClose = () => {
    onClose();
    setTimeout(() => {
      setStep(1);
      setSelectedDate('');
      setSelectedTime('');
      setNotes('');
      setClientSecret('');
      setAppointmentId('');
      setConsultationFee(null);
    }, 400);
  };

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="max-w-2xl rounded-[48px] p-0 gap-0 overflow-hidden">

        {/* ── Header ─────────────────────────────────────────────── */}
        <DialogHeader className="p-8 pb-6 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="flex items-start gap-4">
            <img
              src={doctor.imageUrl || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400'}
              alt={doctor.name}
              className="w-20 h-20 rounded-3xl object-cover shadow-lg flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-2xl mb-2">{doctor.name}</DialogTitle>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <Badge variant="secondary" className="rounded-full">
                  {doctor.specialty || doctor.specialization}
                </Badge>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{doctor.rating || '4.9'}</span>
                  <span className="text-muted-foreground">
                    ({doctor.reviewCount || '100+'} reviews)
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {doctor.experience || '10+'} years of experience
              </p>
            </div>
          </div>

          {/* Step progress */}
          <div className="flex items-center gap-2 mt-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`h-2 flex-1 rounded-full transition-all duration-500 ${
                    s <= step ? 'bg-primary' : 'bg-muted'
                  }`}
                />
                {s < 3 && <div className="w-2" />}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-2 px-1">
            <span className={step >= 1 ? 'text-primary' : ''}>Schedule</span>
            <span className={step >= 2 ? 'text-primary' : ''}>Review</span>
            <span className={step >= 3 ? 'text-primary' : ''}>Payment</span>
          </div>
        </DialogHeader>

        {/* ── Body ─────────────────────────────────────────────────── */}
        <div className="p-8 max-h-[60vh] overflow-y-auto">

          {/* ── Step 1: Date & Time ──────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Select Date &amp; Time
              </h3>

              <div>
                <label className="text-sm font-semibold mb-2 block">Date</label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="rounded-3xl"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="text-sm font-semibold mb-3 block">Available Times</label>
                <div className="grid grid-cols-4 gap-3">
                  {availableTimes.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`px-4 py-3 rounded-2xl border-2 transition-all text-sm font-semibold ${
                        selectedTime === time
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                className="w-full rounded-3xl h-12 bg-primary hover:bg-accent"
                disabled={!selectedDate || !selectedTime}
                onClick={() => setStep(2)}
              >
                Continue
              </Button>
            </div>
          )}

          {/* ── Step 2: Booking Summary + Notes ─────────────────── */}
          {step === 2 && (
            <div className="space-y-6">

              {/* Fee & booking summary card */}
              <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 overflow-hidden">
                <div className="px-6 pt-5 pb-4 border-b border-primary/10">
                  <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5" /> Booking Summary
                  </h3>
                </div>
                <div className="px-6 py-4 space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Stethoscope className="w-3.5 h-3.5" /> Doctor
                    </span>
                    <span className="font-semibold">Dr. {doctor.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" /> Date
                    </span>
                    <span className="font-semibold">{selectedDate}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" /> Time
                    </span>
                    <span className="font-semibold">{selectedTime}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <DollarSign className="w-3.5 h-3.5" /> Session Type
                    </span>
                    <span className="font-semibold">Telemedicine (30 min)</span>
                  </div>
                </div>
                {/* Fee highlight */}
                <div className="mx-4 mb-4 p-4 rounded-2xl bg-white/70 dark:bg-white/10 border border-primary/15 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Consultation Fee
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Charged securely via Stripe
                    </p>
                  </div>
                  <span className="text-3xl font-black text-primary">
                    ${displayFee}
                  </span>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-sm font-semibold mb-2 block">
                  Additional Notes{' '}
                  <span className="font-normal text-muted-foreground">(optional)</span>
                </label>
                <textarea
                  className="w-full px-4 py-3 rounded-3xl border border-border bg-muted/30 min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                  placeholder="Describe your symptoms or concerns..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 rounded-3xl h-12"
                  onClick={() => setStep(1)}
                  disabled={loading}
                >
                  Back
                </Button>
                <Button
                  className="flex-1 rounded-3xl h-12 bg-primary hover:bg-accent gap-2"
                  onClick={handleNextToPayment}
                  disabled={loading}
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Preparing...</>
                  ) : (
                    <><CreditCard className="w-4 h-4" /> Pay ${displayFee}</>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 3: Stripe Payment Form ───────────────────────── */}
          {step === 3 && (
            <div className="space-y-5">
              {/* Order summary */}
              <div className="p-5 bg-muted/40 rounded-3xl border border-border">
                <div className="flex justify-between items-center mb-2 text-sm">
                  <span className="text-muted-foreground">
                    Consultation — Dr. {doctor.name}
                  </span>
                  <span className="font-semibold">${displayFee}</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between items-center">
                  <span className="font-bold">Total</span>
                  <span className="text-2xl font-black text-primary">${displayFee}</span>
                </div>
              </div>

              {/* Stripe card element */}
              <StripePaymentWrapper clientSecret={clientSecret}>
                <PaymentForm onConfirm={handlePaymentSuccess} />
              </StripePaymentWrapper>

              <Button
                variant="ghost"
                className="w-full text-muted-foreground text-sm"
                onClick={() => setStep(2)}
              >
                ← Back to summary
              </Button>
            </div>
          )}

          {/* ── Step 4: Confirmation ─────────────────────────────── */}
          {step === 4 && (
            <div className="py-6 text-center animate-in fade-in zoom-in duration-300">
              <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-200">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Booking Confirmed!</h3>
              <p className="text-muted-foreground mb-6">
                Your appointment with{' '}
                <span className="font-semibold text-foreground">Dr. {doctor.name}</span>{' '}
                has been scheduled for
                <br />
                <span className="font-semibold text-foreground">
                  {selectedDate} at {selectedTime}
                </span>
              </p>

              <div className="bg-primary/5 border border-primary/15 p-5 rounded-3xl text-sm mb-6 space-y-2 text-left">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount Paid</span>
                  <span className="font-bold text-primary">${displayFee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-bold text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Scheduled
                  </span>
                </div>
                <p className="text-xs text-muted-foreground pt-2 border-t border-border">
                  A confirmation email and SMS has been sent to your registered contacts.
                </p>
              </div>

              <Button
                onClick={resetAndClose}
                className="w-full rounded-3xl h-12 bg-primary hover:bg-accent"
              >
                Go to Dashboard
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
