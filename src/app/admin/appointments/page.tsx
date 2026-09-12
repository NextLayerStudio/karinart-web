import { getAdminUser } from '@/app/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/app/lib/prisma';
import AppointmentManagementClient from './AppointmentManagementClient';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function AdminAppointments() {
  // Check authentication
  const user = await getAdminUser();
  if (!user) {
    redirect('/admin/login');
  }

  const [tattooAppointments, beautyAppointments] = await Promise.all([
    prisma.tattooAppointment.findMany({
      orderBy: { createdAt: 'desc' },
    }),
    prisma.beautyAppointment.findMany({
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return (
    <AppointmentManagementClient
      appointments={tattooAppointments.map((app) => ({
        ...app,
        appointmentDate: app.appointmentDate.toISOString(),
        createdAt: app.createdAt.toISOString(),
        status: app.status as 'pending' | 'confirmed' | 'rejected' | 'rescheduled',
      }))}
      beautyAppointments={beautyAppointments.map((app) => ({
        ...app,
        appointmentDate: app.appointmentDate.toISOString(),
        createdAt: app.createdAt.toISOString(),
        status: app.status as 'pending' | 'confirmed' | 'rejected' | 'rescheduled',
      }))}
      username={user.name}
    />
  );
} 