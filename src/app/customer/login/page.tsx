'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const inputClassName = 'input-field';

const highlights = [
  {
    label: 'Ink kredity',
    detail: 'Zbieraj a uplatni zľavy',
  },
  {
    label: 'Pozvánky',
    detail: 'QR kód a odkaz pre priateľov',
  },
  {
    label: 'VIP karta',
    detail: 'Výhody a podmienky',
  },
];

export default function CustomerLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/customer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/customer-program');
      } else {
        setError(data.error || 'Prihlásenie zlyhalo');
      }
    } catch {
      setError('Nastala chyba pri prihlásení');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-white overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-16 h-72 w-72 rounded-full bg-[#c2a4df]/20 blur-3xl" />
        <div className="absolute -bottom-20 -right-10 h-80 w-80 rounded-full bg-[#7568ad]/20 blur-3xl" />
      </div>

      <section className="relative w-full py-24 md:py-32 px-4">
        <div
          className="absolute inset-0 bg-no-repeat z-0 opacity-25"
          style={{
            backgroundImage: 'url(/images/studio.webp)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-black/80" />

        <div className="relative z-10 max-w-xl mx-auto">
          <div className="text-center mb-8 md:mb-10">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#c2a4df]/75 mb-3">
              Karin Art
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-amsterdam-four text-[#c2a4df] drop-shadow-lg mb-4">
              Zákaznícky portál
            </h1>
            <p className="text-white/75 text-sm md:text-base leading-relaxed max-w-md mx-auto">
              Prihlás sa a spravuj svoje ink kredity, pozvánky a QR kód pre priateľov.
            </p>
          </div>

          <div className="surface-card p-6 md:p-8 shadow-[0_12px_48px_rgba(0,0,0,0.45)]">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-white text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClassName}
                  placeholder="vas@email.sk"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-white text-sm font-medium mb-2">
                  Heslo
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClassName}
                  placeholder="Vaše heslo"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary btn-lg w-full"
              >
                {isLoading ? 'Prihlasujem...' : 'Prihlásiť sa'}
              </button>
            </form>

            <p className="mt-6 text-center text-white/60 text-sm">
              Ešte nemáš účet?{' '}
              <Link href="/register" className="text-[#c2a4df] hover:text-white underline">
                Zaregistruj sa
              </Link>
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {highlights.map((item) => (
              <Link
                key={item.label}
                href={item.label === 'VIP karta' ? '/program/vip' : item.label === 'Ink kredity' ? '/program/ink-kredity' : '/register'}
                className="rounded-xl border border-[#c2a4df]/20 bg-black/30 px-4 py-3 text-center hover:border-[#c2a4df]/40 transition-colors"
              >
                <p className="text-[#c2a4df] text-sm font-medium">{item.label}</p>
                <p className="text-white/50 text-xs mt-1">{item.detail}</p>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/tattoo"
              className="text-[#c2a4df]/80 hover:text-white transition-colors text-sm"
            >
              ← Späť na hlavnú stránku
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
