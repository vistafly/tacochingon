'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { MapPin, Phone, Clock, ExternalLink } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { BUSINESS_INFO, SOCIAL_LINKS, ORDER_LINKS, REVIEW_LINKS } from '@/lib/constants';
import { PaymentMethods } from '@/components/ui/PaymentMethods';
import { useSettings } from '@/hooks/useSettings';
import { formatTime } from '@/lib/utils';
import Image from 'next/image';
import { ScarloCredit } from '@/components/ui/ScarloCredit';

export function Footer() {
  const t = useTranslations();
  const currentYear = new Date().getFullYear();
  const { settings } = useSettings();
  const address = settings.address || BUSINESS_INFO.address;
  const phone = settings.phone || BUSINESS_INFO.phone;

  // Combine toggle + schedule for accurate open/closed status
  const isStoreOpen = useMemo(() => {
    if (!settings.isOpen || !settings.isAcceptingOrders) return false;
    const now = new Date();
    const dayKey = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof typeof settings.hours;
    const dayHours = settings.hours[dayKey];
    if (!dayHours) return false;
    const [oH, oM] = dayHours.open.split(':').map(Number);
    const [cH, cM] = dayHours.close.split(':').map(Number);
    const mins = now.getHours() * 60 + now.getMinutes();
    return mins >= oH * 60 + oM && mins < cH * 60 + cM;
  }, [settings]);

  return (
    <footer className="bg-negro-light text-white border-t border-gray-700">
      {/* Mexican flag stripe */}
      <div className="h-1 w-full bg-linear-to-r from-verde via-white to-rojo" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center items-center">
          {/* Brand */}
          <div className="flex flex-col items-center">
            <div
              className="relative w-48 h-28 overflow-hidden shrink-0"
              style={{ maskImage: 'radial-gradient(ellipse 85% 80% at center, black 50%, transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse 85% 80% at center, black 50%, transparent 100%)' }}
            >
              <Image
                src="/images/brand/logo.png"
                alt="El Taco Chingon"
                fill
                sizes="192px"
                className="object-contain"
              />
            </div>
            <p className="text-gray-400 font-accent mt-2">
              {t('footer.tagline')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display text-lg text-amarillo mb-4">{t('footer.quickLinks')}</h3>
            <div className="space-y-2">
              <Link href="/" className="block text-gray-400 hover:text-amarillo transition-colors">
                {t('nav.home')}
              </Link>
              <Link href="/menu" className="block text-gray-400 hover:text-amarillo transition-colors">
                {t('nav.menu')}
              </Link>
            </div>

            {/* Order Online */}
            <h3 className="font-display text-lg text-amarillo mb-4 mt-6">{t('footer.orderOnline')}</h3>
            <div className="space-y-2">
              <a
                href={ORDER_LINKS.doordash}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-gray-400 hover:text-[#FF3008] transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Order on DoorDash
              </a>
              <a
                href={ORDER_LINKS.ubereats}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-gray-400 hover:text-[#06C167] transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Order on Uber Eats
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-display text-lg text-amarillo mb-4">{t('location.title')}</h3>
            {/* Truck Status */}
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 ${
              isStoreOpen ? 'bg-verde/20 text-verde' : 'bg-rojo/20 text-rojo'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isStoreOpen ? 'bg-verde animate-pulse' : 'bg-rojo'}`} />
              <span className="text-sm font-medium">
                {isStoreOpen ? t('common.openNow') : t('common.closed')}
              </span>
            </div>
            {settings.statusMessage && (
              <p className="text-sm text-amarillo mb-3">{settings.statusMessage}</p>
            )}
            <div className="space-y-3">
              <div className="flex items-start justify-center gap-3">
                <MapPin className="w-5 h-5 text-rojo mt-0.5 shrink-0" />
                <span className="text-gray-400">
                  {address.street}<br />
                  {address.city}, {address.state} {address.zip}
                </span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <Phone className="w-5 h-5 text-verde shrink-0" />
                <a href={`tel:${phone}`} className="text-gray-400 hover:text-amarillo transition-colors">
                  {phone}
                </a>
              </div>
              <div className="flex items-start justify-center gap-3">
                <Clock className="w-5 h-5 text-amarillo shrink-0 mt-0.5" />
                <div className="text-gray-400 text-sm space-y-0.5">
                  {(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const).map((day) => {
                    const h = settings.hours[day];
                    return (
                      <div key={day} className="flex justify-between gap-4">
                        <span className="capitalize">{day.slice(0, 3)}</span>
                        <span className={h ? 'text-white' : 'text-rojo text-center w-full'}>
                          {h ? `${formatTime(h.open)} - ${formatTime(h.close)}` : 'Closed'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social & Review Links */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
            {/* Yelp */}
            <a
              href={REVIEW_LINKS.yelp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#FF1A1A] hover:bg-[#D32323] text-white px-4 py-2 rounded-lg transition-colors"
              aria-label="Review El Taco Chingón on Yelp"
            >
              <svg className="w-5 h-5" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="m4.188 10.095.736-.17.073-.02A.813.813 0 0 0 5.45 8.65a1 1 0 0 0-.3-.258 3 3 0 0 0-.428-.198l-.808-.295a76 76 0 0 0-1.364-.493C2.253 7.3 2 7.208 1.783 7.14c-.041-.013-.087-.025-.124-.038a2.1 2.1 0 0 0-.606-.116.72.72 0 0 0-.572.245 2 2 0 0 0-.105.132 1.6 1.6 0 0 0-.155.309c-.15.443-.225.908-.22 1.376.002.423.013.966.246 1.334a.8.8 0 0 0 .22.24c.166.114.333.129.507.141.26.019.513-.045.764-.103l2.447-.566zm8.219-3.911a4.2 4.2 0 0 0-.8-1.14 1.6 1.6 0 0 0-.275-.21 2 2 0 0 0-.15-.073.72.72 0 0 0-.621.031c-.142.07-.294.182-.496.37-.028.028-.063.06-.094.089-.167.156-.353.35-.574.575q-.51.516-1.01 1.042l-.598.62a3 3 0 0 0-.298.365 1 1 0 0 0-.157.364.8.8 0 0 0 .007.301q0 .007.003.013a.81.81 0 0 0 .945.616l.074-.014 3.185-.736c.251-.058.506-.112.732-.242.151-.088.295-.175.394-.35a.8.8 0 0 0 .093-.313c.05-.434-.178-.927-.36-1.308M6.706 7.523c.23-.29.23-.722.25-1.075.07-1.181.143-2.362.201-3.543.022-.448.07-.89.044-1.34-.022-.372-.025-.799-.26-1.104C6.528-.077 5.644-.033 5.04.05q-.278.038-.553.104a8 8 0 0 0-.543.149c-.58.19-1.393.537-1.53 1.204-.078.377.106.763.249 1.107.173.417.41.792.625 1.185.57 1.036 1.15 2.066 1.728 3.097.172.308.36.697.695.857q.033.015.068.025c.15.057.313.068.469.032l.028-.007a.8.8 0 0 0 .377-.226zm-.276 3.161a.74.74 0 0 0-.923-.234 1 1 0 0 0-.145.09 2 2 0 0 0-.346.354c-.026.033-.05.077-.08.104l-.512.705q-.435.591-.861 1.193c-.185.26-.346.479-.472.673l-.072.11c-.152.235-.238.406-.282.559a.7.7 0 0 0-.03.314c.013.11.05.217.108.312q.046.07.1.138a1.6 1.6 0 0 0 .257.237 4.5 4.5 0 0 0 2.196.76 1.6 1.6 0 0 0 .349-.027 2 2 0 0 0 .163-.048.8.8 0 0 0 .278-.178.7.7 0 0 0 .17-.266c.059-.147.098-.335.123-.613l.012-.13c.02-.231.03-.502.045-.821q.037-.735.06-1.469l.033-.87a2.1 2.1 0 0 0-.055-.623 1 1 0 0 0-.117-.27Zm5.783 1.362a2.2 2.2 0 0 0-.498-.378l-.112-.067c-.199-.12-.438-.246-.719-.398q-.644-.353-1.295-.695l-.767-.407c-.04-.012-.08-.04-.118-.059a2 2 0 0 0-.466-.166 1 1 0 0 0-.17-.018.74.74 0 0 0-.725.616 1 1 0 0 0 .01.293c.038.204.13.406.224.583l.41.768q.341.65.696 1.294c.152.28.28.52.398.719q.036.057.068.112c.145.239.261.39.379.497a.73.73 0 0 0 .596.201 2 2 0 0 0 .168-.029 1.6 1.6 0 0 0 .325-.129 4 4 0 0 0 .855-.64c.306-.3.577-.63.788-1.006q.045-.08.076-.165a2 2 0 0 0 .051-.161q.019-.083.029-.168a.8.8 0 0 0-.038-.327.7.7 0 0 0-.165-.27"/>
              </svg>
              Review on Yelp
            </a>

            {/* DoorDash */}
            <a
              href={ORDER_LINKS.doordash}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#FF3008] hover:bg-[#E02800] text-white px-4 py-2 rounded-lg transition-colors"
              aria-label="Order El Taco Chingón on DoorDash"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M23.071 8.409a6.09 6.09 0 0 0-5.396-3.228H.584A.589.589 0 0 0 .17 6.184L3.894 9.93a1.752 1.752 0 0 0 1.242.516h12.049a1.554 1.554 0 1 1 .031 3.108H8.91a.589.589 0 0 0-.415 1.003l3.725 3.747a1.752 1.752 0 0 0 1.242.516h3.757c4.887 0 8.584-5.225 5.852-10.411z"/>
              </svg>
              DoorDash Delivery
            </a>

            {/* Instagram */}
            <a
              href={SOCIAL_LINKS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-linear-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-90 text-white px-4 py-2 rounded-lg transition-opacity"
              aria-label="Follow El Taco Chingón on Instagram"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
              Follow on Instagram
            </a>

            {/* Facebook */}
            <a
              href={SOCIAL_LINKS.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#1877F2] hover:bg-[#166FE5] text-white px-4 py-2 rounded-lg transition-colors"
              aria-label="Follow El Taco Chingón on Facebook"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Follow on Facebook
            </a>
          </div>

          {/* Payment Methods */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs text-gray-500">{t('footer.securePayments')}</p>
            <PaymentMethods />
          </div>

          {/* Developer Credit */}
          <div className="mt-8 border-t border-gray-700">
            <ScarloCredit />
          </div>

          {/* Copyright — bottom */}
          <p className="text-gray-600 text-xs text-center mt-3 pb-1">
            &copy; {currentYear} {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
}
