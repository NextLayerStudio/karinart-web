import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/app/lib/auth';
import prisma from '@/app/lib/prisma';
import { updateCalendarForAppointment, restoreCalendarForAppointment } from '@/app/lib/calendarUtils';
import { sendEmail } from '@/app/lib/emailService';

function getAppointmentId(request: NextRequest): string | null {
  const url = new URL(request.url);
  const match = url.pathname.match(/\/api\/admin\/appointments\/([^\/]+)\/reschedule/);
  return match ? match[1] : null;
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { newDate, newTime, duration } = body;

    if (!newDate || !newTime) {
      return NextResponse.json({ error: 'New date and time are required' }, { status: 400 });
    }

    // Get the appointment
    const appointment = await prisma.tattooAppointment.findUnique({
      where: { id: appointmentId }
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Restore calendar availability for the old appointment time
    if (appointment.status === 'confirmed') {
      const restoreResult = await restoreCalendarForAppointment(
        appointment.appointmentDate,
        appointment.appointmentTime,
        appointment.duration || 3
      );
      
      if (!restoreResult.success) {
        console.error('Failed to restore calendar availability for old appointment:', restoreResult.error);
      }
    }

    // Update appointment
    await prisma.tattooAppointment.update({
      where: { id: appointmentId },
      data: {
        status: 'rescheduled',
        appointmentDate: new Date(newDate),
        appointmentTime: newTime,
        duration: duration || 3
      }
    });

    // Update calendar availability for the new appointment time
    const calendarResult = await updateCalendarForAppointment(
      new Date(newDate),
      newTime,
      duration || 3
    );

    if (!calendarResult.success) {
      console.error('Failed to update calendar availability for new appointment:', calendarResult.error);
    }

    // Send reschedule email to the client
    if (appointment.email) {
      try {
        const emailResult = await sendEmail({
          type: 'rescheduled',
          to: appointment.email,
          name: appointment.fullName,
          datetime: `${new Date(newDate).toLocaleDateString('sk-SK')} ${newTime}`,
        });
        
        if (!emailResult.success) {
          console.error('Failed to send reschedule email:', emailResult.error);
        } else {
          console.log('Reschedule email sent successfully to:', appointment.email);
        }
      } catch (error) {
        console.error('Failed to send reschedule email:', error);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Appointment rescheduled successfully',
      calendarUpdated: calendarResult.success
    });
  } catch (error) {
    console.error('Error rescheduling appointment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 