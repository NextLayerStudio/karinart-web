'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  INK_PROGRAM_MODAL_STORAGE_KEY,
  INK_CREDITS_PER_ACTIVATION,
  INK_CREDIT_EURO_VALUE,
  inkProgramHighlights,
} from '@/app/lib/inkProgramContent';

export default function SummerInkPromoModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetch('/api/ink-program/status')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.enabled === false) {
          return;
        }

        try {
          const dismissed = localStorage.getItem(INK_PROGRAM_MODAL_STORAGE_KEY);
          if (!dismissed) {
            setIsOpen(true);
          }
        } catch {
          setIsOpen(true);
        }
      })
      .catch(() => {
        try {
          const dismissed = localStorage.getItem(INK_PROGRAM_MODAL_STORAGE_KEY);
          if (!dismissed) {
            setIsOpen(true);
          }
        } catch {
          setIsOpen(true);
        }
      });
  }, []);

  const handleDismiss = () => {
    try {
      localStorage.setItem(INK_PROGRAM_MODAL_STORAGE_KEY, '1');
    } catch {
      // ignore
    }
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div
        className="w-full max-w-lg max-h-[90vh] flex flex-col bg-[#0a0a0a] border border-[#c2a4df]/30 rounded-xl shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ink-promo-title"
      >
        <div className="shrink-0 px-6 pt-6 pb-5 border-b border-[#c2a4df]/15 bg-gradient-to-br from-[#c2a4df]/10 to-transparent">
          <p className="text-[#c2a4df] text-xs uppercase tracking-widest mb-2">Letná akcia</p>
          <h2
            id="ink-promo-title"
            className="text-2xl sm:text-[1.65rem] font-semibold text-[#c2a4df] leading-snug mb-3"
          >
            Ink program
          </h2>
          <p className="text-white/75 text-sm leading-relaxed">
            Zbieraj ink kredity, pozývaj priateľov a získavaj zľavy na tetovanie. Program je
            otvorený pre všetkých.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="bg-black/40 border border-[#c2a4df]/20 rounded-lg p-2.5 sm:p-3 text-center min-w-0">
              <p className="text-xl sm:text-2xl font-bold text-[#c2a4df] leading-none">
                {INK_CREDITS_PER_ACTIVATION}
              </p>
              <p className="text-white/50 text-[9px] sm:text-[10px] uppercase tracking-wide mt-1.5 leading-tight">
                ink / pozvaný
              </p>
            </div>
            <div className="bg-black/40 border border-[#c2a4df]/20 rounded-lg p-2.5 sm:p-3 text-center min-w-0">
              <p className="text-xl sm:text-2xl font-bold text-white leading-none">
                {INK_CREDIT_EURO_VALUE} €
              </p>
              <p className="text-white/50 text-[9px] sm:text-[10px] uppercase tracking-wide mt-1.5 leading-tight">
                hodnota
              </p>
            </div>
            <div className="bg-black/40 border border-[#c2a4df]/20 rounded-lg p-2.5 sm:p-3 text-center min-w-0">
              <p className="text-xl sm:text-2xl font-bold text-white leading-none">QR</p>
              <p className="text-white/50 text-[9px] sm:text-[10px] uppercase tracking-wide mt-1.5 leading-tight">
                po termíne
              </p>
            </div>
          </div>

          <ul className="space-y-3">
            {inkProgramHighlights.map((item) => (
              <li key={item.title} className="flex gap-3 text-sm leading-relaxed">
                <span className="text-[#c2a4df] shrink-0 mt-0.5">✦</span>
                <div className="min-w-0">
                  <p className="text-white font-semibold">{item.title}</p>
                  <p className="text-white/65 mt-0.5">{item.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="shrink-0 px-6 pb-6 pt-2 flex flex-col gap-3 border-t border-[#c2a4df]/10 bg-[#0a0a0a]">
          <Link
            href="/program/ink-kredity"
            onClick={handleDismiss}
            className="w-full text-center bg-[#c2a4df] hover:bg-[#5a4e8a] text-black hover:text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Ako to funguje — celý návod
          </Link>
          <button
            type="button"
            onClick={handleDismiss}
            className="w-full border border-white/20 text-white/80 hover:text-white hover:border-white/40 py-3 px-4 rounded-lg transition-colors"
          >
            Zavrieť
          </button>
        </div>
      </div>
    </div>
  );
}
