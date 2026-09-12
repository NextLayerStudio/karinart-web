import { verify, sign } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import prisma from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AdminUser {
  username: string;
  userId: string;
  name: string;
}

export async function getAdminUser(): Promise<AdminUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('admin_session');

    if (!sessionCookie) {
      return null;
    }

    // Verify JWT token
    const decoded = verify(sessionCookie.value, JWT_SECRET) as { sessionId: string };
    
    // Check if session exists in database
    const session = await prisma.session.findUnique({
      where: { 
        id: decoded.sessionId
      },
      include: { user: true }
    });

    if (!session) {
      return null;
    }

    return {
      username: session.user.username,
      userId: session.user.id,
      name: session.user.name
    };
  } catch (error) {
    console.error('Error verifying session:', error);
    return null;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const user = await getAdminUser();
  return user !== null;
}

export async function createSession(userId: string): Promise<string> {
  const sessionId = crypto.randomUUID();

  await prisma.session.create({
    data: {
      id: sessionId,
      token: sessionId,
      userId
    }
  });

  // Create JWT with session ID
  return sign({ sessionId }, JWT_SECRET);
}

export async function deleteSession(sessionId: string): Promise<void> {
  await prisma.session.deleteMany({
    where: { id: sessionId }
  });
} 