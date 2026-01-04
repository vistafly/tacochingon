'use client';

import { useTranslations } from 'next-intl';
import { MapPin, Phone, Clock, ExternalLink } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { BUSINESS_INFO, SOCIAL_LINKS, ORDER_LINKS, REVIEW_LINKS } from '@/lib/constants';
import Image from 'next/image';

export function Footer() {
  const t = useTranslations();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-negro-light text-white border-t border-gray-700">
      {/* Mexican flag stripe */}
      <div className="h-1 w-full bg-gradient-to-r from-verde via-white to-rojo" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="relative w-14 h-14 rounded-full overflow-hidden border-3 border-amarillo flex-shrink-0"
                style={{ boxShadow: '0 0 15px rgba(255, 215, 0, 0.3)' }}
              >
                <Image
                  src="/images/brand/logo.jpg"
                  alt="El Taco Chingon"
                  fill
                  className="object-cover"
                />
              </div>
              <span className="font-display text-xl text-white">
                EL TACO CHINGON
              </span>
            </div>
            <p className="text-gray-400 font-accent">
              {t('footer.tagline')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display text-lg text-amarillo mb-4">{t('nav.menu')}</h3>
            <div className="space-y-2">
              <Link href="/" className="block text-gray-400 hover:text-amarillo transition-colors">
                {t('nav.home')}
              </Link>
              <Link href="/menu" className="block text-gray-400 hover:text-amarillo transition-colors">
                {t('nav.menu')}
              </Link>
              <Link href="/location" className="block text-gray-400 hover:text-amarillo transition-colors">
                {t('nav.location')}
              </Link>
            </div>

            {/* Order Online */}
            <h3 className="font-display text-lg text-amarillo mb-4 mt-6">Order Online</h3>
            <div className="space-y-2">
              <a
                href={ORDER_LINKS.doordash}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-[#FF3008] transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                DoorDash
              </a>
              <a
                href={ORDER_LINKS.ubereats}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-[#06C167] transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Uber Eats
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-display text-lg text-amarillo mb-4">{t('location.title')}</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-rojo mt-0.5 flex-shrink-0" />
                <span className="text-gray-400">
                  {BUSINESS_INFO.address.street}<br />
                  {BUSINESS_INFO.address.city}, {BUSINESS_INFO.address.state} {BUSINESS_INFO.address.zip}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-verde flex-shrink-0" />
                <a href={`tel:${BUSINESS_INFO.phone}`} className="text-gray-400 hover:text-amarillo transition-colors">
                  {BUSINESS_INFO.phone}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-amarillo flex-shrink-0" />
                <span className="text-gray-400">
                  Tue-Sun: 5:30 PM - 11:30 PM
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Social & Review Links */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
            {/* Yelp */}
            <a
              href={REVIEW_LINKS.yelp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#FF1A1A] hover:bg-[#D32323] text-white px-4 py-2 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21.111 18.226c-.141.969-2.119 3.483-3.029 3.847-.311.124-.611.094-.85-.09-.154-.12-.314-.396-2.529-4.146l-.438-.742a.625.625 0 0 0-.2-.205.498.498 0 0 0-.519.021.638.638 0 0 0-.218.246l-.707 1.217c-.108.186-.107.375.003.564.119.206 2.153 3.624 2.274 3.84.121.216.153.404.104.582-.077.281-.411.484-.856.545-.636.086-3.747-.597-4.098-.914-.156-.142-.211-.332-.173-.558.022-.13.053-.199.606-2.063l.561-1.88a.627.627 0 0 0 .019-.224.503.503 0 0 0-.386-.344.593.593 0 0 0-.315.032l-1.314.509c-.199.076-.332.227-.397.448-.071.239-.892 3.904-.987 4.202-.066.209-.168.337-.318.396-.234.091-.594.03-.963-.164-.855-.451-2.812-2.869-2.978-3.799-.056-.313.015-.551.217-.712.133-.107.288-.163 3.479-1.167l.636-.2a.667.667 0 0 0 .247-.128.507.507 0 0 0 .118-.519.632.632 0 0 0-.167-.27l-1.009-.946c-.155-.144-.351-.191-.58-.14-.246.055-3.918.896-4.218.967-.213.05-.375.026-.502-.077-.193-.156-.243-.477-.138-.865.256-.952 1.626-3.696 2.355-4.191.24-.164.481-.183.716-.055.156.084.303.236 3.201 3.224l.574.593a.616.616 0 0 0 .196.139.499.499 0 0 0 .506-.103.618.618 0 0 0 .158-.288l.226-1.392c.034-.212-.023-.389-.171-.524-.16-.147-2.814-2.907-2.971-3.076-.158-.169-.218-.326-.188-.49.046-.255.335-.424.707-.449.927-.063 4.058.504 4.498.749.158.087.251.226.281.408.019.112-.006.258-.362 2.182l-.36 1.94a.63.63 0 0 0 .001.241.5.5 0 0 0 .417.318.607.607 0 0 0 .312-.055l1.266-.581c.191-.087.312-.248.361-.478.053-.248.671-3.993.72-4.297.035-.215.131-.356.299-.437.255-.122.612-.101 1.01.061.905.367 3.097 2.484 3.323 3.433.075.316.023.561-.16.735-.12.114-.276.188-3.37 1.569l-.617.275a.658.658 0 0 0-.23.156.502.502 0 0 0-.064.526c.04.097.1.177.182.239l1.101.829c.168.126.365.151.581.074.233-.083 3.854-1.245 4.147-1.339.207-.067.374-.054.516.041.214.143.297.446.225.845z"/>
              </svg>
              Yelp
            </a>

            {/* DoorDash */}
            <a
              href={ORDER_LINKS.doordash}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#FF3008] hover:bg-[#E02800] text-white px-4 py-2 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.071 8.409a6.09 6.09 0 0 0-5.396-3.228H.584A.589.589 0 0 0 .17 6.184L3.894 9.93a1.752 1.752 0 0 0 1.242.516h12.049a1.554 1.554 0 1 1 .031 3.108H8.91a.589.589 0 0 0-.415 1.003l3.725 3.747a1.752 1.752 0 0 0 1.242.516h3.757c4.887 0 8.584-5.225 5.852-10.411z"/>
              </svg>
              DoorDash
            </a>

            {/* Instagram */}
            <a
              href={SOCIAL_LINKS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-90 text-white px-4 py-2 rounded-lg transition-opacity"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              Instagram
            </a>

            {/* Facebook */}
            <a
              href={SOCIAL_LINKS.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#1877F2] hover:bg-[#166FE5] text-white px-4 py-2 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </a>
          </div>

          {/* Copyright */}
          <p className="text-gray-500 text-sm text-center">
            &copy; {currentYear} {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
}
