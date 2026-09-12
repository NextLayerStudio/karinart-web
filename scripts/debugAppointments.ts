import prisma from '../src/app/lib/prisma';

async function debugAppointments() {
  try {
    console.log('🔍 Debugging appointments...\n');
    
    const appointments = await prisma.tattooAppointment.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`📊 Found ${appointments.length} appointments:\n`);
    
    appointments.forEach((appointment, index) => {
      console.log(`${index + 1}. ${appointment.fullName} (${appointment.email})`);
      console.log(`   Date: ${appointment.appointmentDate.toISOString()}`);
      console.log(`   Time: ${appointment.appointmentTime}`);
      console.log(`   Status: ${appointment.status}`);
      console.log(`   Voucher: ${appointment.voucherCode || 'none'} (${appointment.voucherType || 'none'})`);
      console.log(`   Created: ${appointment.createdAt.toISOString()}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugAppointments(); 