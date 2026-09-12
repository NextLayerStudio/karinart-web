import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { sendEmail } from '@/app/lib/emailService';
import { generateGiveawayDiscountCode } from '@/app/lib/giftCardUtils';

interface GiveawaySubmission {
  fullName: string;
  email: string;
  instagram: string;
  agreeMarketing: boolean;
  agreePrivacy: boolean;
  confirmAdult: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const data: GiveawaySubmission = await request.json();

    // Validate required fields
    if (!data.fullName?.trim() || !data.email?.trim()) {
      return NextResponse.json(
        { error: 'Meno a email sú povinné polia' },
        { status: 400 }
      );
    }

    // Validate Instagram handle (required)
    if (!data.instagram?.trim()) {
      return NextResponse.json(
        { error: 'Instagram handle je povinné pole' },
        { status: 400 }
      );
    }

    if (!data.confirmAdult) {
      return NextResponse.json(
        { error: 'Musíte potvrdiť, že ste starší ako 18 rokov' },
        { status: 400 }
      );
    }

    if (!data.agreePrivacy) {
      return NextResponse.json(
        { error: 'Musíte súhlasiť s ochranou osobných údajov' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { error: 'Neplatný formát email adresy' },
        { status: 400 }
      );
    }

    // Check for duplicate entries in giveaway table
    const existingGiveawayEntry = await prisma.giveawayEntry.findUnique({
      where: { email: data.email }
    });

    if (existingGiveawayEntry) {
      return NextResponse.json(
        { error: 'Táto email adresa sa už zúčastnila súťaže' },
        { status: 400 }
      );
    }

    // Check for duplicate Instagram if provided
    if (data.instagram?.trim()) {
      const existingInstagram = await prisma.giveawayEntry.findFirst({
        where: { 
          instagram: data.instagram.trim()
        }
      });

      if (existingInstagram) {
        return NextResponse.json(
          { error: 'Tento Instagram handle sa už zúčastnil súťaže' },
          { status: 400 }
        );
      }
    }

    // Generate unique discount code
    let discountCode: string;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      discountCode = generateGiveawayDiscountCode();
      attempts++;
      
      // Check if code already exists
      const existingCode = await prisma.discountCode.findUnique({
        where: { code: discountCode }
      });
      
      if (!existingCode) break;
    } while (attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      console.error('Failed to generate unique discount code after', maxAttempts, 'attempts');
      return NextResponse.json(
        { error: 'Chyba pri generovaní zľavového kódu' },
        { status: 500 }
      );
    }

    // Create giveaway entry and discount code in a transaction
    try {
      await prisma.$transaction(async (tx) => {
        // Create giveaway entry
        await tx.giveawayEntry.create({
          data: {
            fullName: data.fullName,
            email: data.email,
            instagram: data.instagram?.trim() || null,
            agreeMarketing: data.agreeMarketing,
            agreePrivacy: data.agreePrivacy,
            confirmAdult: data.confirmAdult
          }
        });

        // Create discount code
        await tx.discountCode.create({
          data: {
            code: discountCode,
            type: 'percentage',
            value: 10, // 10% discount
            maxUses: 1, // Can only be used once
            currentUses: 0,
            expiresAt: new Date('2025-09-30T23:59:59'), // Expires September 30th at midnight
            availableFrom: new Date('2025-09-01T00:00:00'), // Available from September 1st at midnight
            availableTo: new Date('2025-09-30T23:59:59'), // Available until September 30th at midnight
            isActive: true,
            description: `10% zľava z NELETNEJ súťaže pre ${data.email}`
          }
        });
      });
    } catch (error) {
      console.error('Error creating giveaway entry and discount code:', error);
      return NextResponse.json(
        { error: 'Chyba pri ukladaní údajov' },
        { status: 500 }
      );
    }

    // Send email with discount code
    try {
      const emailResult = await sendEmail({
        type: 'giveaway_discount',
        to: data.email,
        name: data.fullName,
        datetime: new Date().toISOString(), // Not used for giveaway emails
        discountCode: discountCode
      });

      if (!emailResult.success) {
        console.error('Failed to send giveaway email:', emailResult.error);
        // Don't fail the whole submission if email fails
      }
    } catch (error) {
      console.error('Error sending giveaway email:', error);
      // Don't fail the whole submission if email fails
    }

    // If marketing consent is given, add to marketing table
    if (data.agreeMarketing) {
      try {
        await prisma.marketing.create({
          data: {
            email: data.email
          }
        });
      } catch (error) {
        console.error('Error adding email to marketing:', error);
        // Don't fail the whole submission if marketing addition fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Úspešne ste sa prihlásili do súťaže!'
    });

  } catch (error) {
    console.error('Error processing giveaway submission:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { error: 'Nastala chyba pri spracovaní požiadavky' },
      { status: 500 }
    );
  }
} 