import dotenv from 'dotenv';
import { sendEmail } from '../src/app/lib/emailService.js';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

const result = await sendEmail({
  type: 'email_verification',
  to: 'vasekdenis@outlook.com',
  name: 'Denis',
  verificationLink: 'https://karinart.sk/verify-email?token=test-preview-link',
});

console.log(result);
