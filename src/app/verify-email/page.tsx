'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

type VerificationState = 'loading' | 'success' | 'error';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [state, setState] = useState<VerificationState>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setState('error');
      setMessage('Chýba overovací token. Skontrolujte odkaz v emaile.');
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(
          `/api/customer/verify-email?token=${encodeURIComponent(token)}`
        );
        const data = await response.json();

        if (response.ok) {
          setState('success');
          setMessage(
            data.message ||
              'Váš email bol úspešne overený. Vitajte v zákazníckom programe Karin Art!'
          );
        } else {
          setState('error');
          setMessage(data.error || 'Overenie emailu zlyhalo');
        }
      } catch {
        setState('error');
        setMessage('Nastala chyba pri overovaní emailu. Skúste to prosím znova.');
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="bg-black/40 backdrop-blur-md border border-[#c2a4df]/20 rounded-lg p-8 text-center space-y-6">
      {state === 'loading' && (
        <>
          <div className="w-12 h-12 mx-auto border-2 border-[#c2a4df]/30 border-t-[#c2a4df] rounded-full animate-spin" />
          <p className="text-white/80">Overujem vašu emailovú adresu...</p>
        </>
      )}

      {state === 'success' && (
        <>
          <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Email overený</h2>
            <p className="text-white/70 text-sm">{message}</p>
          </div>
          <Link
            href="/tattoo"
            className="btn btn-primary btn-md"
          >
            Prejsť na hlavnú stránku
          </Link>
        </>
      )}

      {state === 'error' && (
        <>
          <div className="w-16 h-16 mx-auto rounded-full bg-red-500/20 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Overenie zlyhalo</h2>
            <p className="text-white/70 text-sm">{message}</p>
          </div>
          <Link
            href="/register"
            className="btn btn-primary btn-md"
          >
            Skúsiť registráciu znova
          </Link>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <section className="relative w-full min-h-[70vh] flex items-center justify-center px-4 py-24">
        <div
          className="absolute inset-0 bg-no-repeat z-0 hero-banner-bg opacity-30"
          style={{
            backgroundImage: 'url(/images/studio.webp)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-black/70" />

        <div className="relative z-10 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-amsterdam-four text-[#c2a4df] drop-shadow-lg">
              Overenie emailu
            </h1>
          </div>

          <Suspense
            fallback={
              <div className="bg-black/40 backdrop-blur-md border border-[#c2a4df]/20 rounded-lg p-8 text-center">
                <div className="w-12 h-12 mx-auto border-2 border-[#c2a4df]/30 border-t-[#c2a4df] rounded-full animate-spin" />
              </div>
            }
          >
            <VerifyEmailContent />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
