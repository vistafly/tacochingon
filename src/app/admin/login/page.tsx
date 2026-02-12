'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Loader2, AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAdminLocale } from '@/components/admin/AdminLocaleProvider';
import { locales } from '@/i18n/config';
import { cn } from '@/lib/utils';

export default function AdminLoginPage() {
  const router = useRouter();
  const t = useTranslations('admin');
  const { locale, setLocale } = useAdminLocale();
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Invalid PIN');
      }

      router.push('/admin/orders');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-negro flex items-center justify-center px-4">
      <div className="max-w-sm w-full">
        {/* Language Toggle */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center border border-gray-600 rounded overflow-hidden">
            {locales.map((loc) => (
              <button
                key={loc}
                onClick={() => setLocale(loc)}
                className={cn(
                  'px-3 py-1.5 text-sm font-display transition-colors',
                  locale === loc
                    ? 'bg-amarillo text-negro'
                    : 'bg-negro-light text-white hover:bg-gray-700'
                )}
              >
                {loc.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amarillo/10 text-amarillo mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-display text-white">{t('staffLogin')}</h1>
          <p className="text-gray-400 mt-2">{t('enterPin')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              placeholder={t('enterPinPlaceholder')}
              className="w-full px-4 py-4 bg-negro-light border border-gray-700 rounded-lg text-white text-center text-2xl tracking-widest placeholder-gray-500 focus:border-amarillo focus:outline-none"
              autoFocus
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-rojo bg-rojo/10 border border-rojo/20 rounded-lg p-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={pin.length < 6 || isLoading}
            className="w-full bg-amarillo hover:bg-amarillo/90 text-negro font-bold py-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t('verifying')}
              </>
            ) : (
              t('login')
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
