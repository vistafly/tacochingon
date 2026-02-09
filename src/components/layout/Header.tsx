'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Menu, X, ShoppingCart } from 'lucide-react';
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
    { href: '/location', label: t('location') },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const handleNavClick = () => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
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
      <div className="h-1 w-full bg-gradient-to-r from-verde via-white to-rojo" />

      <nav className="w-full px-6 lg:px-12">
        <div className="relative flex items-center justify-between h-20 md:h-24">
          {/* Logo */}
          <Link href="/" onClick={handleNavClick} className="flex items-center gap-3 group z-10">
            <div
              className="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-3 border-amarillo flex-shrink-0"
              style={{ boxShadow: '0 0 20px rgba(255, 215, 0, 0.4), 0 0 40px rgba(255, 215, 0, 0.2)' }}
            >
              <Image
                src="/images/brand/logo.jpg"
                alt="El Taco Chingon"
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>
            <div className="hidden sm:block">
              <span className="font-display text-2xl text-white group-hover:text-amarillo transition-colors">
                EL TACO CHINGON
              </span>
            </div>
          </Link>

          {/* Desktop Navigation - Absolutely centered */}
          <div className="hidden md:flex items-center gap-10 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={handleNavClick}
                className={cn(
                  'px-4 py-2 font-display text-base tracking-wider uppercase transition-all duration-200',
                  isActive(link.href)
                    ? 'text-amarillo'
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
          <div className="md:hidden py-4 border-t border-gray-700">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => {
                    handleNavClick();
                    setMobileMenuOpen(false);
                  }}
                  className={cn(
                    'px-4 py-3 font-display text-base transition-colors rounded text-center',
                    isActive(link.href)
                      ? 'bg-amarillo/10 text-amarillo'
                      : 'text-white hover:bg-gray-800'
                  )}
                >
                  {link.label}
                </Link>
              ))}

              {/* Mobile Order CTA */}
              <Link
                href="/menu"
                onClick={() => {
                  handleNavClick();
                  setMobileMenuOpen(false);
                }}
                className="mt-4"
              >
                <button className="w-full btn-order py-3">
                  {tCommon('orderNow')}
                </button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Mexican flag stripe - bottom */}
      <div className="h-1 w-full bg-gradient-to-r from-verde via-white to-rojo" />
    </header>
  );
}
