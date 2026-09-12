"use client";

import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { ReactNode } from 'react';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface StripeProviderProps {
  children: ReactNode;
  options?: any;
}

export default function StripeProvider({ children, options = {} }: StripeProviderProps) {
  const defaultOptions = {
    mode: 'payment',
    currency: 'eur',
    amount: options.amount || 0,
    locale: 'sk',
    country: 'SK',
    paymentMethodTypes: ['card'],
    appearance: {
      theme: 'night' as const,
      variables: {
        colorPrimary: '#bba8ff',
        colorBackground: '#0f0f12',
        colorText: '#e9e9ee',
        colorDanger: '#ff6b6b',
        colorSuccess: '#51cf66',
        fontFamily: 'system-ui, sans-serif',
        borderRadius: '12px',
        colorInputBackground: 'rgba(255,255,255,0.03)',
        colorInputBorder: 'rgba(255,255,255,0.08)',
        colorInputText: '#e9e9ee',
        colorInputPlaceholder: '#8f8fa1',
      },
      rules: {
        '.Input': {
          backgroundColor: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px',
          padding: '12px 16px',
          fontSize: '14px',
          color: '#e9e9ee',
        },
        '.Input:focus': {
          borderColor: '#bba8ff',
          boxShadow: '0 0 0 3px rgba(187,168,255,0.35)',
          outline: 'none',
        },
        '.Label': {
          color: '#b9b9c4',
          fontSize: '13px',
          fontWeight: '500',
          marginBottom: '8px',
        },
        '.Error': {
          color: '#ff6b6b',
          fontSize: '12px',
        },
        '.Tab': {
          backgroundColor: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          color: '#b9b9c4',
        },
        '.Tab:hover': {
          backgroundColor: 'rgba(255,255,255,0.08)',
          color: '#e9e9ee',
        },
        '.Tab--selected': {
          backgroundColor: '#bba8ff',
          color: '#0f0f12',
          borderColor: '#bba8ff',
        },
        '.TabIcon': {
          color: 'inherit',
        },
        '.PaymentMethodButton': {
          backgroundColor: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px',
          padding: '12px 16px',
          color: '#e9e9ee',
        },
        '.PaymentMethodButton:hover': {
          backgroundColor: 'rgba(255,255,255,0.08)',
          borderColor: '#bba8ff',
        },
        '.PaymentMethodButton--selected': {
          backgroundColor: '#bba8ff',
          color: '#0f0f12',
          borderColor: '#bba8ff',
        },
      },
    },
    ...options,
  };

  return (
    <Elements stripe={stripePromise} options={defaultOptions}>
      {children}
    </Elements>
  );
}

