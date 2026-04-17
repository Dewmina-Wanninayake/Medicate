import { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '../ui/button';
import { toast } from 'sonner';

export default function PaymentForm({ onConfirm }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);
    
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard/appointments`,
      },
      // If we don't want a full page redirect, we can use:
      redirect: 'if_required',
    });

    if (error) {
      toast.error(error.message);
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      toast.success('Payment successful! Appointment confirmed.');
      onConfirm(paymentIntent.id);
    }
    
    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement options={{ layout: 'tabs' }} />
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing}
        className="w-full rounded-3xl h-12 bg-primary hover:bg-accent"
      >
        {isProcessing ? 'Processing...' : 'Confirm & Pay Now'}
      </Button>
    </form>
  );
}
