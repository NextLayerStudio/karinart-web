import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/app/lib/auth';
import prisma from '@/app/lib/prisma';
import { updateCalendarForAppointment, checkConfirmationConflicts } from '@/app/lib/calendarUtils';
import { sendEmail } from '@/app/lib/emailService';

function getAppointmentId(request: NextRequest): string | null {
  const url = new URL(request.url);
  const match = url.pathname.match(/\/api\/admin\/appointments\/([^\/]+)\/confirm/);
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
    const { duration } = body;

    // Validate duration is provided
    if (!duration || duration <= 0) {
      return NextResponse.json({ error: 'Duration is required and must be greater than 0' }, { status: 400 });
    }

    // Get the appointment
    const appointment = await prisma.tattooAppointment.findUnique({
      where: { id: appointmentId }
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Check for conflicts before confirming
    const conflictCheck = await checkConfirmationConflicts(
      appointmentId,
      appointment.appointmentDate,
      appointment.appointmentTime,
      duration
    );

    if (conflictCheck.hasConflicts) {
      return NextResponse.json({
        success: false,
        error: 'Appointment conflicts with existing appointments',
        conflicts: conflictCheck.conflictingAppointments.map(conflict => ({
          id: conflict.id,
          fullName: conflict.fullName,
          appointmentTime: conflict.appointmentTime,
          duration: conflict.duration,
          status: conflict.status
        }))
      }, { status: 409 });
    }

    // Record voucher usage if appointment has a voucher code
    if (appointment.voucherCode && appointment.voucherType) {
      try {
        if (appointment.voucherType === 'discount') {
          // Find the discount code
          const discountCode = await prisma.discountCode.findUnique({
            where: { code: appointment.voucherCode }
          });

          if (discountCode) {
            // Record usage
            await prisma.discountCodeUse.create({
              data: {
                discountCodeId: discountCode.id,
                appointmentId: appointment.id,
                customerEmail: appointment.email
              }
            });

            // Update usage count
            await prisma.discountCode.update({
              where: { id: discountCode.id },
              data: { currentUses: discountCode.currentUses + 1 }
            });

            console.log(`Discount code ${appointment.voucherCode} usage recorded for appointment ${appointmentId}`);
          }
        } else if (appointment.voucherType === 'giftcard') {
          // Find the gift card
          const giftCard = await prisma.giftCard.findUnique({
            where: { code: appointment.voucherCode }
          });

          if (giftCard) {
            // Record usage
            await prisma.giftCardUse.create({
              data: {
                giftCardId: giftCard.id,
                appointmentId: appointment.id,
                customerEmail: appointment.email,
                amountUsed: giftCard.balance // Use full balance
              }
            });

            // Update usage count and balance
            await prisma.giftCard.update({
              where: { id: giftCard.id },
              data: { 
                currentUses: giftCard.currentUses + 1,
                balance: 0 // Set to 0 since we're using the full balance
              }
            });

            console.log(`Gift card ${appointment.voucherCode} usage recorded for appointment ${appointmentId}`);
          }
        }
      } catch (error) {
        console.error('Error recording voucher usage:', error);
        // Don't fail the appointment confirmation if voucher recording fails
      }
    }

    // Update appointment status
    await prisma.tattooAppointment.update({
      where: { id: appointmentId },
      data: {
        status: 'confirmed',
        duration: duration || 3
      }
    });

    // Update calendar availability to block the time slots
    const calendarResult = await updateCalendarForAppointment(
      appointment.appointmentDate,
      appointment.appointmentTime,
      duration || 3
    );

    if (!calendarResult.success) {
      console.error('Failed to update calendar availability:', calendarResult.error);
      // Don't fail the appointment confirmation if calendar update fails
    }

    // Send confirmation email to the client
    if (appointment.email) {
      try {
        const emailResult = await sendEmail({
          type: 'confirmed',
          to: appointment.email,
          name: appointment.fullName,
          datetime: `${appointment.appointmentDate.toLocaleDateString('sk-SK')} ${appointment.appointmentTime}`,
        });
        
        if (!emailResult.success) {
          console.error('Failed to send confirmation email:', emailResult.error);
        } else {
          console.log('Confirmation email sent successfully to:', appointment.email);
        }
      } catch (error) {
        console.error('Failed to send confirmation email:', error);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Appointment confirmed successfully',
      calendarUpdated: calendarResult.success
    });
  } catch (error) {
    console.error('Error confirming appointment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 