import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import {
  CheckCircle, CreditCard, Lock, Loader2, AlertCircle,
} from 'lucide-react';

// ── Stripe singleton ──────────────────────────────────────────────────────────
const STRIPE_PK =
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||
  'pk_test_51TLgDjBa2adBv6PvdnXC4151Hwd9x8b25ulEGgr4M3OdtdA7Ph5riRA4o2xHkeoeIwClkrFbEHdZsuVAL0nXIg4c00BhWr6NlE';

const stripePromise = loadStripe(STRIPE_PK);

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(amount, currency = 'usd') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

// Stripe CardElement inline styling (matches app theme)
const CARD_STYLE = {
  style: {
    base: {
      fontSize: '16px',
      color: '#1a1a2e',
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSmoothing: 'antialiased',
      '::placeholder': { color: '#94a3b8' },
      iconColor: '#2563eb',
    },
    invalid: {
      color: '#ef4444',
      iconColor: '#ef4444',
    },
  },
  hidePostalCode: true,
};

// ── Inner payment form (must be inside <Elements>) ────────────────────────────
function CardForm({ clientSecret, amount, currency, patientEmail, onSuccess, onError }) {
  const stripe   = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [errorMsg,   setErrorMsg]   = useState('');
  const [succeeded,  setSucceeded]  = useState(false);
  const [cardReady,  setCardReady]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) return;

    setProcessing(true);
    setErrorMsg('');

    const cardElement = elements.getElement(CardElement);

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          email: patientEmail || undefined,
        },
      },
    });

    if (error) {
      setErrorMsg(error.message);
      setProcessing(false);
      onError?.(error);
    } else if (paymentIntent?.status === 'succeeded') {
      setSucceeded(true);
      setProcessing(false);
      setTimeout(() => onSuccess?.(paymentIntent), 1800);
    }
  };

  if (succeeded) {
    return (
      <div className="flex flex-col items-center py-10 gap-6 text-center">
        <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>
        <div>
          <h3 className="text-2xl font-black text-green-600">Payment Successful!</h3>
          <p className="text-muted-foreground mt-2 font-medium">
            Your appointment is confirmed. Check your email for details.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Card input wrapper */}
      <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
          Card Details
        </label>
        <div
          className={`border-2 rounded-2xl px-5 py-4 bg-white transition-colors ${
            cardReady ? 'border-primary/30' : 'border-border/40'
          }`}
        >
          <CardElement
            options={CARD_STYLE}
            onReady={() => setCardReady(true)}
            onChange={(e) => {
              if (e.error) setErrorMsg(e.error.message);
              else setErrorMsg('');
            }}
          />
        </div>
        <p className="text-xs text-muted-foreground font-medium px-1">
          Test card: <span className="font-mono text-primary">4242 4242 4242 4242</span> · Any future date · Any CVC
        </p>
      </div>

      {errorMsg && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-700 text-sm font-medium">
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <Button
        type="submit"
        disabled={!stripe || processing || !clientSecret}
        className="w-full h-14 rounded-full text-lg font-black shadow-2xl shadow-primary/20 gap-3"
      >
        {processing ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> Processing…</>
        ) : (
          <><Lock className="w-5 h-5" /> Pay {fmt(amount, currency)}</>
        )}
      </Button>
    </form>
  );
}

// ── Public component ──────────────────────────────────────────────────────────
export default function StripePaymentModal({
  open,
  onClose,
  clientSecret,
  amount,
  currency = 'usd',
  doctorName,
  appointmentDate,
  patientEmail,
  onSuccess,
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px] rounded-[48px] p-0 border-none shadow-2xl overflow-hidden">

        {/* Gradient header */}
        <div className="bg-gradient-to-br from-primary via-primary to-accent p-10 text-white">
          <div className="flex items-center gap-5 mb-3">
            <div className="w-16 h-16 rounded-3xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <CreditCard className="w-8 h-8" />
            </div>
            <div>
              <div className="text-xs font-black opacity-70 uppercase tracking-[0.2em] mb-1">
                Secure Card Payment
              </div>
              <div className="text-3xl font-black tracking-tight">
                {fmt(amount, currency)}
              </div>
            </div>
          </div>
          {doctorName && (
            <p className="text-sm font-medium opacity-80 mt-3">
              {doctorName}
              {appointmentDate ? (
                <> &middot;{' '}
                  {new Date(appointmentDate).toLocaleDateString('en-US', {
                    weekday: 'short', month: 'short', day: 'numeric',
                  })}
                </>
              ) : null}
            </p>
          )}
        </div>

        {/* Form area */}
        <div className="p-10">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-2xl font-black">Complete Your Booking</DialogTitle>
            <p className="text-muted-foreground text-sm font-medium mt-1">
              Enter your card details to confirm the appointment.
            </p>
          </DialogHeader>

          {/* Elements does NOT need clientSecret for CardElement — it's passed to confirmCardPayment */}
          <Elements stripe={stripePromise}>
            <CardForm
              clientSecret={clientSecret}
              amount={amount}
              currency={currency}
              patientEmail={patientEmail}
              onSuccess={onSuccess}
              onError={(err) => console.error('Stripe error:', err)}
            />
          </Elements>

          <div className="flex items-center justify-center gap-2 mt-8 text-xs text-muted-foreground/70">
            <Lock className="w-3 h-3" />
            <span>256-bit TLS encryption · Secured by Stripe</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
