import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/app/lib/auth';
import prisma from '@/app/lib/prisma';
import { updateCalendarForAppointment, checkConfirmationConflicts } from '@/app/lib/calendarUtils';
import { sendEmail } from '@/app/lib/emailService';

function getAppointmentId(request: NextRequest): string | null {
  const url = new URL(request.url);
  const match = url.pathname.match(/\/api\/admin\/beauty-appointments\/([^/]+)\/confirm/);
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

    const duration = appointment.durationHours;

    const conflictCheck = await checkConfirmationConflicts(
      appointmentId,
      appointment.appointmentDate,
      appointment.appointmentTime,
      duration,
      'beauty'
    );

    if (conflictCheck.hasConflicts) {
      return NextResponse.json(
        {
          success: false,
          error: 'Appointment conflicts with existing appointments',
          conflicts: conflictCheck.conflictingAppointments.map((conflict) => ({
            id: conflict.id,
            fullName: conflict.fullName,
            appointmentTime: conflict.appointmentTime,
            duration: conflict.duration,
            status: conflict.status,
            type: conflict.type,
          })),
        },
        { status: 409 }
      );
    }

    await prisma.beautyAppointment.update({
      where: { id: appointmentId },
      data: { status: 'confirmed' },
    });

    const calendarResult = await updateCalendarForAppointment(
      appointment.appointmentDate,
      appointment.appointmentTime,
      duration
    );

    if (!calendarResult.success) {
      console.error('Failed to update calendar for beauty appointment:', calendarResult.error);
    }

    if (appointment.email) {
      try {
        await sendEmail({
          type: 'confirmed',
          to: appointment.email,
          name: appointment.fullName,
          datetime: `${appointment.appointmentDate.toLocaleDateString('sk-SK')} ${appointment.appointmentTime}`,
        });
      } catch (error) {
        console.error('Failed to send beauty confirmation email:', error);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Beauty termín potvrdený',
      calendarUpdated: calendarResult.success,
      duration,
    });
  } catch (error) {
    console.error('Error confirming beauty appointment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
