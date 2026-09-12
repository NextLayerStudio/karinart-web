import { NextRequest, NextResponse } from 'next/server';
import {
  registerCustomer,
  type CustomerRegistrationInput,
} from '@/app/lib/customerService';
import { getBaseUrlFromRequest } from '@/app/lib/customerUtils';

export async function POST(request: NextRequest) {
  try {
    const data: CustomerRegistrationInput = await request.json();
    const result = await registerCustomer(data, getBaseUrlFromRequest(request));

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({
      success: true,
      message: 'Registrácia bola úspešná. Skontrolujte svoj email a overte účet.',
    });
  } catch (error) {
    console.error('Customer registration error:', error);
    return NextResponse.json(
      { error: 'Nastala chyba pri spracovaní registrácie' },
      { status: 500 }
    );
  }
}
