import fs from 'fs';
import path from 'path';
import { sendEmail } from '@/app/lib/emailService';
import { getCustomerProgramUrl } from '@/app/lib/customerUtils';
import { buildProfileCtaBlock, buildProfileCtaPlainText } from '@/app/lib/emailHelpers';
import { inkCreditsToEuros } from '@/app/lib/summerInviteProgram';

function getFirstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || fullName;
}

function buildPlainText(
  fullName: string,
  inkCredits: number,
  profileUrl: string
): string {
  const firstName = getFirstName(fullName);
  const discountEuros = inkCreditsToEuros(inkCredits);

  return `Ahoj ${firstName},

gratulujem! Jeden z tvojich pozvaných hostí práve aktivoval letný Ink program.

Na tvoj účet som ti pripísala ${inkCredits} ink kreditov (${discountEuros} € zľava).
${buildProfileCtaPlainText(profileUrl)}
Ďakujem, že šíriš slovo o Karin Art!

S láskou,
Karin
info@karinart.sk`;
}

export async function sendInviteActivationEmail(params: {
  to: string;
  fullName: string;
  inkCreditsAwarded: number;
}): Promise<{ success: boolean; error?: string }> {
  const { to, fullName, inkCreditsAwarded } = params;
  const firstName = getFirstName(fullName);
  const profileUrl = getCustomerProgramUrl();
  const discountEuros = inkCreditsToEuros(inkCreditsAwarded);
  const templatePath = path.join(
    process.cwd(),
    'src/app/lib/emailTemplates/invite-activation.html'
  );

  const subject = `🎉 +${inkCreditsAwarded} ink kreditov — aktivácia pozvaného hosta`;

  let htmlBody: string;
  try {
    htmlBody = fs
      .readFileSync(templatePath, 'utf8')
      .replace(/\{\{FIRST_NAME\}\}/g, firstName)
      .replace(/\{\{INK_CREDITS\}\}/g, String(inkCreditsAwarded))
      .replace(/\{\{DISCOUNT_EUROS\}\}/g, String(discountEuros))
      .replace(/\{\{PROFILE_CTA_BLOCK\}\}/g, buildProfileCtaBlock(profileUrl));
  } catch (error) {
    console.error('Error reading invite activation email template:', error);
    return sendEmail({
      type: 'marketing',
      to,
      name: fullName,
      subject,
      message: buildPlainText(fullName, inkCreditsAwarded, profileUrl),
    });
  }

  return sendEmail({
    type: 'invite_activation',
    to,
    name: fullName,
    subject,
    message: buildPlainText(fullName, inkCreditsAwarded, profileUrl),
    customHtml: htmlBody,
  });
}
