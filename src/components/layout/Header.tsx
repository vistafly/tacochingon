'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Menu, X, ShoppingCart, Home, UtensilsCrossed } from 'lucide-react';
import { Link, usePathname } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/store/cart-store';
import { LanguageToggle } from './LanguageToggle';
import Image from 'next/image';

export function Header() {
  const t = useTranslations('nav');
  const tCommon = useTranslations('common');
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { getItemCount, openCart } = useCartStore();
  const itemCount = getItemCount();

  // Prevent hydration mismatch with persisted cart state
  useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { href: '/', label: t('home') },
    { href: '/menu', label: t('menu') },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const handleNavClick = () => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-all duration-200',
        scrolled
          ? 'bg-negro/95 backdrop-blur-sm shadow-lg'
          : 'bg-negro'
      )}
    >
      {/* Mexican flag stripe - top */}
      <div className="h-1 w-full bg-linear-to-r from-verde via-white to-rojo" />

      <nav className="w-full px-4 lg:px-6">
        <div className="relative flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" onClick={handleNavClick} className="flex items-center group z-10 -ml-1.25">
            <div
              className="relative w-28 h-16 md:w-36 md:h-20 overflow-hidden shrink-0"
              style={{ maskImage: 'radial-gradient(ellipse 85% 80% at center, black 50%, transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse 85% 80% at center, black 50%, transparent 100%)' }}
            >
              <Image
                src="/images/brand/logo.png"
                alt="El Taco Chingon"
                fill
                sizes="144px"
                className="object-contain"
              />
            </div>
          </Link>

          {/* Desktop Navigation - Absolutely centered */}
          <div className="hidden md:flex items-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/5 rounded-full p-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={handleNavClick}
                className={cn(
                  'px-6 py-2 font-display text-base tracking-wider uppercase transition-all duration-200 rounded-full',
                  isActive(link.href)
                    ? 'bg-amarillo text-negro'
                    : 'text-white hover:text-amarillo'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center z-10">
            {/* Order CTA - Desktop only */}
            <Link href="/menu" onClick={handleNavClick} className="hidden lg:block mr-8">
              <button className="btn-order text-sm py-2.5 px-6">
                {tCommon('orderNow')}
              </button>
            </Link>

            {/* Language and Cart group - pushed to the right */}
            <div className="flex items-center gap-4">
              <LanguageToggle />

              {/* Cart Button */}
              <button
                onClick={openCart}
                className="relative p-2.5 bg-negro-light hover:bg-gray-700 rounded text-white transition-colors"
                aria-label={t('cart')}
              >
                <ShoppingCart className="w-6 h-6" />
                {mounted && itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-rojo text-white text-xs font-bold rounded-full flex items-center justify-center border border-amarillo">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2.5 bg-negro-light hover:bg-gray-700 rounded text-white transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-2 border-t border-gray-700">
            <div className="grid grid-cols-2 gap-2 px-2">
              <Link
                href="/"
                onClick={() => { handleNavClick(); setMobileMenuOpen(false); }}
                className={cn(
                  'flex items-center justify-center gap-1.5 py-2.5 rounded-lg font-display text-xs uppercase tracking-wider transition-colors',
                  isActive('/') ? 'bg-amarillo text-negro' : 'bg-white/5 text-white hover:bg-white/10'
                )}
              >
                <Home className="w-3.5 h-3.5" />
                {t('home')}
              </Link>
              <Link
                href="/menu"
                onClick={() => { handleNavClick(); setMobileMenuOpen(false); }}
                className={cn(
                  'flex items-center justify-center gap-1.5 py-2.5 rounded-lg font-display text-xs uppercase tracking-wider transition-colors',
                  isActive('/menu') ? 'bg-amarillo text-negro' : 'bg-white/5 text-white hover:bg-white/10'
                )}
              >
                <UtensilsCrossed className="w-3.5 h-3.5" />
                {t('menu')}
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Mexican flag stripe - bottom */}
      <div className="h-1 w-full bg-linear-to-r from-verde via-white to-rojo" />
    </header>
  );
}
