import prisma from '@/app/lib/prisma';
import VoucherManagementClient from './VoucherManagementClient';

export const dynamic = 'force-dynamic';

export default async function AdminVouchers() {
  const discountCodes = await prisma.discountCode.findMany({
    include: {
      uses: {
        orderBy: { usedAt: 'desc' }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const giftCards = await prisma.giftCard.findMany({
    include: {
      uses: {
        orderBy: { usedAt: 'desc' }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <VoucherManagementClient
      discountCodes={discountCodes.map(code => ({
        ...code,
        type: code.type as 'percentage' | 'fixed',
        createdAt: code.createdAt.toISOString(),
        updatedAt: code.updatedAt.toISOString(),
        expiresAt: code.expiresAt?.toISOString() || null,
        availableFrom: code.availableFrom?.toISOString() || null,
        availableTo: code.availableTo?.toISOString() || null,
        uses: code.uses.map(use => ({
          ...use,
          usedAt: use.usedAt.toISOString()
        }))
      }))}
      giftCards={giftCards.map(card => ({
        ...card,
        createdAt: card.createdAt.toISOString(),
        updatedAt: card.updatedAt.toISOString(),
        expiresAt: card.expiresAt?.toISOString() || null,
        uses: card.uses.map(use => ({
          ...use,
          usedAt: use.usedAt.toISOString()
        }))
      }))}
    />
  );
} 