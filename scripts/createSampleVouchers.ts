import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createSampleVouchers() {
  try {
    console.log('Creating sample discount codes and gift cards...');

    // Create sample discount codes
    const discountCodes = [
      {
        code: 'WELCOME10',
        type: 'percentage',
        value: 10,
        maxUses: 50,
        description: 'Uvítací kód - 10% zľava pre nových zákazníkov',
        expiresAt: new Date('2025-12-31')
      },
      {
        code: 'SUMMER20',
        type: 'percentage',
        value: 20,
        maxUses: 20,
        description: 'Letná zľava - 20% zľava',
        expiresAt: new Date('2024-08-31')
      },
      {
        code: 'FIXED50',
        type: 'fixed',
        value: 50,
        maxUses: 10,
        description: 'Fixná zľava 50€',
        expiresAt: new Date('2025-06-30')
      },
      {
        code: 'MINI15',
        type: 'percentage',
        value: 15,
        maxUses: 30,
        description: 'Zľava na malé tetovania - 15%',
        expiresAt: new Date('2025-03-31')
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

    // Create sample gift cards
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
        expiresAt: new Date('2024-12-31')
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

    console.log('Sample vouchers created successfully!');
    console.log('\nSample discount codes:');
    console.log('- WELCOME10 (10% off, expires 2025-12-31)');
    console.log('- SUMMER20 (20% off, expires 2024-08-31)');
    console.log('- FIXED50 (50€ off, expires 2025-06-30)');
    console.log('- MINI15 (15% off, expires 2025-03-31)');
    
    console.log('\nSample gift cards:');
    console.log('- GIFT100 (100€, expires 2025-12-31)');
    console.log('- GIFT200 (200€, expires 2025-12-31)');
    console.log('- GIFT50 (50€, expires 2025-06-30)');
    console.log('- BIRTHDAY75 (75€, expires 2024-12-31)');

  } catch (error) {
    console.error('Error creating sample vouchers:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleVouchers(); 