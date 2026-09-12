import { getAdminUser } from '@/app/lib/auth';
import { redirect } from 'next/navigation';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function AdminRoot() {
  // Check authentication
  const user = await getAdminUser();
  
  if (!user) {
    // If not authenticated, redirect to login
    redirect('/admin/login');
  } else {
    // If authenticated, redirect to portfolio dashboard
    redirect('/admin/portfolio');
  }
} 