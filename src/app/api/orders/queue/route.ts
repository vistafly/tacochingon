import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

// Base prep time formula:
// 10 min minimum + 3 min per active order, capped at 45 min
const BASE_MIN = 10;
const PER_ORDER_MIN = 3;
const BASE_MAX = 45;

export async function GET() {
  try {
    const snapshot = await adminDb
      .collection('orders')
      .where('status', 'in', ['pending', 'preparing'])
      .get();

    const queueSize = snapshot.size;
    const basePrepTime = Math.min(BASE_MAX, BASE_MIN + queueSize * PER_ORDER_MIN);

    return NextResponse.json({ queueSize, basePrepTime });
  } catch (error) {
    console.error('Error fetching queue size:', error);
    // Return safe defaults on error
    return NextResponse.json({ queueSize: 0, basePrepTime: BASE_MIN });
  }
}
