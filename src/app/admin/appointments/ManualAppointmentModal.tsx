'use client';

import { useState } from 'react';
import { generateAllTimeSlots } from '@/app/lib/calendarUtils';

interface ManualAppointmentModalProps {
  onClose: () => void;
  onAppointmentCreated: () => void;
}

export default function ManualAppointmentModal({
  onClose,
  onAppointmentCreated
}: ManualAppointmentModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    instagram: '',
    appointmentDate: '',
    appointmentTime: '',
    duration: 3,
    placement: '',
    size: '',
    color: 'black',
    description: '',
    notes: '',
    source: 'manual' // To track that this was manually created
  });

  const availableTimeSlots = generateAllTimeSlots();

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.appointmentDate || !formData.appointmentTime) {
      alert('Prosím vyplňte povinné polia (meno, dátum, čas).');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/appointments/manual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          alert('Termín úspešne vytvorený!');
          onAppointmentCreated();
          onClose();
        } else {
          alert('Chyba pri vytváraní termínu: ' + result.error);
        }
      } else {
        alert('Chyba pri vytváraní termínu');
      }
    } catch (error) {
      console.error('Error creating manual appointment:', error);
      alert('Chyba pri vytváraní termínu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#0a0a0a] border border-[#c2a4df]/20 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#c2a4df]/20">
          <h2 className="text-2xl font-bold text-white">Pridať manuálny termín</h2>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Client Information */}
          <div className="bg-black/20 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-[#c2a4df] mb-4">Informácie o klientovi</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/60 text-sm mb-1">Meno a priezvisko *</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="w-full px-3 py-2 bg-black/50 border border-[#c2a4df]/30 rounded-lg text-white focus:outline-none focus:border-[#c2a4df]"
                  required
                />
              </div>
              <div>
                <label className="block text-white/60 text-sm mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 bg-black/50 border border-[#c2a4df]/30 rounded-lg text-white focus:outline-none focus:border-[#c2a4df]"
                />
              </div>
              <div>
                <label className="block text-white/60 text-sm mb-1">Telefón</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 bg-black/50 border border-[#c2a4df]/30 rounded-lg text-white focus:outline-none focus:border-[#c2a4df]"
                />
              </div>
              <div>
                <label className="block text-white/60 text-sm mb-1">Instagram</label>
                <input
                  type="text"
                  value={formData.instagram}
                  onChange={(e) => handleInputChange('instagram', e.target.value)}
                  className="w-full px-3 py-2 bg-black/50 border border-[#c2a4df]/30 rounded-lg text-white focus:outline-none focus:border-[#c2a4df]"
                />
              </div>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="bg-black/20 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-[#c2a4df] mb-4">Detaily termínu</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-white/60 text-sm mb-1">Dátum *</label>
                <input
                  type="date"
                  value={formData.appointmentDate}
                  onChange={(e) => handleInputChange('appointmentDate', e.target.value)}
                  className="w-full px-3 py-2 bg-black/50 border border-[#c2a4df]/30 rounded-lg text-white focus:outline-none focus:border-[#c2a4df]"
                  required
                />
              </div>
              <div>
                <label className="block text-white/60 text-sm mb-1">Čas *</label>
                <select
                  value={formData.appointmentTime}
                  onChange={(e) => handleInputChange('appointmentTime', e.target.value)}
                  className="w-full px-3 py-2 bg-black/50 border border-[#c2a4df]/30 rounded-lg text-white focus:outline-none focus:border-[#c2a4df]"
                  required
                >
                  <option value="">Vyberte čas</option>
                  {availableTimeSlots.map((time) => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-white/60 text-sm mb-1">Trvanie (hodiny)</label>
                <select
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-black/50 border border-[#c2a4df]/30 rounded-lg text-white focus:outline-none focus:border-[#c2a4df]"
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
            </div>
          </div>

          {/* Tattoo Details */}
          <div className="bg-black/20 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-[#c2a4df] mb-4">Detaily tetovania</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-white/60 text-sm mb-1">Umiestnenie</label>
                <input
                  type="text"
                  value={formData.placement}
                  onChange={(e) => handleInputChange('placement', e.target.value)}
                  className="w-full px-3 py-2 bg-black/50 border border-[#c2a4df]/30 rounded-lg text-white focus:outline-none focus:border-[#c2a4df]"
                />
              </div>
              <div>
                <label className="block text-white/60 text-sm mb-1">Veľkosť</label>
                <input
                  type="text"
                  value={formData.size}
                  onChange={(e) => handleInputChange('size', e.target.value)}
                  className="w-full px-3 py-2 bg-black/50 border border-[#c2a4df]/30 rounded-lg text-white focus:outline-none focus:border-[#c2a4df]"
                />
              </div>
              <div>
                <label className="block text-white/60 text-sm mb-1">Farba</label>
                <select
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  className="w-full px-3 py-2 bg-black/50 border border-[#c2a4df]/30 rounded-lg text-white focus:outline-none focus:border-[#c2a4df]"
                >
                  <option value="black">Čierna</option>
                  <option value="colored">Farebné</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-white/60 text-sm mb-1">Popis</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-black/50 border border-[#c2a4df]/30 rounded-lg text-white focus:outline-none focus:border-[#c2a4df]"
                placeholder="Popis tetovania..."
              />
            </div>
            <div className="mt-4">
              <label className="block text-white/60 text-sm mb-1">Poznámky</label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 bg-black/50 border border-[#c2a4df]/30 rounded-lg text-white focus:outline-none focus:border-[#c2a4df]"
                placeholder="Dodatočné poznámky..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end p-6 border-t border-[#c2a4df]/20">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 mr-4 text-white/60 hover:text-white transition-colors"
              disabled={isLoading}
            >
              Zrušiť
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#c2a4df] hover:bg-[#7568ad] text-black hover:text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Vytváram...' : 'Vytvoriť termín'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 