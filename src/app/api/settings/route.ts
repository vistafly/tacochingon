import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { settingsService } from '@/lib/settings-service';
import { isAuthenticated } from '@/lib/auth';

// Allowed top-level keys for settings updates
const ALLOWED_KEYS = new Set([
  'businessName', 'phone', 'email', 'address', 'hours',
  'prepTime', 'taxRate', 'isAcceptingOrders', 'pauseMessage',
  'isOpen', 'statusMessage',
]);

// GET /api/settings - Public endpoint to fetch business settings
export async function GET() {
  try {
    const settings = await settingsService.getSettings();
    return NextResponse.json({ settings });
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

    // Validate: only allow known setting keys
    const keys = Object.keys(body);
    if (keys.length === 0) {
      return NextResponse.json(
        { error: 'No settings provided' },
        { status: 400 }
      );
    }

    const invalidKeys = keys.filter((k) => !ALLOWED_KEYS.has(k));
    if (invalidKeys.length > 0) {
      return NextResponse.json(
        { error: `Invalid setting keys: ${invalidKeys.join(', ')}` },
        { status: 400 }
      );
    }

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
