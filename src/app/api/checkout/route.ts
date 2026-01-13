import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { OrderItem } from '@/types/order';

interface CheckoutRequest {
  amount: number;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  pickupTime: string;
  items: OrderItem[];
  specialInstructions?: string;
  subtotal: number;
  tax: number;
}

// Split a string into chunks of maxLength
function chunkString(str: string, maxLength: number): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < str.length; i += maxLength) {
    chunks.push(str.slice(i, i + maxLength));
  }
  return chunks;
}

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
    const body: CheckoutRequest = await request.json();
    const {
      amount,
      customerEmail,
      customerName,
      customerPhone,
      pickupTime,
      items,
      specialInstructions,
      subtotal,
      tax,
    } = body;

    // Validate amount
    if (!amount || amount < 50) {
      return NextResponse.json(
        { error: 'Invalid amount. Minimum is $0.50' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!customerName || !customerPhone || !pickupTime || !items?.length) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Build metadata object
    // Stripe metadata limit: 50 keys, 500 chars per value
    const metadata: Record<string, string> = {
      customerName: customerName.slice(0, 500),
      customerEmail: (customerEmail || '').slice(0, 500),
      customerPhone: customerPhone.slice(0, 500),
      pickupTime,
      specialInstructions: (specialInstructions || '').slice(0, 500),
      subtotal: subtotal.toString(),
      tax: tax.toString(),
      total: (amount / 100).toString(),
      itemCount: items.length.toString(),
    };

    // Serialize items and split across multiple keys if needed
    const itemsJson = JSON.stringify(items);
    const itemChunks = chunkString(itemsJson, 500);
    itemChunks.forEach((chunk, i) => {
      metadata[`items_${i}`] = chunk;
    });
    metadata['items_chunks'] = itemChunks.length.toString();

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // amount in cents
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata,
      receipt_email: customerEmail || undefined,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
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
