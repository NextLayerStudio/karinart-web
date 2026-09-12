"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ShopPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    recipientName: "",
    message: "",
    amount: 0,
    giftPackaging: false,
  });
  const [showGiftPackagingModal, setShowGiftPackagingModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.email || formData.amount < 10) {
      alert("Prosím vyplňte všetky povinné polia a skontrolujte hodnotu poukážky (minimálne 10€).");
      return;
    }

              // Calculate total amount including gift packaging
          const totalAmount = formData.amount + (formData.giftPackaging ? 5 : 0);

          // Redirect to Stripe checkout with form data
          const checkoutUrl = new URL('/shop/giftcards/checkout', window.location.origin);
          checkoutUrl.searchParams.set('type', 'custom');
          checkoutUrl.searchParams.set('amount', totalAmount.toString());
          checkoutUrl.searchParams.set('email', formData.email);
          if (formData.recipientName) {
            checkoutUrl.searchParams.set('recipientName', formData.recipientName);
          }
          if (formData.message) {
            checkoutUrl.searchParams.set('message', formData.message);
          }
          checkoutUrl.searchParams.set('giftPackaging', formData.giftPackaging.toString());
          checkoutUrl.searchParams.set('voucherAmount', formData.amount.toString());

    router.push(checkoutUrl.toString());
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-[#0f0f12] text-white flex flex-col">
      {/* Full-Page Hero Banner */}
      <section className="relative w-full h-[70vh] flex flex-col text-white px-4">
        <div
          className="absolute inset-0 bg-no-repeat z-0 hero-banner-bg"
          style={{
            backgroundImage: "url(/images/studio.webp)",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        ></div>
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black opacity-60"></div>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col justify-center h-full text-center pt-16">
          <div className="space-y-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-amsterdam-four text-[#c2a4df] drop-shadow-lg">Darčekové Poukážky</h1>
            <p className="text-sm md:text-base lg:text-lg text-gray-200 font-light italic px-6 max-w-xl mx-auto">
              Darujte jedinečný zážitok - darčekovú poukážku na profesionálne tetovanie v Karin Art štúdiu.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
          {/* Gift Card Preview */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-[#e9e9ee] mb-4">
                Vlastná Hodnota
              </h1>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-[rgba(255,255,255,0.04)] p-6 h-72 sm:h-96 border border-[rgba(255,255,255,0.08)] shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
              <div className="absolute inset-0 bg-gradient-to-b from-[#bba8ff] to-[#e9a6d1] opacity-20"></div>
              <div className="relative h-full flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-[#b9b9c4] mb-2">
                    Darčeková poukážka
                  </h3>
                </div>
                
                                        <div className="text-center">
                          <div className="text-4xl sm:text-5xl font-semibold text-[#e9e9ee] leading-tight">
                            {formData.amount > 0 ? formData.amount : "---"}€
                          </div>
                          <div className="text-[#b9b9c4] text-xs mt-2">
                            Hodnota poukážky
                          </div>
                        </div>

                <div className="text-center">
                  <div className="text-[#b9b9c4] text-xs mt-4">
                    Platnosť poukážky: 12 mesiacov od zakúpenia
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[rgba(255,255,255,0.04)] rounded-2xl p-6 border border-[rgba(255,255,255,0.08)] shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
              <h3 className="text-lg font-semibold text-[#e9e9ee] mb-4">
                Čo zahŕňa poukážka:
              </h3>
              <ul className="space-y-3 text-[#b9b9c4] text-sm leading-relaxed">
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-[#b9b9c4] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Profesionálne tetovanie v Karin Art štúdiu</span>
                </li>
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-[#b9b9c4] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Bezpečné a čisté prostredie</span>
                </li>
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-[#b9b9c4] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Platnosť 12 mesiacov od zakúpenia</span>
                </li>
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-[#b9b9c4] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Možnosť pridať osobný odkaz</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Order Form */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-[#e9e9ee] mb-2">
                Vytvoriť objednávku
              </h2>
              <p className="text-[#b9b9c4] text-sm">
                Vyplňte údaje pre darčekovú poukážku
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Amount */}
              <div>
                <label className="block text-[#b9b9c4] text-sm font-medium mb-2">
                  Hodnota poukážky (€) *
                </label>
                <input
                  type="number"
                  min="10"
                  max="1000"
                  required
                  value={formData.amount || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    handleInputChange("amount", value === "" ? 0 : parseFloat(value) || 0);
                  }}
                  className="w-full px-4 py-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl text-[#e9e9ee] placeholder-[#8f8fa1] focus:outline-none focus:border-[#bba8ff] focus:ring-[0_0_0_3px_rgba(187,168,255,0.35)] transition-colors"
                  placeholder="Zadajte hodnotu v eurách"
                />
                <p className="text-[#b9b9c4] text-sm mt-1">
                  Minimálna hodnota: 10€, Maximálna hodnota: 1000€
                </p>
                {formData.amount > 0 && formData.amount < 10 && (
                  <p className="text-red-400 text-sm mt-1">
                    Hodnota nemôže byť menšia ako 10€
                  </p>
                )}
              </div>

              {/* Customer Email */}
              <div>
                <label className="block text-[#b9b9c4] text-sm font-medium mb-2">
                  Váš e-mail *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full px-4 py-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl text-[#e9e9ee] placeholder-[#8f8fa1] focus:outline-none focus:border-[#bba8ff] focus:ring-[0_0_0_3px_rgba(187,168,255,0.35)] transition-colors"
                  placeholder="vas@email.com"
                />
                <p className="text-[#b9b9c4] text-sm mt-1">
                  Na tento email dostanete potvrdenie objednávky
                </p>
              </div>

              {/* Recipient Name */}
              <div>
                <label className="block text-[#b9b9c4] text-sm font-medium mb-2">
                  Meno príjemcu (voliteľné)
                </label>
                <input
                  type="text"
                  value={formData.recipientName}
                  onChange={(e) => handleInputChange("recipientName", e.target.value)}
                  className="w-full px-4 py-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl text-[#e9e9ee] placeholder-[#8f8fa1] focus:outline-none focus:border-[#bba8ff] focus:ring-[0_0_0_3px_rgba(187,168,255,0.35)] transition-colors"
                  placeholder="Meno osoby, ktorej je poukážka určená"
                />
              </div>

                                    {/* Personal Message */}
                      <div>
                        <label className="block text-[#b9b9c4] text-sm font-medium mb-2">
                          Osobná správa (voliteľné)
                        </label>
                        <textarea
                          value={formData.message}
                          onChange={(e) => handleInputChange("message", e.target.value)}
                          rows={4}
                          className="w-full px-4 py-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl text-[#e9e9ee] placeholder-[#8f8fa1] focus:outline-none focus:border-[#bba8ff] focus:ring-[0_0_0_3px_rgba(187,168,255,0.35)] transition-colors resize-none"
                          placeholder="Napíšte osobnú správu pre príjemcu poukážky..."
                        />
                        <p className="text-[#b9b9c4] text-sm mt-1">
                          Maximálne 200 znakov
                        </p>
                      </div>

                      {/* Gift Packaging Toggle */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-[#b9b9c4] text-sm font-medium">
                            Chcem darčekové balenie
                          </label>
                          <div className="relative">
                            <input
                              type="checkbox"
                              id="giftPackaging"
                              checked={formData.giftPackaging}
                              onChange={(e) => handleInputChange("giftPackaging", e.target.checked)}
                              className="sr-only"
                            />
                            <label
                              htmlFor="giftPackaging"
                              className={`block w-12 h-6 rounded-full transition-colors duration-200 cursor-pointer ${
                                formData.giftPackaging 
                                  ? 'bg-[#bba8ff]' 
                                  : 'bg-[rgba(255,255,255,0.08)]'
                              }`}
                            >
                              <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                                formData.giftPackaging ? 'translate-x-6' : 'translate-x-0.5'
                              }`}></div>
                            </label>
                          </div>
                        </div>
                        <div className="mt-1">
                          <a
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setShowGiftPackagingModal(true);
                            }}
                            className="text-[#bba8ff] hover:text-[#c7b8ff] text-xs underline hover:no-underline transition-colors"
                          >
                            Čo obsahuje darčekové balenie
                          </a>
                        </div>
                        {formData.giftPackaging && (
                          <div className="p-3 bg-[rgba(187,168,255,0.1)] border border-[rgba(187,168,255,0.2)] rounded-lg mt-2">
                            <p className="text-[#bba8ff] text-xs font-medium">
                              +5€ - Darčekové balenie pridané
                            </p>
                          </div>
                        )}
                      </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={formData.amount < 10}
                className="w-full px-8 py-3 bg-[#bba8ff] hover:bg-[#c7b8ff] disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-semibold rounded-xl transition-colors duration-300 flex items-center justify-center shadow-[0_6px_16px_rgba(187,168,255,0.25)]"
              >
                Pokračovať k Platbe
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </form>

            {/* Security Notice */}
            <div className="text-center">
              <p className="text-[#b9b9c4] text-xs">
                Vaše údaje sú chránené a použité len na spracovanie objednávky.
              </p>
            </div>
          </div>
        </div>
                    </main>

              {/* Gift Packaging Modal */}
              {showGiftPackagingModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-[#0f0f12] border border-[#bba8ff]/30 rounded-xl max-w-sm w-full">
                    <div className="p-5">
                      <div className="text-center mb-4">
                        <h2 className="text-lg font-bold text-[#e9e9ee]">🎁 Darčekové Balenie</h2>
                      </div>

                      <div className="text-center mb-4">
                        <div className="text-2xl font-bold text-[#bba8ff] mb-1">+5€</div>
                        <p className="text-[#b9b9c4] text-xs">
                          Elegantné darčekové balenie
                        </p>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-[#bba8ff] rounded-full"></div>
                          <span className="text-[#e9e9ee]">Fyzická poukážka</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-[#bba8ff] rounded-full"></div>
                          <span className="text-[#e9e9ee]">Elegantné zabalenie</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-[#bba8ff] rounded-full"></div>
                          <span className="text-[#e9e9ee]">Vosková pečať</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-[#bba8ff] rounded-full"></div>
                          <span className="text-[#e9e9ee]">Ručne písané venovanie</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-[#bba8ff] rounded-full"></div>
                          <span className="text-[#e9e9ee]">Doručenie do 3 pracovných dní</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setShowGiftPackagingModal(false)}
                        className="w-full bg-[#bba8ff] hover:bg-[#c7b8ff] text-black font-semibold py-1.5 px-3 rounded-lg transition-colors text-xs"
                      >
                        Rozumiem
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        } 