import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminDb } from '@/lib/firebase/admin';
import { isAuthenticated } from '@/lib/auth';
import { Order, OrderItem } from '@/types/order';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Reconstruct items from chunked Stripe metadata
function reconstructItems(metadata: Record<string, string>): OrderItem[] {
  const chunksCount = parseInt(metadata.items_chunks || '0', 10);
  if (chunksCount === 0) return [];

  let itemsJson = '';
  for (let i = 0; i < chunksCount; i++) {
    itemsJson += metadata[`items_${i}`] || '';
  }

  try {
    return JSON.parse(itemsJson);
  } catch {
    return [];
  }
}

// Create order in Firestore from a verified PaymentIntent
async function createOrderFromPaymentIntent(
  paymentIntent: Stripe.PaymentIntent
): Promise<Order> {
  const metadata = paymentIntent.metadata;

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
  return { id: docRef.id, ...orderData } as Order;
}

// Helper to find an order by payment intent ID or order number
async function findOrder(
  id: string,
  emailFilter?: string | null
): Promise<{ docId: string; order: Order } | null> {
  // Try by payment intent ID first
  let snapshot = await adminDb
    .collection('orders')
    .where('stripe_payment_intent_id', '==', id)
    .limit(1)
    .get();

  if (snapshot.empty && !isNaN(Number(id))) {
    // Try by order number
    snapshot = await adminDb
      .collection('orders')
      .where('order_number', '==', Number(id))
      .limit(1)
      .get();
  }

  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  const order = { id: doc.id, ...doc.data() } as Order;

  // If email filter is provided, verify it matches
  if (emailFilter && order.customer_email !== emailFilter) {
    return null;
  }

  return { docId: doc.id, order };
}

// GET /api/orders/[id] - Get order by payment intent ID or order number
// Requires either admin authentication OR customer email verification
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);

  // Check if admin is authenticated
  const isAdmin = await isAuthenticated();

  // If not admin, require customer email for verification
  const customerEmail = searchParams.get('email');

  if (!isAdmin && !customerEmail) {
    return NextResponse.json(
      { error: 'Unauthorized - customer email required' },
      { status: 401 }
    );
  }

  try {
    const result = await findOrder(id, isAdmin ? null : customerEmail);

    if (!result) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ order: result.order });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

// PATCH /api/orders/[id] - Update order status (admin only)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  if (!(await isAuthenticated())) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const body = await request.json();
  const { status, staffNotes } = body;

  // Validate status
  const validStatuses = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];
  if (status && !validStatuses.includes(status)) {
    return NextResponse.json(
      { error: 'Invalid status' },
      { status: 400 }
    );
  }

  try {
    const result = await findOrder(id);

    if (!result) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Build update object
    const updateData: Record<string, string | null> = {
      updated_at: new Date().toISOString(),
    };
    if (status) updateData.status = status;
    if (staffNotes !== undefined) updateData.staff_notes = staffNotes;

    await adminDb.collection('orders').doc(result.docId).update(updateData);

    // Fetch updated order
    const updatedDoc = await adminDb.collection('orders').doc(result.docId).get();
    const updatedOrder = { id: updatedDoc.id, ...updatedDoc.data() } as Order;

    return NextResponse.json({ order: updatedOrder });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Order not found or update failed' },
      { status: 404 }
    );
  }
}

// POST /api/orders/[id] - Create order after payment verification
// The [id] is the Stripe PaymentIntent ID
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id: paymentIntentId } = await params;

  try {
    // Check if order already exists (idempotent)
    const existingSnapshot = await adminDb
      .collection('orders')
      .where('stripe_payment_intent_id', '==', paymentIntentId)
      .limit(1)
      .get();

    if (!existingSnapshot.empty) {
      const doc = existingSnapshot.docs[0];
      const order = { id: doc.id, ...doc.data() } as Order;
      return NextResponse.json({ order });
    }

    // Verify payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Payment has not been completed' },
        { status: 400 }
      );
    }

    // Create order from verified payment
    const order = await createOrderFromPaymentIntent(paymentIntent);
    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
