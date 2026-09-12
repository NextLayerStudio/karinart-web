import { redirect } from 'next/navigation';
import prisma from '@/app/lib/prisma';
import { getCustomerUser } from '@/app/lib/customerAuth';
import { getAdminUser } from '@/app/lib/auth';

interface JoinPageProps {
  params: Promise<{ customerId: string }>;
}

export default async function JoinPage({ params }: JoinPageProps) {
  const { customerId } = await params;

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: { id: true, emailVerified: true, isActive: true },
  });

  if (!customer || !customer.emailVerified || !customer.isActive) {
    redirect('/register');
  }

  const admin = await getAdminUser();
  if (admin) {
    redirect(`/admin/customers/${customerId}`);
  }

  const customerUser = await getCustomerUser();
  if (customerUser) {
    redirect('/customer-program');
  }

  redirect(`/register?invite=${customerId}`);
}
