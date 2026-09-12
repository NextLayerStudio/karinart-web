import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { sendEmail } from '@/app/lib/emailService';

export async function GET() {
  try {
    // Check if SMTP credentials are configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return NextResponse.json(
        { error: 'SMTP credentials not configured' },
        { status: 500 }
      );
    }

    // Create transporter
    const port = parseInt(process.env.SMTP_PORT || '465');
    const isSecure = port === 465; // Port 465 uses SSL, port 587 uses STARTTLS
    
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.m1.websupport.sk',
      port: port,
      secure: isSecure, // true for 465, false for 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      // For port 587, we need to enable STARTTLS
      ...(port === 587 && {
        requireTLS: true,
        tls: {
          rejectUnauthorized: false
        }
      })
    });

    // Verify connection configuration
    const verifyResult = await transporter.verify();
    
    return NextResponse.json({
      success: true,
      message: 'SMTP connection verified successfully',
      config: {
        host: process.env.SMTP_HOST || 'smtp.m1.websupport.sk',
        port: process.env.SMTP_PORT || '465',
        user: process.env.SMTP_USER,
        secure: isSecure
      },
      verifyResult
    });

  } catch (error) {
    console.error('SMTP verification failed:', error);
    
    let errorMessage = 'SMTP verification failed';
    if (error instanceof Error) {
      if (error.message.includes('authentication failed')) {
        errorMessage = 'SMTP authentication failed - check username and password';
      } else if (error.message.includes('Invalid login')) {
        errorMessage = 'Invalid SMTP login credentials';
      } else if (error.message.includes('ECONNREFUSED')) {
        errorMessage = 'SMTP connection refused - check host and port';
      } else {
        errorMessage = `SMTP error: ${error.message}`;
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, to, appointmentData } = body;

    if (!type || !to || !appointmentData) {
      return NextResponse.json(
        { error: 'Missing required fields: type, to, appointmentData' },
        { status: 400 }
      );
    }

    // Map appointment data to email service format
    const emailData = {
      type: type as 'received' | 'confirmed' | 'rescheduled' | 'declined' | 'internal_notice',
      to: to,
      name: appointmentData.name || 'Test User',
      datetime: appointmentData.datetime || `${appointmentData.date} o ${appointmentData.time}`,
      message: appointmentData.message || appointmentData.description
    };

    // Send the email using the email service
    const result = await sendEmail(emailData);
    
    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      result
    });

  } catch (error) {
    console.error('Test email sending failed:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to send test email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 