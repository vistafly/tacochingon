import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

export function formatTime(time24: string | null): string {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export function isOpenNow(hours: { open: string; close: string } | null): boolean {
  if (!hours) return false;

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const [openHours, openMinutes] = hours.open.split(':').map(Number);
  const [closeHours, closeMinutes] = hours.close.split(':').map(Number);

  const openTime = openHours * 60 + openMinutes;
  const closeTime = closeHours * 60 + closeMinutes;

  // Handle overnight hours (e.g., open at 5:30 PM, close at 11:30 PM)
  if (closeTime < openTime) {
    return currentTime >= openTime || currentTime < closeTime;
  }

  return currentTime >= openTime && currentTime < closeTime;
}

export function generateOrderNumber(): number {
  return Math.floor(1000 + Math.random() * 9000);
}

/**
 * Format order item customizations into a display string.
 * Names are already descriptive (e.g. "No Beans", "Extra Meat", "Pollo"),
 * so we just join them. When "Meat Only" is selected, individual remove
 * options are hidden since they're implied.
 */
export function formatCustomizations(
  customizations: Array<{ id: string; name: { en: string; es: string }; type: string }>,
  locale: 'en' | 'es' = 'en'
): string {
  if (!customizations || customizations.length === 0) return '';

  const hasMeatOnly = customizations.some((c) => c.id === 'meat-only');
  const filtered = hasMeatOnly
    ? customizations.filter((c) => c.id === 'meat-only' || c.type !== 'remove')
    : customizations;

  return filtered.map((c) => c.name[locale] || c.name.en).join(', ');
}
