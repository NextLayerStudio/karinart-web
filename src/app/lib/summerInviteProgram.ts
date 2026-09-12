import { isInkProgramEnabled } from '@/app/lib/siteSettings';

export const SUMMER_PROGRAM_YEAR = 2026;
export const INK_CREDITS_PER_ACTIVATION = 100;
export const INK_CREDIT_EURO_VALUE = 0.1;

/** Ink program beží nepretržite, pokiaľ ho admin nevypne */
export async function isSummerProgramActive(): Promise<boolean> {
  return isInkProgramEnabled();
}

export async function getSummerProgramStatus() {
  const isActive = await isInkProgramEnabled();
  return {
    phase: (isActive ? 'active' : 'paused') as 'active' | 'paused',
    isActive,
    label: isActive ? 'Ink program je aktívny' : 'Ink program je dočasne pozastavený',
  };
}

export function inkCreditsToEuros(credits: number): number {
  return credits * INK_CREDIT_EURO_VALUE;
}

export function redactCustomerName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return 'Anonym';
  }

  return parts
    .map((part) => {
      const firstChar = part.charAt(0).toUpperCase();
      return `${firstChar}***`;
    })
    .join(' ');
}
