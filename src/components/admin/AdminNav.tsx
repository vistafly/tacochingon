'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, Settings, LogOut } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAdminLocale } from './AdminLocaleProvider';
import type { Locale } from '@/i18n/config';

export type NavGuardResult = 'save' | 'discard' | 'stay';

interface AdminNavProps {
  onLogout: () => void;
  /** Async guard — return 'save'|'discard' to proceed, 'stay' to block */
  confirmNavigation?: () => Promise<NavGuardResult>;
}

const navItems = [
  { href: '/admin/orders', labelKey: 'orders' as const, icon: Package },
  { href: '/admin/settings', labelKey: 'settings' as const, icon: Settings },
];

export function AdminNav({ onLogout, confirmNavigation }: AdminNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('admin');
  const { locale, setLocale } = useAdminLocale();
  const [navigating, setNavigating] = useState(false);

  const toggleLocale = () => {
    setLocale(locale === 'en' ? 'es' : 'en' as Locale);
  };

  const handleNavClick = async (href: string) => {
    if (navigating) return;
    if (confirmNavigation) {
      setNavigating(true);
      const result = await confirmNavigation();
      setNavigating(false);
      if (result === 'stay') return;
      // 'save' or 'discard' — parent handles saving before resolving
    }
    router.push(href);
  };

  return (
    <div className="flex items-center gap-1.5">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        if (confirmNavigation && !isActive) {
          return (
            <button
              key={item.href}
              onClick={() => handleNavClick(item.href)}
              className={`flex items-center gap-1.5 p-2 sm:px-3 rounded-lg text-sm font-medium transition-colors bg-gray-700 text-gray-300 hover:bg-gray-600`}
              title={t(item.labelKey)}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{t(item.labelKey)}</span>
            </button>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-1.5 p-2 sm:px-3 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-amarillo text-negro'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            title={t(item.labelKey)}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{t(item.labelKey)}</span>
          </Link>
        );
      })}
      <button
        onClick={toggleLocale}
        className="px-2.5 py-2 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded-lg transition-colors text-xs font-bold"
        title={locale === 'en' ? 'Cambiar a Español' : 'Switch to English'}
      >
        {locale.toUpperCase()}
      </button>
      <button
        onClick={onLogout}
        className="p-2 bg-rojo/20 hover:bg-rojo/30 text-rojo rounded-lg transition-colors"
        title={t('logout')}
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );
}
