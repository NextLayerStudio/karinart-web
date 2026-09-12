'use client';

import Link from 'next/link';

export default function GiveawayPage() {
  return (
    <div className="bg-[var(--background)] text-[var(--foreground)]">      <main className="relative">
        <section className="relative w-full min-h-screen flex items-center justify-center">
          <div
            className="absolute inset-0 bg-no-repeat z-0"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')",
              backgroundSize: "cover",
              backgroundPosition: "center"
            }}
          ></div>
          <div className="absolute inset-0 bg-black bg-opacity-60"></div>
          
          <div className="relative z-10 w-full max-w-6xl mx-auto px-4 py-24">
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-amsterdam-four text-[#c2a4df] drop-shadow-lg mb-6">
                Žiadna súťaž momentálne neprebieha
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                Momentálne neprebieha žiadna súťaž o tetovanie. Sledujte naše sociálne siete a webovú stránku, 
                aby ste nezmeškali budúce príležitosti vyhrať tetovanie zadarmo!
              </p>
              
              <div className="surface-card p-6 md:p-8 mb-8 max-w-4xl mx-auto">
                <h2 className="text-2xl font-semibold text-[#c2a4df] mb-6">
                  Čo môžete robiť zatiaľ?
                </h2>
                <div className="grid md:grid-cols-2 gap-6 text-left">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <span className="text-[#c2a4df] text-2xl">📅</span>
                      <div>
                        <h3 className="font-semibold text-white text-lg">Rezervujte si termín</h3>
                        <p className="text-gray-300">Objednajte si tetovanie cez náš online systém</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="text-[#c2a4df] text-2xl">🎨</span>
                      <div>
                        <h3 className="font-semibold text-white text-lg">Pozrite si portfólio</h3>
                        <p className="text-gray-300">Inšpirujte sa našimi prácami</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <span className="text-[#c2a4df] text-2xl">💬</span>
                      <div>
                        <h3 className="font-semibold text-white text-lg">Kontaktujte nás</h3>
                        <p className="text-gray-300">Máte otázky? Radi vám pomôžeme</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="text-[#c2a4df] text-2xl">📱</span>
                      <div>
                        <h3 className="font-semibold text-white text-lg">Sledujte nás</h3>
                        <p className="text-gray-300">Buďte v kontakte cez sociálne siete</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/appointment" className="btn btn-primary btn-lg">
                  Rezervovať termín
                </Link>
                <Link href="/tattoo/portfolio" className="btn btn-secondary btn-lg">
                  Pozrieť portfólio
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
} 