import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteAllReservations() {
  try {
    console.log('Deleting all existing reservations...');
    
    const result = await prisma.tattooAppointment.deleteMany({});
    
    console.log(`✅ Deleted ${result.count} reservations successfully!`);
  } catch (error) {
    console.error('❌ Error deleting reservations:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAllReservations(); 