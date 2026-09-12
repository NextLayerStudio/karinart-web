import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

import { sendEmail } from '../src/app/lib/emailService.js';

const TO = 'vasekdenis@outlook.com';
const NAME = 'Denis Vašek';
const FIRST = 'Denis';
const DELAY = (ms: number) => new Promise((r) => setTimeout(r, ms));
const TPL = (name: string) =>
  fs.readFileSync(path.join(process.cwd(), 'src/app/lib/emailTemplates', name), 'utf8');

console.log('--- Posielam všetky formáty emailov na', TO, '---\n');

// ── 1. Email verification ─────────────────────────────────────────────────
console.log('1/6  email-verification...');
const r1 = await sendEmail({
  type: 'email_verification',
  to: TO,
  name: NAME,
  verificationLink: 'https://karinart.sk/verify-email?token=preview-demo-token',
});
console.log('     OK:', r1.success, r1.error ?? '');
await DELAY(1500);

// ── 2. Loyalty reward (tier 5 + VIP tier 10) ─────────────────────────────
console.log('2/6  loyalty-reward...');
const REWARD_CARD = (tier: number, title: string, code: string) => `
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 16px;">
    <tr>
      <td style="padding:20px 24px;background:linear-gradient(135deg,rgba(194,164,223,0.1) 0%,rgba(90,78,138,0.15) 100%);border:1px solid rgba(194,164,223,0.3);border-radius:14px;">
        <p style="margin:0 0 6px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#c2a4df;">Odmena · Úroveň ${tier}</p>
        <p style="margin:0 0 12px;font-size:20px;font-weight:600;color:#ffffff;">${title}</p>
        <p style="margin:0;font-size:13px;letter-spacing:1px;color:rgba(255,255,255,0.5);">Kód poukazu</p>
        <p style="margin:4px 0 0;font-size:18px;font-weight:700;letter-spacing:3px;color:#c2a4df;">${code}</p>
      </td>
    </tr>
  </table>`;

const VIP_BLOCK = `
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:28px 0;">
    <tr>
      <td style="padding:28px 24px;background:linear-gradient(135deg,rgba(194,164,223,0.2) 0%,rgba(90,78,138,0.3) 100%);border:2px solid #c2a4df;border-radius:16px;text-align:center;">
        <p style="margin:0 0 8px;font-size:22px;">👑</p>
        <p style="margin:0 0 8px;font-size:24px;font-weight:400;color:#c2a4df;font-family:Georgia,'Times New Roman',serif;">VIP STATUS</p>
        <p style="margin:0 0 16px;font-size:14px;color:rgba(255,255,255,0.7);">Gratulujem — stávaš sa VIP členom!</p>
        <ul style="margin:0;padding:0;list-style:none;text-align:left;">
          <li style="padding:4px 0;font-size:14px;color:rgba(255,255,255,0.8);">✓ 10 % doživotná zľava</li>
          <li style="padding:4px 0;font-size:14px;color:rgba(255,255,255,0.8);">✓ Prednostné rezervovanie termínov</li>
          <li style="padding:4px 0;font-size:14px;color:rgba(255,255,255,0.8);">✓ Tetovací set k narodeninám</li>
          <li style="padding:4px 0;font-size:14px;color:rgba(255,255,255,0.8);">✓ Mystery box na Vianoce</li>
        </ul>
      </td>
    </tr>
  </table>`;

const PROFILE_CTA = `
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:28px 0;">
    <tr>
      <td align="center">
        <a href="https://karinart.sk/customer-program" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#5a4e8a,#7568ad);color:#ffffff;text-decoration:none;border-radius:8px;font-size:15px;font-weight:600;">Pozrieť si kartu</a>
      </td>
    </tr>
  </table>`;

let loyaltyHtml = TPL('loyalty-reward.html')
  .replace('{{FIRST_NAME}}', FIRST)
  .replace('{{NEW_TIER}}', '10')
  .replace('{{REWARDS_BLOCK}}', REWARD_CARD(5, '20 % zľava', 'LVL5-DEMO-ABC') + REWARD_CARD(10, 'VIP STATUS', 'LVL10-DEMO-XYZ'))
  .replace('{{VIP_BLOCK}}', VIP_BLOCK)
  .replace('{{PROFILE_CTA_BLOCK}}', PROFILE_CTA);

const r2 = await sendEmail({
  type: 'loyalty_reward',
  to: TO,
  name: NAME,
  subject: 'Gratulujem! Odomkol(a) si novú odmenu — úroveň 10 / VIP',
  customHtml: loyaltyHtml,
});
console.log('     OK:', r2.success, r2.error ?? '');
await DELAY(1500);

// ── 3. Invite activation (ink kredity) ───────────────────────────────────
console.log('3/6  invite-activation...');
const INK = 5;
const EUR = (INK * 2).toFixed(0); // 1 ink = 2 €

let inviteHtml = TPL('invite-activation.html')
  .replace(/\{\{FIRST_NAME\}\}/g, FIRST)
  .replace(/\{\{INK_CREDITS\}\}/g, String(INK))
  .replace(/\{\{DISCOUNT_EUROS\}\}/g, EUR)
  .replace('{{PROFILE_CTA_BLOCK}}', PROFILE_CTA);

const r3 = await sendEmail({
  type: 'invite_activation',
  to: TO,
  name: NAME,
  subject: 'Gratulujem! Ink kredity za aktiváciu pozvaného hosta',
  customHtml: inviteHtml,
});
console.log('     OK:', r3.success, r3.error ?? '');
await DELAY(1500);

// ── 4. Giveaway discount ─────────────────────────────────────────────────
console.log('4/6  giveaway-discount...');
const r4 = await sendEmail({
  type: 'giveaway_discount',
  to: TO,
  name: NAME,
  discountCode: 'DEMO-PREVIEW-10',
});
console.log('     OK:', r4.success, r4.error ?? '');
await DELAY(1500);

// ── 5–6. Rezervačné emaily (plain text) ──────────────────────────────────
const DEMO_DT = '15. august 2026, 14:00';

console.log('5/6  appointment — received + confirmed...');
const r5a = await sendEmail({ type: 'received', to: TO, name: NAME, datetime: DEMO_DT });
console.log('     received:', r5a.success, r5a.error ?? '');
await DELAY(1000);
const r5b = await sendEmail({ type: 'confirmed', to: TO, name: NAME, datetime: DEMO_DT });
console.log('     confirmed:', r5b.success, r5b.error ?? '');
await DELAY(1000);
const r5c = await sendEmail({ type: 'rescheduled', to: TO, name: NAME, datetime: '22. august 2026, 10:00' });
console.log('     rescheduled:', r5c.success, r5c.error ?? '');
await DELAY(1000);
const r5d = await sendEmail({ type: 'declined', to: TO, name: NAME, datetime: DEMO_DT });
console.log('     declined:', r5d.success, r5d.error ?? '');
await DELAY(1000);

console.log('6/6  internal_notice + marketing...');
const r6a = await sendEmail({ type: 'internal_notice', to: TO, name: NAME, datetime: DEMO_DT });
console.log('     internal_notice:', r6a.success, r6a.error ?? '');
await DELAY(1000);
const r6b = await sendEmail({
  type: 'marketing',
  to: TO,
  name: NAME,
  subject: '[PREVIEW] Novinky z Karin Art',
  message: 'Toto je ukážkový marketingový email. Všetko funguje správne!',
});
console.log('     marketing:', r6b.success, r6b.error ?? '');

console.log('\nVšetko odoslané na', TO);
