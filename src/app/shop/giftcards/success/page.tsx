"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function SuccessContent() {
  const searchParams = useSearchParams();
  const [paymentData, setPaymentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const paymentIntentId = searchParams.get('payment_intent');
    const paymentIntentClientSecret = searchParams.get('payment_intent_client_secret');
    
    if (paymentIntentId) {
      setPaymentData({
        paymentIntentId,
        paymentIntentClientSecret,
      });
    }
    setIsLoading(false);
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f0f12] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-[#bba8ff] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-[#b9b9c4]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f12] text-white flex flex-col">
      {/* Main Content */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-12 md:py-16">
        <div className="text-center space-y-8">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-[#51cf66] to-[#40c057] rounded-full flex items-center justify-center shadow-[0_8px_24px_rgba(81,207,102,0.25)]">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Success Message */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-[#e9e9ee]">
              Payment Successful!
            </h1>
            <p className="text-xl text-[#b9b9c4] max-w-2xl mx-auto">
              Thank you for your purchase. Your gift card has been created and will be sent to your email shortly.
            </p>
          </div>

          {/* Payment Details */}
          {paymentData?.paymentIntentId && (
            <div className="bg-[rgba(255,255,255,0.04)] rounded-2xl p-6 border border-[rgba(255,255,255,0.08)] shadow-[0_8px_24px_rgba(0,0,0,0.25)] max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-[#e9e9ee] mb-4">
                Payment Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#b9b9c4]">Payment ID:</span>
                  <span className="text-[#e9e9ee] font-mono text-xs">
                    {paymentData.paymentIntentId.slice(-8)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#b9b9c4]">Status:</span>
                  <span className="text-[#51cf66] font-medium">Paid</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#b9b9c4]">Date:</span>
                  <span className="text-[#e9e9ee]">
                    {new Date().toLocaleDateString('sk-SK')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* What's Next */}
          <div className="bg-[rgba(255,255,255,0.04)] rounded-2xl p-6 border border-[rgba(255,255,255,0.08)] shadow-[0_8px_24px_rgba(0,0,0,0.25)] max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-[#e9e9ee] mb-4">
              What happens next?
            </h3>
            <ul className="space-y-3 text-left text-[#b9b9c4]">
              <li className="flex items-start">
                <div className="w-1.5 h-1.5 bg-[#bba8ff] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>You'll receive a confirmation email with your gift card details</span>
              </li>
              <li className="flex items-start">
                <div className="w-1.5 h-1.5 bg-[#bba8ff] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>The digital gift card will include a unique code for redemption</span>
              </li>
              <li className="flex items-start">
                <div className="w-1.5 h-1.5 bg-[#bba8ff] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>The recipient can book an appointment using the gift card code</span>
              </li>
              <li className="flex items-start">
                <div className="w-1.5 h-1.5 bg-[#bba8ff] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>Gift card is valid for 12 months from the purchase date</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/shop"
              className="px-6 py-3 bg-[#bba8ff] hover:bg-[#c7b8ff] text-black font-semibold rounded-xl transition-colors duration-300 inline-flex items-center justify-center"
            >
              Buy Another Gift Card
            </Link>
            <Link 
              href="/"
              className="px-6 py-3 bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] text-[#e9e9ee] font-semibold rounded-xl border border-[rgba(255,255,255,0.08)] transition-colors duration-300 inline-flex items-center justify-center"
            >
              Back to Home
            </Link>
          </div>

          {/* Contact Information */}
          <div className="mt-12 pt-8 border-t border-[rgba(255,255,255,0.08)]">
            <p className="text-[#b9b9c4] text-sm">
              Questions about your gift card? Contact us at{' '}
              <a href="mailto:info@karinart.sk" className="text-[#bba8ff] hover:underline">
                info@karinart.sk
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0f0f12] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-[#bba8ff] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-[#b9b9c4]">Loading...</p>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}

