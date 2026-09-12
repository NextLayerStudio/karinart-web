'use client';

import { useState, useRef } from 'react';
import { createBeautyAppointment } from './actions';
import type { BeautyBookableService } from '@/app/lib/beautyServicesCatalog';
import { formatBeautyDuration, formatBeautyPrice } from '@/app/lib/beautyServicesCatalog';

interface BeautyAppointmentFormProps {
  service: BeautyBookableService;
  selectedDate: Date;
  selectedTime: string;
  onBack: () => void;
}

export default function BeautyAppointmentForm({
  service,
  selectedDate,
  selectedTime,
  onBack,
}: BeautyAppointmentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    notes: '',
    confirmAdult: false,
    agreePrivacy: false,
    agreeMarketing: true,
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const result = await createBeautyAppointment({
        ...formData,
        serviceId: service.id,
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
      });

      if (result.success) {
        setShowSuccess(true);
        formRef.current?.reset();
      } else {
        setError(result.error || 'Nastala chyba pri odosielaní rezervácie');
      }
    } catch {
      setError('Nastala chyba pri odosielaní rezervácie');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">✨</div>
        <h2 className="text-2xl font-bold text-[#c2a4df] mb-4">Rezervácia odoslaná!</h2>
        <p className="text-white/80 mb-6">
          Ďakujeme, {formData.fullName || 'vaša žiadosť'} bola prijatá. Karin vás bude čoskoro
          kontaktovať ohľadom potvrdenia termínu.
        </p>
        <p className="text-white/60 text-sm">
          {selectedDate.toLocaleDateString('sk-SK')} o {selectedTime} · {service.title}
        </p>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-xl border border-[#c2a4df]/20 bg-[#c2a4df]/5 p-4">
        <p className="text-[#c2a4df] text-sm uppercase tracking-wider mb-1">Vybraná služba</p>
        <p className="text-white font-semibold text-lg">{service.title}</p>
        <p className="text-white/70 text-sm mt-1">
          {formatBeautyPrice(service.priceEUR)} · {formatBeautyDuration(service.durationHours)}
        </p>
        <p className="text-white/60 text-sm mt-2">
          {selectedDate.toLocaleDateString('sk-SK', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}{' '}
          o {selectedTime}
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-white/80 text-sm mb-2">Meno a priezvisko *</label>
          <input
            type="text"
            required
            value={formData.fullName}
            onChange={(e) => handleInputChange('fullName', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white"
          />
        </div>
        <div>
          <label className="block text-white/80 text-sm mb-2">Email *</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-white/80 text-sm mb-2">Telefón</label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white"
        />
      </div>

      <div>
        <label className="block text-white/80 text-sm mb-2">Poznámka</label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          rows={3}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white resize-none"
          placeholder="Voliteľné — alergie, preferencie..."
        />
      </div>

      <div className="space-y-3">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.confirmAdult}
            onChange={(e) => handleInputChange('confirmAdult', e.target.checked)}
            className="mt-1"
            required
          />
          <span className="text-white/80 text-sm">Potvrdzujem, že mám viac ako 18 rokov *</span>
        </label>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.agreePrivacy}
            onChange={(e) => handleInputChange('agreePrivacy', e.target.checked)}
            className="mt-1"
            required
          />
          <span className="text-white/80 text-sm">
            Súhlasím so spracovaním osobných údajov podľa GDPR *
          </span>
        </label>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.agreeMarketing}
            onChange={(e) => handleInputChange('agreeMarketing', e.target.checked)}
            className="mt-1"
          />
          <span className="text-white/80 text-sm">Chcem dostávať novinky a akcie z Karin Art</span>
        </label>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="text-[#c2a4df] hover:text-white transition-colors px-4 py-2"
        >
          ← Späť na výber času
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-[#c2a4df] hover:bg-[#5a4e8a] text-black hover:text-white font-semibold px-8 py-3 rounded-lg transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Odosielam...' : 'Odoslať rezerváciu'}
        </button>
      </div>
    </form>
  );
}
