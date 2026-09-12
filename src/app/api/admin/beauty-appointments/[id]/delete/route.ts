import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/app/lib/auth';
import prisma from '@/app/lib/prisma';
import { restoreCalendarForAppointment } from '@/app/lib/calendarUtils';

function getAppointmentId(request: NextRequest): string | null {
  const url = new URL(request.url);
  const match = url.pathname.match(/\/api\/admin\/beauty-appointments\/([^/]+)\/delete/);
  return match ? match[1] : null;
}

export async function DELETE(request: NextRequest) {
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

    if (appointment.status === 'confirmed') {
      await restoreCalendarForAppointment(
        appointment.appointmentDate,
        appointment.appointmentTime,
        appointment.durationHours
      );
    }

    await prisma.beautyAppointment.delete({
      where: { id: appointmentId },
    });

    return NextResponse.json({ success: true, message: 'Beauty termín vymazaný' });
  } catch (error) {
    console.error('Error deleting beauty appointment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
