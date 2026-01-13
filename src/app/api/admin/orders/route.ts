import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

// Check admin authentication
async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get('admin_token');
  return adminToken?.value === process.env.ADMIN_PIN;
}

// GET /api/admin/orders - List all orders
export async function GET(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status'); // comma-separated list
  const date = searchParams.get('date'); // 'today' or ISO date

  const supabase = createServerClient();
  let query = supabase.from('orders').select('*');

  // Filter by status
  if (status) {
    const statuses = status.split(',');
    query = query.in('status', statuses);
  }

  // Filter by date
  if (date === 'today') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    query = query
      .gte('created_at', today.toISOString())
      .lt('created_at', tomorrow.toISOString());
  } else if (date) {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    query = query
      .gte('created_at', targetDate.toISOString())
      .lt('created_at', nextDay.toISOString());
  }

  // Order by created_at descending (newest first)
  query = query.order('created_at', { ascending: false });

  const { data: orders, error } = await query;

  if (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }

  return NextResponse.json({ orders });
}
