import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminDb } from '@/lib/firebase/admin';
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
  const existingSnapshot = await adminDb
    .collection('orders')
    .where('stripe_payment_intent_id', '==', paymentIntent.id)
    .limit(1)
    .get();

  if (!existingSnapshot.empty) {
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

  // Generate next order number
  const counterRef = adminDb.collection('counters').doc('orders');
  const orderNumber = await adminDb.runTransaction(async (transaction) => {
    const counterDoc = await transaction.get(counterRef);
    const current = counterDoc.exists ? (counterDoc.data()?.current || 0) : 0;
    const next = current + 1;
    transaction.set(counterRef, { current: next });
    return next;
  });

  // Create order in Firestore
  const now = new Date().toISOString();
  const orderData = {
    order_number: orderNumber,
    status: 'pending' as const,
    customer_name: customerName,
    customer_email: customerEmail,
    customer_phone: customerPhone,
    items,
    subtotal,
    tax,
    total,
    pickup_time: pickupTime,
    special_instructions: specialInstructions,
    stripe_payment_intent_id: paymentIntent.id,
    staff_notes: null,
    created_at: now,
    updated_at: now,
  };

  const docRef = await adminDb.collection('orders').add(orderData);
  console.log('Order created successfully:', orderNumber, 'doc:', docRef.id);
}
