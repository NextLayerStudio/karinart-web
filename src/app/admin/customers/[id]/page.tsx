'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface CustomerInvitee {
  id: string;
  fullName: string;
  email: string;
  emailVerified: boolean;
  isActive: boolean;
  createdAt: string;
}

interface ActivationRecord {
  id: string;
  amountSpent: number;
  inkCreditsAwarded: number;
  notes: string | null;
  createdAt: string;
  inviter: { id: string; fullName: string };
}

interface LoyaltyHistoryRecord {
  id: string;
  amountSpent: number;
  tiersUnlockedList: number[];
  tiersBefore: number;
  tiersAfter: number;
  redundantAmount: number;
  createdAt: string;
}

interface AdminCustomerData {
  customer: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    emailVerified: boolean;
    isActive: boolean;
    agreeMarketing: boolean;
    adminNotes: string | null;
    inkCredits: number;
    isVip: boolean;
    vipAwardedAt?: string | null;
    vipLastActivityAt?: string | null;
    vipExpiresAt?: string | null;
    daysUntilVipExpiry?: number | null;
    vipExpiryWarningSentAt?: string | null;
    loyaltyTier: number;
    loyaltyCardEnabled: boolean;
    loyaltyVipFromCard: boolean;
    birthday: string | null;
    createdAt: string;
    invitedBy: { id: string; fullName: string; email: string } | null;
    invitees: CustomerInvitee[];
  };
  joinUrl: string;
  activationHistory: ActivationRecord[];
  summerProgram: { phase: string; isActive: boolean; label: string };
  loyalty: {
    loyaltyTier: number;
    loyaltyCardEnabled: boolean;
    nextTier: { tier: number; threshold: number; title: string } | null;
    vipSlotsRemaining: number;
    vipSlotsMax: number;
    loyaltyCardSlotsRemaining: number;
    loyaltyCardSlotsMax: number;
    totalVipSlotsRemaining: number;
    totalVipSlotsMax: number;
    rewards: { tier: number; threshold: number; title: string; unlocked: boolean }[];
  } | null;
  loyaltyHistory: LoyaltyHistoryRecord[];
  inkCredits: { available: number; earned: number; spent: number } | null;
  inkCreditHistory: {
    id: string;
    amount: number;
    type: string;
    description: string | null;
    createdAt: string;
  }[];
}

export default function AdminCustomerManagePage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;

  const [data, setData] = useState<AdminCustomerData | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [amountSpent, setAmountSpent] = useState('');
  const [activationNotes, setActivationNotes] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [activationMessage, setActivationMessage] = useState('');
  const [loyaltyAmount, setLoyaltyAmount] = useState('');
  const [loyaltyNotes, setLoyaltyNotes] = useState('');
  const [isRecordingLoyalty, setIsRecordingLoyalty] = useState(false);
  const [loyaltyMessage, setLoyaltyMessage] = useState('');
  const [inkSpendAmount, setInkSpendAmount] = useState('');
  const [inkSpendNote, setInkSpendNote] = useState('');
  const [isSpendingInk, setIsSpendingInk] = useState(false);
  const [inkSpendMessage, setInkSpendMessage] = useState('');
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [modalStep, setModalStep] = useState<'loyalty-card' | 'amount'>('amount');
  const [modalAmount, setModalAmount] = useState('');
  const [modalNotes, setModalNotes] = useState('');
  const [isSubmittingModal, setIsSubmittingModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalError, setModalError] = useState('');
  const [isTogglingLoyaltyCard, setIsTogglingLoyaltyCard] = useState(false);
  const [loyaltyCardMessage, setLoyaltyCardMessage] = useState('');

  const loadCustomer = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/customers/${customerId}`);
      const result = await response.json();

      if (response.ok) {
        setData(result);
        setAdminNotes(result.customer.adminNotes || '');
        setIsActive(result.customer.isActive);
        setModalStep(
          result.customer.loyaltyCardEnabled ? 'amount' : 'loyalty-card'
        );
      } else if (response.status === 401) {
        router.push('/admin/login');
      } else {
        setError(result.error || 'Zákazníka sa nepodarilo načítať');
      }
    } catch {
      setError('Nastala chyba pri načítaní zákazníka');
    } finally {
      setIsLoading(false);
    }
  }, [customerId, router]);

  useEffect(() => {
    loadCustomer().then(() => setShowAppointmentModal(true));
  }, [loadCustomer]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');

    try {
      const response = await fetch(`/api/admin/customers/${customerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive, adminNotes }),
      });

      const result = await response.json();

      if (response.ok) {
        setSaveMessage('Zmeny boli uložené');
        await loadCustomer();
      } else {
        setError(result.error || 'Uloženie zlyhalo');
      }
    } catch {
      setError('Nastala chyba pri ukladaní');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRecordActivation = async () => {
    setIsRecording(true);
    setActivationMessage('');
    setError('');

    try {
      const response = await fetch(`/api/admin/customers/${customerId}/activation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountSpent: parseFloat(amountSpent),
          notes: activationNotes,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setActivationMessage(result.message);
        setAmountSpent('');
        setActivationNotes('');
        await loadCustomer();
      } else {
        setError(result.error || 'Záznam služby zlyhal');
      }
    } catch {
      setError('Nastala chyba pri zázname služby');
    } finally {
      setIsRecording(false);
    }
  };

  const handleRecordLoyalty = async () => {
    setIsRecordingLoyalty(true);
    setLoyaltyMessage('');
    setError('');

    try {
      const response = await fetch(`/api/admin/customers/${customerId}/loyalty`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountSpent: parseFloat(loyaltyAmount),
          notes: loyaltyNotes,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setLoyaltyMessage(result.message);
        setLoyaltyAmount('');
        setLoyaltyNotes('');
        await loadCustomer();
      } else {
        setError(result.error || 'Záznam vernostnej karty zlyhal');
      }
    } catch {
      setError('Nastala chyba pri zázname útraty');
    } finally {
      setIsRecordingLoyalty(false);
    }
  };

  const handleToggleLoyaltyCard = async () => {
    if (!data) return;

    setIsTogglingLoyaltyCard(true);
    setLoyaltyCardMessage('');
    setError('');

    const nextEnabled = !data.customer.loyaltyCardEnabled;

    if (nextEnabled && (data.loyalty?.loyaltyCardSlotsRemaining ?? 0) <= 0) {
      setError(
        `Všetky vernostné karty sú obsadené (${data.loyalty?.loyaltyCardSlotsMax ?? 20}/${data.loyalty?.loyaltyCardSlotsMax ?? 20})`
      );
      return;
    }

    try {
      const response = await fetch(`/api/admin/customers/${customerId}/loyalty-card`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loyaltyCardEnabled: nextEnabled }),
      });

      const result = await response.json();

      if (response.ok) {
        setLoyaltyCardMessage(result.message);
        await loadCustomer();
      } else {
        setError(result.error || 'Zmena vernostnej karty zlyhala');
      }
    } catch {
      setError('Nastala chyba pri zmene vernostnej karty');
    } finally {
      setIsTogglingLoyaltyCard(false);
    }
  };

  const handleAssignLoyaltyCardInModal = async () => {
    if (!data) return;

    const remaining = data.loyalty?.loyaltyCardSlotsRemaining ?? 0;
    if (remaining <= 0) {
      setModalError(
        `Všetky vernostné karty sú obsadené (${data.loyalty?.loyaltyCardSlotsMax ?? 20}/${data.loyalty?.loyaltyCardSlotsMax ?? 20})`
      );
      return;
    }

    setIsSubmittingModal(true);
    setModalError('');
    setModalMessage('');

    try {
      const response = await fetch(`/api/admin/customers/${customerId}/loyalty-card`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loyaltyCardEnabled: true }),
      });

      const result = await response.json();

      if (response.ok) {
        setModalMessage(result.message);
        await loadCustomer();
        setModalStep('amount');
      } else {
        setModalError(result.error || 'Pridelenie vernostnej karty zlyhalo');
      }
    } catch {
      setModalError('Nastala chyba pri pridelení vernostnej karty');
    } finally {
      setIsSubmittingModal(false);
    }
  };

  const handleSkipLoyaltyCardInModal = () => {
    setModalError('');
    setModalMessage('');
    setModalStep('amount');
  };

  const closeAppointmentModal = () => {
    setShowAppointmentModal(false);
    setModalStep('amount');
    setModalAmount('');
    setModalNotes('');
    setModalError('');
    setModalMessage('');
  };

  const handleRecordAppointment = async () => {
    setIsSubmittingModal(true);
    setModalMessage('');
    setModalError('');

    const amount = parseFloat(modalAmount);
    if (!modalAmount || Number.isNaN(amount) || amount <= 0) {
      setModalError('Zadaj platnú sumu útraty');
      setIsSubmittingModal(false);
      return;
    }

    const messages: string[] = [];
    const warnings: string[] = [];

    try {
      if (data && data.customer.loyaltyCardEnabled && data.customer.loyaltyTier < 10) {
        const loyaltyResponse = await fetch(`/api/admin/customers/${customerId}/loyalty`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amountSpent: amount,
            notes: modalNotes,
          }),
        });
        const loyaltyResult = await loyaltyResponse.json();

        if (loyaltyResponse.ok) {
          messages.push(loyaltyResult.message);
        } else if (!loyaltyResult.error?.includes('najvyššiu')) {
          warnings.push(`Vernostná karta: ${loyaltyResult.error}`);
        }
      }

      if (data?.customer.invitedBy) {
        const activationResponse = await fetch(
          `/api/admin/customers/${customerId}/activation`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              amountSpent: amount,
              notes: modalNotes,
            }),
          }
        );
        const activationResult = await activationResponse.json();

        if (activationResponse.ok) {
          messages.push(activationResult.message);
        } else {
          warnings.push(`Ink program: ${activationResult.error}`);
        }
      }

      if (data?.customer.isVip) {
        const vipVisitResponse = await fetch(
          `/api/admin/customers/${customerId}/vip-visit`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              amountSpent: amount,
              notes: modalNotes,
            }),
          }
        );
        const vipVisitResult = await vipVisitResponse.json();

        if (vipVisitResponse.ok) {
          messages.push(vipVisitResult.message);
        } else {
          warnings.push(`VIP: ${vipVisitResult.error}`);
        }
      }

      if (messages.length === 0 && warnings.length === 0) {
        setModalMessage(
          'Útrata nebola zaznamenaná — zákazník nemá pridelenú vernostnú kartu, nemá pozývateľa a nie je VIP.'
        );
      } else if (messages.length === 0) {
        setModalError(warnings.join(' '));
      } else {
        const combined = [...messages, ...warnings].join(' ');
        setModalMessage(combined);
      }

      setModalAmount('');
      setModalNotes('');
      await loadCustomer();
      setTimeout(() => closeAppointmentModal(), 1200);
    } catch {
      setModalError('Nastala chyba pri zázname útraty');
    } finally {
      setIsSubmittingModal(false);
    }
  };

  const handleSpendInkCredits = async () => {
    setIsSpendingInk(true);
    setInkSpendMessage('');
    setError('');

    try {
      const response = await fetch(`/api/admin/customers/${customerId}/ink-credits/spend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseInt(inkSpendAmount, 10),
          description: inkSpendNote,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setInkSpendMessage(result.message);
        setInkSpendAmount('');
        setInkSpendNote('');
        await loadCustomer();
      } else {
        setError(result.error || 'Odpočítanie kreditov zlyhalo');
      }
    } catch {
      setError('Nastala chyba pri odpočítaní kreditov');
    } finally {
      setIsSpendingInk(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-2 border-[#c2a4df]/30 border-t-[#c2a4df] rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-red-400 mb-4">{error || 'Zákazník nebol nájdený'}</p>
        <Link href="/admin/portfolio" className="text-[#c2a4df] hover:text-white underline">
          Späť do adminu
        </Link>
      </div>
    );
  }

  const { customer, activationHistory, summerProgram, loyalty, loyaltyHistory, inkCredits, inkCreditHistory } = data;
  const loyaltyCardSlotsRemaining = loyalty?.loyaltyCardSlotsRemaining ?? 0;
  const loyaltyCardSlotsMax = loyalty?.loyaltyCardSlotsMax ?? 20;
  const canAssignLoyaltyCard = loyaltyCardSlotsRemaining > 0;
  const canRecordSpending =
    Boolean(customer.invitedBy) ||
    (customer.loyaltyCardEnabled && customer.loyaltyTier < 10);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 relative">
      {showAppointmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#111] border border-[#c2a4df]/30 rounded-xl p-6 md:p-8 shadow-2xl">
            {modalStep === 'loyalty-card' ? (
              <>
                <h2 className="text-xl font-semibold text-[#c2a4df] mb-2">
                  Prideliť vernostnú kartu?
                </h2>
                <p className="text-white/70 text-sm mb-4">
                  Zákazník{' '}
                  <span className="text-white font-medium">{customer.fullName}</span> zatiaľ nemá
                  pridelenú vernostnú kartu. Chceš mu ju prideliť pred záznamom útraty?
                </p>

                <div
                  className={`rounded-lg p-4 mb-6 border ${
                    canAssignLoyaltyCard
                      ? 'bg-[#c2a4df]/10 border-[#c2a4df]/30'
                      : 'bg-red-500/10 border-red-500/30'
                  }`}
                >
                  <p
                    className={`text-sm font-medium ${
                      canAssignLoyaltyCard ? 'text-[#c2a4df]' : 'text-red-300'
                    }`}
                  >
                    {canAssignLoyaltyCard
                      ? `Zostáva ${loyaltyCardSlotsRemaining} z ${loyaltyCardSlotsMax} vernostných kariet`
                      : `Všetky vernostné karty sú obsadené (${loyaltyCardSlotsMax}/${loyaltyCardSlotsMax})`}
                  </p>
                  {!canAssignLoyaltyCard && (
                    <p className="text-white/60 text-xs mt-2">
                      Ďalšiu kartu nie je možné prideliť. Môžeš pokračovať len so záznamom útraty
                      alebo ink programom.
                    </p>
                  )}
                </div>

                {modalError && <p className="text-red-400 text-sm mb-4">{modalError}</p>}
                {modalMessage && <p className="text-green-400 text-sm mb-4">{modalMessage}</p>}

                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={handleAssignLoyaltyCardInModal}
                    disabled={isSubmittingModal || !canAssignLoyaltyCard}
                    className="w-full bg-[#c2a4df] hover:bg-[#5a4e8a] text-black hover:text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmittingModal ? 'Pridelenie...' : 'Áno, prideliť vernostnú kartu'}
                  </button>
                  <button
                    type="button"
                    onClick={handleSkipLoyaltyCardInModal}
                    disabled={isSubmittingModal}
                    className="w-full border border-white/20 text-white/80 hover:text-white hover:border-white/40 py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Nie, pokračovať bez karty
                  </button>
                  <button
                    type="button"
                    onClick={closeAppointmentModal}
                    disabled={isSubmittingModal}
                    className="w-full text-white/50 hover:text-white/80 py-2 text-sm transition-colors"
                  >
                    Zatvoriť
                  </button>
                </div>
              </>
            ) : (
              <>
            <h2 className="text-xl font-semibold text-[#c2a4df] mb-2">
              Mal zákazník dnes termín?
            </h2>
            <p className="text-white/70 text-sm mb-6">
              Zaznamenaj sumu útraty za službu pre{' '}
              <span className="text-white font-medium">{customer.fullName}</span>.
              {customer.loyaltyCardEnabled && customer.loyaltyTier < 10 && (
                <> Aktualizuje sa vernostná karta.</>
              )}
              {customer.invitedBy && (
                <>
                  {' '}
                  {customer.loyaltyCardEnabled && customer.loyaltyTier < 10
                    ? 'Zároveň'
                    : 'Automaticky'}{' '}
                  sa aktivuje ink program pozývateľa{' '}
                  <span className="text-white font-medium">{customer.invitedBy.fullName}</span>
                  {' '}(+100 ink), aj bez vernostnej karty.
                </>
              )}
              {!customer.loyaltyCardEnabled && !customer.invitedBy && (
                <> Zákazník nemá vernostnú kartu ani pozývateľa — útrata sa neuloží.</>
              )}
            </p>

            <div className="space-y-4">
              <div>
                <label htmlFor="modalAmount" className="block text-white/50 text-sm mb-2">
                  Suma útraty (€)
                </label>
                <input
                  id="modalAmount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={modalAmount}
                  onChange={(e) => setModalAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-black/50 border border-[#c2a4df]/30 rounded-lg text-white focus:outline-none focus:border-[#c2a4df]"
                  placeholder="napr. 80"
                  autoFocus
                />
              </div>
              <div>
                <label htmlFor="modalNotes" className="block text-white/50 text-sm mb-2">
                  Poznámka (voliteľné)
                </label>
                <input
                  id="modalNotes"
                  type="text"
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  className="w-full px-4 py-3 bg-black/50 border border-[#c2a4df]/30 rounded-lg text-white focus:outline-none focus:border-[#c2a4df]"
                  placeholder="napr. tetovanie predlaktie"
                />
              </div>
            </div>

            {modalError && (
              <p className="text-red-400 text-sm mt-4">{modalError}</p>
            )}
            {modalMessage && (
              <p className="text-green-400 text-sm mt-4">{modalMessage}</p>
            )}

            <div className="flex flex-col-reverse sm:flex-row gap-3 mt-6">
              <button
                type="button"
                onClick={closeAppointmentModal}
                className="flex-1 border border-white/20 text-white/80 hover:text-white hover:border-white/40 py-3 px-4 rounded-lg transition-colors"
              >
                Zatvoriť
              </button>
              <button
                type="button"
                onClick={handleRecordAppointment}
                disabled={isSubmittingModal || !modalAmount || !canRecordSpending}
                className="flex-1 bg-[#c2a4df] hover:bg-[#5a4e8a] text-black hover:text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {isSubmittingModal ? 'Ukladám...' : 'Zaznamenať útratu'}
              </button>
              {!canRecordSpending && (
                <p className="text-white/50 text-xs text-center sm:col-span-2">
                  Bez vernostnej karty a bez pozývateľa nie je čo zaznamenať.
                </p>
              )}
            </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-[#c2a4df] text-sm uppercase tracking-wider mb-1">Správa zákazníka</p>
          <h1 className="text-3xl font-semibold text-white">{customer.fullName}</h1>
          <p className="text-white/60 text-sm mt-1">ID: {customer.id}</p>
        </div>
        <Link
          href="/admin/portfolio"
          className="text-[#c2a4df] hover:text-white transition-colors text-sm"
        >
          ← Späť do adminu
        </Link>
      </div>

      <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-[#c2a4df]">Profil zákazníka</h2>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-white/50">Email</p>
                <p className="text-white">{customer.email}</p>
              </div>
              <div>
                <p className="text-white/50">Telefón</p>
                <p className="text-white">{customer.phone}</p>
              </div>
              <div>
                <p className="text-white/50">Email overený</p>
                <p className={customer.emailVerified ? 'text-green-400' : 'text-yellow-400'}>
                  {customer.emailVerified ? 'Áno' : 'Nie'}
                </p>
              </div>
              <div>
                <p className="text-white/50">Marketing súhlas</p>
                <p className="text-white">{customer.agreeMarketing ? 'Áno' : 'Nie'}</p>
              </div>
              <div>
                <p className="text-white/50">Registrácia</p>
                <p className="text-white">
                  {new Date(customer.createdAt).toLocaleString('sk-SK')}
                </p>
              </div>
              {customer.invitedBy && (
                <div>
                  <p className="text-white/50">Pozval</p>
                  <Link
                    href={`/admin/customers/${customer.invitedBy.id}`}
                    className="text-[#c2a4df] hover:text-white underline"
                  >
                    {customer.invitedBy.fullName}
                  </Link>
                </div>
              )}
              <div>
                <p className="text-white/50">Ink kredity (dostupné)</p>
                <p className="text-[#c2a4df] font-semibold">{inkCredits?.available ?? customer.inkCredits}</p>
              </div>
              <div>
                <p className="text-white/50">Vernostná karta</p>
                <p className="text-[#c2a4df] font-semibold">
                  {customer.loyaltyCardEnabled
                    ? `Pridelená — úroveň ${customer.loyaltyTier} / 10`
                    : 'Nepridelená'}
                </p>
              </div>
              {customer.birthday && (
                <div>
                  <p className="text-white/50">Narodeniny</p>
                  <p className="text-white">
                    {new Date(customer.birthday).toLocaleDateString('sk-SK')}
                  </p>
                </div>
              )}
              {customer.isVip && (
                <>
                  <div>
                    <p className="text-white/50">Status</p>
                    <p className="text-[#c2a4df]">VIP</p>
                  </div>
                  {customer.vipLastActivityAt && (
                    <div>
                      <p className="text-white/50">Posledná návšteva</p>
                      <p className="text-white">
                        {new Date(customer.vipLastActivityAt).toLocaleDateString('sk-SK')}
                      </p>
                    </div>
                  )}
                  {customer.vipExpiresAt && (
                    <div>
                      <p className="text-white/50">VIP platnosť do</p>
                      <p className="text-white">
                        {new Date(customer.vipExpiresAt).toLocaleDateString('sk-SK')}
                        {customer.daysUntilVipExpiry != null && (
                          <span className="text-white/50 text-sm ml-2">
                            ({customer.daysUntilVipExpiry} dní)
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                  {customer.vipExpiryWarningSentAt && (
                    <div>
                      <p className="text-white/50">Upozornenie odoslané</p>
                      <p className="text-white/70 text-sm">
                        {new Date(customer.vipExpiryWarningSentAt).toLocaleDateString('sk-SK')}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {loyalty && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-[#c2a4df] mb-4">
                Vernostná karta — odmeny ({customer.loyaltyTier}/10)
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {loyalty.rewards.map((reward) => (
                  <div
                    key={reward.tier}
                    className={`p-3 rounded-lg border text-center ${
                      reward.unlocked
                        ? 'bg-[#c2a4df]/15 border-[#c2a4df]/50'
                        : 'bg-black/20 border-white/10 opacity-70'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 mx-auto mb-2 rounded-full flex items-center justify-center text-xs font-bold ${
                        reward.unlocked ? 'bg-[#c2a4df] text-black' : 'bg-white/10 text-white/40'
                      }`}
                    >
                      {reward.unlocked ? '✓' : reward.tier}
                    </div>
                    <p className="text-[10px] text-white/40">{reward.threshold} €</p>
                    <p className="text-white text-xs mt-1 leading-snug">{reward.title}</p>
                    <p className={`text-[10px] mt-1 ${reward.unlocked ? 'text-green-400' : 'text-white/30'}`}>
                      {reward.unlocked ? 'Získané' : 'Nezískané'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {inkCredits && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-semibold text-[#c2a4df]">Ink kredity</h2>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-black/30 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-[#c2a4df]">{inkCredits.available}</p>
                  <p className="text-white/50 text-xs mt-1">Dostupné</p>
                </div>
                <div className="bg-black/30 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-white">{inkCredits.earned}</p>
                  <p className="text-white/50 text-xs mt-1">Celkom získané</p>
                </div>
                <div className="bg-black/30 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-white/70">{inkCredits.spent}</p>
                  <p className="text-white/50 text-xs mt-1">Minuté</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="inkSpendAmount" className="block text-white/50 text-sm mb-2">
                    Odpočítať kredity *
                  </label>
                  <input
                    id="inkSpendAmount"
                    type="number"
                    min="1"
                    step="1"
                    value={inkSpendAmount}
                    onChange={(e) => setInkSpendAmount(e.target.value)}
                    className="w-full px-4 py-3 bg-black/50 border border-[#c2a4df]/30 rounded-lg text-white focus:outline-none focus:border-[#c2a4df]"
                    placeholder="napr. 100"
                  />
                </div>
                <div>
                  <label htmlFor="inkSpendNote" className="block text-white/50 text-sm mb-2">
                    Dôvod (voliteľné)
                  </label>
                  <input
                    id="inkSpendNote"
                    type="text"
                    value={inkSpendNote}
                    onChange={(e) => setInkSpendNote(e.target.value)}
                    className="w-full px-4 py-3 bg-black/50 border border-[#c2a4df]/30 rounded-lg text-white focus:outline-none focus:border-[#c2a4df]"
                    placeholder="napr. uplatnenie 10 € zľavy"
                  />
                </div>
              </div>

              <button
                onClick={handleSpendInkCredits}
                disabled={isSpendingInk || !inkSpendAmount || inkCredits.available <= 0}
                className="bg-[#c2a4df] hover:bg-[#5a4e8a] text-black hover:text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
              >
                {isSpendingInk ? 'Odpočítavam...' : 'Odpočítať ink kredity'}
              </button>

              {inkSpendMessage && <p className="text-green-400 text-sm">{inkSpendMessage}</p>}

              {inkCreditHistory.length > 0 && (
                <div className="pt-4 border-t border-white/10 space-y-2">
                  <h3 className="text-sm text-white/50">História ink kreditov</h3>
                  {inkCreditHistory.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex justify-between text-sm p-2 rounded bg-black/20 gap-4"
                    >
                      <span className={tx.amount > 0 ? 'text-green-400' : 'text-orange-300'}>
                        {tx.amount > 0 ? '+' : ''}
                        {tx.amount} ink
                        {tx.description && (
                          <span className="text-white/40"> — {tx.description}</span>
                        )}
                      </span>
                      <span className="text-white/40 text-xs whitespace-nowrap">
                        {new Date(tx.createdAt).toLocaleDateString('sk-SK')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-lg font-semibold text-[#c2a4df]">Vernostná karta — záznam útraty</h2>
              <span className="text-white/50 text-xs">
                Karty: {loyalty?.loyaltyCardSlotsRemaining ?? 0}/{loyalty?.loyaltyCardSlotsMax ?? 20} voľných
                {loyalty && ` · VIP (karta): ${loyalty.vipSlotsRemaining}/${loyalty.vipSlotsMax}`}
                {loyalty && ` · VIP celkom: ${loyalty.totalVipSlotsRemaining}/${loyalty.totalVipSlotsMax}`}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-lg bg-black/30 border border-white/10">
              <div>
                <p className="text-white font-medium">
                  {customer.loyaltyCardEnabled ? 'Karta pridelená' : 'Karta nepridelená'}
                </p>
                <p className="text-white/50 text-sm mt-1">
                  Vernostnú kartu môže mať max 20 zákazníkov — pridelíš ju manuálne.
                  {!customer.loyaltyCardEnabled && (
                    <> Zostáva {loyaltyCardSlotsRemaining} z {loyaltyCardSlotsMax}.</>
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={handleToggleLoyaltyCard}
                disabled={
                  isTogglingLoyaltyCard ||
                  (!customer.loyaltyCardEnabled && !canAssignLoyaltyCard)
                }
                className={`shrink-0 py-2.5 px-5 rounded-lg font-semibold transition-colors disabled:opacity-50 ${
                  customer.loyaltyCardEnabled
                    ? 'border border-red-400/50 text-red-300 hover:bg-red-400/10'
                    : 'bg-[#c2a4df] hover:bg-[#5a4e8a] text-black hover:text-white'
                }`}
              >
                {isTogglingLoyaltyCard
                  ? 'Ukladám...'
                  : customer.loyaltyCardEnabled
                    ? 'Odobrať kartu'
                    : 'Prideliť kartu'}
              </button>
            </div>
            {loyaltyCardMessage && <p className="text-green-400 text-sm">{loyaltyCardMessage}</p>}

            {!customer.loyaltyCardEnabled ? (
              <p className="text-white/60 text-sm">
                Najprv pridel vernostnú kartu — bez nej sa útrata na karte nedá zaznamenať.
              </p>
            ) : (
              <>
            <p className="text-white/60 text-sm">
              Suma sa neakumuluje — každá návšteva sa počíta samostatne. Úrovne 1–5: 50 €/úroveň,
              úrovne 6–10: 100 €/úroveň. Zvyšok sa stratí (napr. 60 € = 1× úroveň, 10 € prepadne).
            </p>

            {loyalty?.nextTier && customer.loyaltyTier < 10 && (
              <p className="text-[#c2a4df] text-sm">
                Ďalšia odmena: <strong>{loyalty.nextTier.title}</strong> — potrebných{' '}
                {loyalty.nextTier.threshold} € v jednej návšteve
              </p>
            )}

            {customer.loyaltyTier < 10 ? (
              <>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="loyaltyAmount" className="block text-white/50 text-sm mb-2">
                      Suma útraty (€) *
                    </label>
                    <input
                      id="loyaltyAmount"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={loyaltyAmount}
                      onChange={(e) => setLoyaltyAmount(e.target.value)}
                      className="w-full px-4 py-3 bg-black/50 border border-[#c2a4df]/30 rounded-lg text-white focus:outline-none focus:border-[#c2a4df]"
                      placeholder="napr. 110"
                    />
                  </div>
                  <div>
                    <label htmlFor="loyaltyNotes" className="block text-white/50 text-sm mb-2">
                      Poznámka (voliteľné)
                    </label>
                    <input
                      id="loyaltyNotes"
                      type="text"
                      value={loyaltyNotes}
                      onChange={(e) => setLoyaltyNotes(e.target.value)}
                      className="w-full px-4 py-3 bg-black/50 border border-[#c2a4df]/30 rounded-lg text-white focus:outline-none focus:border-[#c2a4df]"
                      placeholder="napr. tetovanie chrbát"
                    />
                  </div>
                </div>

                <button
                  onClick={handleRecordLoyalty}
                  disabled={isRecordingLoyalty || !loyaltyAmount}
                  className="bg-[#c2a4df] hover:bg-[#5a4e8a] text-black hover:text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isRecordingLoyalty ? 'Ukladám...' : 'Zaznamenať útratu na vernostnú kartu'}
                </button>
              </>
            ) : (
              <p className="text-green-400 text-sm">Zákazník má odomknutú najvyššiu úroveň karty.</p>
            )}

            {loyaltyMessage && <p className="text-green-400 text-sm">{loyaltyMessage}</p>}

            {loyaltyHistory.length > 0 && (
              <div className="pt-4 border-t border-white/10 space-y-2">
                <h3 className="text-sm text-white/50">História útraty (vernostná karta)</h3>
                {loyaltyHistory.map((record) => (
                  <div
                    key={record.id}
                    className="flex justify-between text-sm p-2 rounded bg-black/20 gap-4"
                  >
                    <span className="text-white/80">
                      {record.amountSpent} € → úrovne {record.tiersUnlockedList.join(', ') || '—'}
                      {record.redundantAmount > 0 && (
                        <span className="text-white/40">
                          {' '}
                          (prepadlo {record.redundantAmount} €)
                        </span>
                      )}
                    </span>
                    <span className="text-white/40 text-xs whitespace-nowrap">
                      {new Date(record.createdAt).toLocaleDateString('sk-SK')}
                    </span>
                  </div>
                ))}
              </div>
            )}
              </>
            )}
          </div>

          {customer.invitedBy && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold text-[#c2a4df]">Ink program — záznam služby</h2>
                <span className="text-white/50 text-xs">{summerProgram.label}</span>
              </div>
              <p className="text-white/60 text-sm">
                Zadaj sumu útraty za službu. Pozývateľ{' '}
                <Link
                  href={`/admin/customers/${customer.invitedBy.id}`}
                  className="text-[#c2a4df] underline"
                >
                  {customer.invitedBy.fullName}
                </Link>{' '}
                získa 100 ink kreditov (10 €).
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="amountSpent" className="block text-white/50 text-sm mb-2">
                    Suma útraty (€) *
                  </label>
                  <input
                    id="amountSpent"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={amountSpent}
                    onChange={(e) => setAmountSpent(e.target.value)}
                    className="w-full px-4 py-3 bg-black/50 border border-[#c2a4df]/30 rounded-lg text-white focus:outline-none focus:border-[#c2a4df]"
                    placeholder="napr. 80"
                  />
                </div>
                <div>
                  <label htmlFor="activationNotes" className="block text-white/50 text-sm mb-2">
                    Poznámka (voliteľné)
                  </label>
                  <input
                    id="activationNotes"
                    type="text"
                    value={activationNotes}
                    onChange={(e) => setActivationNotes(e.target.value)}
                    className="w-full px-4 py-3 bg-black/50 border border-[#c2a4df]/30 rounded-lg text-white focus:outline-none focus:border-[#c2a4df]"
                    placeholder="napr. tetovanie predlaktie"
                  />
                </div>
              </div>

              <button
                onClick={handleRecordActivation}
                disabled={isRecording || !amountSpent || !summerProgram.isActive}
                className="bg-[#c2a4df] hover:bg-[#5a4e8a] text-black hover:text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
              >
                {isRecording
                  ? 'Ukladám...'
                  : summerProgram.isActive
                    ? 'Zaznamenať službu (+100 ink)'
                    : 'Program nie je aktívny'}
              </button>

              {activationMessage && (
                <p className="text-green-400 text-sm">{activationMessage}</p>
              )}

              {activationHistory.length > 0 && (
                <div className="pt-4 border-t border-white/10 space-y-2">
                  <h3 className="text-sm text-white/50">História služieb (tento zákazník)</h3>
                  {activationHistory.map((record) => (
                    <div
                      key={record.id}
                      className="flex justify-between text-sm p-2 rounded bg-black/20"
                    >
                      <span className="text-white/80">
                        {record.amountSpent} € — pozývateľ: {record.inviter.fullName}
                        {record.notes && (
                          <span className="text-white/40"> ({record.notes})</span>
                        )}
                      </span>
                      <span className="text-[#c2a4df]">+{record.inkCreditsAwarded} ink</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {!customer.invitedBy && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-[#c2a4df] mb-2">Letný program</h2>
              <p className="text-white/60 text-sm">
                Tento zákazník nemá pozývateľa — pri zázname služby sa ink kredity neudelia.
              </p>
            </div>
          )}

          <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-[#c2a4df]">Správa účtu</h2>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded"
              />
              <span className="text-white text-sm">Účet je aktívny</span>
            </label>

            <div>
              <label htmlFor="adminNotes" className="block text-white/50 text-sm mb-2">
                Poznámky (len pre admina)
              </label>
              <textarea
                id="adminNotes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-black/50 border border-[#c2a4df]/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[#c2a4df]"
                placeholder="Interné poznámky o zákazníkovi..."
              />
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-[#c2a4df] hover:bg-[#5a4e8a] text-black hover:text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Ukladám...' : 'Uložiť zmeny'}
            </button>

            {saveMessage && <p className="text-green-400 text-sm">{saveMessage}</p>}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-[#c2a4df] mb-4">
              Pozvaní hostia ({customer.invitees.length})
            </h2>

            {customer.invitees.length === 0 ? (
              <p className="text-white/60 text-sm">Tento zákazník zatiaľ nikoho nepozval.</p>
            ) : (
              <div className="space-y-3">
                {customer.invitees.map((invitee) => (
                  <div
                    key={invitee.id}
                    className="flex items-center justify-between gap-4 p-3 rounded-lg bg-black/30 border border-white/10"
                  >
                    <div>
                      <Link
                        href={`/admin/customers/${invitee.id}`}
                        className="text-white font-medium hover:text-[#c2a4df]"
                      >
                        {invitee.fullName}
                      </Link>
                      <p className="text-white/50 text-sm">{invitee.email}</p>
                    </div>
                    <div className="text-right text-xs">
                      <p className={invitee.isActive ? 'text-green-400' : 'text-red-400'}>
                        {invitee.isActive ? 'Aktívny' : 'Neaktívny'}
                      </p>
                      <p className="text-white/40">
                        {new Date(invitee.createdAt).toLocaleDateString('sk-SK')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
      </div>
    </div>
  );
}
