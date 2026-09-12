import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestVouchers() {
  try {
    console.log('Creating test voucher codes...');

    // Test discount codes with date ranges
    const discountCodes = [
      {
        code: 'SEPTEMBER20',
        type: 'percentage',
        value: 20,
        maxUses: 10,
        description: '20% zľava pre september',
        expiresAt: new Date('2025-12-31'),
        availableFrom: new Date('2025-09-01'),
        availableTo: new Date('2025-09-30')
      },
      {
        code: 'SUMMER15',
        type: 'percentage',
        value: 15,
        maxUses: 15,
        description: '15% zľava pre letné mesiace',
        expiresAt: new Date('2025-12-31'),
        availableFrom: new Date('2025-06-01'),
        availableTo: new Date('2025-08-31')
      },
      {
        code: 'WINTER10',
        type: 'percentage',
        value: 10,
        maxUses: 20,
        description: '10% zľava pre zimné mesiace',
        expiresAt: new Date('2025-12-31'),
        availableFrom: new Date('2025-12-01'),
        availableTo: new Date('2026-02-28')
      },
      {
        code: 'FIXED50',
        type: 'fixed',
        value: 50,
        maxUses: 5,
        description: 'Fixná zľava 50€',
        expiresAt: new Date('2025-12-31'),
        availableFrom: null,
        availableTo: null
      },
      {
        code: 'MINI25',
        type: 'percentage',
        value: 25,
        maxUses: 8,
        description: '25% zľava na malé tetovania',
        expiresAt: new Date('2025-12-31'),
        availableFrom: null,
        availableTo: null
      }
    ];

    for (const discountData of discountCodes) {
      await prisma.discountCode.upsert({
        where: { code: discountData.code },
        update: discountData,
        create: discountData
      });
      console.log(`Created/Updated discount code: ${discountData.code}`);
    }

    // Test gift cards
    const giftCards = [
      {
        code: 'GIFT100',
        amount: 100,
        balance: 100,
        maxUses: 1,
        description: 'Darčekový poukaz 100€',
        expiresAt: new Date('2025-12-31')
      },
      {
        code: 'GIFT200',
        amount: 200,
        balance: 200,
        maxUses: 1,
        description: 'Darčekový poukaz 200€',
        expiresAt: new Date('2025-12-31')
      },
      {
        code: 'GIFT50',
        amount: 50,
        balance: 50,
        maxUses: 1,
        description: 'Darčekový poukaz 50€',
        expiresAt: new Date('2025-06-30')
      },
      {
        code: 'BIRTHDAY75',
        amount: 75,
        balance: 75,
        maxUses: 1,
        description: 'Narodeninový darčekový poukaz 75€',
        expiresAt: new Date('2025-12-31')
      }
    ];

    for (const giftData of giftCards) {
      await prisma.giftCard.upsert({
        where: { code: giftData.code },
        update: giftData,
        create: giftData
      });
      console.log(`Created/Updated gift card: ${giftData.code}`);
    }

    console.log('\n✅ Test vouchers created successfully!');
    console.log('\n📋 Available test codes:');
    console.log('\n🎫 Discount Codes:');
    discountCodes.forEach(code => {
      const dateRange = code.availableFrom && code.availableTo 
        ? ` (${code.availableFrom.toLocaleDateString()} - ${code.availableTo.toLocaleDateString()})`
        : ' (anytime)';
      console.log(`  • ${code.code}: ${code.type === 'percentage' ? `${code.value}%` : `${code.value}€`} off${dateRange}`);
    });
    
    console.log('\n🎁 Gift Cards:');
    giftCards.forEach(card => {
      console.log(`  • ${card.code}: ${card.amount}€ balance`);
    });

  } catch (error) {
    console.error('Error creating test vouchers:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestVouchers(); 