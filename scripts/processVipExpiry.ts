import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { processAllVipLifecycles } from '../src/app/lib/vipService.js';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

const prisma = new PrismaClient();

async function backfillVipLastActivity() {
  const vips = await prisma.customer.findMany({
    where: { isVip: true, vipLastActivityAt: null },
    select: { id: true, vipAwardedAt: true, createdAt: true },
  });

  for (const vip of vips) {
    await prisma.customer.update({
      where: { id: vip.id },
      data: { vipLastActivityAt: vip.vipAwardedAt ?? vip.createdAt },
    });
  }

  console.log(`Backfilled vipLastActivityAt for ${vips.length} VIP customers`);
}

async function main() {
  await backfillVipLastActivity();

  const result = await processAllVipLifecycles();
  console.log('VIP lifecycle processing complete:', result);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
