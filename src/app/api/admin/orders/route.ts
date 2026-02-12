import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { isAuthenticated } from '@/lib/auth';
import { Order } from '@/types/order';

// GET /api/admin/orders - List all orders
export async function GET(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status'); // comma-separated list
  const date = searchParams.get('date'); // 'today' or ISO date

  try {
    let query: FirebaseFirestore.Query = adminDb.collection('orders');

    // Filter by date
    if (date === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      // Firestore doesn't support OR queries across different fields easily,
      // so we fetch all orders from today and filter completed ones in memory
      query = query.where('created_at', '>=', today.toISOString());
    } else if (date) {
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      query = query
        .where('created_at', '>=', targetDate.toISOString())
        .where('created_at', '<', nextDay.toISOString());
    }

    // Order by created_at descending (newest first)
    query = query.orderBy('created_at', 'desc');

    const snapshot = await query.get();
    let orders: Order[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Order[];

    // Filter by status in memory (Firestore doesn't support IN + range queries together)
    if (status) {
      const statuses = status.split(',');
      orders = orders.filter((o) => statuses.includes(o.status));
    }

    // For 'today' filter, also include completed orders from last 24 hours
    if (date === 'today') {
      try {
        const twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
        const cutoff = twentyFourHoursAgo.toISOString();

        // Get recently completed orders that might have been created before today
        const completedSnapshot = await adminDb
          .collection('orders')
          .where('status', '==', 'completed')
          .where('updated_at', '>=', cutoff)
          .orderBy('updated_at', 'desc')
          .get();

        const completedOrders = completedSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Order[];

        // Merge, avoiding duplicates
        const existingIds = new Set(orders.map((o) => o.id));
        for (const order of completedOrders) {
          if (!existingIds.has(order.id)) {
            orders.push(order);
          }
        }

        // Re-sort by created_at descending
        orders.sort((a, b) => b.created_at.localeCompare(a.created_at));
      } catch (indexError) {
        // Composite index may not exist yet - skip this secondary query
        console.warn('Completed orders query failed (composite index may be needed):', indexError);
      }
    }

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
