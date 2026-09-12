'use server';

import prisma from '@/app/lib/prisma';
import { revalidatePath } from 'next/cache';
import { sendEmail } from '@/app/lib/emailService';

interface AppointmentFormData {
  fullName: string;
  email: string;
  confirmAdult: boolean;
  placement: string;
  size: string;
  color: string;
  description: string;
  references: string[];
  notes?: string;
  contactPreferenceEmail: boolean;
  contactPreferenceInstagram: boolean;
  contactPreferencePhone: boolean;
  instagram?: string;
  phone?: string;
  agreeMarketing: boolean;
  agreePrivacy: boolean;
  allergies: boolean;
  allergyDescription?: string;
  healthIssues: boolean;
  healthIssueDescription?: string;
  voucherCode?: string;
  imageUrl?: string;
  appointmentDate: Date;
  appointmentTime: string;
}

export async function createTattooAppointment(formData: AppointmentFormData) {
  try {
    // Validate required fields
    if (!formData.confirmAdult || !formData.agreePrivacy) {
      return { success: false, error: 'Required consents not provided' };
    }

    // Validate appointment date (must be at least 2 days in advance)
    const appointmentDate = new Date(formData.appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    appointmentDate.setHours(0, 0, 0, 0);
    
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + 2); // Minimum 2 days advance
    
    if (appointmentDate < minDate) {
      return { 
        success: false, 
        error: 'Termín musí byť minimálne 2 dni vopred. Vyberte prosím neskorší dátum.' 
      };
    }

    if (formData.allergies && !formData.allergyDescription?.trim()) {
      return { success: false, error: 'Allergy description required when allergies are indicated' };
    }

    if (formData.healthIssues && !formData.healthIssueDescription?.trim()) {
      return { success: false, error: 'Health issue description required when health issues are indicated' };
    }

    // Filter out empty references
    const filteredReferences = formData.references.filter(ref => ref.trim() !== '');

    // Validate and process voucher code
    let voucherDetails = null;
    let voucherType = null;
    
    if (formData.voucherCode?.trim()) {
      const upperCode = formData.voucherCode.trim().toUpperCase();
      
      // First check discount codes
      const discountCode = await prisma.discountCode.findUnique({
        where: { code: upperCode }
      });
      
      if (discountCode && discountCode.isActive && 
          (!discountCode.expiresAt || new Date() < discountCode.expiresAt) &&
          discountCode.currentUses < discountCode.maxUses) {
        
        // Check availability date range
        const appointmentDateObj = new Date(formData.appointmentDate);
        if ((!discountCode.availableFrom || appointmentDateObj >= discountCode.availableFrom) &&
            (!discountCode.availableTo || appointmentDateObj <= discountCode.availableTo)) {
          voucherDetails = discountCode;
          voucherType = 'discount';
        }
      }
      
      // If not a discount code, check gift cards
      if (!voucherDetails) {
        const giftCard = await prisma.giftCard.findUnique({
          where: { code: upperCode }
        });
        
        if (giftCard && giftCard.isActive && 
            (!giftCard.expiresAt || new Date() < giftCard.expiresAt) &&
            giftCard.currentUses < giftCard.maxUses &&
            giftCard.balance > 0) {
          voucherDetails = giftCard;
          voucherType = 'giftcard';
        }
      }
    }

    // Create appointment in database
    const appointment = await prisma.tattooAppointment.create({
      data: {
        fullName: formData.fullName,
        email: formData.email,
        confirmAdult: formData.confirmAdult,
        placement: formData.placement,
        size: formData.size,
        color: formData.color,
        description: formData.description,
        references: filteredReferences,
        imageUrl: formData.imageUrl || null,
        notes: formData.notes || null,
        contactPreferenceEmail: formData.contactPreferenceEmail,
        contactPreferenceInstagram: formData.contactPreferenceInstagram,
        contactPreferencePhone: formData.contactPreferencePhone,
        instagram: formData.instagram || null,
        phone: formData.phone || null,
        agreeMarketing: formData.agreeMarketing,
        agreePrivacy: formData.agreePrivacy,
        allergies: formData.allergies,
        allergyDescription: formData.allergyDescription || null,
        healthIssues: formData.healthIssues,
        healthIssueDescription: formData.healthIssueDescription || null,
        voucherCode: voucherDetails?.code || null,
        voucherType: voucherType,
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime,
        status: 'pending',
      },
    });

    // Voucher usage will be recorded only when appointment is approved by Karin
    // For now, just store the voucher information in the appointment

    // Save email to marketing list if consent given
    if (formData.agreeMarketing) {
      try {
        await prisma.marketing.upsert({
          where: { email: formData.email },
          update: {}, // Don't update anything if email already exists
          create: {
            email: formData.email,
          },
        });
      } catch (error) {
        console.error('Error saving marketing email:', error);
        // Don't fail the appointment creation if marketing save fails
      }
    }

    // Send confirmation email to the requestee
    try {
      const emailResult = await sendEmail({
        type: 'received',
        to: appointment.email,
        name: appointment.fullName,
        datetime: `${appointment.appointmentDate.toLocaleDateString('sk-SK')} ${appointment.appointmentTime}`,
      });
      
      if (!emailResult.success) {
        console.error('Failed to send confirmation email to requestee:', emailResult.error);
      } else {
        console.log('Confirmation email sent successfully to:', appointment.email);
      }
    } catch (error) {
      console.error('Failed to send confirmation email to requestee:', error);
    }

    // Send notification email to info@karinart.sk
    try {
      let details = `Kontaktný e-mail: ${appointment.email}\n`;
      details += `\nPodrobnosti:\n`;
      details += `Umiestnenie: ${appointment.placement}\n`;
      details += `Veľkosť: ${appointment.size}\n`;
      details += `Štýl: ${appointment.color}\n`;
      details += `Popis: ${appointment.description}\n`;
      if (appointment.references.length > 0) {
        details += `Referencie: ${appointment.references.join(', ')}\n`;
      }
      if (appointment.imageUrl) {
        details += `Obrázok: ${appointment.imageUrl}\n`;
      }
      if (appointment.notes) {
        details += `Poznámky: ${appointment.notes}\n`;
      }
      details += `Preferencie kontaktu: `;
      if (appointment.contactPreferenceEmail) details += 'Email ';
      if (appointment.contactPreferenceInstagram) details += 'Instagram ';
      if (appointment.contactPreferencePhone) details += 'Telefón ';
      if (appointment.instagram) details += `\nInstagram: ${appointment.instagram}`;
      if (appointment.phone) details += `\nTelefón: ${appointment.phone}`;
      if (appointment.allergies) details += `\nAlergie: ${appointment.allergyDescription}`;
      if (appointment.healthIssues) details += `\nZdravotné problémy: ${appointment.healthIssueDescription}`;
      if (appointment.voucherCode) details += `\n${appointment.voucherType === 'discount' ? 'Zľavový kód' : 'Darčekový poukaz'}: ${appointment.voucherCode}`;
      details += `\nSúhlas dospelý: ${appointment.confirmAdult ? 'Áno' : 'Nie'}`;
      details += `\nSúhlas GDPR: ${appointment.agreePrivacy ? 'Áno' : 'Nie'}`;
      details += `\nSúhlas marketing: ${appointment.agreeMarketing ? 'Áno' : 'Nie'}`;
      details += `\nID žiadosti: ${appointment.id}`;
      details += `\nOdoslané: ${appointment.createdAt.toLocaleString('sk-SK')}`;
      
      const emailResult = await sendEmail({
        type: 'internal_notice',
        to: 'info@karinart.sk',
        name: appointment.fullName,
        datetime: `${appointment.appointmentDate.toLocaleDateString('sk-SK')} ${appointment.appointmentTime}`,
        message: details,
        relatedCustomerEmail: appointment.email,
      });
      
      if (!emailResult.success) {
        console.error('Failed to send notification email to info@karinart.sk:', emailResult.error);
      } else {
        console.log('Notification email sent successfully to info@karinart.sk');
      }
    } catch (error) {
      console.error('Failed to send notification email to info@karinart.sk:', error);
    }

    // Generate test output (simulates email content)
    const testOutput = generateTestOutput(appointment, formData.appointmentDate, formData.appointmentTime);

    // In a real application, you would send this as an email
    // For now, we'll just log it to console
    console.log('=== APPOINTMENT REQUEST TEST OUTPUT ===');
    console.log(testOutput);
    console.log('========================================');

    revalidatePath('/appointment');

    return { 
      success: true, 
      appointmentId: appointment.id,
      testOutput 
    };

  } catch (error) {
    console.error('Error creating tattoo appointment:', error);
    return { 
      success: false, 
      error: 'Failed to create appointment' 
    };
  }
}

function generateTestOutput(appointment: {
  id: string;
  fullName: string;
  email: string;
  placement: string;
  size: string;
  color: string;
  description: string;
  references: string[];
  imageUrl: string | null;
  notes: string | null;
  contactPreferenceEmail: boolean;
  contactPreferenceInstagram: boolean;
  contactPreferencePhone: boolean;
  instagram: string | null;
  phone: string | null;
  agreeMarketing: boolean;
  confirmAdult: boolean;
  agreePrivacy: boolean;
  allergies: boolean;
  allergyDescription: string | null;
  healthIssues: boolean;
  healthIssueDescription: string | null;
  createdAt: Date;
}, appointmentDate: Date, appointmentTime: string): string {
  const contactMethods = [];
  if (appointment.contactPreferenceEmail) contactMethods.push('Email');
  if (appointment.contactPreferenceInstagram) contactMethods.push('Instagram');
  if (appointment.contactPreferencePhone) contactMethods.push('Phone');

  const healthInfo = [];
  if (appointment.allergies) {
    healthInfo.push(`Allergies: ${appointment.allergyDescription}`);
  }
  if (appointment.healthIssues) {
    healthInfo.push(`Health Issues: ${appointment.healthIssueDescription}`);
  }

  return `
NEW TATTOO APPOINTMENT REQUEST
==============================

APPOINTMENT DETAILS:
Date: ${appointmentDate.toLocaleDateString('en-US', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}
Time: ${appointmentTime}

CLIENT INFORMATION:
Name: ${appointment.fullName}
Email: ${appointment.email}

TATTOO DETAILS:
Placement: ${appointment.placement}
Size: ${appointment.size}
Color Style: ${appointment.color === 'color' ? 'Color' : 'Black and White'}
Description: ${appointment.description}

REFERENCE IMAGES:
${appointment.references.length > 0 ? appointment.references.map((ref: string, index: number) => `${index + 1}. ${ref}`).join('\n') : 'None provided'}

${appointment.imageUrl ? `UPLOADED REFERENCE IMAGE: ${appointment.imageUrl}` : ''}

${appointment.notes ? `ADDITIONAL NOTES: ${appointment.notes}` : ''}

CONTACT PREFERENCES:
Preferred contact methods: ${contactMethods.join(', ')}
${appointment.instagram ? `Instagram: ${appointment.instagram}` : ''}
${appointment.phone ? `Phone: ${appointment.phone}` : ''}

HEALTH INFORMATION:
${healthInfo.length > 0 ? healthInfo.join('\n') : 'No health issues reported'}

CONSENT:
- Adult confirmation: ${appointment.confirmAdult ? 'Yes' : 'No'}
- Privacy consent: ${appointment.agreePrivacy ? 'Yes' : 'No'}
- Marketing consent: ${appointment.agreeMarketing ? 'Yes' : 'No'}

SUBMISSION DETAILS:
Appointment ID: ${appointment.id}
Submitted: ${appointment.createdAt.toLocaleString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})}

---
This is a test output simulating an email notification.
In production, this would be sent to Karin's email address.
`;
} 