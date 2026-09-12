import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/app/lib/auth';
import prisma from '@/app/lib/prisma';
import { updateCalendarForAppointment } from '@/app/lib/calendarUtils';
import { sendEmail } from '@/app/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const user = await getAdminUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      fullName,
      email,
      phone,
      instagram,
      appointmentDate,
      appointmentTime,
      duration,
      placement,
      size,
      color,
      description,
      notes
    } = body;

    // Validate required fields
    if (!fullName || !appointmentDate || !appointmentTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create the appointment
    const appointment = await prisma.tattooAppointment.create({
      data: {
        fullName,
        email: email || null,
        phone: phone || null,
        instagram: instagram || null,
        appointmentDate: new Date(appointmentDate),
        appointmentTime,
        duration: duration || 3,
        placement: placement || '',
        size: size || '',
        color: color || 'black',
        description: description || '',
        notes: notes || '',
        status: 'confirmed', // Manual appointments are typically confirmed
        confirmAdult: true, // Assume adult for manual appointments
        contactPreferenceEmail: !!email,
        contactPreferenceInstagram: !!instagram,
        contactPreferencePhone: !!phone,
        agreeMarketing: false,
        agreePrivacy: true,
        allergies: false,
        allergyDescription: null,
        healthIssues: false,
        healthIssueDescription: null,
        imageUrl: null
      }
    });

    // Update calendar availability to block the time slots
    const calendarResult = await updateCalendarForAppointment(
      appointment.appointmentDate,
      appointment.appointmentTime,
      appointment.duration || 3
    );

    if (!calendarResult.success) {
      console.error('Failed to update calendar availability:', calendarResult.error);
      // Don't fail the appointment creation if calendar update fails
    }

    // Send confirmation email to the client if email is provided
    if (appointment.email) {
      try {
        const emailResult = await sendEmail({
          type: 'confirmed',
          to: appointment.email,
          name: appointment.fullName,
          datetime: `${appointment.appointmentDate.toLocaleDateString('sk-SK')} ${appointment.appointmentTime}`,
        });
        
        if (!emailResult.success) {
          console.error('Failed to send confirmation email for manual appointment:', emailResult.error);
        } else {
          console.log('Confirmation email sent successfully for manual appointment to:', appointment.email);
        }
      } catch (error) {
        console.error('Failed to send confirmation email for manual appointment:', error);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Manual appointment created successfully',
      appointment: {
        ...appointment,
        appointmentDate: appointment.appointmentDate.toISOString(),
        createdAt: appointment.createdAt.toISOString()
      },
      calendarUpdated: calendarResult.success
    });
  } catch (error) {
    console.error('Error creating manual appointment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 