import fs from 'fs';
import path from 'path';
import { sendEmail } from '@/app/lib/emailService';
import { getCustomerProgramUrl } from '@/app/lib/customerUtils';
import { buildProfileCtaBlock, buildProfileCtaPlainText } from '@/app/lib/emailHelpers';
import { formatSkDate } from '@/app/lib/vipService';

function getFirstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || fullName;
}

function buildPlainText(
  fullName: string,
  expiresAt: Date,
  daysRemaining: number,
  profileUrl: string
): string {
  const firstName = getFirstName(fullName);
  const expiryLabel = formatSkDate(expiresAt);

  return `Ahoj ${firstName},

tvoj VIP status v Karin Art čoskoro vyprší — o ${daysRemaining} dní, ${expiryLabel}.

Aby si si ponechal VIP výhody, stačí ma navštíviť v štúdiu a nechať si zaznamenať termín. Každá návšteva predĺži platnosť o ďalší rok.

Ak sa v najbližších týždňoch neobjavíš, VIP status sa automaticky ukončí.
${buildProfileCtaPlainText(profileUrl)}
Teším sa na teba!

S láskou,
Karin
info@karinart.sk`;
}

export async function sendVipExpiryWarningEmail(params: {
  to: string;
  fullName: string;
  expiresAt: Date;
  daysRemaining: number;
}): Promise<{ success: boolean; error?: string }> {
  const { to, fullName, expiresAt, daysRemaining } = params;
  const firstName = getFirstName(fullName);
  const profileUrl = getCustomerProgramUrl();
  const expiryLabel = formatSkDate(expiresAt);
  const templatePath = path.join(
    process.cwd(),
    'src/app/lib/emailTemplates/vip-expiry-warning.html'
  );

  const subject = `⏳ Tvoj VIP status vyprší o ${daysRemaining} dní`;

  let htmlBody: string;
  try {
    htmlBody = fs
      .readFileSync(templatePath, 'utf8')
      .replace(/\{\{FIRST_NAME\}\}/g, firstName)
      .replace(/\{\{EXPIRY_DATE\}\}/g, expiryLabel)
      .replace(/\{\{DAYS_REMAINING\}\}/g, String(daysRemaining))
      .replace(/\{\{PROFILE_CTA_BLOCK\}\}/g, buildProfileCtaBlock(profileUrl));
  } catch (error) {
    console.error('Error reading VIP expiry warning email template:', error);
    return sendEmail({
      type: 'marketing',
      to,
      name: fullName,
      subject,
      message: buildPlainText(fullName, expiresAt, daysRemaining, profileUrl),
    });
  }

  return sendEmail({
    type: 'vip_expiry_warning',
    to,
    name: fullName,
    subject,
    message: buildPlainText(fullName, expiresAt, daysRemaining, profileUrl),
    customHtml: htmlBody,
  });
}
