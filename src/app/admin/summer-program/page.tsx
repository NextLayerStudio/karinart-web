'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface AdminLeaderboardEntry {
  rank: number;
  redactedName: string;
  inkCredits: number;
  activationCount: number;
  isVip: boolean;
}

export default function AdminSummerProgramPage() {
  const [entries, setEntries] = useState<AdminLeaderboardEntry[]>([]);
  const [programStatus, setProgramStatus] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAwarding, setIsAwarding] = useState(false);
  const [inkProgramEnabled, setInkProgramEnabled] = useState(true);
  const [isTogglingProgram, setIsTogglingProgram] = useState(false);

  const loadData = async () => {
    try {
      const response = await fetch('/api/program/summer-leaderboard');
      const result = await response.json();

      if (response.ok) {
        setEntries(result.entries);
        setProgramStatus(result.programStatus.label);
      } else {
        setError(result.error || 'Nepodarilo sa načítať program');
      }
    } catch {
      setError('Nastala chyba pri načítaní programu');
    } finally {
      setIsLoading(false);
    }
  };

  const loadInkProgramSetting = async () => {
    try {
      const response = await fetch('/api/admin/settings/ink-program');
      const result = await response.json();
      if (response.ok) {
        setInkProgramEnabled(result.enabled);
      }
    } catch {
      // ignore — toggle defaults to enabled
    }
  };

  useEffect(() => {
    loadData();
    loadInkProgramSetting();
  }, []);

  const handleToggleInkProgram = async () => {
    const nextEnabled = !inkProgramEnabled;
    const confirmMessage = nextEnabled
      ? 'Znova zapnúť ink program? Návštevníci opäť uvidia možnosť zapojiť sa.'
      : 'Vypnúť ink program? Návštevníci už nikde neuvidia možnosť zapojiť sa (existujúci účastníci budú fungovať ďalej).';

    if (!confirm(confirmMessage)) return;

    setIsTogglingProgram(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/admin/settings/ink-program', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: nextEnabled }),
      });
      const result = await response.json();

      if (response.ok) {
        setInkProgramEnabled(result.enabled);
        setMessage(
          result.enabled
            ? 'Ink program je znova zapnutý pre nových účastníkov.'
            : 'Ink program je vypnutý — návštevníci sa doň už nemôžu zapojiť.'
        );
        await loadData();
      } else {
        setError(result.error || 'Zmena sa nepodarila');
      }
    } catch {
      setError('Nastala chyba pri zmene stavu programu');
    } finally {
      setIsTogglingProgram(false);
    }
  };

  const handleAwardVip = async () => {
    if (!confirm('Udeliť VIP status aktuálnemu lídrovi leaderboardu?')) return;

    setIsAwarding(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/admin/program/summer/award-vip', {
        method: 'POST',
      });
      const result = await response.json();

      if (response.ok) {
        setMessage(result.message);
        await loadData();
      } else {
        setError(result.error || 'Udelenie VIP zlyhalo');
      }
    } catch {
      setError('Nastala chyba pri udeľovaní VIP');
    } finally {
      setIsAwarding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-2 border-[#c2a4df]/30 border-t-[#c2a4df] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-[#c2a4df] text-sm uppercase tracking-wider mb-1">Letný program 2026</p>
          <h1 className="text-3xl font-semibold text-white">Ink kredity & Leaderboard</h1>
          <p className="text-white/60 text-sm mt-1">{programStatus}</p>
        </div>
        <Link href="/admin/portfolio" className="text-[#c2a4df] hover:text-white text-sm">
          ← Späť do adminu
        </Link>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[#c2a4df]">Ink program pre návštevníkov</h2>
          <p className="text-white/60 text-sm mt-1">
            {inkProgramEnabled
              ? 'Zapnutý — návštevníci vidia možnosť zapojiť sa (nav menu, ponuka na hlavnej stránke, stránka programu).'
              : 'Vypnutý — možnosť zapojiť sa sa návštevníkom nikde nezobrazuje. Existujúci účastníci naďalej fungujú.'}
          </p>
        </div>
        <button
          onClick={handleToggleInkProgram}
          disabled={isTogglingProgram}
          className={`shrink-0 font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 ${
            inkProgramEnabled
              ? 'bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30'
              : 'bg-[#c2a4df] text-black hover:bg-[#5a4e8a] hover:text-white'
          }`}
        >
          {isTogglingProgram
            ? 'Ukladám...'
            : inkProgramEnabled
              ? 'Vypnúť ink program'
              : 'Zapnúť ink program'}
        </button>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-[#c2a4df]">Ako to funguje</h2>
        <ul className="text-white/70 text-sm space-y-2 list-disc list-inside">
          <li>Ink program beží nepretržite — bez obmedzenia počtu účastníkov</li>
          <li>Keď pozvaný zákazník využije službu, naskenuj jeho QR a zadaj sumu útraty</li>
          <li>Pozývateľ automaticky získa 100 ink kreditov (= 10 € zľava)</li>
          <li>Víťaz leaderboardu môže získať doživotný VIP status (max 25 VIP celkom, z toho 20 cez vernostnú kartu)</li>
        </ul>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-[#c2a4df] mb-4">Leaderboard (admin)</h2>

        {entries.length === 0 ? (
          <p className="text-white/60 text-sm">Zatiaľ žiadne aktivácie.</p>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <div
                key={entry.rank}
                className="flex items-center justify-between p-3 rounded-lg bg-black/30 border border-white/10"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[#c2a4df] font-bold w-6">#{entry.rank}</span>
                  <div>
                    <p className="text-white">
                      {entry.redactedName}
                      {entry.isVip && (
                        <span className="ml-2 text-xs text-[#c2a4df]">VIP</span>
                      )}
                    </p>
                    <p className="text-white/50 text-xs">{entry.activationCount} aktivácií</p>
                  </div>
                </div>
                <p className="text-[#c2a4df] font-semibold">{entry.inkCredits} ink</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-white/10">
          <button
            onClick={handleAwardVip}
            disabled={isAwarding || entries.length === 0}
            className="bg-[#c2a4df] hover:bg-[#5a4e8a] text-black hover:text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
          >
            {isAwarding ? 'Udeľujem VIP...' : 'Udeliť VIP status lídrovi'}
          </button>
          {message && <p className="text-green-400 text-sm mt-3">{message}</p>}
          {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
        </div>
      </div>

      <p className="text-white/40 text-xs text-center">
        Verejný leaderboard:{' '}
        <Link href="/program/summer-leaderboard" className="text-[#c2a4df] underline">
          /program/summer-leaderboard
        </Link>
      </p>
    </div>
  );
}
