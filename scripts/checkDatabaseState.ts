import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabaseState() {
  try {
    console.log('Checking database state...\n');

    // Check if we can query appointments
    try {
      const appointments = await prisma.tattooAppointment.findMany({
        take: 5,
        select: {
          id: true,
          fullName: true,
          email: true,
          voucherCode: true,
          voucherType: true,
          status: true,
          createdAt: true
        }
      });
      
      console.log('✅ Successfully queried appointments:');
      console.log(`Found ${appointments.length} appointments`);
      appointments.forEach(apt => {
        console.log(`  - ${apt.fullName} (${apt.email}) - Voucher: ${apt.voucherCode || 'none'} (${apt.voucherType || 'none'})`);
      });
    } catch (error) {
      console.error('❌ Error querying appointments:', error);
    }

    // Check discount codes
    try {
      const discountCodes = await prisma.discountCode.findMany({
        take: 3,
        select: {
          id: true,
          code: true,
          type: true,
          value: true,
          availableFrom: true,
          availableTo: true,
          currentUses: true,
          maxUses: true
        }
      });
      
      console.log('\n✅ Successfully queried discount codes:');
      console.log(`Found ${discountCodes.length} discount codes`);
      discountCodes.forEach(code => {
        console.log(`  - ${code.code}: ${code.type} ${code.value} (${code.currentUses}/${code.maxUses} uses)`);
      });
    } catch (error) {
      console.error('❌ Error querying discount codes:', error);
    }

    // Check gift cards
    try {
      const giftCards = await prisma.giftCard.findMany({
        take: 3,
        select: {
          id: true,
          code: true,
          amount: true,
          balance: true,
          currentUses: true,
          maxUses: true
        }
      });
      
      console.log('\n✅ Successfully queried gift cards:');
      console.log(`Found ${giftCards.length} gift cards`);
      giftCards.forEach(card => {
        console.log(`  - ${card.code}: ${card.balance}€ balance (${card.currentUses}/${card.maxUses} uses)`);
      });
    } catch (error) {
      console.error('❌ Error querying gift cards:', error);
    }

  } catch (error) {
    console.error('Error checking database state:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseState(); 