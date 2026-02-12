/**
 * Seed a test order directly into Firestore (local dev only).
 * Usage: npx tsx scripts/seed-test-order.ts
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Load .env.local manually
const envPath = resolve(import.meta.dirname || __dirname, '..', '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx);
  let val = trimmed.slice(eqIdx + 1);
  // Strip surrounding quotes
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1);
  }
  process.env[key] = val;
}

if (!getApps().length) {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (projectId && clientEmail && privateKey) {
    initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  } else {
    console.error('Missing Firebase Admin env vars in .env.local');
    process.exit(1);
  }
}

const db = getFirestore();

async function seedOrder() {
  // Increment order counter
  const counterRef = db.collection('counters').doc('orders');
  const orderNumber = await db.runTransaction(async (tx) => {
    const doc = await tx.get(counterRef);
    const current = doc.exists ? (doc.data()?.current || 0) : 0;
    const next = current + 1;
    tx.set(counterRef, { current: next });
    return next;
  });

  const now = new Date();
  const pickupTime = new Date(now.getTime() + 30 * 60 * 1000); // 30 min from now

  const order = {
    order_number: orderNumber,
    status: 'pending',
    customer_name: 'Test Customer',
    customer_email: 'test@example.com',
    customer_phone: '(555) 123-4567',
    items: [
      {
        itemId: 'test-taco-1',
        name: { en: 'Carne Asada Taco', es: 'Taco de Carne Asada' },
        quantity: 2,
        basePrice: 4.50,
        customizations: [],
        itemTotal: 9.00,
      },
      {
        itemId: 'test-burrito-1',
        name: { en: 'California Burrito', es: 'Burrito California' },
        quantity: 1,
        basePrice: 12.00,
        customizations: [],
        itemTotal: 12.00,
      },
    ],
    subtotal: 21.00,
    tax: 1.84,
    total: 22.84,
    pickup_time: pickupTime.toISOString(),
    special_instructions: null,
    stripe_payment_intent_id: `pi_test_seed_${Date.now()}`,
    staff_notes: null,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  };

  const docRef = await db.collection('orders').add(order);
  const piId = order.stripe_payment_intent_id;

  console.log(`\nTest order created successfully!`);
  console.log(`  Firestore ID : ${docRef.id}`);
  console.log(`  Payment ID   : ${piId}`);
  console.log(`  Order #      : ${orderNumber}`);
  console.log(`  Total        : $${order.total.toFixed(2)}`);
  console.log(`  Pickup       : ${pickupTime.toLocaleTimeString()}`);
  console.log(`\n--- Admin view ---`);
  console.log(`  http://localhost:3000/admin/orders`);
  console.log(`\n--- Client view ---`);
  console.log(`  Paste this in your browser console, then visit the URL:`);
  console.log(`  localStorage.setItem('order_${piId}_email', '${order.customer_email}');`);
  console.log(`  localStorage.setItem('el-taco-chingon-active-order', '${JSON.stringify({ state: { activeOrder: { paymentIntentId: piId, orderNumber, status: order.status, createdAt: order.created_at, pickupTime: order.pickup_time, total: order.total } }, version: 0 })}');`);
  console.log(`\n  http://localhost:3000/en/order/${piId}`);
}

seedOrder().then(() => process.exit(0)).catch((err) => {
  console.error('Failed to seed order:', err);
  process.exit(1);
});
