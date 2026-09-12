'use client';

import { useState, useRef } from 'react';
import { createTattooAppointment } from './actions';
import imageCompression from 'browser-image-compression';
import { nanoid } from 'nanoid';

interface AppointmentFormProps {
  selectedDate: Date;
  selectedTime: string;
  onBack: () => void;
}

export default function AppointmentForm({ selectedDate, selectedTime, onBack }: AppointmentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    confirmAdult: false,
    placement: '',
    size: '',
    color: 'black', // Default to black
    description: '',
    references: [''],
    notes: '',
    contactPreferenceEmail: true, // Always true, not editable
    contactPreferenceInstagram: false,
    contactPreferencePhone: false,
    instagram: '',
    phone: '',
    agreeMarketing: true,
    agreePrivacy: false,
    allergies: false,
    allergyDescription: '',
    healthIssues: false,
    healthIssueDescription: '',
    voucherCode: ''
  });

  // Voucher validation state
  const [voucherValidation, setVoucherValidation] = useState<{
    isValid: boolean;
    message: string;
    type?: 'discount' | 'giftcard';
    details?: any;
  } | null>(null);

  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleReferenceChange = (index: number, value: string) => {
    const newReferences = [...formData.references];
    newReferences[index] = value;
    setFormData(prev => ({
      ...prev,
      references: newReferences
    }));
  };

  const addReference = () => {
    setFormData(prev => ({
      ...prev,
      references: [...prev.references, '']
    }));
  };

  const removeReference = (index: number) => {
    if (formData.references.length > 1) {
      const newReferences = formData.references.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        references: newReferences
      }));
    }
  };

  const validateVoucher = async (code: string) => {
    if (!code.trim()) {
      setVoucherValidation(null);
      return;
    }

    setIsValidatingVoucher(true);
    try {
      const response = await fetch('/api/voucher/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code: code.trim(), 
          email: formData.email,
          appointmentDate: selectedDate.toISOString()
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        let message = '';
        if (data.type === 'discount') {
          message = `Zľavový kód platný: ${data.voucher.type === 'percentage' ? `${data.voucher.value}% zľava` : `${data.voucher.value}€ zľava`}`;
        } else {
          message = `Darčekový poukaz platný: ${data.voucher.balance}€ zostatok`;
        }
        
        setVoucherValidation({
          isValid: true,
          message,
          type: data.type,
          details: data.voucher
        });
      } else {
        setVoucherValidation({
          isValid: false,
          message: data.error
        });
      }
    } catch (error) {
      setVoucherValidation({
        isValid: false,
        message: 'Nastala chyba pri validácii kódu'
      });
    } finally {
      setIsValidatingVoucher(false);
    }
  };

  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 10,
      maxWidthOrHeight: 4096,
      useWebWorker: true,
      fileType: 'image/webp',
      quality: 0.9,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      return new File([compressedFile], `${nanoid()}.webp`, { type: 'image/webp' });
    } catch (error) {
      console.error('Compression error:', error);
      throw error;
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      setUploadProgress(0);
      
      // Compress image to WebP format
      const compressedFile = await compressImage(file);
      
      const formData = new FormData();
      formData.append('files', compressedFile);
      
      const response = await fetch('/api/appointment/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const result = await response.json();
      if (result.success && result.uploaded && result.uploaded.length > 0) {
        setUploadedImageUrl(result.uploaded[0].imageUrl);
        setUploadProgress(100);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Nepodarilo sa nahrať obrázok. Prosím skúste to znova.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.confirmAdult || !formData.agreePrivacy) {
      alert('Prosím potvrďte, že ste starší ako 18 rokov a súhlasíte so zásadami ochrany osobných údajov.');
      return;
    }

    if (!formData.color) {
      alert('Prosím vyberte farbu tetovania (Čierna alebo Farebná).');
      return;
    }

    if (formData.allergies && !formData.allergyDescription.trim()) {
      alert('Prosím opíšte vaše alergie.');
      return;
    }

    if (formData.healthIssues && !formData.healthIssueDescription.trim()) {
      alert('Prosím opíšte váš zdravotný stav.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createTattooAppointment({
        ...formData,
        imageUrl: uploadedImageUrl,
        appointmentDate: selectedDate,
        appointmentTime: selectedTime
      });

      if (result.success) {
        setShowSuccess(true);
      } else {
        alert(result.error || 'Nepodarilo sa odoslať žiadosť o termín');
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Nepodarilo sa odoslať žiadosť o termín. Skúste to prosím znova.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="text-center">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-white mb-4">Žiadosť o termín odoslaná!</h2>
        <p className="text-white/80 mb-6">
          Vaša žiadosť o termín bola zaznamenaná. Karin vás bude kontaktovať čoskoro.
        </p>
        <button
          onClick={() => window.location.href = '/'}
          className="btn btn-secondary btn-md"
        >
          Späť na hlavnú stránku
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white">Detaily termínu</h2>
        <button
          onClick={onBack}
          className="text-[#c2a4df] hover:text-white transition-colors text-sm sm:text-base self-start sm:self-auto"
        >
          ← Späť na výber času
        </button>
      </div>

      <div className="mb-6 p-4 bg-[#c2a4df]/10 border border-[#c2a4df]/20 rounded-lg">
        <p className="text-white/80">
          <strong>Vybraný dátum:</strong> {selectedDate.toLocaleDateString('sk-SK', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
        <p className="text-white/80">
          <strong>Vybraný čas:</strong> {selectedTime}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Required Fields */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[#c2a4df] border-b border-[#c2a4df]/20 pb-2">
            Povinné informácie
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Celé meno *
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                className="input-field"
                placeholder="Vaše celé meno"
              />
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Emailová adresa *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="input-field"
                placeholder="vas.email@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Umiestnenie tetovania *
              </label>
              <input
                type="text"
                required
                value={formData.placement}
                onChange={(e) => handleInputChange('placement', e.target.value)}
                className="input-field"
                placeholder="napr. ľavé predlaktie, chrbát, členok"
              />
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Približná veľkosť *
              </label>
              <input
                type="text"
                required
                value={formData.size}
                onChange={(e) => handleInputChange('size', e.target.value)}
                className="input-field"
                placeholder="napr. 5cm x 3cm, veľkosť dlane"
              />
            </div>
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Farba tetovania *
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.color === 'black'}
                  onChange={(e) => handleInputChange('color', e.target.checked ? 'black' : '')}
                  className="mr-2"
                />
                <span className="text-white">Čierna</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.color === 'colored'}
                  onChange={(e) => handleInputChange('color', e.target.checked ? 'colored' : '')}
                  className="mr-2"
                />
                <span className="text-white">Farebná</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Detailný popis *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="input-field"
              placeholder="Opíšte váš nápad na tetovanie detailne..."
            />
          </div>
        </div>

        {/* Optional Fields */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[#c2a4df] border-b border-[#c2a4df]/20 pb-2">
            Voliteľné informácie
          </h3>

          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Referenčné obrázky (URL adresy)
            </label>
            {formData.references.map((ref, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="url"
                  value={ref}
                  onChange={(e) => handleReferenceChange(index, e.target.value)}
                  className="flex-1 min-w-0 px-4 py-3 bg-black/50 border border-[#c2a4df]/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[#c2a4df]"
                  placeholder="https://example.com/referencny-obrazok"
                />
                {formData.references.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeReference(index)}
                    className="px-3 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addReference}
              className="text-[#c2a4df] hover:text-white transition-colors text-sm"
            >
              + Pridať ďalšiu referenciu
            </button>
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Nahrať referenčný obrázok (voliteľné)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/heic,image/heif,image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleImageUpload(file);
                }
              }}
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative border-2 border-dashed border-[#c2a4df]/40 rounded-lg p-8 text-center cursor-pointer hover:border-[#c2a4df] hover:bg-[#c2a4df]/5 transition-all duration-200 group"
            >
              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 bg-[#c2a4df]/20 rounded-full flex items-center justify-center group-hover:bg-[#c2a4df]/30 transition-colors">
                  <svg className="w-6 h-6 text-[#c2a4df]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-medium">Kliknite pre výber súboru</p>
                  <p className="text-white/60 text-sm mt-1">alebo potiahnite súbor sem</p>
                </div>
                <p className="text-white/40 text-xs">
                  Podporované formáty: JPG, PNG, HEIC, HEIF, WebP (max. 10MB)
                </p>
              </div>
            </div>
            
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm text-white/60 mb-2">
                  <span>Nahrávanie...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-[#c2a4df] to-[#7568ad] h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            {uploadedImageUrl && (
              <div className="mt-4 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-green-400 font-medium">Obrázok úspešne nahraný</p>
                    <p className="text-green-400/60 text-sm">Obrázok bude priložený k vašej žiadosti</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Ďalšie poznámky
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              className="input-field"
              placeholder="Akékoľvek špeciálne požiadavky, poznámky alebo ďalšie informácie..."
            />
          </div>
        </div>

        {/* Contact Preferences */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[#c2a4df] border-b border-[#c2a4df]/20 pb-2">
            Preferencie kontaktu
          </h3>

          <div className="space-y-3">
            <div className="flex items-center text-white/60">
              <input
                type="checkbox"
                checked={true}
                disabled
                className="mr-2"
              />
              <span>Email (vždy povolený)</span>
            </div>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.contactPreferenceInstagram}
                onChange={(e) => handleInputChange('contactPreferenceInstagram', e.target.checked)}
                className="mr-2"
              />
              <span className="text-white">Instagram</span>
            </label>
            {formData.contactPreferenceInstagram && (
              <input
                type="text"
                value={formData.instagram}
                onChange={(e) => handleInputChange('instagram', e.target.value)}
                className="ml-6 w-full px-4 py-3 bg-black/50 border border-[#c2a4df]/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[#c2a4df]"
                placeholder="@vas_instagram_handle"
              />
            )}

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.contactPreferencePhone}
                onChange={(e) => handleInputChange('contactPreferencePhone', e.target.checked)}
                className="mr-2"
              />
              <span className="text-white">Telefón</span>
            </label>
            {formData.contactPreferencePhone && (
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="ml-6 w-full px-4 py-3 bg-black/50 border border-[#c2a4df]/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[#c2a4df]"
                placeholder="+421 XXX XXX XXX"
              />
            )}
          </div>
        </div>

        {/* Voucher Code */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[#c2a4df] border-b border-[#c2a4df]/20 pb-2">
            Zľavový kód alebo darčekový poukaz (voliteľné)
          </h3>

          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Kód
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                style={{ minWidth: 0 }}
                value={formData.voucherCode}
                onChange={(e) => {
                  handleInputChange('voucherCode', e.target.value);
                  if (e.target.value.trim()) {
                    validateVoucher(e.target.value);
                  } else {
                    setVoucherValidation(null);
                  }
                }}
                className="input-field"
                placeholder="Zadajte zľavový kód alebo darčekový poukaz"
              />
              {isValidatingVoucher && (
                <div className="px-3 py-3 bg-blue-600 text-white rounded-lg">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                </div>
              )}
            </div>
            {voucherValidation && (
              <div className={`mt-2 p-2 rounded text-sm ${
                voucherValidation.isValid 
                  ? 'bg-green-900/20 border border-green-500/30 text-green-400' 
                  : 'bg-red-900/20 border border-red-500/30 text-red-400'
              }`}>
                {voucherValidation.message}
              </div>
            )}
          </div>
        </div>

        {/* Health Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[#c2a4df] border-b border-[#c2a4df]/20 pb-2">
            Zdravotné informácie
          </h3>

          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.allergies}
                onChange={(e) => handleInputChange('allergies', e.target.checked)}
                className="mr-2"
              />
              <span className="text-white">Mám alergiu</span>
            </label>
            {formData.allergies && (
              <input
                type="text"
                required
                value={formData.allergyDescription}
                onChange={(e) => handleInputChange('allergyDescription', e.target.value)}
                className="ml-6 w-full px-4 py-3 bg-black/50 border border-[#c2a4df]/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[#c2a4df]"
                placeholder="Prosím opíšte vaše alergie..."
              />
            )}

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.healthIssues}
                onChange={(e) => handleInputChange('healthIssues', e.target.checked)}
                className="mr-2"
              />
              <span className="text-white">Mám zdravotný problém relevantný pre tetovanie</span>
            </label>
            {formData.healthIssues && (
              <input
                type="text"
                required
                value={formData.healthIssueDescription}
                onChange={(e) => handleInputChange('healthIssueDescription', e.target.value)}
                className="ml-6 w-full px-4 py-3 bg-black/50 border border-[#c2a4df]/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[#c2a4df]"
                placeholder="Prosím opíšte váš zdravotný stav..."
              />
            )}
          </div>
        </div>

        {/* Consent */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[#c2a4df] border-b border-[#c2a4df]/20 pb-2">
            Súhlas a dohody
          </h3>

          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                required
                checked={formData.confirmAdult}
                onChange={(e) => handleInputChange('confirmAdult', e.target.checked)}
                className="mr-2"
              />
              <span className="text-white">Potvrdzujem, že som starší ako 18 rokov *</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                required
                checked={formData.agreePrivacy}
                onChange={(e) => handleInputChange('agreePrivacy', e.target.checked)}
                className="mr-2"
              />
              <span className="text-white">Súhlasím so spracovaním mojich osobných údajov *</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.agreeMarketing}
                onChange={(e) => handleInputChange('agreeMarketing', e.target.checked)}
                className="mr-2"
              />
              <span className="text-white">Súhlasím so zasielaním marketingových komunikácií</span>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary btn-lg w-full"
          >
            {isSubmitting ? 'Odosielanie...' : 'Odoslať žiadosť o termín'}
          </button>
        </div>
      </form>
    </div>
  );
} 