import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { sendEmail } from '../src/app/lib/emailService.js';
import { getCustomerProgramUrl } from '../src/app/lib/customerUtils.js';
import { buildProfileCtaBlock, buildProfileCtaPlainText } from '../src/app/lib/emailHelpers.js';
import { inkCreditsToEuros } from '../src/app/lib/summerInviteProgram.js';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

const INVITER_EMAIL = process.argv[2] || 'lirixteam@gmail.com';

const prisma = new PrismaClient();

function getFirstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || fullName;
}

async function sendInviteActivationEmail(params: {
  to: string;
  fullName: string;
  inkCreditsAwarded: number;
}) {
  const { to, fullName, inkCreditsAwarded } = params;
  const firstName = getFirstName(fullName);
  const profileUrl = getCustomerProgramUrl();
  const discountEuros = inkCreditsToEuros(inkCreditsAwarded);
  const templatePath = path.join(
    process.cwd(),
    'src/app/lib/emailTemplates/invite-activation.html'
  );

  const subject = `🎉 +${inkCreditsAwarded} ink kreditov — aktivácia pozvaného hosta`;

  const plainText = `Ahoj ${firstName},

gratulujem! Jeden z tvojich pozvaných hostí práve aktivoval letný Ink program.

Na tvoj účet som ti pripísala ${inkCreditsAwarded} ink kreditov (${discountEuros} € zľava).
${buildProfileCtaPlainText(profileUrl)}
Ďakujem, že šíriš slovo o Karin Art!

S láskou,
Karin
info@karinart.sk`;

  const htmlBody = fs
    .readFileSync(templatePath, 'utf8')
    .replace(/\{\{FIRST_NAME\}\}/g, firstName)
    .replace(/\{\{INK_CREDITS\}\}/g, String(inkCreditsAwarded))
    .replace(/\{\{DISCOUNT_EUROS\}\}/g, String(discountEuros))
    .replace(/\{\{PROFILE_CTA_BLOCK\}\}/g, buildProfileCtaBlock(profileUrl));

  return sendEmail({
    type: 'invite_activation',
    to,
    name: fullName,
    subject,
    message: plainText,
    customHtml: htmlBody,
  });
}

async function main() {
  const inviter = await prisma.customer.findUnique({
    where: { email: INVITER_EMAIL },
    select: { id: true, email: true, fullName: true },
  });

  if (!inviter) {
    throw new Error(`Customer not found: ${INVITER_EMAIL}`);
  }

  const activations = await prisma.inviteeActivation.findMany({
    where: { inviterId: inviter.id },
    orderBy: { createdAt: 'asc' },
    include: {
      invitee: { select: { fullName: true } },
    },
  });

  if (activations.length === 0) {
    console.log('No activations found — sending one preview email instead.');
    const result = await sendInviteActivationEmail({
      to: inviter.email,
      fullName: inviter.fullName,
      inkCreditsAwarded: 100,
    });
    console.log(result);
    return;
  }

  console.log(`Sending ${activations.length} ink notification email(s) to ${inviter.email}...\n`);

  for (const activation of activations) {
    const result = await sendInviteActivationEmail({
      to: inviter.email,
      fullName: inviter.fullName,
      inkCreditsAwarded: activation.inkCreditsAwarded,
    });

    console.log(
      result.success
        ? `✅ Sent (+${activation.inkCreditsAwarded} ink — ${activation.invitee.fullName})`
        : `❌ Failed (${activation.invitee.fullName}): ${result.error}`
    );
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
