'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import BeautyAppointmentForm from './BeautyAppointmentForm';
import type { BeautyBookableService } from '@/app/lib/beautyServicesCatalog';
import {
  formatBeautyDuration,
  formatBeautyPrice,
} from '@/app/lib/beautyServicesCatalog';
import {
  generateAllTimeSlots,
  getAvailableStartSlotsForDuration,
} from '@/app/lib/calendarUtils';

interface DayAvailability {
  date: string;
  isAvailable: boolean;
  timeSlots: string[];
}

const getAvailableDates = () => {
  const dates = [];
  const today = new Date();
  for (let i = 2; i <= 29; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date);
  }
  return dates;
};

function BeautyAppointmentContent() {
  const searchParams = useSearchParams();
  const preselectedServiceId = searchParams.get('service');

  const [currentStep, setCurrentStep] = useState<'service' | 'calendar' | 'time' | 'form'>(
    preselectedServiceId ? 'calendar' : 'service'
  );
  const [selectedServiceId, setSelectedServiceId] = useState(preselectedServiceId || '');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [availability, setAvailability] = useState<DayAvailability[]>([]);
  const [bookableServices, setBookableServices] = useState<BeautyBookableService[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const selectedService = bookableServices.find((service) => service.id === selectedServiceId);
  const availableDates = getAvailableDates();
  const firstAvailableDate = availableDates[0] ?? new Date();
  const startingDayOfWeek = (firstAvailableDate.getDay() + 6) % 7;
  const paddingDays = Array.from({ length: startingDayOfWeek });
  const allTimeSlots = generateAllTimeSlots();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const today = new Date();
        const startDate = new Date();
        startDate.setDate(today.getDate() + 2);
        const endDate = new Date();
        endDate.setDate(today.getDate() + 29);

        const [availabilityResponse, servicesResponse] = await Promise.all([
          fetch(
            `/api/calendar/availability?startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`
          ),
          fetch('/api/beauty/services'),
        ]);

        if (availabilityResponse.ok) {
          setAvailability(await availabilityResponse.json());
        }

        if (servicesResponse.ok) {
          const servicesResult = await servicesResponse.json();
          setBookableServices(servicesResult.services ?? []);
        }
      } catch (error) {
        console.error('Error fetching appointment data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const servicesByCategory = useMemo(() => {
    return {
      laminacia: bookableServices.filter((s) => s.categorySlug === 'laminacia'),
      'osetrenia-pleti': bookableServices.filter((s) => s.categorySlug === 'osetrenia-pleti'),
    };
  }, [bookableServices]);

  const isDateAvailable = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    const dayAvailability = availability.find((day) => day.date === dateString);
    if (!dayAvailability) {
      const dayOfWeek = date.getDay();
      return dayOfWeek !== 0 && dayOfWeek !== 6;
    }
    return dayAvailability.isAvailable && dayAvailability.timeSlots.length > 0;
  };

  const getAvailableTimesForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    const dayAvailability = availability.find((day) => day.date === dateString);
    let baseSlots: string[];

    if (!dayAvailability) {
      const dayOfWeek = date.getDay();
      baseSlots = dayOfWeek !== 0 && dayOfWeek !== 6 ? allTimeSlots : [];
    } else {
      baseSlots = dayAvailability.timeSlots;
    }

    if (!selectedService) {
      return baseSlots;
    }

    return getAvailableStartSlotsForDuration(baseSlots, selectedService.durationHours);
  };

  const handleServiceSelect = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setSelectedDate(null);
    setSelectedTime('');
    setCurrentStep('calendar');
  };

  const handleDateSelect = (date: Date) => {
    if (!isDateAvailable(date)) return;
    setSelectedDate(date);
    setCurrentStep('time');
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setCurrentStep('form');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <main className="pt-20 pb-12 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-white/60">Načítavam dostupnosť...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <main className="pt-28 sm:pt-32 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-[#c2a4df]/70 text-xs uppercase tracking-[0.3em] mb-3">
              Karin Beauty Sphere
            </p>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-amsterdam-four text-[#c2a4df] mb-4">
              Rezervácia beauty termínu
            </h1>
            <p className="text-white/80 text-sm sm:text-lg">
              Vyberte službu, dátum a čas — po potvrdení sa v kalendári rezervuje presné trvanie
              ošetrenia
            </p>
          </div>

          <div className="surface-card rounded-2xl p-4 sm:p-6 md:p-8">
            {currentStep === 'service' && (
              <div className="space-y-8">
                <h2 className="text-xl sm:text-2xl font-bold text-white text-center">
                  Vyberte službu
                </h2>

                {Object.entries(servicesByCategory).map(([categorySlug, services]) => (
                  <div key={categorySlug}>
                    <h3 className="text-[#c2a4df] text-sm uppercase tracking-wider mb-3">
                      {categorySlug === 'laminacia' ? 'Laminácia' : 'Ošetrenia pleti'}
                    </h3>
                    <div className="grid gap-3">
                      {services.map((service) => (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => handleServiceSelect(service.id)}
                          className="text-left rounded-xl border border-white/10 hover:border-[#c2a4df]/40 bg-white/5 hover:bg-[#c2a4df]/5 p-4 transition-colors"
                        >
                          <div className="flex justify-between gap-4 items-start">
                            <p className="text-white font-medium">{service.title}</p>
                            <div className="text-right shrink-0">
                              <p className="text-[#c2a4df] font-semibold">
                                {formatBeautyPrice(service.priceEUR)}
                              </p>
                              <p className="text-white/50 text-xs">
                                {formatBeautyDuration(service.durationHours)}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {currentStep === 'calendar' && selectedService && (
              <div>
                <div className="mb-6 rounded-xl border border-[#c2a4df]/20 bg-[#c2a4df]/5 p-4 flex justify-between gap-4 items-center">
                  <div>
                    <p className="text-white font-medium">{selectedService.title}</p>
                    <p className="text-white/60 text-sm">
                      {formatBeautyPrice(selectedService.priceEUR)} ·{' '}
                      {formatBeautyDuration(selectedService.durationHours)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep('service')}
                    className="text-[#c2a4df] text-sm hover:text-white"
                  >
                    Zmeniť
                  </button>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 text-center">
                  Vyberte dátum
                </h2>
                <div className="grid grid-cols-7 gap-1 sm:gap-2 max-w-md mx-auto">
                  {['Po', 'Ut', 'St', 'Št', 'Pi', 'So', 'Ne'].map((day) => (
                    <div key={day} className="text-center text-white/60 text-xs sm:text-sm py-2">
                      {day}
                    </div>
                  ))}
                  {paddingDays.map((_, index) => (
                    <div key={`padding-${index}`} />
                  ))}
                  {availableDates.map((date, index) => {
                    const isAvailable = isDateAvailable(date);
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleDateSelect(date)}
                        disabled={!isAvailable}
                        className={`aspect-square flex items-center justify-center text-sm sm:text-base rounded-lg sm:rounded-xl transition-all ${
                          isAvailable
                            ? 'text-white hover:bg-[#c2a4df] hover:text-black'
                            : 'text-white/30 bg-white/5 cursor-not-allowed'
                        }`}
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>
                <div className="text-center mt-6">
                  <button
                    type="button"
                    onClick={() => setCurrentStep('service')}
                    className="text-[#c2a4df] hover:text-white transition-colors"
                  >
                    ← Späť na výber služby
                  </button>
                </div>
              </div>
            )}

            {currentStep === 'time' && selectedService && selectedDate && (
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 text-center">
                  Vyberte čas pre{' '}
                  {selectedDate.toLocaleDateString('sk-SK', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </h2>
                <p className="text-center text-white/60 text-sm mb-4">
                  Zobrazujú sa len časy, kde sa zmestí celé ošetrenie (
                  {formatBeautyDuration(selectedService.durationHours)})
                </p>
                <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-md mx-auto">
                  {allTimeSlots.map((time) => {
                    const availableTimes = getAvailableTimesForDate(selectedDate);
                    const isAvailable = availableTimes.includes(time);
                    return (
                      <button
                        key={time}
                        type="button"
                        onClick={() => isAvailable && handleTimeSelect(time)}
                        disabled={!isAvailable}
                        className={`py-3 px-2 text-sm sm:text-base rounded-lg sm:rounded-xl transition-all ${
                          isAvailable
                            ? 'text-white hover:bg-[#c2a4df] hover:text-black'
                            : 'text-white/30 bg-white/5 cursor-not-allowed'
                        }`}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
                <div className="text-center mt-6">
                  <button
                    type="button"
                    onClick={() => setCurrentStep('calendar')}
                    className="text-[#c2a4df] hover:text-white transition-colors"
                  >
                    ← Späť na výber dátumu
                  </button>
                </div>
              </div>
            )}

            {currentStep === 'form' && selectedService && selectedDate && selectedTime && (
              <BeautyAppointmentForm
                service={selectedService}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                onBack={() => setCurrentStep('time')}
              />
            )}
          </div>

          <div className="text-center mt-6">
            <Link href="/beauty-sphere/services" className="text-white/50 hover:text-[#c2a4df] text-sm">
              ← Späť na služby
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function BeautyAppointmentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white/60">
          Načítavam...
        </div>
      }
    >
      <BeautyAppointmentContent />
    </Suspense>
  );
}
