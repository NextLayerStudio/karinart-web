import bcrypt from 'bcryptjs';
import prisma from '@/app/lib/prisma';
import { sendEmail } from '@/app/lib/emailService';
import {
  getVipStatusInfo,
  processVipLifecycleForCustomer,
} from '@/app/lib/vipService';
import { isTestAccountEmail } from '@/app/lib/testAccount';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+]?[\d\s()-]{9,}$/;
const VERIFICATION_TOKEN_EXPIRY_HOURS = 24;
const MIN_PASSWORD_LENGTH = 8;

export interface CustomerRegistrationInput {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  birthday: string;
  confirmAdult: boolean;
  agreeDataProcessing: boolean;
  agreeMarketing: boolean;
  invitedById?: string;
}

export type RegistrationValidationResult =
  | { valid: true }
  | { valid: false; error: string };

export function validateCustomerRegistration(
  data: CustomerRegistrationInput
): RegistrationValidationResult {
  if (!data.fullName?.trim()) {
    return { valid: false, error: 'Meno a priezvisko je povinné pole' };
  }

  if (!data.email?.trim()) {
    return { valid: false, error: 'Email je povinné pole' };
  }

  if (!EMAIL_REGEX.test(data.email.trim())) {
    return { valid: false, error: 'Neplatný formát email adresy' };
  }

  if (!data.phone?.trim()) {
    return { valid: false, error: 'Telefónne číslo je povinné pole' };
  }

  if (!PHONE_REGEX.test(data.phone.trim())) {
    return { valid: false, error: 'Neplatný formát telefónneho čísla' };
  }

  if (!data.password || data.password.length < MIN_PASSWORD_LENGTH) {
    return {
      valid: false,
      error: `Heslo musí mať aspoň ${MIN_PASSWORD_LENGTH} znakov`,
    };
  }

  if (!data.confirmAdult) {
    return { valid: false, error: 'Musíte potvrdiť, že ste starší ako 18 rokov' };
  }

  if (!data.agreeDataProcessing) {
    return {
      valid: false,
      error: 'Musíte súhlasiť so spracovaním a uchovávaním osobných údajov',
    };
  }

  if (!data.birthday?.trim()) {
    return { valid: false, error: 'Dátum narodenia je povinný' };
  }

  const birthdayDate = new Date(data.birthday);
  if (Number.isNaN(birthdayDate.getTime())) {
    return { valid: false, error: 'Neplatný dátum narodenia' };
  }

  if (birthdayDate > new Date()) {
    return { valid: false, error: 'Dátum narodenia nemôže byť v budúcnosti' };
  }

  const ageCutoff = new Date();
  ageCutoff.setFullYear(ageCutoff.getFullYear() - 18);
  if (birthdayDate > ageCutoff) {
    return { valid: false, error: 'Musíte mať aspoň 18 rokov' };
  }

  return { valid: true };
}

export function buildVerificationLink(baseUrl: string, token: string): string {
  const normalizedBaseUrl = baseUrl.replace(/\/$/, '');
  return `${normalizedBaseUrl}/verify-email?token=${token}`;
}

async function validateInviter(
  invitedById?: string
): Promise<{ valid: true; inviterId: string } | { valid: false; error: string }> {
  if (!invitedById?.trim()) {
    return { valid: true, inviterId: '' };
  }

  const inviter = await prisma.customer.findUnique({
    where: { id: invitedById.trim() },
    select: { id: true, emailVerified: true, isActive: true },
  });

  if (!inviter) {
    return { valid: false, error: 'Neplatný pozývací odkaz' };
  }

  if (!inviter.emailVerified || !inviter.isActive) {
    return { valid: false, error: 'Pozývací odkaz už nie je aktívny' };
  }

  return { valid: true, inviterId: inviter.id };
}

export async function loginCustomer(
  email: string,
  password: string
): Promise<
  | { success: true; customerId: string; isVip: boolean }
  | { success: false; error: string; status: number }
> {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail || !password) {
    return { success: false, error: 'Email a heslo sú povinné', status: 400 };
  }

  const customer = await prisma.customer.findUnique({
    where: { email: normalizedEmail },
  });

  if (!customer) {
    return { success: false, error: 'Nesprávny email alebo heslo', status: 401 };
  }

  if (!customer.emailVerified) {
    return {
      success: false,
      error: 'Najprv overte svoju emailovú adresu. Skontrolujte doručenú poštu.',
      status: 403,
    };
  }

  if (!customer.isActive) {
    return {
      success: false,
      error: 'Váš účet bol deaktivovaný. Kontaktujte nás na info@karinart.sk.',
      status: 403,
    };
  }

  const isPasswordValid = await bcrypt.compare(password, customer.password);

  if (!isPasswordValid) {
    return { success: false, error: 'Nesprávny email alebo heslo', status: 401 };
  }

  const vipLifecycle = await processVipLifecycleForCustomer(customer.id);

  return {
    success: true,
    customerId: customer.id,
    isVip: vipLifecycle?.isVip ?? customer.isVip,
  };
}

export async function getCustomerProgramData(customerId: string) {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      createdAt: true,
      isVip: true,
      vipAwardedAt: true,
      vipLastActivityAt: true,
      loyaltyVipFromCard: true,
      isTestAccount: true,
      birthday: true,
      invitedBy: {
        select: { id: true, fullName: true },
      },
      invitees: {
        where: { emailVerified: true },
        select: {
          id: true,
          fullName: true,
          email: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!customer) {
    return null;
  }

  const vipStatus = getVipStatusInfo(customer);

  return {
    ...customer,
    vipExpiresAt: vipStatus.vipExpiresAt,
    daysUntilVipExpiry: vipStatus.daysUntilExpiry,
  };
}

export async function getInviterPreview(inviterId: string) {
  return prisma.customer.findFirst({
    where: {
      id: inviterId,
      emailVerified: true,
      isActive: true,
    },
    select: { id: true, fullName: true },
  });
}

export async function registerCustomer(
  data: CustomerRegistrationInput,
  baseUrl: string
): Promise<{ success: true } | { success: false; error: string; status: number }> {
  const validation = validateCustomerRegistration(data);
  if (!validation.valid) {
    return { success: false, error: validation.error, status: 400 };
  }

  const inviterValidation = await validateInviter(data.invitedById);
  if (!inviterValidation.valid) {
    return { success: false, error: inviterValidation.error, status: 400 };
  }

  const normalizedEmail = data.email.trim().toLowerCase();
  const isTestRegistration = isTestAccountEmail(normalizedEmail);
  const existingCustomer = await prisma.customer.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingCustomer?.emailVerified) {
    return {
      success: false,
      error: 'Účet s touto emailovou adresou už existuje',
      status: 409,
    };
  }

  const verificationToken = crypto.randomUUID();
  const verificationExpiresAt = new Date(
    Date.now() + VERIFICATION_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000
  );
  const hashedPassword = await bcrypt.hash(data.password, 12);
  const birthdayDate = new Date(data.birthday);
  const customerData = {
    email: normalizedEmail,
    phone: data.phone.trim(),
    fullName: data.fullName.trim(),
    password: hashedPassword,
    birthday: birthdayDate,
    confirmAdult: data.confirmAdult,
    agreeDataProcessing: data.agreeDataProcessing,
    agreeMarketing: data.agreeMarketing,
    isTestAccount: isTestRegistration,
    emailVerified: false,
    emailVerificationToken: verificationToken,
    emailVerificationExpiresAt: verificationExpiresAt,
    invitedById: inviterValidation.inviterId || existingCustomer?.invitedById || null,
  };

  if (existingCustomer) {
    await prisma.customer.update({
      where: { id: existingCustomer.id },
      data: customerData,
    });
  } else {
    await prisma.customer.create({ data: customerData });
  }

  if (data.agreeMarketing && !isTestRegistration) {
    try {
      await prisma.marketing.upsert({
        where: { email: normalizedEmail },
        update: {},
        create: { email: normalizedEmail },
      });
    } catch (error) {
      console.error('Error adding customer to marketing list:', error);
    }
  }

  const verificationLink = buildVerificationLink(baseUrl, verificationToken);
  const emailResult = await sendEmail({
    type: 'email_verification',
    to: normalizedEmail,
    name: data.fullName.trim(),
    verificationLink,
  });

  if (!emailResult.success) {
    return {
      success: false,
      error: 'Registrácia bola vytvorená, ale nepodarilo sa odoslať overovací email. Skúste to prosím neskôr.',
      status: 500,
    };
  }

  if (isTestRegistration) {
    await prisma.customer.update({
      where: { email: normalizedEmail },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiresAt: null,
      },
    });
  }

  return { success: true };
}

export async function verifyCustomerEmail(
  token: string
): Promise<{ success: true } | { success: false; error: string; status: number }> {
  if (!token?.trim()) {
    return { success: false, error: 'Chýba overovací token', status: 400 };
  }

  const customer = await prisma.customer.findUnique({
    where: { emailVerificationToken: token },
  });

  if (!customer) {
    return { success: false, error: 'Neplatný alebo expirovaný overovací odkaz', status: 400 };
  }

  if (customer.emailVerified) {
    return { success: true };
  }

  if (
    customer.emailVerificationExpiresAt &&
    customer.emailVerificationExpiresAt < new Date()
  ) {
    return {
      success: false,
      error: 'Overovací odkaz expiroval. Zaregistrujte sa prosím znova.',
      status: 400,
    };
  }

  await prisma.customer.update({
    where: { id: customer.id },
    data: {
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpiresAt: null,
    },
  });

  return { success: true };
}
