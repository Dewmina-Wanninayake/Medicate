import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Calendar, Clock, Upload, CheckCircle2, Star, AlertCircle, RefreshCw, X, File } from 'lucide-react';
import { appointmentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function BookingModal({ open, onClose, doctor }) {
  const { user } = useAuth();

  const [step, setStep]               = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes]             = useState('');
  const [uploadFile, setUploadFile]   = useState(null);
  const [booking, setBooking]         = useState(false);
  const [bookingError, setBookingError] = useState('');

  const availableTimes = [
    '09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
  ];

  const resetAndClose = () => {
    setStep(1);
    setSelectedDate('');
    setSelectedTime('');
    setNotes('');
    setUploadFile(null);
    setBooking(false);
    setBookingError('');
    onClose();
  };

  const handleComplete = async () => {
    if (!selectedDate || !selectedTime) {
      setBookingError('Please select a date and time.');
      return;
    }
    setBooking(true);
    setBookingError('');
    try {
      await appointmentAPI.book({
        doctorId:   doctor?.id || doctor?._id,
        doctorName: doctor?.name,
        specialty:  doctor?.specialty,
        date:       selectedDate,
        time:       selectedTime,
        notes:      notes.trim(),
        patientId:  user?._id || user?.id,
        patientName: user?.name,
      });
      setStep(4);
      setTimeout(() => {
        resetAndClose();
      }, 3000);
    } catch (err) {
      setBookingError(
        err?.response?.data?.message || 'Booking failed. The appointment service may be offline. Please try again.'
      );
      setBooking(false);
    }
  };

  if (!doctor) return null;

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="max-w-2xl rounded-[48px] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-8 pb-6 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="flex items-start gap-4">
            <img
              src={doctor.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=6366f1&color=fff&size=80`}
              alt={doctor.name}
              className="w-20 h-20 rounded-3xl object-cover shadow-lg"
            />
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2">Dr. {doctor.name}</DialogTitle>
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="secondary" className="rounded-full">{doctor.specialty}</Badge>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{doctor.rating || '4.5'}</span>
                  {doctor.reviewCount > 0 && (
                    <span className="text-muted-foreground">({doctor.reviewCount} reviews)</span>
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {doctor.experience}+ years of experience
                {doctor.consultationFee && ` · Consultation fee: $${doctor.consultationFee}`}
              </p>
            </div>
          </div>

          {/* Progress steps */}
          {step < 4 && (
            <div className="flex items-center gap-2 mt-6">
              {[
                { n: 1, label: 'Date & Time' },
                { n: 2, label: 'Details' },
                { n: 3, label: 'Confirm' },
              ].map(({ n, label }) => (
                <div key={n} className="flex items-center flex-1 gap-1">
                  <div className="flex flex-col items-center shrink-0">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      n <= step ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                    }`}>
                      {n < step ? '✓' : n}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5 hidden sm:block">{label}</div>
                  </div>
                  {n < 3 && <div className={`h-0.5 flex-1 rounded-full transition-all ${n < step ? 'bg-primary' : 'bg-muted'}`} />}
                </div>
              ))}
            </div>
          )}
        </DialogHeader>

        {/* Body */}
        <div className="p-8">
          {/* Step 1: Date & Time */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" /> Select Date & Time
                </h3>
                <div className="mb-5">
                  <label className="text-sm font-semibold mb-2 block">Appointment Date</label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                    className="rounded-3xl"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold mb-3 block">Available Times</label>
                  <div className="grid grid-cols-4 gap-3">
                    {availableTimes.map(time => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`px-3 py-3 rounded-2xl border-2 transition-all text-sm font-semibold ${
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

          {/* Step 2: Notes & optional file */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-primary" /> Additional Details
                </h3>
                <div className="mb-4">
                  <label className="text-sm font-semibold mb-2 block">Notes or Concerns</label>
                  <textarea
                    className="w-full px-4 py-3 rounded-3xl border border-border bg-muted/30 min-h-[100px] resize-none text-sm"
                    placeholder="Describe your symptoms or reason for the visit..."
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold mb-2 block">Upload Medical Record (Optional)</label>
                  <div
                    className="border-2 border-dashed border-border rounded-3xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => document.getElementById('booking-file-input')?.click()}
                  >
                    <input
                      id="booking-file-input"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={e => setUploadFile(e.target.files?.[0] || null)}
                    />
                    {uploadFile ? (
                      <div className="flex items-center justify-center gap-3">
                        <File className="w-6 h-6 text-primary" />
                        <div className="text-left">
                          <div className="font-semibold text-sm">{uploadFile.name}</div>
                          <div className="text-xs text-muted-foreground">{(uploadFile.size/1024).toFixed(1)} KB</div>
                        </div>
                        <button
                          className="ml-2 text-muted-foreground hover:text-red-500"
                          onClick={e => { e.stopPropagation(); setUploadFile(null); }}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm font-semibold">Click to upload</p>
                        <p className="text-xs text-muted-foreground">PDF, JPG, PNG up to 10MB</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 rounded-3xl h-12" onClick={() => setStep(1)}>Back</Button>
                <Button className="flex-1 rounded-3xl h-12 bg-primary hover:bg-accent" onClick={() => setStep(3)}>Continue</Button>
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" /> Confirm Appointment
                </h3>

                <div className="space-y-3 p-5 bg-muted/30 rounded-3xl">
                  {[
                    { label: 'Doctor', value: `Dr. ${doctor.name}` },
                    { label: 'Specialty', value: doctor.specialty },
                    { label: 'Date', value: selectedDate ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '—' },
                    { label: 'Time', value: selectedTime },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between text-sm">
                      <span className="text-muted-foreground font-medium">{row.label}</span>
                      <span className="font-bold">{row.value}</span>
                    </div>
                  ))}
                  {notes && (
                    <div className="pt-2 border-t border-border/50">
                      <div className="text-xs text-muted-foreground mb-1">Notes</div>
                      <div className="text-sm">{notes}</div>
                    </div>
                  )}
                  <div className="pt-2 border-t border-border/50 flex justify-between">
                    <span className="font-bold">Consultation Fee</span>
                    <span className="text-xl font-black text-primary">
                      ${doctor.consultationFee || 50}.00
                    </span>
                  </div>
                </div>
              </div>

              {bookingError && (
                <div className="flex items-start gap-2 text-red-600 text-sm bg-red-50 p-4 rounded-2xl border border-red-200">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{bookingError}</span>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 rounded-3xl h-12" onClick={() => setStep(2)} disabled={booking}>
                  Back
                </Button>
                <Button
                  className="flex-1 rounded-3xl h-12 bg-primary hover:bg-accent font-bold"
                  onClick={handleComplete}
                  disabled={booking}
                >
                  {booking
                    ? <><RefreshCw className="w-4 h-4 animate-spin mr-2" />Booking...</>
                    : 'Confirm Booking'
                  }
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <div className="py-12 text-center">
              <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6 animate-bounce">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Booking Confirmed! 🎉</h3>
              <p className="text-muted-foreground mb-2">
                Your appointment with Dr. {doctor.name} has been scheduled:
              </p>
              <p className="font-bold text-lg text-foreground">
                {selectedDate && new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {selectedTime}
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                You can view this appointment in your appointments dashboard.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
