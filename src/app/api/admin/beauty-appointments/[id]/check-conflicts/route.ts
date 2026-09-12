import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/app/lib/auth';
import prisma from '@/app/lib/prisma';
import { checkConfirmationConflicts } from '@/app/lib/calendarUtils';

function getAppointmentId(request: NextRequest): string | null {
  const url = new URL(request.url);
  const match = url.pathname.match(/\/api\/admin\/beauty-appointments\/([^/]+)\/check-conflicts/);
  return match ? match[1] : null;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAdminUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const appointmentId = getAppointmentId(request);
    if (!appointmentId) {
      return NextResponse.json({ error: 'Invalid appointment ID' }, { status: 400 });
    }

    const appointment = await prisma.beautyAppointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    const conflictCheck = await checkConfirmationConflicts(
      appointmentId,
      appointment.appointmentDate,
      appointment.appointmentTime,
      appointment.durationHours,
      'beauty'
    );

    return NextResponse.json({
      success: true,
      hasConflicts: conflictCheck.hasConflicts,
      conflictingAppointments: conflictCheck.conflictingAppointments.map((conflict) => ({
        id: conflict.id,
        fullName: conflict.fullName,
        appointmentTime: conflict.appointmentTime,
        duration: conflict.duration,
        status: conflict.status,
        type: conflict.type,
        appointmentDate: conflict.appointmentDate,
      })),
    });
  } catch (error) {
    console.error('Error checking beauty appointment conflicts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
