import { useState } from 'react';
import { Calendar as CalendarIcon, Clock, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";

export default function BookingWorkflow({ selectedDoctor, onCancel }) {
  const [step, setStep] = useState(1);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  if (!selectedDoctor) return null;

  const handleConfirm = () => {
    setBookingConfirmed(true);
  };

  if (bookingConfirmed) {
    return (
      <Card className="rounded-[32px] border-none shadow-xl text-center py-10 bg-gradient-to-br from-green-50 to-white">
        <CardContent className="space-y-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800">Booking Confirmed!</h2>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Your appointment with {selectedDoctor.name} has been successfully scheduled. An email confirmation has been sent to you.
          </p>
          <Button onClick={onCancel} className="bg-primary hover:bg-accent rounded-full px-8 mt-4">
            Back to Hub
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-[32px] shadow-lg border-border">
      <CardHeader className="bg-muted/30 rounded-t-[32px] border-b border-border pb-6 flex flex-row items-center justify-between">
        <CardTitle className="text-xl">Book Consultation</CardTitle>
        <Button variant="ghost" size="sm" onClick={onCancel} className="rounded-full">Cancel</Button>
      </CardHeader>
      
      <CardContent className="p-8">
        <div className="flex gap-6 items-center mb-8 bg-muted/20 p-4 rounded-2xl">
          <img src={selectedDoctor.imageUrl} className="w-16 h-16 rounded-full object-cover shadow-sm" alt="Doctor" />
          <div>
            <h3 className="font-bold text-lg">{selectedDoctor.name}</h3>
            <p className="text-primary text-sm font-medium">{selectedDoctor.specialty}</p>
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right-8">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary" />
              Select Date & Time
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <Input type="date" className="rounded-2xl bg-muted/20 border-border" />
              <Input type="time" className="rounded-2xl bg-muted/20 border-border" />
            </div>
            
            <div>
              <h4 className="font-semibold text-sm mb-3 text-muted-foreground">Reason for visit</h4>
              <Input placeholder="Describe your symptoms briefly..." className="rounded-2xl p-4 bg-muted/20 border-border" />
            </div>
            
            <Button onClick={() => setStep(2)} className="w-full rounded-full mt-4 h-12 text-lg">Next Step</Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-8">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Confirmation
            </h4>
            
            <div className="bg-muted/30 p-6 rounded-2xl space-y-4">
              <div className="flex justify-between border-b border-border pb-4">
                <span className="text-muted-foreground">Consultation Fee</span>
                <span className="font-bold">$150.00</span>
              </div>
              <div className="flex justify-between border-b border-border pb-4">
                <span className="text-muted-foreground">Platform Fee</span>
                <span className="font-bold">$5.00</span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="font-semibold text-gray-800">Total</span>
                <span className="font-bold text-primary">$155.00</span>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1 rounded-full h-12">Back</Button>
              <Button onClick={handleConfirm} className="flex-1 rounded-full h-12 bg-primary hover:bg-accent">Confirm & Pay</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
