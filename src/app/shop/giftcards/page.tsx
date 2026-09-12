import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Darčekové Poukážky - Karin Art Tetovanie Bratislava",
  description: "Darčekové poukážky na tetovanie v Karin Art štúdiu. Vyberte si z našich balíčkov alebo vytvorte vlastnú hodnotu. Ideálny darček pre milovníkov tetovaní.",
  keywords: "darčekové poukážky tetovanie, poukážka na tetovanie, darček tetovanie Bratislava, Karin Art poukážky",
};

const giftCardOptions = [
  {
    id: "30",
    amount: 30,
    title: "Malá Poukážka",
    description: "Ideálna pre malé tetovanie alebo príspevok na väčšie",
    color: "from-purple-500 to-pink-500",
    popular: false,
  },
  {
    id: "50",
    amount: 50,
    title: "Stredná Poukážka",
    description: "Perfektná pre stredne veľké tetovanie",
    color: "from-blue-500 to-purple-500",
    popular: true,
  },
  {
    id: "100",
    amount: 100,
    title: "Veľká Poukážka",
    description: "Pre komplexné a detailné tetovanie",
    color: "from-green-500 to-blue-500",
    popular: false,
  },
  {
    id: "custom",
    amount: 0,
    title: "Vlastná Hodnota",
    description: "Vyberte si vlastnú sumu podľa vašich možností",
    color: "from-gray-500 to-gray-700",
    popular: false,
  },
];

export default function GiftCardsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 pt-28 pb-12 md:pt-32">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-[#c2a4df] mb-6">
            Darčekové Poukážky
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Darujte jedinečný zážitok - darčekovú poukážku na profesionálne tetovanie v Karin Art štúdiu. 
            Vyberte si z našich balíčkov alebo vytvorte vlastnú hodnotu.
          </p>
        </div>

        {/* Gift Card Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {giftCardOptions.map((option) => (
            <Link
              key={option.id}
              href={`/shop/giftcards/${option.id}`}
              className="group relative"
            >
              <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${option.color} p-8 h-80 transition-transform duration-300 group-hover:scale-105`}>
                {option.popular && (
                  <div className="absolute top-4 right-4 bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-semibold">
                    Najpopulárnejšia
                  </div>
                )}
                
                <div className="h-full flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {option.title}
                    </h3>
                    <p className="text-white/90 text-sm mb-4">
                      {option.description}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    {option.id === "custom" ? (
                      <div className="text-3xl font-bold text-white">
                        Vlastná hodnota
                      </div>
                    ) : (
                      <div className="text-4xl font-bold text-white">
                        {option.amount}€
                      </div>
                    )}
                    <div className="text-white/80 text-sm mt-2">
                      {option.id === "custom" ? "Vyberte si sumu" : "Hodnota poukážky"}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-6 bg-black/20 rounded-xl border border-[#c2a4df]/20">
            <div className="w-16 h-16 bg-[#c2a4df] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-[#c2a4df] mb-2">
              Platnosť 1 rok
            </h3>
            <p className="text-white/70">
              Poukážka je platná 12 mesiacov od dátuma zakúpenia
            </p>
          </div>

          <div className="text-center p-6 bg-black/20 rounded-xl border border-[#c2a4df]/20">
            <div className="w-16 h-16 bg-[#c2a4df] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-[#c2a4df] mb-2">
              Profesionálna kvalita
            </h3>
            <p className="text-white/70">
              Garantujeme najvyššiu kvalitu tetovaní a sterilné prostredie
            </p>
          </div>

          <div className="text-center p-6 bg-black/20 rounded-xl border border-[#c2a4df]/20">
            <div className="w-16 h-16 bg-[#c2a4df] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-[#c2a4df] mb-2">
              Osobný darček
            </h3>
            <p className="text-white/70">
              Pridajte osobnú správu a urobte darček ešte špeciálnejším
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-[#c2a4df]/10 to-[#7568ad]/10 rounded-2xl p-12 border border-[#c2a4df]/20">
          <h2 className="text-3xl font-bold text-[#c2a4df] mb-4">
            Darujte jedinečný zážitok
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            Darčeková poukážka na tetovanie je perfektný darček pre každého, kto si váži umenie a jedinečnosť. 
            Vyberte si hodnotu a my sa postaráme o zvyšok.
          </p>
          <Link
            href="/shop/giftcards/custom"
            className="inline-flex items-center px-8 py-4 bg-[#c2a4df] hover:bg-[#7568ad] text-black font-semibold rounded-lg transition-colors duration-300"
          >
            Vytvoriť vlastnú poukážku
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </main>
    </div>
  );
} 