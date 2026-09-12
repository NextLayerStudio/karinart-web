'use client';

import { useState, useEffect } from 'react';
import { Metadata } from 'next';
import AppointmentForm from './AppointmentForm';
import { generateAllTimeSlots } from '@/app/lib/calendarUtils';

interface DayAvailability {
  date: string;
  isAvailable: boolean;
  timeSlots: string[];
}

const getAvailableDates = () => {
  const dates = [];
  const today = new Date();
  // Start from 2 days ahead to enforce 2-day advance booking requirement
  for (let i = 2; i <= 29; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date);
  }
  return dates;
};

export default function AppointmentPage() {
  const [currentStep, setCurrentStep] = useState<'calendar' | 'time' | 'form'>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availability, setAvailability] = useState<DayAvailability[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const availableDates = getAvailableDates();
  const firstAvailableDate = availableDates.length > 0 ? availableDates[0] : new Date();
  const startingDayOfWeek = (firstAvailableDate.getDay() + 6) % 7; // 0 for Monday
  const paddingDays = Array.from({ length: startingDayOfWeek });

  const availableTimes = generateAllTimeSlots();

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const today = new Date();
        const startDate = new Date();
        startDate.setDate(today.getDate() + 2); // Start from 2 days ahead
        const endDate = new Date();
        endDate.setDate(today.getDate() + 29); // End date adjusted to maintain 28-day window
        const response = await fetch(`/api/calendar/availability?startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`);
        if (response.ok) {
          setAvailability(await response.json());
        }
      } catch (error) {
        console.error('Error fetching availability:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAvailability();
  }, []);

  const isDateAvailable = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    const dayAvailability = availability.find(day => day.date === dateString);
    if (!dayAvailability) {
      const dayOfWeek = date.getDay();
      return dayOfWeek !== 0 && dayOfWeek !== 6;
    }
    return dayAvailability.isAvailable && dayAvailability.timeSlots.length > 0;
  };

  const getAvailableTimesForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    const dayAvailability = availability.find(day => day.date === dateString);
    if (!dayAvailability) {
      const dayOfWeek = date.getDay();
      return (dayOfWeek !== 0 && dayOfWeek !== 6) ? availableTimes : [];
    }
    return dayAvailability.timeSlots;
  };

  const getTimeSlotsWithAvailability = (date: Date) => {
    const available = getAvailableTimesForDate(date);
    return availableTimes.map(time => ({
      time,
      isAvailable: available.includes(time),
    }));
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
      <div className="min-h-screen bg-[#0a0a0a]">        <main className="pt-20 pb-12 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-white/60">Načítavam dostupnosť...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">      <main className="pt-28 sm:pt-32 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header and Steps UI as before */}
          <div className="text-center mb-10">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-amsterdam-four text-[#c2a4df] mb-6 sm:mb-4">
              Zarezervujte si svoj atrament
            </h1>
            <p className="text-white/80 text-sm sm:text-lg mt-2">
              Premením vašu víziu na umenie
            </p>
          </div>
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              {/* Step 1 */}
              <div className={`flex items-center ${currentStep === 'calendar' || currentStep === 'time' || currentStep === 'form' ? 'text-[#c2a4df]' : 'text-white/40'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep === 'calendar' || currentStep === 'time' || currentStep === 'form' ? 'border-[#c2a4df] bg-[#c2a4df] text-black' : 'border-white/40'}`}>1</div>
                <span className="ml-2 hidden sm:inline">Výber dátumu</span>
              </div>
              <div className={`w-8 h-1 ${currentStep === 'time' || currentStep === 'form' ? 'bg-[#c2a4df]' : 'bg-white/20'}`}></div>
              {/* Step 2 */}
              <div className={`flex items-center ${currentStep === 'time' || currentStep === 'form' ? 'text-[#c2a4df]' : 'text-white/40'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep === 'time' || currentStep === 'form' ? 'border-[#c2a4df] bg-[#c2a4df] text-black' : 'border-white/40'}`}>2</div>
                <span className="ml-2 hidden sm:inline">Výber času</span>
              </div>
              <div className={`w-8 h-1 ${currentStep === 'form' ? 'bg-[#c2a4df]' : 'bg-white/20'}`}></div>
              {/* Step 3 */}
              <div className={`flex items-center ${currentStep === 'form' ? 'text-[#c2a4df]' : 'text-white/40'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep === 'form' ? 'border-[#c2a4df] bg-[#c2a4df] text-black' : 'border-white/40'}`}>3</div>
                <span className="ml-2 hidden sm:inline">Detaily</span>
              </div>
            </div>
          </div>
          {/* Step Content */}
          <div className="surface-card rounded-2xl p-4 sm:p-6 md:p-8">
            {currentStep === 'calendar' && (
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 text-center">Vyberte dátum</h2>
                <div className="grid grid-cols-7 gap-1 sm:gap-2 max-w-md mx-auto">
                  {['Po', 'Ut', 'St', 'Št', 'Pi', 'So', 'Ne'].map(day => (
                    <div key={day} className="text-center text-white/60 text-xs sm:text-sm py-2">{day}</div>
                  ))}
                  {paddingDays.map((_, index) => <div key={`padding-${index}`} />)}
                  {availableDates.map((date, index) => {
                    const isAvailable = isDateAvailable(date);
                    return (
                      <button
                        key={index}
                        onClick={() => handleDateSelect(date)}
                        disabled={!isAvailable}
                        className={`aspect-square flex items-center justify-center text-sm sm:text-base rounded-lg sm:rounded-xl transition-all ${isAvailable ? 'text-white hover:bg-[#c2a4df] hover:text-black hover:shadow-lg hover:shadow-[#c2a4df]/20' : 'text-white/30 bg-white/5 cursor-not-allowed'}`}
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            {currentStep === 'time' && (
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 text-center">
                  Vyberte čas pre {selectedDate?.toLocaleDateString('sk-SK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </h2>
                <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-md mx-auto">
                  {getTimeSlotsWithAvailability(selectedDate!).map(({ time, isAvailable }) => (
                    <button
                      key={time}
                      onClick={() => isAvailable && handleTimeSelect(time)}
                      disabled={!isAvailable}
                      className={`py-3 px-2 text-sm sm:text-base rounded-lg sm:rounded-xl transition-all ${isAvailable ? 'text-white hover:bg-[#c2a4df] hover:text-black hover:shadow-lg hover:shadow-[#c2a4df]/20' : 'text-white/30 bg-white/5 cursor-not-allowed'}`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
                <div className="text-center mt-6">
                  <button onClick={() => setCurrentStep('calendar')} className="text-[#c2a4df] hover:text-white transition-colors">
                    ← Späť na výber dátumu
                  </button>
                </div>
              </div>
            )}
            {currentStep === 'form' && (
              <AppointmentForm selectedDate={selectedDate!} selectedTime={selectedTime} onBack={() => setCurrentStep('time')} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 