import { verify, sign } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import prisma from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface CustomerUser {
  customerId: string;
  email: string;
  fullName: string;
}

export async function getCustomerUser(): Promise<CustomerUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('customer_session');

    if (!sessionCookie) {
      return null;
    }

    const decoded = verify(sessionCookie.value, JWT_SECRET) as { sessionId: string };

    const session = await prisma.customerSession.findUnique({
      where: { id: decoded.sessionId },
      include: { customer: true },
    });

    if (!session || !session.customer.emailVerified || !session.customer.isActive) {
      return null;
    }

    return {
      customerId: session.customer.id,
      email: session.customer.email,
      fullName: session.customer.fullName,
    };
  } catch (error) {
    console.error('Error verifying customer session:', error);
    return null;
  }
}

export async function createCustomerSession(customerId: string): Promise<string> {
  const sessionId = crypto.randomUUID();

  await prisma.customerSession.create({
    data: {
      id: sessionId,
      token: sessionId,
      customerId,
    },
  });

  return sign({ sessionId }, JWT_SECRET);
}

export async function deleteCustomerSession(sessionId: string): Promise<void> {
  await prisma.customerSession.deleteMany({
    where: { id: sessionId },
  });
}

export function buildCustomerJoinUrl(baseUrl: string, customerId: string): string {
  return `${baseUrl.replace(/\/$/, '')}/join/${customerId}`;
}
