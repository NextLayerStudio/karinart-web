import { redirect } from 'next/navigation';
import { getAdminUser } from '@/app/lib/auth';
import prisma from '@/app/lib/prisma';
import { isFlashSaleEnabled } from '@/app/lib/siteSettings';
import FlashDesignsManagementClient from './FlashDesignsManagementClient';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function AdminFlashDesigns() {
  // Check authentication
  const user = await getAdminUser();
  if (!user) {
    redirect('/admin/login');
  }

  // Fetch flash designs
  const [flashDesigns, flashSaleEnabled] = await Promise.all([
    prisma.flashDesign.findMany({ 
      orderBy: { createdAt: 'desc' } 
    }),
    isFlashSaleEnabled(),
  ]);

  return (
    <FlashDesignsManagementClient 
      flashDesigns={flashDesigns.map((design) => ({ 
        ...design, 
        reserved: (design as any).reserved ?? false,
        createdAt: design.createdAt.toISOString(),
        updatedAt: design.updatedAt.toISOString(),
      }))}
      flashSaleEnabled={flashSaleEnabled}
      username={user.name}
    />
  );
}
