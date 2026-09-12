import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const sig = headersList.get('stripe-signature');

    if (!sig) {
      console.error('No Stripe signature found in webhook request');
      return NextResponse.json({ error: 'No Stripe signature found' }, { status: 400 });
    }

    if (!endpointSecret) {
      console.error('STRIPE_WEBHOOK_SECRET is not configured');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
      console.log('Webhook event received:', {
        type: event.type,
        id: event.id,
        object: event.object
      });
    } catch (err: any) {
      console.error('Webhook signature verification failed:', {
        error: err.message,
        sig: sig,
        body: body.substring(0, 100) + '...' // Log first 100 chars of body
      });
      return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log('Payment succeeded:', paymentIntent.id);
      // Payment succeeded - you can add custom logic here later
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}