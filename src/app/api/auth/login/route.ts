import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/app/lib/prisma';
import { createSession } from '@/app/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    
    // Debug logging
    console.log('Login attempt for username:', username);

    // Get all admin users (since we can't query by hashed username directly)
    const users = await prisma.adminUser.findMany();
    
    // Find user by comparing hashed usernames
    let user = null;
    for (const u of users) {
      const isUsernameMatch = await bcrypt.compare(username, u.username);
      if (isUsernameMatch) {
        user = u;
        break;
      }
    }

    if (!user) {
      console.log('Login failed: User not found');
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Compare password with hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log('Login failed: Invalid password');
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    console.log('Login successful for user:', username);
    
    // Create database session
    const token = await createSession(user.id);

    // Set HTTP-only cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: 'admin_session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
} 