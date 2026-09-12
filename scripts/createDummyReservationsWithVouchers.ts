import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createDummyReservationsWithVouchers() {
  try {
    console.log('Creating dummy reservations with voucher codes...');

    // Sample customer data
    const customers = [
      { name: 'Jana Nováková', email: 'jana.novakova@test.sk', voucherCode: 'SEPTEMBER20' },
      { name: 'Peter Kováč', email: 'peter.kovac@test.sk', voucherCode: 'SUMMER15' },
      { name: 'Mária Svobodová', email: 'maria.svobodova@test.sk', voucherCode: 'GIFT100' },
      { name: 'Tomáš Horváth', email: 'tomas.horvath@test.sk', voucherCode: 'FIXED50' },
      { name: 'Eva Králová', email: 'eva.kralova@test.sk', voucherCode: 'MINI25' },
      { name: 'Martin Varga', email: 'martin.varga@test.sk', voucherCode: 'GIFT200' },
      { name: 'Lucia Tóthová', email: 'lucia.tothova@test.sk', voucherCode: 'WINTER10' },
      { name: 'Andrej Nagy', email: 'andrej.nagy@test.sk', voucherCode: 'BIRTHDAY75' },
      { name: 'Zuzana Kissová', email: 'zuzana.kissova@test.sk', voucherCode: null }, // No voucher
      { name: 'Jozef Balogh', email: 'jozef.balogh@test.sk', voucherCode: 'GIFT50' }
    ];

    // Create reservations for different dates
    const dates = [
      new Date('2025-09-15'), // September - SEPTEMBER20 will work
      new Date('2025-08-20'), // August - SUMMER15 will work
      new Date('2025-09-10'), // September - SEPTEMBER20 will work
      new Date('2025-10-05'), // October - FIXED50 will work (anytime)
      new Date('2025-09-25'), // September - SEPTEMBER20 will work
      new Date('2025-12-15'), // December - WINTER10 will work
      new Date('2025-09-30'), // September - SEPTEMBER20 will work
      new Date('2025-11-20'), // November - BIRTHDAY75 will work (anytime)
      new Date('2025-08-15'), // August - SUMMER15 will work
      new Date('2025-09-05')  // September - SEPTEMBER20 will work
    ];

    const times = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];

    for (let i = 0; i < customers.length; i++) {
      const customer = customers[i];
      const appointmentDate = dates[i];
      const appointmentTime = times[i % times.length];

      // Determine voucher type based on the code
      let voucherType = null;
      if (customer.voucherCode) {
        if (['SEPTEMBER20', 'SUMMER15', 'WINTER10', 'FIXED50', 'MINI25'].includes(customer.voucherCode)) {
          voucherType = 'discount';
        } else if (['GIFT100', 'GIFT200', 'GIFT50', 'BIRTHDAY75'].includes(customer.voucherCode)) {
          voucherType = 'giftcard';
        }
      }

      const reservation = await prisma.tattooAppointment.create({
        data: {
          fullName: customer.name,
          email: customer.email,
          confirmAdult: true,
          placement: 'Rameno',
          size: 'Stredné',
          color: 'Čierna',
          description: `Test rezervácia pre ${customer.name} s ${customer.voucherCode ? `kódom ${customer.voucherCode}` : 'bez kódu'}`,
          references: ['https://example.com/reference1.jpg'],
          notes: 'Test rezervácia vytvorená automaticky',
          contactPreferenceEmail: true,
          contactPreferenceInstagram: false,
          contactPreferencePhone: false,
          agreeMarketing: true,
          agreePrivacy: true,
          allergies: false,
          healthIssues: false,
          voucherCode: customer.voucherCode,
          voucherType: voucherType,
          appointmentDate: appointmentDate,
          appointmentTime: appointmentTime,
          status: 'pending'
        }
      });

      console.log(`✅ Created reservation for ${customer.name} on ${appointmentDate.toLocaleDateString()} at ${appointmentTime}${customer.voucherCode ? ` with voucher ${customer.voucherCode}` : ''}`);
    }

    console.log('\n🎉 Dummy reservations with vouchers created successfully!');
    console.log('\n📋 Summary:');
    console.log('• 10 reservations created');
    console.log('• 9 with voucher codes, 1 without');
    console.log('• Mix of discount codes and gift cards');
    console.log('• Various dates to test date range validation');
    console.log('\n💡 Next steps:');
    console.log('1. Go to /admin/appointments to see the reservations');
    console.log('2. Try confirming some reservations to test voucher usage recording');
    console.log('3. Check /admin/vouchers to see usage statistics');

  } catch (error) {
    console.error('Error creating dummy reservations:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDummyReservationsWithVouchers(); 