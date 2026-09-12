'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface LeaderboardEntry {
  rank: number;
  redactedName: string;
  inkCredits: number;
  discountValueEuros: number;
  activationCount: number;
  isVip: boolean;
}

interface LeaderboardData {
  programStatus: {
    phase: 'upcoming' | 'active' | 'ended';
    isActive: boolean;
    label: string;
  };
  entries: LeaderboardEntry[];
  program: {
    year: number;
    creditsPerActivation: number;
    discountPerActivationEuros: number;
    vipPrize: string;
  };
}

export default function SummerLeaderboardPage() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const response = await fetch('/api/program/summer-leaderboard');
        const result = await response.json();

        if (response.ok) {
          setData(result);
        } else {
          setError(result.error || 'Leaderboard sa nepodarilo načítať');
        }
      } catch {
        setError('Nastala chyba pri načítaní leaderboardu');
      } finally {
        setIsLoading(false);
      }
    };

    loadLeaderboard();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <section className="relative w-full py-20 md:py-28 px-4">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'url(/images/studio.webp)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-black/75" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-8">
          <div className="text-center">
            <p className="text-[#c2a4df] text-sm uppercase tracking-widest mb-2">
              Letný program {data?.program.year ?? 2026}
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-amsterdam-four text-[#c2a4df] mb-4">
              Ink Leaderboard
            </h1>
            <p className="text-white/75 text-sm md:text-base max-w-xl mx-auto">
              Pozvi priateľa — keď sa po termíne aktivuje predložením QR kódu, získaš{' '}
              <span className="text-[#c2a4df] font-semibold">100 ink kreditov</span> (10 € zľava).
              Za každého pozvaného len raz. Program je otvorený pre všetkých.
            </p>
            {data && (
              <p className="text-white/50 text-sm mt-3">{data.programStatus.label}</p>
            )}
          </div>

          <div className="bg-black/40 backdrop-blur-md border border-[#c2a4df]/20 rounded-lg p-6 md:p-8">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-10 h-10 border-2 border-[#c2a4df]/30 border-t-[#c2a4df] rounded-full animate-spin" />
              </div>
            ) : error ? (
              <p className="text-red-400 text-center">{error}</p>
            ) : data?.entries.length === 0 ? (
              <p className="text-white/60 text-center text-sm">
                Leaderboard je zatiaľ prázdny. Buď prvý, kto pozve priateľa a nech využije službu!
              </p>
            ) : (
              <div className="space-y-3">
                {data?.entries.map((entry) => (
                  <div
                    key={entry.rank}
                    className={`flex items-center justify-between gap-4 p-4 rounded-lg border ${
                      entry.rank === 1
                        ? 'bg-[#c2a4df]/10 border-[#c2a4df]/40'
                        : 'bg-black/30 border-[#c2a4df]/10'
                    }`}
                  >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <span
                        className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full text-sm font-bold ${
                          entry.rank === 1
                            ? 'bg-[#c2a4df] text-black'
                            : 'bg-white/10 text-white'
                        }`}
                      >
                        {entry.rank}
                      </span>
                      <div className="min-w-0">
                        <p className="text-white font-medium flex items-center gap-2 flex-wrap min-w-0">
                          <span className="truncate">{entry.redactedName}</span>
                          {entry.isVip && (
                            <span className="text-xs bg-[#c2a4df]/20 text-[#c2a4df] px-2 py-0.5 rounded-full">
                              VIP
                            </span>
                          )}
                        </p>
                        <p className="text-white/50 text-xs">
                          {entry.activationCount}{' '}
                          {entry.activationCount === 1 ? 'aktivácia' : 'aktivácií'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[#c2a4df] font-semibold whitespace-nowrap">{entry.inkCredits} ink</p>
                      <p className="text-white/50 text-xs whitespace-nowrap">{entry.discountValueEuros} € zľava</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="text-center space-y-3">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/program/ink-kredity"
                className="inline-block border border-[#c2a4df]/50 text-[#c2a4df] hover:bg-[#c2a4df]/10 font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Ako fungujú ink kredity
              </Link>
              <Link
                href="/customer/login"
                className="inline-block bg-[#c2a4df] hover:bg-[#5a4e8a] text-black hover:text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Zákaznícka zóna
              </Link>
            </div>
            <p className="text-white/40 text-xs">
              Mená sú kvôli súkromiu skryté a zobrazené len v skrátenej forme.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
