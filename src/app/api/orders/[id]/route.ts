import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/orders/[id] - Get order by payment intent ID or order number
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const supabase = createServerClient();

  // Try to find by payment intent ID first
  let query = supabase
    .from('orders')
    .select('*')
    .eq('stripe_payment_intent_id', id);

  let { data: order, error } = await query.single();

  // If not found, try by order number
  if (!order && !isNaN(Number(id))) {
    const { data: orderByNumber, error: numberError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', Number(id))
      .single();

    order = orderByNumber;
    error = numberError;
  }

  if (error || !order) {
    return NextResponse.json(
      { error: 'Order not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ order });
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

  const supabase = createServerClient();

  // Build update object
  const updateData: Record<string, string | null> = {};
  if (status) updateData.status = status;
  if (staffNotes !== undefined) updateData.staff_notes = staffNotes;

  // Try to update by payment intent ID first
  let { data: order, error } = await supabase
    .from('orders')
    .update(updateData as never)
    .eq('stripe_payment_intent_id', id)
    .select()
    .single();

  // If not found, try by order number
  if (!order && !isNaN(Number(id))) {
    const { data: orderByNumber, error: numberError } = await supabase
      .from('orders')
      .update(updateData as never)
      .eq('order_number', Number(id))
      .select()
      .single();

    order = orderByNumber;
    error = numberError;
  }

  if (error || !order) {
    return NextResponse.json(
      { error: 'Order not found or update failed' },
      { status: 404 }
    );
  }

  return NextResponse.json({ order });
}
