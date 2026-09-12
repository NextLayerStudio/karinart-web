import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/app/lib/auth';
import prisma from '@/app/lib/prisma';
import { restoreCalendarForAppointment } from '@/app/lib/calendarUtils';
import { sendEmail } from '@/app/lib/emailService';

function getAppointmentId(request: NextRequest): string | null {
  const url = new URL(request.url);
  const match = url.pathname.match(/\/api\/admin\/appointments\/([^\/]+)\/reject/);
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

    // Get the appointment
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

    // Update appointment status
    await prisma.tattooAppointment.update({
      where: { id: appointmentId },
      data: {
        status: 'rejected'
      }
    });

    // Send decline email to the client
    if (appointment.email) {
      try {
        const emailResult = await sendEmail({
          type: 'declined',
          to: appointment.email,
          name: appointment.fullName,
          datetime: `${appointment.appointmentDate.toLocaleDateString('sk-SK')} ${appointment.appointmentTime}`,
        });
        
        if (!emailResult.success) {
          console.error('Failed to send decline email:', emailResult.error);
        } else {
          console.log('Decline email sent successfully to:', appointment.email);
        }
      } catch (error) {
        console.error('Failed to send decline email:', error);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Appointment rejected successfully',
      calendarRestored: appointment.status === 'confirmed'
    });
  } catch (error) {
    console.error('Error rejecting appointment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 