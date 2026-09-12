import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createDummyData() {
  console.log('🚀 Creating dummy data for testing...');

  try {
    // Create dummy discount codes
    console.log('📝 Creating discount codes...');
    const discountCodes = [
      {
        code: 'WELCOME20',
        type: 'percentage',
        value: 20,
        maxUses: 50,
        currentUses: 0,
        description: 'Vítací kód - 20% zľava pre nových zákazníkov',
        isActive: true,
        availableFrom: new Date('2025-01-01'),
        availableTo: new Date('2025-12-31'),
      },
      {
        code: 'SUMMER30',
        type: 'percentage',
        value: 30,
        maxUses: 20,
        currentUses: 0,
        description: 'Letná zľava - 30% zľava na všetky tetovania',
        isActive: true,
        availableFrom: new Date('2025-06-01'),
        availableTo: new Date('2025-08-31'),
      },
      {
        code: 'FIXED50',
        type: 'fixed',
        value: 50,
        maxUses: 10,
        currentUses: 0,
        description: 'Fixná zľava 50€ na väčšie tetovania',
        isActive: true,
        availableFrom: new Date('2025-01-01'),
        availableTo: new Date('2025-12-31'),
      },
      {
        code: 'SEPTEMBER25',
        type: 'percentage',
        value: 25,
        maxUses: 15,
        currentUses: 0,
        description: 'Septembrová zľava - 25% zľava',
        isActive: true,
        availableFrom: new Date('2025-09-01'),
        availableTo: new Date('2025-09-30'),
      },
    ];

    for (const code of discountCodes) {
      await prisma.discountCode.upsert({
        where: { code: code.code },
        update: code,
        create: code,
      });
      console.log(`✅ Created discount code: ${code.code}`);
    }

    // Create dummy gift cards
    console.log('🎁 Creating gift cards...');
    const giftCards = [
      {
        code: 'GIFT100',
        amount: 100,
        balance: 100,
        maxUses: 1,
        currentUses: 0,
        description: 'Darčeková poukážka 100€',
        isActive: true,
      },
      {
        code: 'GIFT50',
        amount: 50,
        balance: 50,
        maxUses: 1,
        currentUses: 0,
        description: 'Darčeková poukážka 50€',
        isActive: true,
      },
      {
        code: 'GIFT200',
        amount: 200,
        balance: 200,
        maxUses: 1,
        currentUses: 0,
        description: 'Darčeková poukážka 200€',
        isActive: true,
      },
      {
        code: 'GIFT75',
        amount: 75,
        balance: 75,
        maxUses: 1,
        currentUses: 0,
        description: 'Darčeková poukážka 75€',
        isActive: true,
      },
    ];

    for (const card of giftCards) {
      await prisma.giftCard.upsert({
        where: { code: card.code },
        update: card,
        create: card,
      });
      console.log(`✅ Created gift card: ${card.code}`);
    }



    // Create dummy appointment requests
    console.log('📅 Creating appointment requests...');
    const appointments = [
      {
        fullName: 'Anna Malá',
        email: 'anna.mala@test.sk',
        phone: '+421901234567',
        appointmentDate: new Date('2025-08-05T10:00:00Z'),
        appointmentTime: '10:00',
        placement: 'Zápästie',
        size: 'Malé',
        color: 'Čierna',
        duration: 2,
        description: 'Malé tetovanie srdca na zápästí',
        healthIssues: false,
        healthIssueDescription: '',
        voucherCode: 'WELCOME20',
        voucherType: 'discount',
        originalPrice: 80,
        finalPrice: 64,
        status: 'pending',
        confirmAdult: true,
        agreePrivacy: true,
        agreeMarketing: true,
        contactPreferenceEmail: true,
        contactPreferencePhone: false,
        contactPreferenceInstagram: false,
        allergies: false,
        references: [''],
      },
      {
        fullName: 'Martin Veľký',
        email: 'martin.velky@test.sk',
        phone: '+421902345678',
        appointmentDate: new Date('2025-08-10T14:00:00Z'),
        appointmentTime: '14:00',
        placement: 'Predlaktie',
        size: 'Stredné',
        color: 'Farebné',
        duration: 4,
        description: 'Geometrický dizajn s farebnými prvkami',
        healthIssues: false,
        healthIssueDescription: '',
        voucherCode: 'GIFT100',
        voucherType: 'giftcard',
        originalPrice: 200,
        finalPrice: 100,
        status: 'confirmed',
        confirmAdult: true,
        agreePrivacy: true,
        agreeMarketing: true,
        contactPreferenceEmail: true,
        contactPreferencePhone: false,
        contactPreferenceInstagram: false,
        allergies: false,
        references: [''],
      },
      {
        fullName: 'Lucia Krásna',
        email: 'lucia.krasna@test.sk',
        phone: '+421903456789',
        appointmentDate: new Date('2025-08-15T11:00:00Z'),
        appointmentTime: '11:00',
        placement: 'Chrbát',
        size: 'Veľké',
        color: 'Čiernobiela',
        duration: 6,
        description: 'Realistické tetovanie portrétu',
        healthIssues: true,
        healthIssueDescription: 'Alergia na latex',
        voucherCode: 'FIXED50',
        voucherType: 'discount',
        originalPrice: 300,
        finalPrice: 250,
        status: 'pending',
        confirmAdult: true,
        agreePrivacy: true,
        agreeMarketing: true,
        contactPreferenceEmail: true,
        contactPreferencePhone: false,
        contactPreferenceInstagram: false,
        allergies: true,
        allergyDescription: 'Alergia na latex',
        references: [''],
      },
      {
        fullName: 'Jozef Starý',
        email: 'jozef.stary@test.sk',
        phone: '+421904567890',
        appointmentDate: new Date('2025-08-20T16:00:00Z'),
        appointmentTime: '16:00',
        placement: 'Noha',
        size: 'Malé',
        color: 'Čierna',
        duration: 1,
        description: 'Jednoduchý symbol',
        healthIssues: false,
        healthIssueDescription: '',
        voucherCode: null,
        voucherType: null,
        originalPrice: 60,
        finalPrice: 60,
        status: 'confirmed',
        confirmAdult: true,
        agreePrivacy: true,
        agreeMarketing: true,
        contactPreferenceEmail: true,
        contactPreferencePhone: false,
        contactPreferenceInstagram: false,
        allergies: false,
        references: [''],
      },
      {
        fullName: 'Katarína Mladá',
        email: 'katarina.mlada@test.sk',
        phone: '+421905678901',
        appointmentDate: new Date('2025-08-25T13:00:00Z'),
        appointmentTime: '13:00',
        placement: 'Rameno',
        size: 'Stredné',
        color: 'Farebné',
        duration: 3,
        description: 'Kvetinový dizajn s akvarelovým efektom',
        healthIssues: false,
        healthIssueDescription: '',
        voucherCode: 'SUMMER30',
        voucherType: 'discount',
        originalPrice: 150,
        finalPrice: 105,
        status: 'pending',
        confirmAdult: true,
        agreePrivacy: true,
        agreeMarketing: true,
        contactPreferenceEmail: true,
        contactPreferencePhone: false,
        contactPreferenceInstagram: false,
        allergies: false,
        references: [''],
      },
    ];

    for (const appointment of appointments) {
      await prisma.tattooAppointment.create({
        data: appointment,
      });
      console.log(`✅ Created appointment for: ${appointment.fullName}`);
    }

    // Create some voucher usage records
    console.log('📊 Creating voucher usage records...');
    const voucherUsages = [
      {
        discountCodeId: (await prisma.discountCode.findUnique({ where: { code: 'WELCOME20' } }))!.id,
        customerEmail: 'anna.mala@test.sk',
        appointmentId: (await prisma.tattooAppointment.findFirst({ where: { email: 'anna.mala@test.sk' } }))!.id,
      },
      {
        discountCodeId: (await prisma.discountCode.findUnique({ where: { code: 'FIXED50' } }))!.id,
        customerEmail: 'lucia.krasna@test.sk',
        appointmentId: (await prisma.tattooAppointment.findFirst({ where: { email: 'lucia.krasna@test.sk' } }))!.id,
      },
      {
        giftCardId: (await prisma.giftCard.findUnique({ where: { code: 'GIFT100' } }))!.id,
        customerEmail: 'martin.velky@test.sk',
        amountUsed: 100,
        appointmentId: (await prisma.tattooAppointment.findFirst({ where: { email: 'martin.velky@test.sk' } }))!.id,
      },
    ];

    for (const usage of voucherUsages) {
      if (usage.discountCodeId) {
        await prisma.discountCodeUse.create({
          data: {
            discountCodeId: usage.discountCodeId,
            customerEmail: usage.customerEmail,
            appointmentId: usage.appointmentId,
          },
        });
        console.log(`✅ Created discount code usage for: ${usage.customerEmail}`);
      } else if (usage.giftCardId) {
        await prisma.giftCardUse.create({
          data: {
            giftCardId: usage.giftCardId,
            customerEmail: usage.customerEmail,
            amountUsed: usage.amountUsed,
            appointmentId: usage.appointmentId,
          },
        });
        console.log(`✅ Created gift card usage for: ${usage.customerEmail}`);
      }
    }

    // Update usage counts
    console.log('🔄 Updating usage counts...');
    await prisma.discountCode.update({
      where: { code: 'WELCOME20' },
      data: { currentUses: 1 },
    });
    await prisma.discountCode.update({
      where: { code: 'FIXED50' },
      data: { currentUses: 1 },
    });
    await prisma.giftCard.update({
      where: { code: 'GIFT100' },
      data: { currentUses: 1, balance: 0 },
    });

    console.log('🎉 All dummy data created successfully!');
    console.log('\n📋 Summary:');
    console.log('- 4 discount codes created');
    console.log('- 4 gift cards created');

    console.log('- 5 appointment requests created');
    console.log('- 3 voucher usage records created');

  } catch (error) {
    console.error('❌ Error creating dummy data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDummyData(); 