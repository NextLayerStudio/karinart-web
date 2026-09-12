import { getAdminUser } from '@/app/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/app/lib/prisma';
import PortfolioManagementClient from './PortfolioManagementClient';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function AdminPortfolio() {
  // Check authentication
  const user = await getAdminUser();
  if (!user) {
    redirect('/admin/login');
  }

  // Fetch tattoo, beauty images, and free designs
  const [tattooImages, beautyImages, freeDesigns] = await Promise.all([
    prisma.tattooImage.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.beautyImage.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.freeDesign.findMany({ orderBy: { createdAt: 'desc' } }),
  ]);

  return (
    <PortfolioManagementClient 
      tattooImages={tattooImages.map((img: { id: string; createdAt: Date; imageUrl: string; title: string; }) => ({ ...img, createdAt: img.createdAt.toISOString() }))}
      beautyImages={beautyImages.map((img: { id: string; createdAt: Date; imageUrl: string; title: string; }) => ({ ...img, createdAt: img.createdAt.toISOString() }))}
      freeDesigns={freeDesigns.map((design: { id: string; createdAt: Date; updatedAt: Date; imageUrl: string; title: string; description: string | null; reserved: boolean; }) => ({ ...design, description: design.description ?? undefined, reserved: design.reserved ?? false, createdAt: design.createdAt.toISOString(), updatedAt: design.updatedAt.toISOString() }))}
      username={user.name}
    />
  );
} 