'use client';

import { useEffect, useState, useCallback } from 'react';
import { formatBeautyDuration, formatBeautyPrice } from '@/app/lib/beautyServicesCatalog';

interface Conflict {
  id: string;
  fullName: string;
  appointmentTime: string;
  duration: number;
  status: string;
  type?: string;
}

export interface BeautyAppointment {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  confirmAdult: boolean;
  agreePrivacy: boolean;
  agreeMarketing: boolean;
  serviceId: string;
  serviceTitle: string;
  servicePrice: number | null;
  durationHours: number;
  notes: string | null;
  appointmentDate: string;
  appointmentTime: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'rescheduled';
  createdAt: string;
}

interface BeautyAppointmentDetailModalProps {
  appointment: BeautyAppointment;
  onClose: () => void;
}

export default function BeautyAppointmentDetailModal({
  appointment,
  onClose,
}: BeautyAppointmentDetailModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [hasConflicts, setHasConflicts] = useState(false);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [isCheckingConflicts, setIsCheckingConflicts] = useState(false);

  const checkConflicts = useCallback(async () => {
    setIsCheckingConflicts(true);
    try {
      const response = await fetch(
        `/api/admin/beauty-appointments/${appointment.id}/check-conflicts`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }
      );
      if (response.ok) {
        const result = await response.json();
        setHasConflicts(result.hasConflicts);
        setConflicts(result.conflictingAppointments || []);
      }
    } catch (error) {
      console.error('Error checking conflicts:', error);
    } finally {
      setIsCheckingConflicts(false);
    }
  }, [appointment.id]);

  useEffect(() => {
    if (appointment.status === 'pending') {
      checkConflicts();
    }
  }, [appointment.status, checkConflicts]);

  const handleConfirm = async () => {
    if (hasConflicts) {
      alert('Tento termín sa prekrýva s existujúcimi termínmi.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/beauty-appointments/${appointment.id}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      });

      const result = await response.json();
      if (response.ok && result.success) {
        alert(
          `Beauty termín potvrdený! V kalendári sa rezervovalo ${formatBeautyDuration(appointment.durationHours)}.`
        );
        onClose();
        window.location.reload();
      } else if (result.conflicts) {
        alert(`Konflikt s: ${result.conflicts.map((c: Conflict) => c.fullName).join(', ')}`);
      } else {
        alert(result.error || 'Nepodarilo sa potvrdiť termín');
      }
    } catch (error) {
      console.error('Error confirming beauty appointment:', error);
      alert('Chyba pri potvrdzovaní');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!confirm('Naozaj chcete zamietnuť tento beauty termín?')) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/beauty-appointments/${appointment.id}/reject`, {
        method: 'POST',
      });
      if (response.ok) {
        alert('Termín zamietnutý');
        onClose();
        window.location.reload();
      }
    } catch (error) {
      console.error('Error rejecting beauty appointment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Naozaj chcete vymazať tento termín?')) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/beauty-appointments/${appointment.id}/delete`, {
        method: 'DELETE',
      });
      if (response.ok) {
        alert('Termín vymazaný');
        onClose();
        window.location.reload();
      }
    } catch (error) {
      console.error('Error deleting beauty appointment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statusLabel =
    appointment.status === 'confirmed'
      ? 'Potvrdený'
      : appointment.status === 'rejected'
        ? 'Zamietnutý'
        : 'Čaká na potvrdenie';

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#111] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-white/10 flex justify-between items-start gap-4">
          <div>
            <p className="text-[#c2a4df] text-xs uppercase tracking-wider mb-1">Beauty termín</p>
            <h2 className="text-xl font-semibold text-white">{appointment.fullName}</h2>
            <p className="text-white/60 text-sm mt-1">{statusLabel}</p>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white text-2xl leading-none">
            ×
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-white/50 text-sm">Služba</p>
              <p className="text-white font-medium">{appointment.serviceTitle}</p>
            </div>
            <div>
              <p className="text-white/50 text-sm">Cena / trvanie</p>
              <p className="text-white font-medium">
                {formatBeautyPrice(appointment.servicePrice)} ·{' '}
                {formatBeautyDuration(appointment.durationHours)}
              </p>
            </div>
            <div>
              <p className="text-white/50 text-sm">Dátum a čas</p>
              <p className="text-white font-medium">
                {new Date(appointment.appointmentDate).toLocaleDateString('sk-SK')}{' '}
                {appointment.appointmentTime}
              </p>
            </div>
            <div>
              <p className="text-white/50 text-sm">Email</p>
              <p className="text-white font-medium">{appointment.email}</p>
            </div>
            {appointment.phone && (
              <div>
                <p className="text-white/50 text-sm">Telefón</p>
                <p className="text-white font-medium">{appointment.phone}</p>
              </div>
            )}
          </div>

          {appointment.notes && (
            <div>
              <p className="text-white/50 text-sm">Poznámky</p>
              <p className="text-white/80">{appointment.notes}</p>
            </div>
          )}

          {appointment.status === 'pending' && (
            <div className="rounded-lg border border-white/10 p-4">
              <p className="text-white/70 text-sm mb-2">
                Po potvrdení sa v kalendári automaticky zablokuje{' '}
                <strong className="text-[#c2a4df]">
                  {formatBeautyDuration(appointment.durationHours)}
                </strong>
                .
              </p>
              {isCheckingConflicts ? (
                <p className="text-white/50 text-sm">Kontrolujem konflikty...</p>
              ) : hasConflicts ? (
                <div className="text-red-300 text-sm">
                  <p className="font-medium mb-1">Konflikt s existujúcimi termínmi:</p>
                  <ul className="list-disc pl-5">
                    {conflicts.map((conflict) => (
                      <li key={conflict.id}>
                        {conflict.fullName} ({conflict.appointmentTime} · {conflict.duration}h)
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-green-400 text-sm">Žiadne konflikty</p>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-white/10 flex flex-wrap gap-3 justify-end">
          {appointment.status === 'pending' && (
            <>
              <button
                onClick={handleReject}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg border border-red-500/40 text-red-300 hover:bg-red-500/10 disabled:opacity-50"
              >
                Zamietnuť
              </button>
              <button
                onClick={handleConfirm}
                disabled={isLoading || hasConflicts || isCheckingConflicts}
                className="px-4 py-2 rounded-lg bg-[#c2a4df] text-black font-semibold hover:bg-[#5a4e8a] hover:text-white disabled:opacity-50"
              >
                Potvrdiť ({formatBeautyDuration(appointment.durationHours)})
              </button>
            </>
          )}
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg border border-white/20 text-white/70 hover:text-white disabled:opacity-50"
          >
            Vymazať
          </button>
        </div>
      </div>
    </div>
  );
}
