import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerClient } from '@/lib/supabase/server';
import { OrderItem } from '@/types/order';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

// Reconstruct items from chunked metadata
function reconstructItems(metadata: Record<string, string>): OrderItem[] {
  const chunksCount = parseInt(metadata.items_chunks || '0', 10);
  if (chunksCount === 0) return [];

  let itemsJson = '';
  for (let i = 0; i < chunksCount; i++) {
    itemsJson += metadata[`items_${i}`] || '';
  }

  try {
    return JSON.parse(itemsJson);
  } catch (error) {
    console.error('Error parsing items JSON:', error);
    return [];
  }
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handlePaymentSuccess(paymentIntent);
      break;
    }
    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log('Payment failed:', paymentIntent.id);
      break;
    }
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const metadata = paymentIntent.metadata;

  // Check if order already exists (idempotency)
  const supabase = createServerClient();
  const { data: existingOrder } = await supabase
    .from('orders')
    .select('id')
    .eq('stripe_payment_intent_id', paymentIntent.id)
    .single();

  if (existingOrder) {
    console.log('Order already exists for PaymentIntent:', paymentIntent.id);
    return;
  }

  // Extract order data from metadata
  const customerName = metadata.customerName || '';
  const customerEmail = metadata.customerEmail || '';
  const customerPhone = metadata.customerPhone || '';
  const pickupTime = metadata.pickupTime || new Date().toISOString();
  const specialInstructions = metadata.specialInstructions || null;
  const subtotal = parseFloat(metadata.subtotal || '0');
  const tax = parseFloat(metadata.tax || '0');
  const total = parseFloat(metadata.total || '0');
  const items = reconstructItems(metadata);

  // Create order in Supabase
  const orderData = {
    status: 'pending' as const,
    customer_name: customerName,
    customer_email: customerEmail,
    customer_phone: customerPhone,
    items: items as unknown as Record<string, unknown>[],
    subtotal,
    tax,
    total,
    pickup_time: pickupTime,
    special_instructions: specialInstructions,
    stripe_payment_intent_id: paymentIntent.id,
    staff_notes: null,
  };

  const { data: order, error } = await supabase
    .from('orders')
    .insert(orderData as never)
    .select()
    .single();

  if (error) {
    console.error('Error creating order in Supabase:', error);
    throw new Error(`Failed to create order: ${error.message}`);
  }

  console.log('Order created successfully:', (order as { order_number: number }).order_number);
}
