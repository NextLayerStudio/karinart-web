"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function GiftCardConfirmationPage({ 
  params 
}: { 
  params: Promise<{ orderId: string }> 
}) {
  const [orderId, setOrderId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadParams = async () => {
      const { orderId } = await params;
      setOrderId(orderId);
      setIsLoading(false);
    };
    loadParams();
  }, [params]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-[#c2a4df] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white/80">Načítavam...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 pt-28 pb-16 md:pt-32">
        <div className="text-center">
          {/* Success Icon */}
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl md:text-4xl font-bold text-[#c2a4df] mb-6">
            Objednávka prijatá!
          </h1>
          
          <p className="text-xl text-white/80 mb-8">
            Na email dostaneš inštrukcie na platbu.
          </p>

          {/* Order ID */}
          <div className="bg-black/20 rounded-xl p-6 border border-[#c2a4df]/20 mb-8">
            <h2 className="text-lg font-semibold text-[#c2a4df] mb-2">
              Číslo objednávky:
            </h2>
            <p className="text-lg sm:text-2xl font-mono text-white bg-black/30 px-4 py-2 rounded-lg break-all">
              {orderId}
            </p>
            <p className="text-white/60 text-sm mt-2">
              Uložte si toto číslo pre budúcu komunikáciu
            </p>
          </div>

          {/* Next Steps */}
          <div className="bg-gradient-to-r from-[#c2a4df]/10 to-[#7568ad]/10 rounded-xl p-6 border border-[#c2a4df]/20 mb-8">
            <h3 className="text-lg font-semibold text-[#c2a4df] mb-4">
              Čo bude nasledovať:
            </h3>
            <div className="space-y-3 text-left">
              <div className="flex items-start">
                <div className="w-6 h-6 bg-[#c2a4df] rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                  <span className="text-black text-sm font-bold">1</span>
                </div>
                <p className="text-white/80">
                  <strong>Email s platbou:</strong> Do 24 hodín dostanete email s inštrukciami na platbu
                </p>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 bg-[#c2a4df] rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                  <span className="text-black text-sm font-bold">2</span>
                </div>
                <p className="text-white/80">
                  <strong>Potvrdenie platby:</strong> Po úspešnej platbe vám pošleme potvrdenie
                </p>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 bg-[#c2a4df] rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                  <span className="text-black text-sm font-bold">3</span>
                </div>
                <p className="text-white/80">
                  <strong>Darčeková poukážka:</strong> Poukážka bude pripravená do 2-3 pracovných dní
                </p>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-black/20 rounded-xl p-6 border border-[#c2a4df]/20 mb-8">
            <h3 className="text-lg font-semibold text-[#c2a4df] mb-4">
              Máte otázky?
            </h3>
            <p className="text-white/80 mb-4">
              Ak máte akékoľvek otázky ohľadom vašej objednávky, neváhajte nás kontaktovať:
            </p>
            <div className="space-y-2 text-white/80">
              <p>📧 Email: info@karinart.sk</p>
              <p>📱 Telefón: +421 XXX XXX XXX</p>
              <p>💬 Instagram: @karinart.tattoo</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/shop/giftcards"
              className="px-8 py-4 bg-[#c2a4df] hover:bg-[#7568ad] text-black font-semibold rounded-lg transition-colors duration-300"
            >
              Ďalšie darčekové poukážky
            </Link>
            <Link
              href="/"
              className="px-8 py-4 bg-transparent border border-[#c2a4df] hover:bg-[#c2a4df]/10 text-[#c2a4df] font-semibold rounded-lg transition-colors duration-300"
            >
              Späť na hlavnú stránku
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
} 