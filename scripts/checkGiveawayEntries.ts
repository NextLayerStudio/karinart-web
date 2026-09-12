import prisma from '../src/app/lib/prisma';

async function checkGiveawayEntries() {
  console.log('🎨 Checking existing giveaway entries...\n');

  try {
    const entries = await prisma.giveawayEntry.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        instagram: true,
        agreeMarketing: true,
        agreePrivacy: true,
        confirmAdult: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`Found ${entries.length} giveaway entries:\n`);

    entries.forEach((entry, index) => {
      console.log(`${index + 1}. ${entry.fullName} (${entry.email})`);
      console.log(`   Instagram: ${entry.instagram || 'N/A'}`);
      console.log(`   Marketing consent: ${entry.agreeMarketing}`);
      console.log(`   Privacy consent: ${entry.agreePrivacy}`);
      console.log(`   Adult confirmed: ${entry.confirmAdult}`);
      console.log(`   Created: ${entry.createdAt.toLocaleDateString()}`);
      console.log('');
    });

  } catch (error) {
    console.error('Error checking giveaway entries:', error);
  }
}

checkGiveawayEntries()
  .catch(console.error)
  .finally(() => process.exit(0));
