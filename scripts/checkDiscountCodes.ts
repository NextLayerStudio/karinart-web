import prisma from '../src/app/lib/prisma';

async function checkDiscountCodes() {
  console.log('🔍 Checking existing discount codes in database...\n');

  try {
    const discountCodes = await prisma.discountCode.findMany({
      select: {
        id: true,
        code: true,
        type: true,
        value: true,
        isActive: true,
        expiresAt: true,
        description: true,
        currentUses: true,
        maxUses: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`Found ${discountCodes.length} discount codes:\n`);

    discountCodes.forEach((code, index) => {
      console.log(`${index + 1}. ${code.code}`);
      console.log(`   Type: ${code.type}`);
      console.log(`   Value: ${code.value}${code.type === 'percentage' ? '%' : '€'}`);
      console.log(`   Active: ${code.isActive}`);
      console.log(`   Uses: ${code.currentUses}/${code.maxUses}`);
      console.log(`   Expires: ${code.expiresAt ? code.expiresAt.toLocaleDateString() : 'Never'}`);
      console.log(`   Description: ${code.description || 'N/A'}`);
      console.log('');
    });

    // Check for giveaway codes specifically
    const giveawayCodes = discountCodes.filter(code => code.code.startsWith('NELETNA'));
    console.log(`🎨 Found ${giveawayCodes.length} NELETNA giveaway codes\n`);

  } catch (error) {
    console.error('Error checking discount codes:', error);
  }
}

checkDiscountCodes()
  .catch(console.error)
  .finally(() => process.exit(0));
