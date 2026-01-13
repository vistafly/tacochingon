import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  const { pin } = await request.json();
  const adminPin = process.env.ADMIN_PIN;

  if (!adminPin) {
    return NextResponse.json(
      { error: 'Admin PIN not configured' },
      { status: 500 }
    );
  }

  if (pin !== adminPin) {
    return NextResponse.json(
      { error: 'Invalid PIN' },
      { status: 401 }
    );
  }

  // Set HTTP-only cookie
  const cookieStore = await cookies();
  cookieStore.set('admin_token', adminPin, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });

  return NextResponse.json({ success: true });
}

export async function DELETE() {
  // Logout - clear cookie
  const cookieStore = await cookies();
  cookieStore.delete('admin_token');

  return NextResponse.json({ success: true });
}

export async function GET() {
  // Check if authenticated
  const cookieStore = await cookies();
  const adminToken = cookieStore.get('admin_token');
  const adminPin = process.env.ADMIN_PIN;

  if (!adminToken || adminToken.value !== adminPin) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true });
}
