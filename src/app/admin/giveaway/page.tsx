import { getAdminUser } from '@/app/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/app/lib/prisma';
import GiveawayManagementClient from './GiveawayManagementClient';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function AdminGiveaway() {
  // Check authentication
  const user = await getAdminUser();
  if (!user) {
    redirect('/admin/login');
  }

  // Fetch all giveaway entries
  const giveawayEntries = await prisma.giveawayEntry.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <GiveawayManagementClient 
      entries={giveawayEntries.map(entry => ({
        ...entry,
        instagram: entry.instagram ?? null,
        createdAt: entry.createdAt.toISOString()
      }))}
    />
  );
} 