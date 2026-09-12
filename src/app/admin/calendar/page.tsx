'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface DayAvailability {
  id: string;
  date: string;
  isAvailable: boolean;
  timeSlots: TimeSlot[];
}

interface TimeSlot {
  id: string;
  time: string;
  isAvailable: boolean;
}

const getAvailableDates = () => {
  const dates = [];
  const today = new Date();
  
  // Generate next 28 days
  for (let i = 1; i <= 28; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date);
  }
  
  return dates;
};

export default function AdminCalendar() {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [dayAvailability, setDayAvailability] = useState<DayAvailability | null>(null);
  const [allDatesAvailability, setAllDatesAvailability] = useState<Map<string, DayAvailability>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        router.push('/admin/login');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const availableDates = getAvailableDates();
  const firstAvailableDate = availableDates.length > 0 ? availableDates[0] : new Date();
  const startingDayOfWeek = (firstAvailableDate.getDay() + 6) % 7; // 0 for Monday
  const paddingDays = Array.from({ length: startingDayOfWeek });

  // Fetch availability for all dates in the calendar
  const fetchAllDatesAvailability = useCallback(async () => {
    try {
      const startDate = formatDateForAPI(availableDates[0]);
      const endDate = formatDateForAPI(availableDates[availableDates.length - 1]);
      
      const response = await fetch(`/api/calendar/availability?startDate=${startDate}&endDate=${endDate}`);
      if (response.ok) {
        const data = await response.json();
        const availabilityMap = new Map();
        
        data.forEach((day: { date: string; isAvailable: boolean; timeSlots?: string[]; id?: string }) => {
          availabilityMap.set(day.date, {
            id: day.id || '',
            date: day.date,
            isAvailable: day.isAvailable,
            timeSlots: day.timeSlots || []
          });
        });
        
        setAllDatesAvailability(availabilityMap);
      }
    } catch (error) {
      console.error('Error fetching all dates availability:', error);
    }
  }, [availableDates]);

  const formatDateForAPI = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // Fetch all dates availability on component mount
  useEffect(() => {
    fetchAllDatesAvailability();
  }, [fetchAllDatesAvailability]);

  // Update all dates availability when day availability changes
  useEffect(() => {
    if (dayAvailability) {
      setAllDatesAvailability(prev => new Map(prev).set(dayAvailability.date, dayAvailability));
    }
  }, [dayAvailability]);

  const handleDateSelect = async (date: Date) => {
    const dateString = formatDateForAPI(date);
    setSelectedDate(dateString);
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/calendar/${dateString}`);
      if (response.ok) {
        const data = await response.json();
        setDayAvailability(data);
      } else {
        console.error('Error fetching day availability:', response.status);
        setMessage('Chyba pri načítaní dostupnosti');
      }
    } catch (error) {
      console.error('Error fetching day availability:', error);
      setMessage('Chyba pri načítaní dostupnosti');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDayAvailability = async () => {
    if (!dayAvailability) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/calendar/${dayAvailability.date}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isAvailable: !dayAvailability.isAvailable,
          timeSlots: dayAvailability.timeSlots
        }),
      });

      if (response.ok) {
        setDayAvailability(prev => prev ? { ...prev, isAvailable: !prev.isAvailable } : null);
        setMessage('Dostupnosť dňa aktualizovaná');
      } else {
        setMessage('Chyba pri aktualizácii dostupnosti');
      }
    } catch (error) {
      console.error('Error updating day availability:', error);
      setMessage('Chyba pri aktualizácii dostupnosti');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTimeSlot = async (time: string) => {
    if (!dayAvailability) return;

    const updatedTimeSlots = dayAvailability.timeSlots.map(slot =>
      slot.time === time ? { ...slot, isAvailable: !slot.isAvailable } : slot
    );

    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/calendar/${dayAvailability.date}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isAvailable: dayAvailability.isAvailable,
          timeSlots: updatedTimeSlots
        }),
      });

      if (response.ok) {
        setDayAvailability(prev => prev ? { ...prev, timeSlots: updatedTimeSlots } : null);
        setMessage('Časové sloty aktualizované');
      } else {
        setMessage('Chyba pri aktualizácii časových slotov');
      }
    } catch (error) {
      console.error('Error updating time slots:', error);
      setMessage('Chyba pri aktualizácii časových slotov');
    } finally {
      setIsLoading(false);
    }
  };

  const saveDayAvailability = async () => {
    if (!dayAvailability) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/calendar/${dayAvailability.date}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dayAvailability),
      });

      if (response.ok) {
        setMessage('Dostupnosť uložená');
      } else {
        setMessage('Chyba pri ukladaní dostupnosti');
      }
    } catch (error) {
      console.error('Error saving day availability:', error);
      setMessage('Chyba pri ukladaní dostupnosti');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshCurrentDate = async () => {
    if (selectedDate) {
      const date = new Date(selectedDate);
      await handleDateSelect(date);
    }
  };

  const setAllTimeSlotsAvailable = async () => {
    if (!selectedDate) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/calendar/${selectedDate}?action=setAllAvailable`, {
        method: 'PATCH',
      });

      if (response.ok) {
        const updatedData = await response.json();
        setDayAvailability(updatedData);
        setMessage('Všetky časové sloty nastavené ako dostupné');
      } else {
        setMessage('Chyba pri nastavení dostupnosti');
      }
    } catch (error) {
      console.error('Error setting all time slots available:', error);
      setMessage('Chyba pri nastavení dostupnosti');
    } finally {
      setIsLoading(false);
    }
  };

  const setAllTimeSlotsUnavailable = async () => {
    if (!selectedDate) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/calendar/${selectedDate}?action=setAllUnavailable`, {
        method: 'PATCH',
      });

      if (response.ok) {
        const updatedData = await response.json();
        setDayAvailability(updatedData);
        setMessage('Všetky časové sloty nastavené ako nedostupné');
      } else {
        setMessage('Chyba pri nastavení dostupnosti');
      }
    } catch (error) {
      console.error('Error setting all time slots unavailable:', error);
      setMessage('Chyba pri nastavení dostupnosti');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-6xl mx-auto">

          {message && (
            <div className="mb-6 p-4 bg-[#c2a4df]/20 border border-[#c2a4df]/40 rounded-lg text-center">
              <p className="text-[#c2a4df]">{message}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Calendar Selection */}
            <div className="bg-black/40 backdrop-blur-md border border-[#c2a4df]/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Výber dátumu</h3>
              <div className="grid grid-cols-7 gap-2">
                {/* Day headers */}
                {['Po', 'Ut', 'St', 'Št', 'Pi', 'So', 'Ne'].map(day => (
                  <div key={day} className="text-center text-white/60 text-sm py-2">
                    {day}
                  </div>
                ))}
                
                {/* Padding for the first day */}
                {paddingDays.map((_, index) => (
                    <div key={`padding-${index}`} />
                ))}

                {/* Calendar dates */}
                {availableDates.map((date, index) => {
                  const dayOfWeek = date.getDay();
                  // getDay() returns: 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
                  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
                  const isSelected = selectedDate === formatDateForAPI(date);
                  
                  let buttonClasses = 'p-3 rounded-lg transition-colors';
                  
                  // Check if this date has availability data
                  const dateKey = formatDateForAPI(date);
                  const dateAvailability = allDatesAvailability.get(dateKey);
                  const hasAvailabilityData = dateAvailability !== undefined;
                  const isActuallyAvailable = hasAvailabilityData ? dateAvailability.isAvailable : !isWeekend;
                  
                  if (isSelected) {
                    buttonClasses += ' bg-[#c2a4df] text-black';
                  } else if (isActuallyAvailable) {
                    buttonClasses += ' text-white hover:bg-[#c2a4df]/20';
                  } else {
                    buttonClasses += ' bg-red-600/20 text-red-400 hover:bg-red-600/30';
                  }
                  
                  return (
                    <button
                      key={index}
                      onClick={() => handleDateSelect(date)}
                      className={buttonClasses}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
              
              {/* Legend */}
              <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-[#c2a4df]/20 rounded"></div>
                  <span className="text-white/60">Pracovné dni (dostupné)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-600/20 rounded"></div>
                  <span className="text-red-400">Víkendy (nedostupné)</span>
                </div>
              </div>
            </div>

            {/* Day Management */}
            {selectedDate && dayAvailability && (
              <div className="bg-black/40 backdrop-blur-md border border-[#c2a4df]/20 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">
                    {new Date(selectedDate).toLocaleDateString('sk-SK', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h3>
                  <button
                    onClick={refreshCurrentDate}
                    disabled={isLoading}
                    className="bg-[#c2a4df] hover:bg-[#7568ad] text-black hover:text-white px-3 py-1 rounded-lg transition-colors disabled:opacity-50 text-sm"
                  >
                    {isLoading ? 'Načítavam...' : '🔄 Obnoviť'}
                  </button>
                </div>

                {/* Weekend Notice */}
                {(() => {
                  const dayOfWeek = new Date(selectedDate).getDay();
                  // getDay() returns: 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
                  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
                  
                  if (isWeekend) {
                    return (
                      <div className="mb-4 p-3 bg-red-600/20 border border-red-600/40 rounded-lg">
                        <p className="text-red-400 text-sm">
                          ⚠️ Víkendy sú štandardne nedostupné. Môžete ich povoliť manuálne.
                        </p>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Day Availability Toggle */}
                <div className="mb-6">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={dayAvailability.isAvailable}
                      onChange={toggleDayAvailability}
                      disabled={isLoading}
                      className="w-5 h-5 text-[#c2a4df] bg-black border-[#c2a4df]/30 rounded focus:ring-[#c2a4df] focus:ring-2"
                    />
                    <span className="text-white font-medium">Dostupný deň</span>
                  </label>
                </div>

                {/* Bulk Operations */}
                <div className="mb-6">
                  <h4 className="text-white font-medium mb-3">Hromadné operácie</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={setAllTimeSlotsAvailable}
                      disabled={isLoading}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {isLoading ? 'Nastavujem...' : 'Všetky dostupné'}
                    </button>
                    <button
                      onClick={setAllTimeSlotsUnavailable}
                      disabled={isLoading}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {isLoading ? 'Nastavujem...' : 'Všetky nedostupné'}
                    </button>
                  </div>
                </div>

                {/* Time Slots */}
                {dayAvailability.isAvailable && (
                  <div>
                    <h4 className="text-white font-medium mb-4">Časové sloty</h4>
                    <div className="grid grid-cols-3 gap-3">
                      {dayAvailability.timeSlots.map((slot) => (
                        <button
                          key={slot.time}
                          onClick={() => toggleTimeSlot(slot.time)}
                          disabled={isLoading}
                          className={`p-3 rounded-lg transition-colors ${
                            slot.isAvailable
                              ? 'bg-[#c2a4df] text-black hover:bg-[#7568ad]'
                              : 'bg-gray-700 text-white/60 hover:bg-gray-600'
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Save Button */}
                <div className="mt-6">
                  <button
                    onClick={saveDayAvailability}
                    disabled={isLoading}
                    className="w-full bg-[#c2a4df] hover:bg-[#7568ad] text-black hover:text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Ukladám...' : 'Uložiť dostupnosť'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 