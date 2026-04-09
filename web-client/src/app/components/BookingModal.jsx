import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Calendar, Clock, CreditCard, Upload, CheckCircle2, Star } from 'lucide-react';

export default function BookingModal({ open, onClose, doctor }) {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  if (!doctor) return null;

  const availableTimes = [
    '09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
  ];

  const handleComplete = () => {
    setStep(4);
    setTimeout(() => {
      onClose();
      setStep(1);
      setSelectedDate('');
      setSelectedTime('');
    }, 3000);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl rounded-[48px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-8 pb-6 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="flex items-start gap-4">
            <img
              src={doctor.imageUrl}
              alt={doctor.name}
              className="w-20 h-20 rounded-3xl object-cover shadow-lg"
            />
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2">{doctor.name}</DialogTitle>
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="secondary" className="rounded-full">
                  {doctor.specialty}
                </Badge>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{doctor.rating}</span>
                  <span className="text-muted-foreground">({doctor.reviewCount} reviews)</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {doctor.experience} years of experience
              </p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-2 mt-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`h-2 flex-1 rounded-full transition-all ${
                    s <= step
                      ? 'bg-primary'
                      : 'bg-muted'
                  }`}
                />
                {s < 3 && <div className="w-2" />}
              </div>
            ))}
          </div>
        </DialogHeader>

        <div className="p-8">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Select Date & Time
                </h3>
                
                <div className="mb-4">
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

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg mb-4 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-primary" />
                  Upload Medical Records (Optional)
                </h3>
                
                <div className="border-2 border-dashed border-border rounded-3xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm font-semibold mb-1">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PDF, JPG, PNG up to 10MB
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold mb-2 block">
                  Additional Notes
                </label>
                <textarea
                  className="w-full px-4 py-3 rounded-3xl border border-border bg-muted/30 min-h-[100px] resize-none"
                  placeholder="Describe your symptoms or concerns..."
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 rounded-3xl h-12"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button
                  className="flex-1 rounded-3xl h-12 bg-primary hover:bg-accent"
                  onClick={() => setStep(3)}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Payment Information
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold mb-2 block">
                      Card Number
                    </label>
                    <Input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      className="rounded-3xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold mb-2 block">
                        Expiry Date
                      </label>
                      <Input
                        type="text"
                        placeholder="MM/YY"
                        className="rounded-3xl"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold mb-2 block">
                        CVV
                      </label>
                      <Input
                        type="text"
                        placeholder="123"
                        className="rounded-3xl"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-3xl">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Consultation Fee</span>
                      <span className="font-semibold">$50.00</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Platform Fee</span>
                      <span className="font-semibold">$5.00</span>
                    </div>
                    <div className="border-t border-border pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="font-semibold">Total</span>
                        <span className="text-xl font-bold text-primary">$55.00</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 rounded-3xl h-12"
                  onClick={() => setStep(2)}
                >
                  Back
                </Button>
                <Button
                  className="flex-1 rounded-3xl h-12 bg-primary hover:bg-accent"
                  onClick={handleComplete}
                >
                  Confirm Booking
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="py-12 text-center">
              <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Booking Confirmed!</h3>
              <p className="text-muted-foreground mb-6">
                Your appointment with {doctor.name} has been scheduled for
                <br />
                <span className="font-semibold text-foreground">
                  {selectedDate} at {selectedTime}
                </span>
              </p>
              <p className="text-sm text-muted-foreground">
                A confirmation email has been sent to your inbox.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
