import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Use environment variable for test key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

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
