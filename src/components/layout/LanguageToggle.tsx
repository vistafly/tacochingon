'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { locales, localeNames, type Locale } from '@/i18n/config';
import { cn } from '@/lib/utils';

export function LanguageToggle() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();

  const handleLocaleChange = (newLocale: Locale) => {
    router.replace(pathname, { locale: newLocale, scroll: false });
  };

  return (
    <div className="flex items-center border border-gray-600 rounded overflow-hidden">
      {locales.map((loc) => (
        <button
          key={loc}
          onClick={() => handleLocaleChange(loc)}
          className={cn(
            'px-3 py-1.5 text-sm font-display transition-colors',
            locale === loc
              ? 'bg-amarillo text-negro'
              : 'bg-negro-light text-white hover:bg-gray-700'
          )}
          aria-label={localeNames[loc]}
        >
          {loc.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
