import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { settingsService } from '@/lib/settings-service';
import { firebaseInitTime, firebaseInitStatus } from '@/lib/firebase/admin';

// Check admin authentication
async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get('admin_token');
  return adminToken?.value === process.env.ADMIN_PIN;
}

// GET /api/settings - Public endpoint to fetch business settings
export async function GET() {
  const routeStart = Date.now();
  try {
    const queryStart = Date.now();
    const settings = await settingsService.getSettings();
    const queryMs = Date.now() - queryStart;
    const totalMs = Date.now() - routeStart;

    return NextResponse.json({
      settings,
      _debug: {
        timing: { settingsQuery: queryMs, total: totalMs },
        firebaseInit: { ms: firebaseInitTime, status: firebaseInitStatus },
      },
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// PATCH /api/settings - Admin only, update business settings
export async function PATCH(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    await settingsService.updateSettings(body);
    const settings = await settingsService.getSettings();

    // Revalidate pages that use settings data
    revalidatePath('/[locale]/location', 'page');
    revalidatePath('/[locale]', 'page');

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
