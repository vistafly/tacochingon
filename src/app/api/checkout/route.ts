import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  // Check if Stripe key is configured
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey || stripeSecretKey.includes('YOUR_SECRET_KEY_HERE')) {
    return NextResponse.json(
      { error: 'Stripe is not configured. Please add your Stripe secret key to .env.local' },
      { status: 500 }
    );
  }

  const stripe = new Stripe(stripeSecretKey);

  try {
    const { amount, customerEmail, customerName, items } = await request.json();

    // Validate amount
    if (!amount || amount < 50) {
      return NextResponse.json(
        { error: 'Invalid amount. Minimum is $0.50' },
        { status: 400 }
      );
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // amount in cents
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        customerName,
        customerEmail,
        itemCount: items?.length || 0,
      },
      receipt_email: customerEmail,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Stripe error:', error);

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
