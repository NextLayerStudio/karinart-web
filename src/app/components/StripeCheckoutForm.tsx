"use client";

import { useState, useEffect } from 'react';
import {
  useStripe,
  useElements,
  PaymentElement,
  AddressElement,
} from '@stripe/react-stripe-js';
import { useRouter } from 'next/navigation';

interface CheckoutFormProps {
  amount: number;
  giftCardData: {
    recipientName?: string;
    message?: string;
    email: string;
  };
  onSuccess?: (paymentIntent: any) => void;
  onError?: (error: string) => void;
}

export default function StripeCheckoutForm({ 
  amount, 
  giftCardData, 
  onSuccess, 
  onError 
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Create payment intent when component mounts
  useEffect(() => {
    createPaymentIntent();
  }, [amount]);

  const createPaymentIntent = async () => {
    try {
      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency: 'eur',
          metadata: {
            recipientName: giftCardData.recipientName || '',
            message: giftCardData.message || '',
            customerEmail: giftCardData.email,
            type: 'gift_card',
          },
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        setErrorMessage(data.error);
        onError?.(data.error);
        return;
      }

      setClientSecret(data.clientSecret);
    } catch (error) {
      const errorMsg = 'Nepodarilo sa inicializovať platbu. Skúste to prosím znova.';
      setErrorMessage(errorMsg);
      onError?.(errorMsg);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      setErrorMessage('Platobný systém nie je pripravený. Skúste to prosím znova.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      // First, submit the elements to validate the form
      const { error: submitError } = await elements.submit();
      
      if (submitError) {
        setErrorMessage(submitError.message || 'Chyba vo formulári. Skontrolujte prosím údaje.');
        onError?.(submitError.message || 'Chyba vo formulári');
        return;
      }

      // Then confirm the payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/shop/giftcards/success`,
          receipt_email: giftCardData.email,
        },
        redirect: 'if_required',
      });

      if (error) {
        console.error('Payment failed:', error);
        setErrorMessage(error.message || 'Platba zlyhala. Skúste to prosím znova.');
        onError?.(error.message || 'Platba zlyhala');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('Payment succeeded:', paymentIntent);
        onSuccess?.(paymentIntent);
        router.push(`/shop/giftcards/success?payment_intent=${paymentIntent.id}`);
      }
    } catch (error) {
      console.error('Payment error:', error);
      const errorMsg = 'Nastala neočakávaná chyba. Skúste to prosím znova.';
      setErrorMessage(errorMsg);
      onError?.(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!clientSecret) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-8 h-8 border-2 border-[#bba8ff] border-t-transparent rounded-full"></div>
        <span className="ml-3 text-[#b9b9c4]">Pripravujem platbu...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Element */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#e9e9ee]">
          Platobné Údaje
        </h3>
        <div className="p-4 bg-[rgba(255,255,255,0.04)] rounded-2xl border border-[rgba(255,255,255,0.08)]">
                    <PaymentElement 
            options={{
              layout: 'tabs',
              paymentMethodOrder: ['card'],
              defaultValues: {
                billingDetails: {
                  email: giftCardData.email,
                },
              },
              wallets: {
                applePay: 'never',
                googlePay: 'never',
              },
            }}
          />
        </div>
      </div>

      {/* Billing Address */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#e9e9ee]">
          Fakturačná Adresa
        </h3>
                      <div className="p-4 bg-[rgba(255,255,255,0.04)] rounded-2xl border border-[rgba(255,255,255,0.08)]">
                <AddressElement 
                  options={{
                    mode: 'billing',
                    allowedCountries: ['SK'],
                  }}
                />
              </div>
      </div>



      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <p className="text-red-400 text-sm">{errorMessage}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || !elements || isProcessing}
        className="w-full px-8 py-4 bg-[#bba8ff] hover:bg-[#c7b8ff] disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-semibold rounded-xl transition-colors duration-300 flex items-center justify-center shadow-[0_6px_16px_rgba(187,168,255,0.25)]"
      >
        {isProcessing ? (
          <>
            <div className="animate-spin w-5 h-5 border-2 border-black border-t-transparent rounded-full mr-3"></div>
            Spracovávam Platbu...
          </>
        ) : (
          <>
            Zaplatiť {amount}€
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </>
        )}
      </button>

      {/* Security Notice */}
      <div className="text-center">
                      <p className="text-[#b9b9c4] text-xs flex items-center justify-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <a href="https://stripe.com/en-sk" target="_blank" rel="noopener noreferrer" className="text-[#bba8ff] hover:text-[#c7b8ff] underline">Stripe</a> • Vaše platobné údaje sú šifrované a bezpečné
              </p>
      </div>
    </form>
  );
}

