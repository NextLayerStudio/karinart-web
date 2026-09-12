import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { shouldSkipInternalNotice } from '@/app/lib/testAccount';

function getFirstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || fullName;
}

export interface EmailData {
  type: 'received' | 'confirmed' | 'rescheduled' | 'declined' | 'internal_notice' | 'marketing' | 'giveaway_discount' | 'email_verification' | 'loyalty_reward' | 'invite_activation' | 'vip_expiry_warning' | 'analytics_report';
  to: string;
  name: string;
  relatedCustomerEmail?: string;
  datetime?: string;
  message?: string;
  subject?: string;
  discountCode?: string;
  verificationLink?: string;
  loyaltyRewardHtml?: string;
  customHtml?: string;
}

// Email templates
const emailTemplates = {
  received: {
    subject: 'Vaša rezervácia bola prijatá',
    body: (name: string, datetime: string) => 
      `Dobrý deň ${name},

Vaša žiadosť o rezerváciu na ${datetime} bola úspešne prijatá.
Karin sa Vám čoskoro ozve ohľadom potvrdenia termínu.

Ďakujeme za prejavenú dôveru.

S pozdravom,
Karin Art
info@karinart.sk`
  },
  confirmed: {
    subject: 'Vaša rezervácia bola potvrdená',
    body: (name: string, datetime: string) => 
      `Dobrý deň ${name},

Vaša rezervácia na termín ${datetime} bola potvrdená.
Tešíme sa na Vašu návštevu.

V prípade otázok nás neváhajte kontaktovať.

S pozdravom,
Karin Art
info@karinart.sk`
  },
  rescheduled: {
    subject: 'Zmena rezervácie',
    body: (name: string, datetime: string) => 
      `Dobrý deň ${name},

Vaša rezervácia bola upravená. Nový termín je ${datetime}.
Pokiaľ Vám nový termín nevyhovuje, prosím, dajte nám vedieť.

S pozdravom,
Karin Art
info@karinart.sk`
  },
  declined: {
    subject: 'Rezervácia zamietnutá',
    body: (name: string, datetime: string) => 
      `Dobrý deň ${name},

Ľutujeme, ale Vašu rezerváciu na termín ${datetime} nebolo možné potvrdiť.
Prosím, vyberte si iný termín alebo nás kontaktujte pre ďalšie možnosti.

S pozdravom,
Karin Art
info@karinart.sk`
  },
  internal_notice: {
    subject: 'Nová žiadosť o termín',
    body: (name: string, datetime: string) => 
      `Bola prijatá nová žiadosť o termín od klienta ${name}, na dátum ${datetime}.

S pozdravom,
Karin Art
info@karinart.sk`
  },
  marketing: {
    subject: (customSubject: string) => customSubject || 'Novinky z Karin Art',
    body: (name: string, message: string) => 
      `Dobrý deň ${name},

${message}

S pozdravom,
Karin Art
info@karinart.sk`
  },
  email_verification: {
    subject: 'Ahoj! Ešte jedno kliknutie a si v mojom zákazníckom programe',
    body: (name: string, verificationLink: string) => {
      const templatePath = path.join(
        process.cwd(),
        'src/app/lib/emailTemplates/email-verification.html'
      );
      const firstName = getFirstName(name);

      try {
        let htmlContent = fs.readFileSync(templatePath, 'utf8');
        htmlContent = htmlContent
          .replace(/\{\{NAME\}\}/g, name)
          .replace(/\{\{FIRST_NAME\}\}/g, firstName)
          .replace(/\{\{VERIFICATION_LINK\}\}/g, verificationLink);
        return htmlContent;
      } catch (error) {
        console.error('Error reading email verification template:', error);
        return `Ahoj ${firstName},

ďakujem za záujem zapojiť sa do môjho zákazníckeho programu — veľmi ma to teší!

Ešte jeden malý krok: over svoj email kliknutím na tento odkaz:
${verificationLink}

Odkaz je platný 24 hodín.

Ak si sa neregistroval(a), tento email pokojne ignoruj.

S láskou,
Karin
info@karinart.sk`;
      }
    },
    plainText: (name: string, verificationLink: string) => {
      const firstName = getFirstName(name);
      return `Ahoj ${firstName},

ďakujem za záujem zapojiť sa do môjho zákazníckeho programu — veľmi ma to teší!

Ešte jeden malý krok: over svoj email kliknutím na tento odkaz:
${verificationLink}

Odkaz je platný 24 hodín.

Ak si sa neregistroval(a), tento email pokojne ignoruj.

Teším sa na teba v štúdiu!

S láskou,
Karin
info@karinart.sk`;
    },
  },
  giveaway_discount: {
    subject: '🎉 Si v hre! - NELETNÁ Giveaway',
    body: (name: string, discountCode: string) => {
      // Read the HTML template
      const templatePath = path.join(process.cwd(), 'src/app/lib/emailTemplates/giveaway.html');
      
      try {
        let htmlContent = fs.readFileSync(templatePath, 'utf8');
        // Replace the placeholder with the actual discount code
        htmlContent = htmlContent.replace(/SEPTINK10/g, discountCode);
        return htmlContent;
      } catch (error) {
        console.error('Error reading email template:', error);
        // Fallback to plain text
        return `Dobrý deň ${name},

Ďakujeme za účasť v NELETNEJ súťaži o tetovanie! 🎨

Vaša 10% zľava na septemberové termíny je tu:

🎫 Zľavový kód: ${discountCode}

Ako použiť zľavu:
• Pri rezervácii termínu v septembri 2025 povedzte tento kód
• Zľava platí iba pre termíny v septembri 2025
• Zľava sa vzťahuje na všetky typy tetovaní
• Kód je platný len raz

Víťaza súťaže zverejníme čoskoro na našom Instagram profile.

S pozdravom,
Karin Art
info@karinart.sk`;
      }
    }
  }
};

// Create transporter
function createTransporter() {
  const port = parseInt(process.env.SMTP_PORT || '465');
  const isSecure = port === 465; // Port 465 uses SSL, port 587 uses STARTTLS
  
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.m1.websupport.sk',
    port: port,
    secure: isSecure, // true for 465, false for 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    // For port 587, we need to enable STARTTLS
    ...(port === 587 && {
      requireTLS: true,
      tls: {
        rejectUnauthorized: false
      }
    })
  });
}

// Validation function
export function validateEmailData(data: unknown): data is EmailData {
  if (typeof data !== 'object' || data === null) return false;
  
  const d = data as Partial<EmailData>;
  
  if (!d.type || !d.to || !d.name) {
    return false;
  }

  if (d.type === 'email_verification') {
  return (
      typeof d.type === 'string' &&
      typeof d.to === 'string' &&
      typeof d.name === 'string' &&
      d.to.trim().length > 0 &&
      d.name.trim().length > 0 &&
      typeof (d.verificationLink ?? d.message) === 'string' &&
      (d.verificationLink ?? d.message ?? '').trim().length > 0
    );
  }

  if (d.type === 'loyalty_reward' || d.type === 'invite_activation' || d.type === 'vip_expiry_warning' || d.type === 'marketing' || d.type === 'analytics_report') {
    return (
      typeof d.type === 'string' &&
      typeof d.to === 'string' &&
      typeof d.name === 'string' &&
      d.to.trim().length > 0 &&
      d.name.trim().length > 0
    );
  }
  
  if (!d.datetime) {
    return false;
  }
  
  if (typeof d.type !== 'string' || typeof d.to !== 'string' || 
      typeof d.name !== 'string' || typeof d.datetime !== 'string' ||
      d.to.trim().length === 0 || d.name.trim().length === 0 || 
      d.datetime.trim().length === 0) {
    return false;
  }
  return true;
}

// Main email sending function
export async function sendEmail(emailData: EmailData): Promise<{ success: boolean; error?: string }> {
  try {
    if (
      emailData.type === 'internal_notice' &&
      shouldSkipInternalNotice(emailData.relatedCustomerEmail)
    ) {
      console.log('Skipping internal notice for sandbox test account');
      return { success: true };
    }

    // Check if SMTP credentials are configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('SMTP credentials not configured');
      return { success: false, error: 'Email service not configured' };
    }

    // Log SMTP configuration for debugging (without password)
    const port = parseInt(process.env.SMTP_PORT || '465');
    const isSecure = port === 465;
    console.log('SMTP Configuration:', {
      host: process.env.SMTP_HOST || 'smtp.m1.websupport.sk',
      port: process.env.SMTP_PORT || '465',
      user: process.env.SMTP_USER,
      secure: isSecure
    });

    // Get email template
    const template = emailTemplates[emailData.type as keyof typeof emailTemplates];
    if (!template && emailData.type !== 'loyalty_reward' && emailData.type !== 'invite_activation' && emailData.type !== 'vip_expiry_warning' && emailData.type !== 'analytics_report') {
      return { success: false, error: 'Invalid email type' };
    }

    // Create email content
    let emailBody: string;
    let emailSubject: string;
    let plainTextBody: string | undefined;

    if (emailData.type === 'marketing') {
      emailBody = template.body(emailData.name, emailData.message || '');
      emailSubject = emailData.subject || 'Novinky z Karin Art';
    } else if (emailData.type === 'email_verification') {
      const verificationLink = emailData.verificationLink || emailData.message || '';
      emailBody = template.body(emailData.name, verificationLink);
      emailSubject = template.subject as string;
      const verificationTemplate = emailTemplates.email_verification as {
        plainText?: (name: string, verificationLink: string) => string;
      };
      plainTextBody = verificationTemplate.plainText?.(emailData.name, verificationLink);
    } else if (emailData.type === 'giveaway_discount') {
      emailBody = template.body(emailData.name, emailData.discountCode || '');
      emailSubject = template.subject as string;
    } else if (emailData.type === 'loyalty_reward' || emailData.type === 'invite_activation' || emailData.type === 'vip_expiry_warning' || emailData.type === 'analytics_report') {
      emailBody =
        emailData.customHtml || emailData.loyaltyRewardHtml || emailData.message || '';
      emailSubject =
        emailData.subject ||
        (emailData.type === 'loyalty_reward'
          ? 'Gratulujem! Nová odmena na vernostnej karte'
          : emailData.type === 'invite_activation'
            ? 'Gratulujem! Ink kredity za aktiváciu pozvaného hosta'
            : emailData.type === 'vip_expiry_warning'
              ? 'Tvoj VIP status čoskoro vyprší'
              : 'Týždenná analytika Karin Art');
      plainTextBody = emailData.message;
    } else {
      emailBody = template.body(emailData.name, emailData.datetime ?? '');
      emailSubject = typeof template.subject === 'function' 
        ? (template.subject as (customSubject: string) => string)('') 
        : (template.subject as string);
      
      // Append custom message if provided
      if (emailData.message && typeof emailData.message === 'string') {
        emailBody += `\n\n${emailData.message}`;
      }
    }

    // Create transporter
    const transporter = createTransporter();

    const isHtmlEmail =
      emailData.type === 'giveaway_discount' ||
      emailData.type === 'email_verification' ||
      emailData.type === 'loyalty_reward' ||
      emailData.type === 'invite_activation' ||
      emailData.type === 'vip_expiry_warning' ||
      emailData.type === 'analytics_report';

    // Send email
    const mailOptions = {
      from: '"Karin Art" <info@karinart.sk>',
      replyTo: 'info@karinart.sk',
      to: emailData.to,
      subject: emailSubject,
      text: isHtmlEmail ? (plainTextBody ?? 'HTML email - please view in browser') : emailBody,
      html: isHtmlEmail ? emailBody : undefined,
    };

    console.log('Sending email:', {
      to: emailData.to,
      subject: emailSubject,
      type: emailData.type
    });

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);

    return { success: true };

  } catch (error) {
    console.error('Error sending email:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      const errorMessage = (error as Error).message;
      if (errorMessage.includes('authentication failed')) {
        return { success: false, error: 'SMTP authentication failed. Please check credentials.' };
      }
      if (errorMessage.includes('Invalid login')) {
        return { success: false, error: 'Invalid SMTP login credentials.' };
      }
      if (errorMessage.includes('ECONNREFUSED')) {
        return { success: false, error: 'SMTP connection refused. Please check host and port.' };
      }
      return { success: false, error: `Email sending failed: ${errorMessage}` };
    }
    
    return { success: false, error: 'Failed to send email' };
  }
}