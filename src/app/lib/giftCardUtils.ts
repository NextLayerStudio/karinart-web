import prisma from './prisma';

/**
 * Generates a unique gift card code in the format: GIFTXXXXXX
 * where X is a random alphanumeric character
 */
export async function generateGiftCardCode(): Promise<string> {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const prefixes = ['GC', 'GIFT', 'CARD'];
  let code: string;
  let isUnique = false;

  while (!isUnique) {
    // Pick a random prefix
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    
    // Generate random characters
    let randomPart = '';
    for (let i = 0; i < 6; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    code = `${prefix}${randomPart}`;

    // Check if code is unique in GiftCard table
    const existingGiftCard = await prisma.giftCard.findUnique({
      where: { code },
    });

    if (!existingGiftCard) {
      isUnique = true;
      return code;
    }
  }

  throw new Error('Could not generate unique gift card code');
}

// Generate unique discount code for giveaway
export function generateGiveawayDiscountCode(): string {
  const prefix = 'NELETNA';
  const randomNumbers = Math.floor(Math.random() * 90000) + 10000; // 5 random digits (10000-99999)
  return `${prefix}${randomNumbers}`;
}

// Validate discount code format
export function isValidDiscountCode(code: string): boolean {
  // Check if code starts with NELETNA and has 5 digits after
  return /^NELETNA\d{5}$/.test(code);
}
