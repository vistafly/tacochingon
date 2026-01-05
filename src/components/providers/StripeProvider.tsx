'use client';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { ReactNode } from 'react';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface StripeProviderProps {
  children: ReactNode;
  clientSecret: string;
}

export function StripeProvider({ children, clientSecret }: StripeProviderProps) {
  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'night',
      variables: {
        colorPrimary: '#F5A623', // amarillo
        colorBackground: '#1a1a1a', // negro-light
        colorText: '#ffffff',
        colorDanger: '#EF4444', // rojo
        fontFamily: 'system-ui, sans-serif',
        borderRadius: '8px',
      },
      rules: {
        '.Input': {
          backgroundColor: '#0f0f0f',
          border: '1px solid #374151',
        },
        '.Input:focus': {
          border: '1px solid #F5A623',
          boxShadow: 'none',
        },
        '.Label': {
          color: '#9CA3AF',
        },
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
}
