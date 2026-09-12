'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import QRCode from 'react-qr-code';
import { formatLoyaltyVisitSpendHint } from '@/app/lib/loyaltyProgram';

interface Invitee {
  id: string;
  fullName: string;
  email: string;
  createdAt: string;
}

interface CustomerProgramData {
  customer: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    createdAt: string;
    inkCredits: number;
    inkCreditsEarned: number;
    inkCreditsSpent: number;
    isVip: boolean;
    isTestAccount: boolean;
    vipAwardedAt: string | null;
    vipLastActivityAt?: string | null;
    vipExpiresAt?: string | null;
    daysUntilVipExpiry?: number | null;
    loyaltyVipFromCard: boolean;
    invitedBy: { id: string; fullName: string } | null;
    invitees: Invitee[];
  };
  joinUrl: string;
  summerProgram: {
    programStatus: { phase: string; isActive: boolean; label: string };
    inkCredits: number;
    inkCreditsEarned: number;
    inkCreditsSpent: number;
    programInkCredits: number;
    discountValueEuros: number;
    earnedDiscountValueEuros: number;
    activationCount: number;
    rank: number | null;
    isVip: boolean;
    recentActivations: {
      id: string;
      amountSpent: number;
      inkCreditsAwarded: number;
      createdAt: string;
      inviteeName: string;
    }[];
  } | null;
  loyalty: {
    loyaltyTier: number;
    isVip: boolean;
    loyaltyVipFromCard: boolean;
    hasBirthday: boolean;
    nextTier: { tier: number; threshold: number; title: string; isVip?: boolean } | null;
    rewards: {
      tier: number;
      threshold: number;
      title: string;
      isVip: boolean;
      unlocked: boolean;
      isCurrent: boolean;
    }[];
    vipBenefits: string[];
    loyaltyCardEnabled: boolean;
  } | null;
}

function formatMemberSince(date: string | null, fallback: string): string {
  const value = date ? new Date(date) : new Date(fallback);
  return value.toLocaleDateString('sk-SK', { month: 'long', year: 'numeric' });
}

const cardClass = 'bg-black/40 backdrop-blur-md border border-[#c2a4df]/20 rounded-lg p-6 md:p-8';

export default function CustomerProgramPage() {
  const router = useRouter();
  const [data, setData] = useState<CustomerProgramData | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [qrSize, setQrSize] = useState(180);

  useEffect(() => {
    const updateQrSize = () => {
      setQrSize(Math.min(200, Math.max(140, window.innerWidth - 120)));
    };

    updateQrSize();
    window.addEventListener('resize', updateQrSize);
    return () => window.removeEventListener('resize', updateQrSize);
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch('/api/customer/me');
        const result = await response.json();

        if (response.ok) {
          setData(result);
        } else if (response.status === 401) {
          router.push('/customer/login');
        } else {
          setError(result.error || 'Nepodarilo sa načítať profil');
        }
      } catch {
        setError('Nastala chyba pri načítaní profilu');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await fetch('/api/customer/logout', { method: 'POST' });
    router.push('/customer/login');
  };

  const handleCopyReferralLink = async () => {
    if (!data?.joinUrl) return;

    try {
      await navigator.clipboard.writeText(data.joinUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      setLinkCopied(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-[#c2a4df]/30 border-t-[#c2a4df] rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Profil sa nepodarilo načítať'}</p>
          <Link href="/customer/login" className="text-[#c2a4df] hover:text-white underline">
            Späť na prihlásenie
          </Link>
        </div>
      </div>
    );
  }

  const { customer, joinUrl, summerProgram, loyalty } = data;
  const isVip = customer.isVip;
  const showLoyaltyCard =
    Boolean(loyalty?.loyaltyCardEnabled) && (!isVip || customer.isTestAccount);
  const tiersUntilVip =
    loyalty && loyalty.loyaltyTier < 10 ? 10 - loyalty.loyaltyTier : 0;
  const vipProgressLabel =
    tiersUntilVip === 1
      ? 'Posledná úroveň pred VIP'
      : tiersUntilVip > 1
        ? `${tiersUntilVip} úrovne do VIP`
        : null;
  const firstName = customer.fullName.trim().split(/\s+/)[0];
  const shortId = customer.id.slice(-8).toUpperCase();
  const vipBenefits = loyalty?.vipBenefits ?? [];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <section className="relative w-full py-20 md:py-28 px-4">
        <div
          className="absolute inset-0 bg-no-repeat z-0 opacity-30"
          style={{
            backgroundImage: 'url(/images/studio.webp)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-black/75" />

        <div className="relative z-10 max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            {isVip && (
              <p className="text-[#c2a4df]/70 text-xs uppercase tracking-[0.3em] mb-3">VIP Lounge</p>
            )}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-amsterdam-four text-[#c2a4df] mb-3 flex items-center justify-center gap-3 flex-wrap">
              Ahoj, {firstName}!
              {isVip && (
                <span className="text-sm bg-[#c2a4df] text-black px-3 py-1 rounded-full font-sans font-bold">
                  VIP
                </span>
              )}
            </h1>
            <p className="text-white/75 text-sm md:text-base">
              {isVip
                ? 'Tvoj exkluzívny zákaznícky profil u mňa'
                : 'Toto je tvoj zákaznícky profil u mňa'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 items-stretch">
            <div className={`${cardClass} flex flex-col h-full`}>
              <h2 className="text-lg font-semibold text-[#c2a4df] mb-2">Tvoj QR kód</h2>
              <p className="text-white/70 text-sm leading-relaxed mb-4">
                Zdieľaj pozývací odkaz alebo nechaj priateľa naskenovať QR. Keď sa pozvaný po termíne
                aktivuje predložením svojho QR kódu, získaš 100 ink kreditov — iba raz za každého
                pozvaného.
              </p>

              <div className="flex justify-center mb-5">
                <div className="inline-block p-3 bg-white rounded-xl shadow-lg">
                  <QRCode value={joinUrl} size={qrSize} />
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyReferralLink}
                className="w-full border border-[#c2a4df]/40 text-[#c2a4df] hover:bg-[#c2a4df]/10 font-medium py-3 px-4 rounded-lg transition-colors"
              >
                {linkCopied ? 'Odkaz skopírovaný!' : 'Skopírovať pozývací odkaz'}
              </button>

              <p className="text-white/45 text-xs mt-4 leading-relaxed">
                Pozvaný musí po skončení termínu predložiť svoj QR kód zo zákazníckej zóny — bez toho
                sa neaktivuje.
              </p>
            </div>

            <div className={`${cardClass} flex flex-col h-full`}>
              <h2 className="text-lg font-semibold text-[#c2a4df] mb-4">Tvoje údaje</h2>

              <div className="flex-1 divide-y divide-white/10">
                <div className="flex items-center justify-between gap-4 py-3 first:pt-0">
                  <span className="text-white/50 text-sm shrink-0">Meno</span>
                  <span className="text-white text-sm text-right break-words">{customer.fullName}</span>
                </div>
                <div className="flex items-center justify-between gap-4 py-3">
                  <span className="text-white/50 text-sm shrink-0">Email</span>
                  <span className="text-white text-sm text-right break-all">{customer.email}</span>
                </div>
                <div className="flex items-center justify-between gap-4 py-3">
                  <span className="text-white/50 text-sm shrink-0">Telefón</span>
                  <span className="text-white text-sm text-right">{customer.phone}</span>
                </div>
                {customer.invitedBy && (
                  <div className="flex items-center justify-between gap-4 py-3">
                    <span className="text-white/50 text-sm shrink-0">Pozval(a) ťa</span>
                    <span className="text-white text-sm text-right">{customer.invitedBy.fullName}</span>
                  </div>
                )}
              </div>

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="mt-6 w-full border border-[#c2a4df]/40 text-[#c2a4df] hover:bg-[#c2a4df]/10 py-3 rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoggingOut ? 'Odhlasujem...' : 'Odhlásiť sa'}
              </button>
            </div>
          </div>

          {isVip && (
            <>
              <div className="relative max-w-lg mx-auto">
                <div className="absolute -inset-px bg-gradient-to-br from-[#c2a4df]/40 via-[#5a4e8a]/30 to-[#c2a4df]/20 rounded-xl blur-sm" />
                <div className={`relative ${cardClass} shadow-lg`}>
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                      <p className="text-[#c2a4df]/70 text-[10px] uppercase tracking-[0.25em] mb-1">
                        Karin
                      </p>
                      <p className="text-white text-xl font-semibold">{customer.fullName}</p>
                      <p className="text-white/45 text-sm mt-1">Exkluzívne VIP členstvo</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block bg-[#c2a4df] text-black text-xs font-bold px-3 py-1 rounded-full">
                        VIP
                      </span>
                      <p className="text-white/40 text-xs mt-2">
                        Člen od {formatMemberSince(customer.vipAwardedAt, customer.createdAt)}
                      </p>
                      {customer.vipExpiresAt && (
                        <p className="text-white/40 text-xs mt-1">
                          Platnosť do{' '}
                          {new Date(customer.vipExpiresAt).toLocaleDateString('sk-SK')}
                          {customer.daysUntilVipExpiry != null &&
                            customer.daysUntilVipExpiry <= 60 && (
                              <span className="text-[#c2a4df]">
                                {' '}
                                · {customer.daysUntilVipExpiry} dní
                              </span>
                            )}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-end justify-between gap-4 pt-5 border-t border-[#c2a4df]/20">
                    <div>
                      <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">
                        Doživotná zľava
                      </p>
                      <p className="text-3xl font-bold text-[#c2a4df]">10 %</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">
                        Členské ID
                      </p>
                      <p className="text-[#c2a4df] font-mono text-sm tracking-widest">KA-{shortId}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <Link
                  href="/appointment"
                  className="inline-flex items-center gap-2 bg-[#c2a4df] hover:bg-[#5a4e8a] text-black hover:text-white font-semibold py-3 px-8 rounded-lg transition-colors"
                >
                  Rezervovať termín
                  <span>→</span>
                </Link>
              </div>

              <p className="text-center text-white/45 text-xs max-w-md mx-auto">
                VIP platnosť trvá 1 rok od poslednej návštevy u mňa. Každý zaznamenaný termín ju
                predĺži o ďalší rok.{' '}
                <Link href="/program/vip" className="text-[#c2a4df]/80 hover:text-[#c2a4df] underline">
                  Kompletné podmienky VIP programu →
                </Link>
              </p>

              {vipBenefits.length > 0 && (
                <div className={cardClass}>
                  <h2 className="text-xl font-semibold text-[#c2a4df] mb-4">Tvoje VIP výhody</h2>
                  <ul className="grid sm:grid-cols-2 gap-3">
                    {vipBenefits.map((benefit) => (
                      <li
                        key={benefit}
                        className="flex gap-2.5 p-3 rounded-lg bg-black/30 border border-[#c2a4df]/10"
                      >
                        <span className="text-[#c2a4df] shrink-0 text-sm leading-5">✦</span>
                        <span className="text-white/75 text-sm leading-5">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  {loyalty && !loyalty.hasBirthday && (
                    <p className="text-yellow-400/80 text-xs mt-4">
                      Pre tetovací set k narodeninám doplň dátum narodenia u mňa pri návšteve.
                    </p>
                  )}
                </div>
              )}

              <div className={`${cardClass} bg-gradient-to-br from-[#c2a4df]/10 to-[#5a4e8a]/5`}>
                <h2 className="text-xl font-semibold text-[#c2a4df] mb-2">VIP dizajny</h2>
                <p className="text-white/60 text-sm mb-5">
                  Ako VIP člen máš prístup k exkluzívnym dizajnom, ktoré nie sú verejne dostupné.
                  Pozri si voľné návrhy alebo sa mi ozvi priamo.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/volne-navrhy"
                    className="inline-flex items-center gap-2 bg-[#c2a4df]/15 border border-[#c2a4df]/30 text-[#c2a4df] hover:bg-[#c2a4df]/25 py-2.5 px-5 rounded-lg text-sm font-medium transition-colors"
                  >
                    Prezrieť voľné návrhy
                  </Link>
                  <Link
                    href="/tattoo/contact"
                    className="inline-flex items-center gap-2 border border-[#c2a4df]/30 text-white/70 hover:text-white hover:bg-[#c2a4df]/10 py-2.5 px-5 rounded-lg text-sm transition-colors"
                  >
                    Kontaktovať ma
                  </Link>
                </div>
              </div>
            </>
          )}

          {showLoyaltyCard && loyalty && (
            <div className={cardClass}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-[#c2a4df]">Vernostná karta</h2>
                  <p className="text-white/60 text-sm mt-1">
                    Úroveň {loyalty.loyaltyTier} z 10
                    {vipProgressLabel && (
                      <span className="text-[#c2a4df]/80"> · {vipProgressLabel}</span>
                    )}
                  </p>
                  <Link
                    href="/program/vip"
                    className="inline-block text-[#c2a4df]/80 hover:text-[#c2a4df] text-xs mt-2 underline"
                  >
                    VIP podmienky a limity →
                  </Link>
                </div>
                {loyalty.loyaltyTier >= 10 ? (
                  <div className="text-sm bg-[#c2a4df]/15 border border-[#c2a4df]/40 rounded-lg px-4 py-2">
                    <p className="text-white/50 text-xs">Vernostná karta</p>
                    <p className="text-[#c2a4df] font-medium">VIP status dosiahnutý</p>
                  </div>
                ) : (
                  loyalty.nextTier && (
                    <div className="text-sm bg-[#c2a4df]/10 border border-[#c2a4df]/30 rounded-lg px-4 py-2">
                      <p className="text-white/50 text-xs">
                        {loyalty.nextTier.isVip ? 'Ďalšia úroveň' : 'Ďalšia odmena'}
                      </p>
                      <p className="text-[#c2a4df] font-medium">
                        {loyalty.nextTier.isVip ? 'VIP status' : loyalty.nextTier.title}
                      </p>
                      <p className="text-white/60 text-xs mt-1">
                        {formatLoyaltyVisitSpendHint(loyalty.nextTier.threshold)}
                      </p>
                      {loyalty.nextTier.isVip && (
                        <p className="text-white/50 text-xs mt-1">
                          Exkluzívne členstvo cez vernostnú kartu
                        </p>
                      )}
                    </div>
                  )
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {loyalty.rewards.map((reward) => (
                  <div
                    key={reward.tier}
                    className={`relative p-4 rounded-lg border text-center transition-colors ${
                      reward.isVip
                        ? reward.unlocked
                          ? 'bg-[#c2a4df]/20 border-[#c2a4df]/60'
                          : reward.isCurrent
                            ? 'bg-[#c2a4df]/10 border-[#c2a4df]/50 ring-1 ring-[#c2a4df]/40'
                            : 'bg-black/30 border-[#c2a4df]/25'
                        : reward.unlocked
                          ? 'bg-[#c2a4df]/15 border-[#c2a4df]/50'
                          : reward.isCurrent
                            ? 'bg-black/40 border-[#c2a4df]/40 ring-1 ring-[#c2a4df]/30'
                            : 'bg-black/20 border-white/10 opacity-60'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center text-sm font-bold ${
                        reward.unlocked
                          ? 'bg-[#c2a4df] text-black'
                          : 'bg-white/10 text-white/50'
                      }`}
                    >
                      {reward.unlocked ? '✓' : reward.isVip ? 'VIP' : reward.tier}
                    </div>
                    <p className="text-white text-xs leading-snug">
                      {reward.isVip ? 'VIP status' : reward.title}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {summerProgram && (
            <div className="bg-gradient-to-br from-[#c2a4df]/15 to-[#5a4e8a]/10 border border-[#c2a4df]/30 rounded-lg p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-[#c2a4df]">Ink program</h2>
                  <p className="text-white/60 text-sm mt-1">{summerProgram.programStatus.label}</p>
                </div>
                <Link
                  href="/program/summer-leaderboard"
                  className="inline-block text-center border border-[#c2a4df]/50 text-[#c2a4df] hover:bg-[#c2a4df]/10 py-2 px-4 rounded-lg text-sm transition-colors"
                >
                  Leaderboard →
                </Link>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-black/30 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-[#c2a4df]">{summerProgram.inkCredits}</p>
                  <p className="text-white/50 text-xs mt-1">dostupné ink</p>
                  <p className="text-white/70 text-sm">{summerProgram.discountValueEuros} € zľava</p>
                </div>
                <div className="bg-black/30 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-white">{summerProgram.inkCreditsEarned}</p>
                  <p className="text-white/50 text-xs mt-1">celkom získané</p>
                  <p className="text-white/70 text-sm">{summerProgram.earnedDiscountValueEuros} €</p>
                </div>
                <div className="bg-black/30 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-white/70">{summerProgram.inkCreditsSpent}</p>
                  <p className="text-white/50 text-xs mt-1">minuté</p>
                </div>
                <div className="bg-black/30 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-white">
                    {summerProgram.rank ? `#${summerProgram.rank}` : '—'}
                  </p>
                  <p className="text-white/50 text-xs mt-1">poradie na leaderboarde</p>
                </div>
              </div>

              {summerProgram.recentActivations.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-[#c2a4df] mb-3">Nedávne aktivácie</h3>
                  <div className="space-y-2">
                    {summerProgram.recentActivations.map((activation) => (
                      <div
                        key={activation.id}
                        className="flex justify-between items-center gap-3 text-sm p-3 rounded-lg bg-black/20 border border-[#c2a4df]/10"
                      >
                        <span className="text-white/80 min-w-0 truncate">
                          {activation.inviteeName}
                        </span>
                        <span className="text-[#c2a4df] font-medium whitespace-nowrap">
                          +{activation.inkCreditsAwarded} ink
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className={cardClass}>
            <h2 className="text-lg font-semibold text-[#c2a4df] mb-4">
              Tvoji pozvaní ({customer.invitees.length})
            </h2>

            {customer.invitees.length === 0 ? (
              <p className="text-white/60 text-sm">
                Zatiaľ nemáš žiadnych pozvaných. Skopíruj pozývací odkaz alebo ukáž QR kód.
              </p>
            ) : (
              <div className="space-y-3">
                {customer.invitees.map((invitee) => (
                  <div
                    key={invitee.id}
                    className="flex items-center justify-between gap-4 p-3 rounded-lg bg-black/30 border border-[#c2a4df]/10"
                  >
                    <div className="min-w-0">
                      <p className="text-white font-medium truncate">{invitee.fullName}</p>
                      <p className="text-white/50 text-sm truncate">{invitee.email}</p>
                    </div>
                    <p className="text-white/40 text-xs whitespace-nowrap">
                      {new Date(invitee.createdAt).toLocaleDateString('sk-SK')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
