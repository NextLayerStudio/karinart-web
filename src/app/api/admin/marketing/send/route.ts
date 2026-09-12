import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { sendEmail } from '@/app/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    const { emailIds, subject, message } = await request.json();

    if (!emailIds || !Array.isArray(emailIds) || emailIds.length === 0) {
      return NextResponse.json(
        { error: 'No email IDs provided' },
        { status: 400 }
      );
    }

    if (!subject || !subject.trim()) {
      return NextResponse.json(
        { error: 'Subject is required' },
        { status: 400 }
      );
    }

    // Fetch the marketing emails
    const marketingEmails = await prisma.marketing.findMany({
      where: {
        id: {
          in: emailIds
        }
      }
    });

    if (marketingEmails.length === 0) {
      return NextResponse.json(
        { error: 'No valid emails found' },
        { status: 400 }
      );
    }

    let sentCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    // Send emails to each recipient
    for (const emailRecord of marketingEmails) {
      try {
        const result = await sendEmail({
          type: 'marketing',
          to: emailRecord.email,
          name: emailRecord.email.split('@')[0], // Use email prefix as name
          datetime: new Date().toISOString(), // Current date/time
          subject: subject,
          message: message
        });

        if (result.success) {
          sentCount++;
        } else {
          failedCount++;
          errors.push(`${emailRecord.email}: ${result.error}`);
        }
      } catch (error) {
        failedCount++;
        errors.push(`${emailRecord.email}: Failed to send`);
        console.error(`Error sending email to ${emailRecord.email}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      sent: sentCount,
      failed: failedCount,
      total: marketingEmails.length,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Error sending marketing emails:', error);
    return NextResponse.json(
      { error: 'Failed to send marketing emails' },
      { status: 500 }
    );
  }
} 