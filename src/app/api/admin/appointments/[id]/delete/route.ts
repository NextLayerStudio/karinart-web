import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/app/lib/auth';
import prisma from '@/app/lib/prisma';
import { restoreCalendarForAppointment } from '@/app/lib/calendarUtils';

function getAppointmentId(request: NextRequest): string | null {
  const url = new URL(request.url);
  const match = url.pathname.match(/\/api\/admin\/appointments\/([^\/]+)\/delete/);
  return match ? match[1] : null;
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify admin authentication
    const user = await getAdminUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const appointmentId = getAppointmentId(request);
    if (!appointmentId) {
      return NextResponse.json({ error: 'Invalid appointment ID' }, { status: 400 });
    }

    // Get the appointment first to restore calendar availability
    const appointment = await prisma.tattooAppointment.findUnique({
      where: { id: appointmentId }
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Restore calendar availability if the appointment was confirmed
    if (appointment.status === 'confirmed') {
      const restoreResult = await restoreCalendarForAppointment(
        appointment.appointmentDate,
        appointment.appointmentTime,
        appointment.duration || 3
      );
      
      if (!restoreResult.success) {
        console.error('Failed to restore calendar availability:', restoreResult.error);
      }
    }

    // Delete the appointment
    await prisma.tattooAppointment.delete({
      where: { id: appointmentId }
    });

    return NextResponse.json({
      success: true,
      message: 'Appointment deleted successfully',
      calendarRestored: appointment.status === 'confirmed'
    });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 