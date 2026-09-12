'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { generateAllTimeSlots } from '@/app/lib/calendarUtils';

interface VoucherDetailsProps {
  voucherCode: string;
  voucherType: string | null;
}

function VoucherDetails({ voucherCode, voucherType }: VoucherDetailsProps) {
  const [voucherInfo, setVoucherInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVoucherDetails = async () => {
      try {
        const response = await fetch(`/api/admin/vouchers/${encodeURIComponent(voucherCode)}`);

        if (response.ok) {
          const data = await response.json();
          setVoucherInfo(data.voucher);
        } else {
          console.error('Failed to fetch voucher details');
        }
      } catch (error) {
        console.error('Error fetching voucher details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (voucherCode) {
      fetchVoucherDetails();
    }
  }, [voucherCode]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-white font-medium">{voucherCode}</span>
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          voucherType === 'discount' 
            ? 'bg-green-500/20 text-green-400' 
            : 'bg-purple-500/20 text-purple-400'
        }`}>
          {voucherType === 'discount' ? 'Zľavový kód' : 'Darčekový poukaz'}
        </span>
        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!voucherInfo) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-white font-medium">{voucherCode}</span>
        <span className="px-2 py-1 rounded text-xs font-medium bg-red-500/20 text-red-400">
          Neplatný kód
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-white font-medium">{voucherCode}</span>
      <span className={`px-2 py-1 rounded text-xs font-medium ${
        voucherType === 'discount' 
          ? 'bg-green-500/20 text-green-400' 
          : 'bg-purple-500/20 text-purple-400'
      }`}>
        {voucherType === 'discount' ? 'Zľavový kód' : 'Darčekový poukaz'}
      </span>
      <span className="text-white/80 text-sm">
        {voucherType === 'discount' 
          ? voucherInfo.type === 'percentage' 
            ? `${voucherInfo.value}% zľava`
            : `${voucherInfo.value}€ zľava`
          : `${voucherInfo.balance}€ hodnota`
        }
      </span>
    </div>
  );
}

interface Conflict {
  id: string;
  fullName: string;
  appointmentTime: string;
  duration: number;
  status: string;
}

interface Appointment {
  id: string;
  fullName: string;
  email: string;
  confirmAdult: boolean;
  placement: string;
  size: string;
  color: string;
  description: string;
  notes: string | null;
  contactPreferenceEmail: boolean;
  contactPreferenceInstagram: boolean;
  contactPreferencePhone: boolean;
  instagram: string | null;
  phone: string | null;
  agreeMarketing: boolean;
  agreePrivacy: boolean;
  allergies: boolean;
  allergyDescription: string | null;
  healthIssues: boolean;
  healthIssueDescription: string | null;
  voucherCode: string | null;
  voucherType: string | null;
  imageUrl: string | null;
  appointmentDate: string;
  appointmentTime: string;
  duration: number | null;
  status: 'pending' | 'confirmed' | 'rejected' | 'rescheduled';
  createdAt: string;
}

interface AppointmentDetailModalProps {
  appointment: Appointment;
  onClose: () => void;
}

export default function AppointmentDetailModal({
  appointment,
  onClose
}: AppointmentDetailModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [newDate, setNewDate] = useState(appointment.appointmentDate);
  const [newTime, setNewTime] = useState(appointment.appointmentTime);
  const [newDuration, setNewDuration] = useState(appointment.duration || 3);
  const [showRescheduleForm, setShowRescheduleForm] = useState(false);
  const [showDurationPopup, setShowDurationPopup] = useState(false);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [hasConflicts, setHasConflicts] = useState(false);
  const [isCheckingConflicts, setIsCheckingConflicts] = useState(false);

  const availableTimeSlots = generateAllTimeSlots();

  const checkConflicts = useCallback(async (duration: number) => {
    if (!duration || duration <= 0) {
      setHasConflicts(false);
      setConflicts([]);
      return;
    }

    setIsCheckingConflicts(true);
    try {
      const response = await fetch(`/api/admin/appointments/${appointment.id}/check-conflicts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ duration }),
      });

      if (response.ok) {
        const result = await response.json();
        setHasConflicts(result.hasConflicts);
        setConflicts(result.conflictingAppointments || []);
      } else {
        console.error('Error checking conflicts:', response.status);
        setHasConflicts(false);
        setConflicts([]);
      }
    } catch (error) {
      console.error('Error checking conflicts:', error);
      setHasConflicts(false);
      setConflicts([]);
    } finally {
      setIsCheckingConflicts(false);
    }
  }, [appointment.id]);

  // Check conflicts when duration changes
  useEffect(() => {
    if (newDuration && newDuration > 0) {
      checkConflicts(newDuration);
    }
  }, [newDuration, checkConflicts]);

  // Check conflicts when duration changes in popup
  useEffect(() => {
    if (showDurationPopup && newDuration && newDuration > 0) {
      checkConflicts(newDuration);
    }
  }, [showDurationPopup, newDuration, checkConflicts]);

  const handleConfirm = async () => {
    // Always show the duration popup first
    setShowDurationPopup(true);
  };

  const confirmAppointmentWithDuration = async () => {
    if (!newDuration || newDuration <= 0) {
      alert('Prosím nastavte trvanie termínu pred potvrdením.');
      return;
    }

    // Wait for any ongoing conflict check to complete
    if (isCheckingConflicts) {
      alert('Prosím počkajte, kontrolujem konflikty...');
      return;
    }

    // Re-check conflicts before confirming
    await checkConflicts(newDuration);

    if (hasConflicts) {
      alert('Tento termín sa prekrýva s existujúcimi termínmi. Nie je možné ho potvrdiť.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/appointments/${appointment.id}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          duration: newDuration
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          alert('Termín potvrdený! Bol vygenerovaný email s upozornením.');
          onClose();
          window.location.reload();
        } else {
          if (result.conflicts) {
            const conflictNames = result.conflicts.map((c: Conflict) => c.fullName).join(', ');
            alert(`Nie je možné potvrdiť termín - konflikt s: ${conflictNames}`);
          } else {
            alert('Failed to confirm appointment: ' + result.error);
          }
        }
      } else {
        const errorData = await response.json();
        if (errorData.conflicts) {
          const conflictNames = errorData.conflicts.map((c: Conflict) => c.fullName).join(', ');
          alert(`Nie je možné potvrdiť termín - konflikt s: ${conflictNames}`);
        } else {
          alert('Failed to confirm appointment');
        }
      }
    } catch (error) {
      console.error('Error confirming appointment:', error);
      alert('Error confirming appointment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReschedule = async () => {
    if (!showRescheduleForm) {
      setShowRescheduleForm(true);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/appointments/${appointment.id}/reschedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newDate,
          newTime,
          duration: newDuration
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          alert('Termín preplánovaný! Bol vygenerovaný email s upozornením.');
          onClose();
          window.location.reload();
        } else {
          alert('Nepodarilo sa preplánovať termín: ' + result.error);
        }
      } else {
        alert('Nepodarilo sa preplánovať termín');
      }
    } catch (error) {
      console.error('Chyba pri preplánovaní termínu:', error);
      alert('Chyba pri preplánovaní termínu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!confirm('Naozaj chcete zamietnuť tento termín?')) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/appointments/${appointment.id}/reject`, {
        method: 'POST',
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          alert('Termín zamietnutý');
          onClose();
          window.location.reload();
        } else {
          alert('Nepodarilo sa zamietnuť termín: ' + result.error);
        }
      } else {
        alert('Nepodarilo sa zamietnuť termín');
      }
    } catch (error) {
      console.error('Chyba pri zamietnutí termínu:', error);
      alert('Chyba pri zamietnutí termínu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Naozaj chcete vymazať tento termín? Táto akcia sa nedá vrátiť späť.')) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/appointments/${appointment.id}/delete`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          alert('Termín úspešne vymazaný');
          onClose();
          window.location.reload();
        } else {
          alert('Nepodarilo sa vymazať termín: ' + result.error);
        }
      } else {
        alert('Nepodarilo sa vymazať termín');
      }
    } catch (error) {
      console.error('Chyba pri mazaní termínu:', error);
      alert('Chyba pri mazaní termínu');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500/20 text-green-400';
      case 'rejected':
        return 'bg-red-500/20 text-red-400';
      case 'rescheduled':
        return 'bg-yellow-500/20 text-yellow-400';
      default:
        return 'bg-blue-500/20 text-blue-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sk-SK', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#0a0a0a] border border-[#c2a4df]/20 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#c2a4df]/20">
          <h2 className="text-2xl font-bold text-white">Detail Termínu</h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Client Information */}
          <div className="bg-black/20 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-[#c2a4df] mb-4">Informácie o klientovi</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-white/60 text-sm">Celé meno</p>
                <p className="text-white font-medium">{appointment.fullName}</p>
              </div>
              <div>
                <p className="text-white/60 text-sm">Email</p>
                <p className="text-white font-medium">{appointment.email}</p>
              </div>
               <div>
                <p className="text-white/60 text-sm">Potvrdenie dospelosti</p>
                <p className="text-white font-medium">{appointment.confirmAdult ? '✅ Potvrdené' : '❌ Nepotvrdené'}</p>
              </div>
                <div>
                <p className="text-white/60 text-sm">Status</p>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusClasses(appointment.status)}`}>
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </span>
              </div>
              {appointment.voucherCode && (
                <div className="md:col-span-2">
                  <p className="text-white/60 text-sm">Použitý voucher</p>
                  <VoucherDetails voucherCode={appointment.voucherCode} voucherType={appointment.voucherType} />
                </div>
              )}
            </div>
          </div>

          {/* Tattoo Details */}
          <div className="bg-black/20 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-[#c2a4df] mb-4">Detaily tetovania</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-white/60 text-sm">Umiestnenie</p>
                <p className="text-white font-medium">{appointment.placement}</p>
              </div>
              <div>
                <p className="text-white/60 text-sm">Veľkosť</p>
                <p className="text-white font-medium">{appointment.size}</p>
              </div>
              <div>
                <p className="text-white/60 text-sm">Farba</p>
                <p className="text-white font-medium">{appointment.color}</p>
              </div>
              <div>
                <p className="text-white/60 text-sm">Aktuálne trvanie</p>
                <p className="text-white font-medium">{appointment.duration || 3} hodín</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-white/60 text-sm">Popis</p>
              <p className="text-white">{appointment.description}</p>
            </div>
            {appointment.notes && (
              <div className="mt-4">
                <p className="text-white/60 text-sm">Ďalšie poznámky</p>
                <p className="text-white">{appointment.notes}</p>
              </div>
            )}
          </div>

          {/* Contact Preferences */}
          <div className="bg-black/20 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-[#c2a4df] mb-4">Preferencie kontaktu</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <span className={`w-3 h-3 rounded-full mr-3 ${appointment.contactPreferenceEmail ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                <span className="text-white">Email (vždy povolený)</span>
              </div>
              <div className="flex items-center">
                <span className={`w-3 h-3 rounded-full mr-3 ${appointment.contactPreferenceInstagram ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                <span className="text-white">Instagram</span>
                {appointment.contactPreferenceInstagram && appointment.instagram && (
                  <span className="text-white/60 ml-2">({appointment.instagram})</span>
                )}
              </div>
              <div className="flex items-center">
                <span className={`w-3 h-3 rounded-full mr-3 ${appointment.contactPreferencePhone ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                <span className="text-white">Telefón</span>
                {appointment.contactPreferencePhone && appointment.phone && (
                  <span className="text-white/60 ml-2">({appointment.phone})</span>
                )}
              </div>
            </div>
          </div>

          {/* Health Information */}
          {(appointment.allergies || appointment.healthIssues) && (
            <div className="bg-black/20 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-[#c2a4df] mb-4">Zdravotné informácie</h3>
              {appointment.allergies && (
                <div className="mb-2">
                  <p className="text-white/60 text-sm">Alergie</p>
                  <p className="text-white">{appointment.allergyDescription}</p>
                </div>
              )}
              {appointment.healthIssues && (
                <div>
                  <p className="text-white/60 text-sm">Zdravotné problémy</p>
                  <p className="text-white">{appointment.healthIssueDescription}</p>
                </div>
              )}
            </div>
          )}

          {/* Uploaded Image */}
          {appointment.imageUrl && (
            <div className="bg-black/20 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-[#c2a4df] mb-4">Nahraný referenčný obrázok</h3>
              <div className="relative">
                <Image
                  src={appointment.imageUrl}
                  alt="Referencia"
                  width={400}
                  height={400}
                  className="w-full max-w-md h-64 object-cover rounded-lg"
                />
              </div>
            </div>
          )}

          {/* Admin Actions */}
          <div className="bg-black/20 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-[#c2a4df] mb-4">Akcie administrátora</h3>
            
            {/* Current Appointment Info */}
            <div className="mb-4 p-3 bg-black/30 rounded-lg">
              <p className="text-white/60 text-sm">Aktuálny termín</p>
              <p className="text-white font-medium">{formatDate(appointment.appointmentDate)} o {formatTime(appointment.appointmentTime)}</p>
            </div>

           {/* Reschedule Form */}
           {showRescheduleForm && (
              <div className="mb-4 p-4 bg-black/30 rounded-lg">
                <h4 className="text-white font-medium mb-3">Preplánovať termín</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div>
                    <label className="block text-white/60 text-sm mb-1">Nový dátum</label>
                    <input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full px-3 py-2 bg-black/50 border border-[#c2a4df]/30 rounded-lg text-white focus:outline-none focus:border-[#c2a4df]"
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 text-sm mb-1">Nový čas</label>
                    <select
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="w-full px-3 py-2 bg-black/50 border border-[#c2a4df]/30 rounded-lg text-white focus:outline-none focus:border-[#c2a4df]"
                    >
                      {availableTimeSlots.map((time) => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-white/60 text-sm mb-1">Trvanie (hodiny) *</label>
                    <select
                      value={newDuration}
                      onChange={(e) => setNewDuration(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-black/50 border border-[#c2a4df]/30 rounded-lg text-white focus:outline-none focus:border-[#c2a4df]"
                      required
                    >
                      <option value={0.5}>0.5 hodiny (30 min)</option>
                      <option value={1}>1 hodina</option>
                      <option value={1.5}>1.5 hodiny</option>
                      <option value={2}>2 hodiny</option>
                      <option value={2.5}>2.5 hodiny</option>
                      <option value={3}>3 hodiny</option>
                      <option value={3.5}>3.5 hodiny</option>
                      <option value={4}>4 hodiny</option>
                      <option value={4.5}>4.5 hodiny</option>
                      <option value={5}>5 hodín</option>
                      <option value={5.5}>5.5 hodiny</option>
                      <option value={6}>6 hodín</option>
                      <option value={6.5}>6.5 hodiny</option>
                      <option value={7}>7 hodín</option>
                      <option value={7.5}>7.5 hodiny</option>
                      <option value={8}>8 hodín</option>
                    </select>
                    <p className="text-white/40 text-xs mt-1">* Povinné pre potvrdenie termínu</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              {appointment.status === 'pending' && (
                <button
                  onClick={handleConfirm}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Potvrdzujem...' : '✅ Potvrdiť termín'}
                </button>
              )}
              {appointment.status === 'confirmed' && (
                <button
                  onClick={handleReschedule}
                  disabled={isLoading}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Preplánovávam...' : showRescheduleForm ? '🕓 Potvrdiť preplánovanie' : '🔄 Preplánovať'}
                </button>
              )}
              {appointment.status === 'pending' && (
                 <button
                    onClick={handleReschedule}
                    disabled={isLoading}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                    {isLoading ? 'Preplánovávam...' : showRescheduleForm ? '🕓 Potvrdiť preplánovanie' : '🔄 Preplánovať'}
                </button>
              )}
              {appointment.status === 'pending' && (
                <button
                  onClick={handleReject}
                  disabled={isLoading}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Zamietam...' : '❌ Zamietnuť'}
                </button>
              )}
              {showRescheduleForm && (
                <button
                  onClick={() => setShowRescheduleForm(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Zrušiť
                </button>
              )}
               <button
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Mažem...' : '🗑️ Vymazať termín'}
              </button>
            </div>
          </div>
        </div>

      {/* Duration Popup Modal */}
      {showDurationPopup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-[#0a0a0a] border border-[#c2a4df]/20 rounded-lg max-w-md w-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#c2a4df]/20">
              <h3 className="text-xl font-bold text-white">Nastavte trvanie termínu</h3>
              <button
                onClick={() => setShowDurationPopup(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-white/80 mb-4">
                Pred potvrdením termínu musíte nastaviť jeho trvanie. Systém automaticky skontroluje konflikty s existujúcimi termínmi.
              </p>
              
              <div className="mb-6">
                <label className="block text-white/60 text-sm mb-2">Trvanie termínu *</label>
                <select
                  value={newDuration}
                  onChange={(e) => setNewDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-black/50 border border-[#c2a4df]/30 rounded-lg text-white focus:outline-none focus:border-[#c2a4df]"
                  required
                >
                  <option value={0.5}>0.5 hodiny (30 min)</option>
                  <option value={1}>1 hodina</option>
                  <option value={1.5}>1.5 hodiny</option>
                  <option value={2}>2 hodiny</option>
                  <option value={2.5}>2.5 hodiny</option>
                  <option value={3}>3 hodiny</option>
                  <option value={3.5}>3.5 hodiny</option>
                  <option value={4}>4 hodiny</option>
                  <option value={4.5}>4.5 hodiny</option>
                  <option value={5}>5 hodín</option>
                  <option value={5.5}>5.5 hodiny</option>
                  <option value={6}>6 hodín</option>
                  <option value={6.5}>6.5 hodiny</option>
                  <option value={7}>7 hodín</option>
                  <option value={7.5}>7.5 hodiny</option>
                  <option value={8}>8 hodín</option>
                </select>
              </div>

              {/* Current Appointment Info */}
              <div className="mb-4 p-3 bg-black/30 rounded-lg">
                <p className="text-white/60 text-sm">Termín</p>
                <p className="text-white font-medium">{formatDate(appointment.appointmentDate)} o {formatTime(appointment.appointmentTime)}</p>
                <p className="text-white/60 text-sm">Trvanie: {newDuration} hodín</p>
              </div>

              {/* Conflict Checking Indicator */}
              {isCheckingConflicts && (
                <div className="mb-4 p-3 bg-yellow-600/20 border border-yellow-600/40 rounded-lg">
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400 mr-2"></div>
                    <span className="text-yellow-400 text-sm">Kontrolujem konflikty...</span>
                  </div>
                </div>
              )}

              {/* Conflict Warning */}
              {hasConflicts && !isCheckingConflicts && (
                <div className="mb-4 p-3 bg-red-600/20 border border-red-600/40 rounded-lg">
                  <p className="text-red-400 text-sm font-medium mb-2">⚠️ Konflikt s existujúcimi termínmi</p>
                  <div className="space-y-1">
                    {conflicts.slice(0, 3).map((conflict) => (
                      <div key={conflict.id} className="text-red-300 text-xs">
                        • {conflict.fullName} ({conflict.appointmentTime} - {conflict.duration}h) - {conflict.status === 'confirmed' ? 'Potvrdený' : 'Čaká'}
                      </div>
                    ))}
                    {conflicts.length > 3 && (
                      <div className="text-red-300 text-xs">... a {conflicts.length - 3} ďalších</div>
                    )}
                  </div>
                  <p className="text-red-300 text-xs mt-2">
                    Nie je možné potvrdiť tento termín kým sa konflikty nevyriešia.
                  </p>
                </div>
              )}

              {/* Success Message */}
              {!hasConflicts && !isCheckingConflicts && newDuration && newDuration > 0 && (
                <div className="mb-4 p-3 bg-green-600/20 border border-green-600/40 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-green-400 text-lg mr-2">✅</span>
                    <span className="text-green-400 text-sm">Žiadne konflikty - termín je možné potvrdiť</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDurationPopup(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Zrušiť
                </button>
                <button
                  onClick={async () => {
                    if (newDuration && newDuration > 0) {
                      // Wait for any ongoing conflict check to complete
                      if (isCheckingConflicts) {
                        alert('Prosím počkajte, kontrolujem konflikty...');
                        return;
                      }
                      
                      // Re-check conflicts before confirming
                      await checkConflicts(newDuration);
                      
                      if (!hasConflicts) {
                        setShowDurationPopup(false);
                        confirmAppointmentWithDuration();
                      } else {
                        alert('Tento termín sa prekrýva s existujúcimi termínmi. Nie je možné ho potvrdiť.');
                      }
                    }
                  }}
                  disabled={!newDuration || newDuration <= 0 || hasConflicts || isCheckingConflicts}
                  className="px-4 py-2 bg-[#c2a4df] hover:bg-[#7568ad] text-black hover:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCheckingConflicts ? 'Kontrolujem konflikty...' : hasConflicts ? '❌ Konflikt - Nie je možné potvrdiť' : 'Potvrdiť termín'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
} 