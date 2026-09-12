import fs from 'fs';
import path from 'path';
import { VIP_BENEFITS } from '@/app/lib/loyaltyProgram';
import { sendEmail } from '@/app/lib/emailService';
import { getCustomerProgramUrl } from '@/app/lib/customerUtils';
import { buildProfileCtaBlock, buildProfileCtaPlainText } from '@/app/lib/emailHelpers';

export interface UnlockedRewardEmail {
  tier: number;
  title: string;
  voucherCode: string;
}

function getFirstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || fullName;
}

export function buildLoyaltyVoucherCode(tier: number, transactionId: string): string {
  const suffix = transactionId.replace(/[^a-zA-Z0-9]/g, '').slice(-8).toUpperCase();
  return tier === 10 ? `KARIN-VIP-${suffix}` : `KARIN-L${tier}-${suffix}`;
}

function buildRewardsBlock(rewards: UnlockedRewardEmail[]): string {
  return rewards
    .map(
      (reward) => `
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 16px;">
                <tr>
                  <td style="padding:24px;background:linear-gradient(135deg,rgba(194,164,223,0.1) 0%,rgba(90,78,138,0.15) 100%);border:1px dashed rgba(194,164,223,0.45);border-radius:14px;text-align:center;">
                    <p style="margin:0 0 6px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#c2a4df;">Úroveň ${reward.tier}</p>
                    <p style="margin:0 0 18px;font-size:17px;line-height:1.4;color:#ffffff;font-weight:600;">${reward.title}</p>
                    <p style="margin:0 0 8px;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,0.45);">Kód poukazu</p>
                    <p style="margin:0;display:inline-block;padding:12px 20px;background:#0a0a0a;border:1px solid rgba(194,164,223,0.35);border-radius:8px;font-size:20px;font-weight:700;letter-spacing:2px;color:#c2a4df;font-family:monospace;">${reward.voucherCode}</p>
                  </td>
                </tr>
              </table>`
    )
    .join('');
}

function buildVipBlock(vipGranted: boolean): string {
  if (!vipGranted) {
    return '';
  }

  const benefitsList = VIP_BENEFITS.map(
    (benefit) =>
      `<li style="margin:0 0 8px;font-size:14px;line-height:1.6;color:rgba(255,255,255,0.75);">${benefit}</li>`
  ).join('');

  return `
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:8px 0 0;">
                <tr>
                  <td style="padding:24px;background:linear-gradient(135deg,rgba(194,164,223,0.18) 0%,rgba(90,78,138,0.25) 100%);border:1px solid rgba(194,164,223,0.5);border-radius:14px;">
                    <p style="margin:0 0 12px;font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#c2a4df;">VIP status</p>
                    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#ffffff;">
                      Gratulujem — patríš medzi exkluzívnych VIP členov! Toto sú tvoje výhody:
                    </p>
                    <ul style="margin:0;padding:0 0 0 18px;">
                      ${benefitsList}
                    </ul>
                  </td>
                </tr>
              </table>`;
}

function buildPlainText(
  fullName: string,
  newTier: number,
  rewards: UnlockedRewardEmail[],
  vipGranted: boolean,
  profileUrl: string
): string {
  const firstName = getFirstName(fullName);
  const rewardLines = rewards
    .map((r) => `  • Úroveň ${r.tier}: ${r.title}\n    Kód poukazu: ${r.voucherCode}`)
    .join('\n');

  let text = `Ahoj ${firstName},

gratulujem! Odomkol(a) si novú úroveň na vernostnej karte.

Tvoja aktuálna úroveň: ${newTier} / 10

Tvoje poukazy (ukáž tento email pri návšteve):
${rewardLines}
`;

  if (vipGranted) {
    text += `
VIP STATUS — tvoje výhody:
${VIP_BENEFITS.map((b) => `  • ${b}`).join('\n')}
`;
  }

  text += `
Ako uplatniť: Pri ďalšej návšteve mi ukáž tento email alebo kód poukazu.
${buildProfileCtaPlainText(profileUrl)}
Ďakujem za tvoju dôveru — teším sa na teba!

S láskou,
Karin
info@karinart.sk`;

  return text;
}

export async function sendLoyaltyUnlockEmail(params: {
  to: string;
  fullName: string;
  newTier: number;
  unlockedRewards: UnlockedRewardEmail[];
  vipGranted: boolean;
}): Promise<{ success: boolean; error?: string }> {
  const { to, fullName, newTier, unlockedRewards, vipGranted } = params;
  const firstName = getFirstName(fullName);
  const profileUrl = getCustomerProgramUrl();
  const templatePath = path.join(
    process.cwd(),
    'src/app/lib/emailTemplates/loyalty-reward.html'
  );

  const tierLabel =
    unlockedRewards.length === 1
      ? `úroveň ${unlockedRewards[0].tier}`
      : `úrovne ${unlockedRewards.map((r) => r.tier).join(', ')}`;

  const subject = vipGranted
    ? '🎉 Gratulujem! Odomkol(a) si VIP status — Karin Art'
    : `🎉 Gratulujem! Odomkol(a) si ${tierLabel} — Karin Art`;

  let htmlBody: string;
  try {
    htmlBody = fs
      .readFileSync(templatePath, 'utf8')
      .replace(/\{\{FIRST_NAME\}\}/g, firstName)
      .replace(/\{\{NEW_TIER\}\}/g, String(newTier))
      .replace(/\{\{REWARDS_BLOCK\}\}/g, buildRewardsBlock(unlockedRewards))
      .replace(/\{\{VIP_BLOCK\}\}/g, buildVipBlock(vipGranted))
      .replace(/\{\{PROFILE_CTA_BLOCK\}\}/g, buildProfileCtaBlock(profileUrl));
  } catch (error) {
    console.error('Error reading loyalty reward email template:', error);
    return sendEmail({
      type: 'marketing',
      to,
      name: fullName,
      subject,
      message: buildPlainText(fullName, newTier, unlockedRewards, vipGranted, profileUrl),
    });
  }

  return sendEmail({
    type: 'loyalty_reward',
    to,
    name: fullName,
    subject,
    message: buildPlainText(fullName, newTier, unlockedRewards, vipGranted, profileUrl),
    customHtml: htmlBody,
  });
}
