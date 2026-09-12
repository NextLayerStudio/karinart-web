import prisma from '../src/app/lib/prisma.js';

async function main() {
  console.log('Starting availability reset...');

  try {
    // Deleting all time slots first due to the relation
    const deletedTimeSlots = await prisma.timeSlot.deleteMany({});
    console.log(`Successfully deleted ${deletedTimeSlots.count} time slots.`);

    // Deleting all day availability records
    const deletedDayAvailabilities = await prisma.dayAvailability.deleteMany({});
    console.log(`Successfully deleted ${deletedDayAvailabilities.count} day availability records.`);

    console.log('✅ Availability reset complete. The calendar will now use default availability (weekdays available, weekends unavailable).');
  } catch (error) {
    console.error('❌ Error resetting availability:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 