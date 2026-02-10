'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import type { Locale } from '@/i18n/config';
import enMessages from '../../../messages/en.json';
import esMessages from '../../../messages/es.json';

const messages: Record<Locale, typeof enMessages> = { en: enMessages, es: esMessages };
const STORAGE_KEY = 'admin-locale';

interface AdminLocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const AdminLocaleContext = createContext<AdminLocaleContextType>({
  locale: 'en',
  setLocale: () => {},
});

export function useAdminLocale() {
  return useContext(AdminLocaleContext);
}

export function AdminLocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored === 'en' || stored === 'es') {
      setLocaleState(stored);
    }
    setMounted(true);
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(STORAGE_KEY, newLocale);
  }, []);

  // Avoid hydration mismatch — show loading spinner until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-negro flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amarillo border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AdminLocaleContext.Provider value={{ locale, setLocale }}>
      <NextIntlClientProvider locale={locale} messages={messages[locale]}>
        {children}
      </NextIntlClientProvider>
    </AdminLocaleContext.Provider>
  );
}
