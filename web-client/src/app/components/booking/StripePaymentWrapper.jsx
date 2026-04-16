import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Use environment variable or fallback to test key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51TLgDjBa2adBv6PvdnXC4151Hwd9x8b25ulEGgr4M3OdtdA7Ph5riRA4o2xHkeoeIwClkrFbEHdZsuVAL0nXIg4c00BhWr6NlE');

export default function StripePaymentWrapper({ children, clientSecret }) {
  if (!clientSecret) return null;

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#3b82f6',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        borderRadius: '24px',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
}
