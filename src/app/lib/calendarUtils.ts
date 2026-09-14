import prisma from './prisma';

export interface TimeSlot {
  time: string;
  isAvailable: boolean;
}

/**
 * Updates calendar availability by blocking time slots for a confirmed appointment
 */
export async function updateCalendarForAppointment(
  appointmentDate: Date,
  appointmentTime: string,
  duration: number
) {
  try {
    // Get or create day availability
    let dayAvailability = await prisma.dayAvailability.findUnique({
      where: { date: appointmentDate },
      include: { timeSlots: true }
    });

    if (!dayAvailability) {
      // Check if it's a weekend (0 = Sunday, 6 = Saturday)
      const dayOfWeek = appointmentDate.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      // Create new day availability if it doesn't exist
      dayAvailability = await prisma.dayAvailability.create({
        data: {
          date: appointmentDate,
          isAvailable: !isWeekend, // Weekdays available, weekends unavailable by default
          timeSlots: {
            create: generateAllTimeSlots().map(time => ({
              time,
              isAvailable: !isWeekend // Weekdays available, weekends unavailable by default
            }))
          }
        },
        include: { timeSlots: true }
      });
    }

    // Calculate which time slots to block
    const slotsToBlock = calculateTimeSlotsToBlock(appointmentTime, duration);
    
    // Update time slots to mark them as unavailable
    for (const timeSlot of dayAvailability.timeSlots) {
      if (slotsToBlock.includes(timeSlot.time)) {
        await prisma.timeSlot.update({
          where: { id: timeSlot.id },
          data: { isAvailable: false }
        });
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating calendar for appointment:', error);
    return { success: false, error };
  }
}

/**
 * Restores calendar availability when an appointment is cancelled or rejected
 */
export async function restoreCalendarForAppointment(
  appointmentDate: Date,
  appointmentTime: string,
  duration: number
) {
  try {
    const dayAvailability = await prisma.dayAvailability.findUnique({
      where: { date: appointmentDate },
      include: { timeSlots: true }
    });

    if (!dayAvailability) {
      return { success: true }; // No day availability to restore
    }

    // Calculate which time slots to restore
    const slotsToRestore = calculateTimeSlotsToBlock(appointmentTime, duration);
    
    // Update time slots to mark them as available
    for (const timeSlot of dayAvailability.timeSlots) {
      if (slotsToRestore.includes(timeSlot.time)) {
        await prisma.timeSlot.update({
          where: { id: timeSlot.id },
          data: { isAvailable: true }
        });
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error restoring calendar for appointment:', error);
    return { success: false, error };
  }
}

/**
 * Generates all possible time slots including half-hour intervals
 */
export function generateAllTimeSlots(): string[] {
  const slots: string[] = [];
  for (let hour = 9; hour <= 17; hour++) {
    // Full hour
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    // Half hour (except for 17:30 which would be after closing)
    if (hour < 17) {
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }
  return slots;
}

/**
 * Calculates which time slots should be blocked for a given appointment
 */
export function calculateTimeSlotsToBlock(startTime: string, duration: number): string[] {
  const slotsToBlock: string[] = [];
  const [startHour, startMinute] = startTime.split(':').map(Number);
  
  // Convert duration to minutes
  const durationMinutes = duration * 60;
  
  // Calculate end time
  const startTotalMinutes = startHour * 60 + startMinute;
  const endTotalMinutes = startTotalMinutes + durationMinutes;
  
  // Generate all time slots that fall within the appointment duration
  let currentMinutes = startTotalMinutes;
  while (currentMinutes < endTotalMinutes) {
    const hour = Math.floor(currentMinutes / 60);
    const minute = currentMinutes % 60;
    
    // Format time slot
    const timeSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    
    // Only add if it's a valid time slot (00 or 30 minutes)
    if (minute === 0 || minute === 30) {
      slotsToBlock.push(timeSlot);
    }
    
    currentMinutes += 30; // Move to next half-hour slot
  }
  
  return slotsToBlock;
}

export function getAvailableStartSlotsForDuration(
  availableSlots: string[],
  durationHours: number,
  closingHour = 17
): string[] {
  const closingMinutes = closingHour * 60;

  return availableSlots.filter((startTime) => {
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = startMinutes + durationHours * 60;

    if (endMinutes > closingMinutes) {
      return false;
    }

    const requiredSlots = calculateTimeSlotsToBlock(startTime, durationHours);
    return requiredSlots.every((slot) => availableSlots.includes(slot));
  });
}

/**
 * Checks if a time slot is available for a given date
 */
export async function isTimeSlotAvailable(date: Date, time: string): Promise<boolean> {
  const dayAvailability = await prisma.dayAvailability.findUnique({
    where: { date },
    include: {
      timeSlots: {
        where: { time }
      }
    }
  });

  // If no day availability exists, check if it's a weekend
  if (!dayAvailability) {
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    return !isWeekend; // Weekdays available, weekends unavailable by default
  }

  // If day is marked as unavailable, return false
  if (!dayAvailability.isAvailable) {
    return false;
  }

  // Check specific time slot availability
  const timeSlot = dayAvailability.timeSlots[0];
  return timeSlot ? timeSlot.isAvailable : true;
}

/**
 * Fetches all active (pending or confirmed) tattoo + beauty appointments within a
 * date range and returns, per date, the set of time slots already taken up by
 * them (based on each appointment's own duration). Used to keep the public
 * calendar from offering slots that someone already requested.
 */
export async function getBookedSlotsByDate(
  startDate: Date,
  endDate: Date
): Promise<Map<string, Set<string>>> {
  const [tattooAppointments, beautyAppointments] = await Promise.all([
    prisma.tattooAppointment.findMany({
      where: {
        appointmentDate: { gte: startDate, lte: endDate },
        status: { in: ['confirmed', 'pending'] },
      },
      select: { appointmentDate: true, appointmentTime: true, duration: true },
    }),
    prisma.beautyAppointment.findMany({
      where: {
        appointmentDate: { gte: startDate, lte: endDate },
        status: { in: ['confirmed', 'pending'] },
      },
      select: { appointmentDate: true, appointmentTime: true, durationHours: true },
    }),
  ]);

  const bookedByDate = new Map<string, Set<string>>();

  const addBooked = (date: Date, time: string, duration: number | null) => {
    const dateKey = date.toISOString().split('T')[0];
    const blockedSlots = calculateTimeSlotsToBlock(time, duration || 3);
    const existing = bookedByDate.get(dateKey) ?? new Set<string>();
    blockedSlots.forEach((slot) => existing.add(slot));
    bookedByDate.set(dateKey, existing);
  };

  tattooAppointments.forEach((appointment) =>
    addBooked(appointment.appointmentDate, appointment.appointmentTime, appointment.duration)
  );
  beautyAppointments.forEach((appointment) =>
    addBooked(appointment.appointmentDate, appointment.appointmentTime, appointment.durationHours)
  );

  return bookedByDate;
}

/**
 * Checks if two appointments overlap in time
 */
export function appointmentsOverlap(
  appointment1Date: Date,
  appointment1Time: string,
  appointment1Duration: number,
  appointment2Date: Date,
  appointment2Time: string,
  appointment2Duration: number
): boolean {
  // If different dates, no overlap
  if (appointment1Date.toDateString() !== appointment2Date.toDateString()) {
    return false;
  }

  // Convert times to minutes for easier comparison
  const time1 = convertTimeToMinutes(appointment1Time);
  const time2 = convertTimeToMinutes(appointment2Time);
  const end1 = time1 + (appointment1Duration * 60);
  const end2 = time2 + (appointment2Duration * 60);

  // Check for overlap: one appointment starts before the other ends
  return (time1 < end2) && (time2 < end1);
}

/**
 * Converts time string (HH:MM) to minutes since midnight
 */
function convertTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

interface AppointmentLike {
  id: string;
  fullName: string;
  appointmentDate: Date;
  appointmentTime: string;
  duration: number | null;
  status: string;
  type: "tattoo" | "beauty";
}

async function fetchActiveAppointmentsForDate(
  appointmentDate: Date,
  excludeId?: string,
  excludeType?: "tattoo" | "beauty"
): Promise<AppointmentLike[]> {
  const dateOnly = new Date(appointmentDate);
  dateOnly.setHours(0, 0, 0, 0);

  const [tattooAppointments, beautyAppointments] = await Promise.all([
    prisma.tattooAppointment.findMany({
      where: {
        appointmentDate: dateOnly,
        status: { in: ["confirmed", "pending"] },
        ...(excludeType === "tattoo" && excludeId ? { id: { not: excludeId } } : {}),
      },
    }),
    prisma.beautyAppointment.findMany({
      where: {
        appointmentDate: dateOnly,
        status: { in: ["confirmed", "pending"] },
        ...(excludeType === "beauty" && excludeId ? { id: { not: excludeId } } : {}),
      },
    }),
  ]);

  return [
    ...tattooAppointments.map((appointment) => ({
      id: appointment.id,
      fullName: appointment.fullName,
      appointmentDate: appointment.appointmentDate,
      appointmentTime: appointment.appointmentTime,
      duration: appointment.duration,
      status: appointment.status,
      type: "tattoo" as const,
    })),
    ...beautyAppointments.map((appointment) => ({
      id: appointment.id,
      fullName: appointment.fullName,
      appointmentDate: appointment.appointmentDate,
      appointmentTime: appointment.appointmentTime,
      duration: appointment.durationHours,
      status: appointment.status,
      type: "beauty" as const,
    })),
  ];
}

interface ConflictingAppointment {
  id: string;
  fullName: string;
  appointmentDate: Date;
  appointmentTime: string;
  duration: number | null;
  status: string;
  type: "tattoo" | "beauty";
}

/**
 * Gets all appointments that conflict with a given appointment
 */
export async function getConflictingAppointments(
  appointmentId: string,
  appointmentDate: Date,
  appointmentTime: string,
  appointmentDuration: number,
  appointmentType: "tattoo" | "beauty" = "tattoo"
): Promise<ConflictingAppointment[]> {
  const sameDayAppointments = await fetchActiveAppointmentsForDate(
    appointmentDate,
    appointmentId,
    appointmentType
  );

  return sameDayAppointments.filter((appointment) =>
    appointmentsOverlap(
      appointmentDate,
      appointmentTime,
      appointmentDuration,
      appointment.appointmentDate,
      appointment.appointmentTime,
      appointment.duration || 3
    )
  );
}

/**
 * Checks if confirming an appointment would create conflicts
 */
export async function checkConfirmationConflicts(
  appointmentId: string,
  appointmentDate: Date,
  appointmentTime: string,
  appointmentDuration: number,
  appointmentType: "tattoo" | "beauty" = "tattoo"
): Promise<{
  hasConflicts: boolean;
  conflictingAppointments: ConflictingAppointment[];
}> {
  const conflictingAppointments = await getConflictingAppointments(
    appointmentId,
    appointmentDate,
    appointmentTime,
    appointmentDuration,
    appointmentType
  );

  return {
    hasConflicts: conflictingAppointments.length > 0,
    conflictingAppointments
  };
}