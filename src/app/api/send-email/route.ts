import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, validateEmailData, EmailData } from '@/app/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate request
    if (!validateEmailData(body)) {
      return NextResponse.json(
        { error: 'Invalid request data. Required fields: type, to, name, datetime' },
        { status: 400 }
      );
    }

    // Send email
    const result = await sendEmail(body as EmailData);

    if (result.success) {
      return NextResponse.json(
        { message: 'Email sent successfully' },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to send email' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in send-email API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 