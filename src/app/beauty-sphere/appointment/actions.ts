'use server';

import prisma from '@/app/lib/prisma';
import { revalidatePath } from 'next/cache';
import { sendEmail } from '@/app/lib/emailService';
import { getMergedBeautyBookableService } from '@/app/lib/beautyPriceService';
import { formatBeautyDuration, formatBeautyPrice } from '@/app/lib/beautyServicesCatalog';

interface BeautyAppointmentFormData {
  fullName: string;
  email: string;
  phone?: string;
  confirmAdult: boolean;
  agreePrivacy: boolean;
  agreeMarketing: boolean;
  notes?: string;
  serviceId: string;
  appointmentDate: Date;
  appointmentTime: string;
}

export async function createBeautyAppointment(formData: BeautyAppointmentFormData) {
  try {
    if (!formData.confirmAdult || !formData.agreePrivacy) {
      return { success: false, error: 'Vyžadované súhlasy neboli potvrdené' };
    }

    const service = await getMergedBeautyBookableService(formData.serviceId);
    if (!service) {
      return { success: false, error: 'Neplatná služba' };
    }

    const appointmentDate = new Date(formData.appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    appointmentDate.setHours(0, 0, 0, 0);

    const minDate = new Date(today);
    minDate.setDate(today.getDate() + 2);

    if (appointmentDate < minDate) {
      return {
        success: false,
        error: 'Termín musí byť minimálne 2 dni vopred. Vyberte prosím neskorší dátum.',
      };
    }

    const appointment = await prisma.beautyAppointment.create({
      data: {
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone?.trim() || null,
        confirmAdult: formData.confirmAdult,
        agreePrivacy: formData.agreePrivacy,
        agreeMarketing: formData.agreeMarketing,
        serviceId: service.id,
        serviceTitle: service.title,
        servicePrice: service.priceEUR,
        durationHours: service.durationHours,
        notes: formData.notes?.trim() || null,
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime,
        status: 'pending',
      },
    });

    if (formData.agreeMarketing) {
      try {
        await prisma.marketing.upsert({
          where: { email: appointment.email },
          update: {},
          create: { email: appointment.email },
        });
      } catch (error) {
        console.error('Error saving marketing email:', error);
      }
    }

    try {
      await sendEmail({
        type: 'received',
        to: appointment.email,
        name: appointment.fullName,
        datetime: `${appointment.appointmentDate.toLocaleDateString('sk-SK')} ${appointment.appointmentTime}`,
      });
    } catch (error) {
      console.error('Failed to send beauty appointment email to client:', error);
    }

    try {
      const details = [
        `Služba: ${appointment.serviceTitle}`,
        `Cena: ${formatBeautyPrice(appointment.servicePrice)}`,
        `Trvanie: ${formatBeautyDuration(appointment.durationHours)}`,
        `Email: ${appointment.email}`,
        appointment.phone ? `Telefón: ${appointment.phone}` : null,
        appointment.notes ? `Poznámky: ${appointment.notes}` : null,
        `ID žiadosti: ${appointment.id}`,
      ]
        .filter(Boolean)
        .join('\n');

      await sendEmail({
        type: 'internal_notice',
        to: 'info@karinart.sk',
        name: appointment.fullName,
        datetime: `${appointment.appointmentDate.toLocaleDateString('sk-SK')} ${appointment.appointmentTime}`,
        message: details,
        relatedCustomerEmail: appointment.email,
      });
    } catch (error) {
      console.error('Failed to send beauty appointment notification:', error);
    }

    revalidatePath('/beauty-sphere/appointment');

    return {
      success: true,
      appointmentId: appointment.id,
    };
  } catch (error) {
    console.error('Error creating beauty appointment:', error);
    return {
      success: false,
      error: 'Nepodarilo sa vytvoriť rezerváciu',
    };
  }
}
