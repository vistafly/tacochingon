import { cookies } from 'next/headers';
import { createHmac, timingSafeEqual } from 'crypto';

function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}

export function generateSessionToken(pin: string): string {
  const secret = pin + (process.env.STRIPE_SECRET_KEY || 'fallback-secret');
  return createHmac('sha256', secret)
    .update(`admin-session-${pin}`)
    .digest('hex');
}

export async function isAuthenticated(): Promise<boolean> {
  const adminPin = process.env.ADMIN_PIN;
  if (!adminPin) return false;

  const cookieStore = await cookies();
  const adminToken = cookieStore.get('admin_token');
  if (!adminToken) return false;

  const expectedToken = generateSessionToken(adminPin);
  return safeCompare(adminToken.value, expectedToken);
}
