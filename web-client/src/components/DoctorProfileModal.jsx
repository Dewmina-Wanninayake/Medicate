import { useState, useEffect } from 'react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription 
} from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { 
  Star, Clock, MapPin, Calendar as CalendarIcon, Shield, 
  Stethoscope, Award, Briefcase, Info, ChevronRight, Check, Activity
} from 'lucide-react';
import { appointmentsAPI } from '../services/api';
import { toast } from 'sonner';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Input } from './ui/input';

export default function DoctorProfileModal({ doctor, isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('09:00');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookingStep, setBookingStep] = useState('profile'); // 'profile' | 'booking' | 'success'
  const [availability, setAvailability] = useState([]);
  const [reasonForVisit, setReasonForVisit] = useState('');

  useEffect(() => {
    if (isOpen && doctor && bookingStep === 'booking') {
      fetchAvailability();
    }
  }, [isOpen, doctor, bookingStep]);

  const fetchAvailability = async () => {
    try {
      const data = await appointmentsAPI.getDoctorAvailability(doctor._id);
      setAvailability(data);
    } catch (err) {
      console.error(err);
    }
  };

  if (!doctor) return null;

  const handleBook = async () => {
    try {
      if (!selectedSlot || !selectedDate) {
        toast.error("Please select a date and time slot");
        return;
      }

      setLoading(true);
      await appointmentsAPI.book({
        doctorId: doctor._id,
        appointmentDate: selectedDate.toISOString(),
        startTime: selectedSlot,
        specialization: doctor.specialization,
        reasonForVisit,
        consultationType: 'video'
      });
      setBookingStep('success');
      toast.success('Appointment booked successfully!');
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to book appointment';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const getDayStatus = (date) => {
    const dayAppointments = availability.filter(a => 
      new Date(a.appointmentDate).toDateString() === date.toDateString()
    );
    if (dayAppointments.length === 0) return null;
    if (dayAppointments.some(a => a.status === 'confirmed')) return 'confirmed';
    if (dayAppointments.some(a => a.status === 'pending')) return 'pending';
    return null;
  };

  const slots = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];

  return (
    <Dialog open={isOpen} onOpenChange={(val) => {
      if (!val) {
        setBookingStep('profile');
        setSelectedSlot('09:00');
        setSelectedDate(new Date());
      }
      onClose();
    }}>
      <DialogContent className="sm:max-w-[1100px] rounded-[40px] border-none shadow-2xl p-0 overflow-hidden bg-background">
        {bookingStep === 'success' ? (
          <div className="p-16 text-center space-y-8">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 animate-in zoom-in duration-500">
              <Check className="w-12 h-12" />
            </div>
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-primary">Booking Confirmed!</h2>
              <p className="text-xl text-muted-foreground">
                Dr. {doctor.name.toLowerCase().startsWith('dr.') ? doctor.name : `Dr. ${doctor.name}`} will be ready for you on {selectedDate.toLocaleDateString()} at {selectedSlot}.
              </p>
            </div>
            <Button onClick={onClose} className="w-full rounded-full py-8 text-xl font-bold shadow-xl shadow-primary/20">
              Return to Dashboard
            </Button>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row h-full max-h-[95vh]">
            {/* Left Column: Info/Form */}
                <div className="flex-1 p-12 space-y-8 overflow-y-auto bg-white">
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24 rounded-3xl border-4 border-primary/5 shadow-xl">
                  <AvatarImage src={doctor.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${doctor.name}`} />
                  <AvatarFallback>{doctor.name?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-3xl font-black text-primary">
                    {doctor.name.toLowerCase().startsWith('dr.') ? doctor.name : `Dr. ${doctor.name}`}
                  </h2>
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-4 py-1 text-sm font-bold mt-2">
                    {doctor.specialization}
                  </Badge>
                </div>
              </div>

              {bookingStep === 'profile' ? (
                <>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="p-4 rounded-3xl bg-muted/20 text-center space-y-1">
                      <Briefcase className="w-6 h-6 mx-auto text-primary" />
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Experience</p>
                      <p className="font-black text-base">{doctor.experience || 5}+ Yrs</p>
                    </div>
                    <div className="p-4 rounded-3xl bg-muted/20 text-center space-y-1">
                      <Stethoscope className="w-6 h-6 mx-auto text-primary" />
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Specialty</p>
                      <p className="font-black text-base">Expert</p>
                    </div>
                    <div className="p-4 rounded-3xl bg-muted/20 text-center space-y-1">
                      <Star className="w-6 h-6 mx-auto text-amber-500 fill-amber-500" />
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Rating</p>
                      <p className="font-black text-base">4.9/5</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Info className="w-4 h-4" /> Professional Bio
                    </h3>
                    <p className="text-lg text-muted-foreground leading-relaxed font-medium">
                      {doctor.bio || `Dr. ${doctor.name} is a renowned ${doctor.specialization} with over ${doctor.experience || 5} years of international experience in specialized medical care.`}
                    </p>
                  </div>

                  <div className="p-6 rounded-[32px] bg-primary/5 border border-primary/10 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Session Rate</p>
                      <p className="text-3xl font-black text-primary">${doctor.consultationFee || 100}<span className="text-sm font-bold text-muted-foreground">/consult</span></p>
                    </div>
                    <Button onClick={() => setBookingStep('booking')} className="rounded-full h-14 px-10 text-lg font-bold shadow-lg shadow-primary/20">
                      Reserve Slot
                    </Button>
                  </div>
                </>
              ) : (
                <div className="space-y-8 animate-in slide-in-from-bottom duration-300">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-sm font-black uppercase tracking-widest text-muted-foreground">Selection Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full h-14 rounded-2xl border-muted/20 bg-muted/5 justify-start text-left font-bold text-lg">
                            <CalendarIcon className="mr-3 h-6 w-6 text-primary" />
                            {selectedDate.toLocaleDateString(undefined, { dateStyle: 'long' })}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 rounded-3xl shadow-2xl border-none" align="start">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            className="p-4"
                            modifiers={{
                              booked: (date) => getDayStatus(date) === 'confirmed',
                              pending: (date) => getDayStatus(date) === 'pending',
                            }}
                            modifiersStyles={{
                              booked: { backgroundColor: 'var(--primary)', color: 'white', fontWeight: 'bold', borderRadius: '50%' },
                              pending: { backgroundColor: '#FBBF24', color: 'white', fontWeight: 'bold', borderRadius: '50%' }
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-black uppercase tracking-widest text-muted-foreground">Select Time Slot</label>
                      <div className="grid grid-cols-3 gap-3">
                        {slots.map(slot => (
                          <button
                            key={slot}
                            onClick={() => setSelectedSlot(slot)}
                            className={`py-4 rounded-2xl text-base font-black transition-all ${
                              selectedSlot === slot 
                                ? 'bg-primary text-primary-foreground shadow-xl scale-105' 
                                : 'bg-muted/30 hover:bg-muted/50 border border-transparent text-muted-foreground'
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-black uppercase tracking-widest text-muted-foreground">Primary Concern</label>
                      <Input 
                        placeholder="Symptoms, follow-up, etc." 
                        className="h-16 rounded-2xl border-muted/20 bg-muted/5 text-lg font-medium"
                        value={reasonForVisit}
                        onChange={(e) => setReasonForVisit(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button variant="ghost" onClick={() => setBookingStep('profile')} className="flex-1 rounded-full h-14 font-bold text-lg">
                      Back
                    </Button>
                    <Button 
                      onClick={handleBook} 
                      disabled={loading} 
                      className="flex-[2] rounded-full h-14 font-black text-xl shadow-xl shadow-primary/20"
                    >
                      {loading ? 'Securing Slot...' : 'Confirm Booking'}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Visual Availability */}
            <div className="w-full md:w-[420px] bg-primary/5 p-12 flex flex-col items-center border-l border-primary/10">
               <h3 className="text-2xl font-black text-primary mb-10 flex items-center gap-3 uppercase tracking-[0.2em]">
                  <Activity className="w-7 h-7" /> Live Schedule
               </h3>

               <div className="bg-white rounded-[48px] shadow-2xl p-8 border-none scale-105">
                 <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="border-none"
                    modifiers={{
                      booked: (date) => getDayStatus(date) === 'confirmed',
                      pending: (date) => getDayStatus(date) === 'pending',
                    }}
                    modifiersStyles={{
                      booked: { backgroundColor: 'var(--primary)', color: 'white', fontWeight: 'bold', borderRadius: '50%' },
                      pending: { backgroundColor: '#FBBF24', color: 'white', fontWeight: 'bold', borderRadius: '50%' }
                    }}
                 />
               </div>

               <div className="mt-16 w-full space-y-8">
                  <div className="flex items-center gap-5">
                    <div className="w-6 h-6 rounded-full bg-primary shadow-lg shadow-primary/30" />
                    <span className="text-sm font-black text-muted-foreground uppercase tracking-widest">Fully Booked</span>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="w-6 h-6 rounded-full bg-yellow-400 shadow-lg shadow-yellow-200" />
                    <span className="text-sm font-black text-muted-foreground uppercase tracking-widest">Pending</span>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="w-6 h-6 rounded-full border-4 border-primary/10" />
                    <span className="text-sm font-black text-muted-foreground uppercase tracking-widest">Available</span>
                  </div>
               </div>

               <div className="mt-auto pt-10 w-full text-center">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-2 opacity-50">Authorized Medical Partner</p>
                  <p className="font-black text-primary text-xl">Dr. {doctor.name.replace(/^dr\.?\s*/i, '')}</p>
               </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
