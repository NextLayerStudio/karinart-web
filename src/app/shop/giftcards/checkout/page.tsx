"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import StripeProvider from '../../../components/StripeProvider';
import StripeCheckoutForm from '../../../components/StripeCheckoutForm';

const giftCardOptions = {
  "custom": { amount: 0, title: "Vlastná Hodnota", description: "Vyberte si sumu podľa seba a vytvorte si vlastnú darčekovú poukážku" },
};

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [giftCardData, setGiftCardData] = useState({
    type: '',
    amount: 0,
    voucherAmount: 0,
    email: '',
    recipientName: '',
    message: '',
    giftPackaging: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get data from URL parameters
    const type = searchParams.get('type') || '';
    const amount = parseFloat(searchParams.get('amount') || '0');
    const voucherAmount = parseFloat(searchParams.get('voucherAmount') || '0');
    const email = searchParams.get('email') || '';
    const recipientName = searchParams.get('recipientName') || '';
    const message = searchParams.get('message') || '';
    const giftPackaging = searchParams.get('giftPackaging') === 'true';

    // Validate required data
    if (!type || !amount || !email || amount < 10) {
      router.push('/shop');
      return;
    }

    setGiftCardData({
      type,
      amount,
      voucherAmount,
      email,
      recipientName,
      message,
      giftPackaging,
    });
    setIsLoading(false);
  }, [searchParams, router]);

  const handlePaymentSuccess = async (paymentIntent: any) => {
    try {
      // Create gift card order in database
      const response = await fetch('/api/giftcards/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...giftCardData,
          stripePaymentIntentId: paymentIntent.id,
          status: 'PAID',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create gift card order');
      }

      const orderData = await response.json();
      console.log('Gift card order created:', orderData);
    } catch (error) {
      console.error('Error creating gift card order:', error);
    }
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    // Could show a toast notification or error modal here
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f0f12] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-[#bba8ff] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-[#b9b9c4]">Načítavam pokladňu...</p>
        </div>
      </div>
    );
  }

  const giftCard = giftCardOptions[giftCardData.type as keyof typeof giftCardOptions];

  return (
    <div className="min-h-screen bg-[#0f0f12] text-white flex flex-col">
      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-12 md:py-16">
        {/* Header - outside the grid */}
        <div className="mb-8">
          <Link href="/shop" className="text-[#bba8ff] hover:underline mb-6 inline-block">
            ← Späť na Poukážky
          </Link>
          <h1 className="text-3xl font-bold text-[#e9e9ee] mb-2">
            Dokončite Vašu Objednávku
          </h1>
          <p className="text-[#b9b9c4]">
            Skontrolujte detaily poukážky a dokončite platbu
          </p>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left Column - Gift Card Preview & Summary */}
          <div className="space-y-6">

            {/* Gift Card Preview - Will be generated */}
            <div className="bg-[rgba(255,255,255,0.04)] rounded-2xl p-6 border border-[rgba(255,255,255,0.08)] shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
              <div className="h-48 flex items-center justify-center">
                <p className="text-[#b9b9c4] text-sm">
                  Náhľad poukážky sa vygeneruje...
                </p>
              </div>
            </div>

            {/* Order Details */}
            <div className="bg-[rgba(255,255,255,0.04)] rounded-2xl p-6 border border-[rgba(255,255,255,0.08)] shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
              <h3 className="text-lg font-semibold text-[#e9e9ee] mb-4">
                Detaily Objednávky
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#b9b9c4]">Typ Poukážky:</span>
                  <span className="text-[#e9e9ee]">{giftCard?.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#b9b9c4]">Hodnota poukážky:</span>
                  <span className="text-[#e9e9ee] font-medium">{giftCardData.voucherAmount}€</span>
                </div>
                {giftCardData.giftPackaging && (
                  <div className="flex justify-between">
                    <span className="text-[#b9b9c4]">Darčekové balenie:</span>
                    <span className="text-[#bba8ff] font-medium">+5€</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-[rgba(255,255,255,0.08)]">
                  <span className="text-[#e9e9ee] font-medium">Celková suma:</span>
                  <span className="text-[#e9e9ee] font-bold">{giftCardData.amount}€</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-[#b9b9c4] flex-shrink-0">Email Zákazníka:</span>
                  <span className="text-[#e9e9ee] break-all text-right">{giftCardData.email}</span>
                </div>
                {giftCardData.recipientName && (
                  <div className="flex justify-between">
                    <span className="text-[#b9b9c4]">Príjemca:</span>
                    <span className="text-[#e9e9ee]">{giftCardData.recipientName}</span>
                  </div>
                )}
                {giftCardData.message && (
                  <div className="pt-2 border-t border-[rgba(255,255,255,0.08)]">
                    <span className="text-[#b9b9c4] block mb-2">Osobná Správa:</span>
                    <p className="text-[#e9e9ee] text-sm italic">
                      "{giftCardData.message}"
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* What's Included */}
            <div className="bg-[rgba(255,255,255,0.04)] rounded-2xl p-6 border border-[rgba(255,255,255,0.08)] shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
              <h3 className="text-lg font-semibold text-[#e9e9ee] mb-4">
                Čo je Zahrnuté:
              </h3>
              <ul className="space-y-2 text-sm text-[#b9b9c4]">
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-[#bba8ff] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Profesionálna tetovacia služba v štúdiu Karin Art</span>
                </li>
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-[#bba8ff] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Bezpečné a sterilné prostredie</span>
                </li>
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-[#bba8ff] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Platnosť 12 mesiacov od dátumu nákupu</span>
                </li>
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-[#bba8ff] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Digitálna poukážka doručená emailom</span>
                </li>
                {giftCardData.giftPackaging && (
                  <>
                    <li className="flex items-start">
                      <div className="w-1.5 h-1.5 bg-[#bba8ff] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Fyzická poukážka s elegantným zabalením</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-1.5 h-1.5 bg-[#bba8ff] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Vosková pečať a ručne písané venovanie</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-1.5 h-1.5 bg-[#bba8ff] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Doručenie do 3 pracovných dní</span>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>

          {/* Right Column - Payment Form */}
          <div className="space-y-6">
            <div className="bg-[rgba(255,255,255,0.04)] rounded-2xl p-6 border border-[rgba(255,255,255,0.08)] shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
              <h2 className="text-2xl font-bold text-[#e9e9ee] mb-6">
                Platba
              </h2>
              
              <StripeProvider options={{ amount: giftCardData.amount * 100 }}>
                <StripeCheckoutForm
                  amount={giftCardData.amount}
                  giftCardData={giftCardData}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              </StripeProvider>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0f0f12] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-[#bba8ff] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-[#b9b9c4]">Načítavam...</p>
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}

