import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { cookies } from 'next/headers';
import { Order } from '@/types/order';

interface RouteParams {
  params: Promise<{ id: string }>;
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
  const cookieStore = await cookies();
  const adminToken = cookieStore.get('admin_token');
  const isAdmin = adminToken?.value === process.env.ADMIN_PIN;

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

  // Check admin authentication
  const cookieStore = await cookies();
  const adminToken = cookieStore.get('admin_token');

  if (!adminToken || adminToken.value !== process.env.ADMIN_PIN) {
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
