'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { CheckCircle, ArrowRight, Phone } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { BUSINESS_INFO } from '@/lib/constants';

export default function CheckoutSuccessPage() {
  const t = useTranslations('checkout');
  const { clearCart } = useCartStore();

  // Clear cart on mount (in case redirect didn't trigger it)
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="py-12 md:py-16 bg-negro min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-verde/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-verde" />
            </div>
          </div>

          {/* Success Message */}
          <h1 className="font-display text-3xl md:text-4xl text-white mb-4">
            {t('successTitle')}
          </h1>
          <p className="text-gray-400 text-lg mb-8">
            {t('successMessage')}
          </p>

          {/* Order Info Card */}
          <div className="bg-negro-light rounded-lg border border-gray-700 p-6 mb-8 text-left">
            <h2 className="font-display text-lg text-amarillo mb-4">
              {t('whatNext')}
            </h2>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-amarillo font-bold">1.</span>
                <span>{t('nextStep1')}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amarillo font-bold">2.</span>
                <span>{t('nextStep2')}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amarillo font-bold">3.</span>
                <span>{t('nextStep3')}</span>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="bg-negro-light rounded-lg border border-gray-700 p-6 mb-8">
            <p className="text-gray-400 mb-3">{t('questionsContact')}</p>
            <a
              href={`tel:${BUSINESS_INFO.phone.replace(/\D/g, '')}`}
              className="inline-flex items-center gap-2 text-amarillo hover:underline text-lg"
            >
              <Phone className="w-5 h-5" />
              {BUSINESS_INFO.phone}
            </a>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/menu">
              <button className="btn-order flex items-center justify-center gap-2 w-full sm:w-auto">
                {t('orderMore')}
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <Link href="/">
              <button className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:border-amarillo hover:text-amarillo transition-colors w-full sm:w-auto">
                {t('backToHome')}
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
