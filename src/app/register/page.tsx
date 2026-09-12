'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const inputClassName = 'input-field';
const REGISTER_DRAFT_KEY = 'karin-register-draft';

type RegisterFormData = {
  fullName: string;
  email: string;
  phone: string;
  birthday: string;
  password: string;
  confirmPassword: string;
  confirmAdult: boolean;
  agreeDataProcessing: boolean;
  agreeMarketing: boolean;
};

const emptyFormData: RegisterFormData = {
  fullName: '',
  email: '',
  phone: '',
  birthday: '',
  password: '',
  confirmPassword: '',
  confirmAdult: false,
  agreeDataProcessing: false,
  agreeMarketing: false,
};

function loadRegisterDraft(): RegisterFormData {
  if (typeof window === 'undefined') {
    return emptyFormData;
  }

  try {
    const saved = sessionStorage.getItem(REGISTER_DRAFT_KEY);
    if (!saved) {
      return emptyFormData;
    }

    const parsed = JSON.parse(saved) as Partial<RegisterFormData>;
    return {
      ...emptyFormData,
      ...parsed,
      password: '',
      confirmPassword: '',
    };
  } catch {
    return emptyFormData;
  }
}

function saveRegisterDraft(formData: RegisterFormData) {
  if (typeof window === 'undefined') {
    return;
  }

  const { password, confirmPassword, ...draft } = formData;
  sessionStorage.setItem(REGISTER_DRAFT_KEY, JSON.stringify(draft));
}

function clearRegisterDraft() {
  if (typeof window === 'undefined') {
    return;
  }

  sessionStorage.removeItem(REGISTER_DRAFT_KEY);
}

function RegisterForm() {
  const searchParams = useSearchParams();
  const inviteId = searchParams.get('invite');

  const [inviterName, setInviterName] = useState<string | null>(null);
  const [formData, setFormData] = useState<RegisterFormData>(emptyFormData);
  const [isDraftRestored, setIsDraftRestored] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    setFormData(loadRegisterDraft());
    setIsDraftRestored(true);
  }, []);

  useEffect(() => {
    if (!isDraftRestored) {
      return;
    }

    saveRegisterDraft(formData);
  }, [formData, isDraftRestored]);

  useEffect(() => {
    if (!inviteId) return;

    const loadInviter = async () => {
      try {
        const response = await fetch(`/api/customer/inviter/${inviteId}`);
        const data = await response.json();
        if (response.ok) {
          setInviterName(data.inviter.fullName);
        }
      } catch {
        // Invite banner is optional — registration still works without it
      }
    };

    loadInviter();
  }, [inviteId]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Heslá sa nezhodujú');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/customer/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          birthday: formData.birthday,
          password: formData.password,
          confirmAdult: formData.confirmAdult,
          agreeDataProcessing: formData.agreeDataProcessing,
          agreeMarketing: formData.agreeMarketing,
          invitedById: inviteId || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        clearRegisterDraft();
        setIsSuccess(true);
      } else {
        setError(data.error || 'Registrácia zlyhala');
      }
    } catch {
      setError('Nastala chyba pri registrácii. Skúste to prosím znova.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="surface-card p-6 md:p-8">
      {inviterName && !isSuccess && (
        <div className="mb-6 p-4 rounded-lg bg-[#c2a4df]/10 border border-[#c2a4df]/30 text-center">
          <p className="text-[#c2a4df] text-sm font-medium">
            {inviterName} ťa pozýva do zákazníckeho programu Karin Art
          </p>
        </div>
      )}

      {isSuccess ? (
        <div className="text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#c2a4df]/20 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-[#c2a4df]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Skontrolujte svoj email</h2>
            <p className="text-white/70 text-sm">
              Na adresu <span className="text-[#c2a4df]">{formData.email}</span> sme odoslali
              overovací odkaz. Kliknite naň pre dokončenie registrácie. Odkaz je platný 24 hodín.
            </p>
          </div>
          <Link
            href="/customer/login"
            className="btn btn-primary btn-md"
          >
            Prejsť na prihlásenie
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="fullName" className="block text-white text-sm font-medium mb-2">
              Meno a priezvisko *
            </label>
            <input
              type="text"
              id="fullName"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className={inputClassName}
              placeholder="Vaše meno a priezvisko"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-white text-sm font-medium mb-2">
              Email *
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={inputClassName}
              placeholder="vas@email.sk"
              required
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-white text-sm font-medium mb-2">
              Telefónne číslo *
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={inputClassName}
              placeholder="+421 900 000 000"
              required
            />
          </div>

          <div>
            <label htmlFor="birthday" className="block text-white text-sm font-medium mb-2">
              Dátum narodenia *
            </label>
            <input
              type="date"
              id="birthday"
              value={formData.birthday}
              onChange={(e) => handleInputChange('birthday', e.target.value)}
              className={inputClassName}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-white text-sm font-medium mb-2">
              Heslo *
            </label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={inputClassName}
              placeholder="Minimálne 8 znakov"
              minLength={8}
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-white text-sm font-medium mb-2">
              Potvrdenie hesla *
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className={inputClassName}
              placeholder="Zopakujte heslo"
              minLength={8}
              required
            />
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-semibold text-[#c2a4df] border-b border-[#c2a4df]/20 pb-2">
              Súhlas a dohody
            </h3>

            <div className="flex items-start gap-2">
              <input
                id="confirmAdult"
                type="checkbox"
                checked={formData.confirmAdult}
                onChange={(e) => handleInputChange('confirmAdult', e.target.checked)}
                className="mt-1"
                required
              />
              <label htmlFor="confirmAdult" className="text-white text-sm cursor-pointer">
                Potvrdzujem, že som starší ako 18 rokov *
              </label>
            </div>

            <div className="flex items-start gap-2">
              <input
                id="agreeDataProcessing"
                type="checkbox"
                checked={formData.agreeDataProcessing}
                onChange={(e) => handleInputChange('agreeDataProcessing', e.target.checked)}
                className="mt-1"
                required
              />
              <div className="text-white text-sm">
                <label htmlFor="agreeDataProcessing" className="cursor-pointer">
                  Súhlasím so spracovaním a uchovávaním mojich osobných údajov podľa{' '}
                </label>
                <Link
                  href="/gdpr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#c2a4df] hover:text-white underline"
                >
                  zásad ochrany osobných údajov
                </Link>
                <span> *</span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <input
                id="agreeMarketing"
                type="checkbox"
                checked={formData.agreeMarketing}
                onChange={(e) => handleInputChange('agreeMarketing', e.target.checked)}
                className="mt-1"
              />
              <label htmlFor="agreeMarketing" className="text-white text-sm cursor-pointer">
                Chcem dostávať marketingové ponuky a novinky
              </label>
            </div>
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
            {isLoading ? 'Registrujem...' : 'Vytvoriť profil'}
          </button>

          <p className="text-center text-white/60 text-sm">
            Už máš účet?{' '}
            <Link href="/customer/login" className="text-[#c2a4df] hover:text-white underline">
              Prihlás sa
            </Link>
          </p>
        </form>
      )}
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <section className="relative w-full py-24 md:py-32 px-4">
        <div
          className="absolute inset-0 bg-no-repeat z-0 hero-banner-bg opacity-30"
          style={{
            backgroundImage: 'url(/images/studio.webp)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-black/70" />

        <div className="relative z-10 max-w-xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-amsterdam-four text-[#c2a4df] drop-shadow-lg mb-4">
              Zákaznícky program
            </h1>
            <p className="text-white/80 text-sm md:text-base">
              Vytvor si profil a získaj prístup k výhodám u mňa.
            </p>
            <p className="text-white/50 text-xs mt-3">
              Zaujíma ťa VIP?{' '}
              <Link href="/program/vip" className="text-[#c2a4df] hover:text-white underline">
                Prečítaj si výhody a podmienky programu
              </Link>
            </p>
          </div>

          <Suspense
            fallback={
              <div className="bg-black/40 backdrop-blur-md border border-[#c2a4df]/20 rounded-lg p-8 text-center">
                <div className="w-10 h-10 mx-auto border-2 border-[#c2a4df]/30 border-t-[#c2a4df] rounded-full animate-spin" />
              </div>
            }
          >
            <RegisterForm />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
