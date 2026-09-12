import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteAllEmails() {
  try {
    console.log('Deleting all emails from marketing table...');
    
    const result = await prisma.marketing.deleteMany({});
    
    console.log(`✅ Deleted ${result.count} emails successfully!`);
  } catch (error) {
    console.error('❌ Error deleting emails:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAllEmails(); 