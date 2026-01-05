'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeft, ShoppingBag, MessageSquare } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useCartStore } from '@/store/cart-store';
import { formatPrice } from '@/lib/utils';
import { ORDER_LINKS } from '@/lib/constants';
import { CartItem } from '@/components/cart/CartItem';

export default function CheckoutPage() {
  const t = useTranslations('checkout');
  const tCart = useTranslations('cart');
  const {
    items,
    orderNotes,
    setOrderNotes,
    getSubtotal,
    getTax,
    getTotal,
  } = useCartStore();

  const [localOrderNotes, setLocalOrderNotes] = useState(orderNotes);

  const subtotal = getSubtotal();
  const tax = getTax();
  const total = getTotal();

  const handleOrderNotesChange = (value: string) => {
    setLocalOrderNotes(value);
    setOrderNotes(value);
  };

  if (items.length === 0) {
    return (
      <div className="py-12 md:py-16 bg-negro min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <ShoppingBag className="w-20 h-20 text-gray-600 mx-auto mb-6" />
            <h2 className="text-xl font-display text-white mb-2">
              {tCart('empty')}
            </h2>
            <p className="text-gray-400 mb-8">{tCart('emptyMessage')}</p>
            <Link href="/menu">
              <button className="btn-order">
                {tCart('continueShopping')}
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 md:py-16 bg-negro min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/cart" className="inline-flex items-center text-gray-400 hover:text-amarillo transition-colors mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('backToCart')}
          </Link>
          <h1 className="font-display text-3xl md:text-4xl text-white">
            {t('title')}
          </h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items Summary */}
            <div className="bg-negro-light rounded-lg border border-gray-700 p-6">
              <h2 className="font-display text-lg text-white mb-4">
                {t('orderItems')}
              </h2>
              <div className="space-y-3">
                {items.map((cartItem) => (
                  <CartItem key={cartItem.cartItemId} cartItem={cartItem} showNotesEditor />
                ))}
              </div>
            </div>

            {/* Special Instructions for entire order */}
            <div className="bg-negro-light rounded-lg border border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-amarillo" />
                <h2 className="font-display text-lg text-white">
                  {t('specialInstructions')}
                </h2>
              </div>
              <textarea
                value={localOrderNotes}
                onChange={(e) => handleOrderNotesChange(e.target.value)}
                placeholder={t('orderNotesPlaceholder')}
                rows={3}
                className="w-full px-4 py-3 bg-negro border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-amarillo focus:outline-none resize-none"
              />
              <p className="text-xs text-gray-500 mt-2">
                {t('orderNotesHint')}
              </p>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-negro-light rounded-lg border border-gray-700 p-6 sticky top-24">
              <h2 className="font-display text-lg text-white mb-4">
                {tCart('orderSummary')}
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-400">
                  <span>{tCart('subtotal')}</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>{tCart('tax')} (7.75%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="border-t border-gray-700 pt-3">
                  <div className="flex justify-between font-display text-xl text-amarillo">
                    <span>{tCart('total')}</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Coming Soon */}
              <div className="mb-6">
                <button className="w-full btn-order py-4 opacity-50 cursor-not-allowed" disabled>
                  {t('pay')}
                </button>
                <p className="text-sm text-gray-500 text-center mt-3">
                  {t('paymentComingSoon')}
                </p>
              </div>

              {/* Order Online Options */}
              <div className="pt-6 border-t border-gray-700">
                <p className="text-sm text-gray-400 text-center mb-3">
                  {tCart('orderThroughApps')}
                </p>
                <div className="flex gap-2">
                  <a
                    href={ORDER_LINKS.doordash}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 bg-[#FF3008] hover:bg-[#E02800] text-white py-2.5 rounded-lg transition-colors text-sm font-medium"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.071 8.409a6.09 6.09 0 0 0-5.396-3.228H.584A.589.589 0 0 0 .17 6.184L3.894 9.93a1.752 1.752 0 0 0 1.242.516h12.049a1.554 1.554 0 1 1 .031 3.108H8.91a.589.589 0 0 0-.415 1.003l3.725 3.747a1.752 1.752 0 0 0 1.242.516h3.757c4.887 0 8.584-5.225 5.852-10.411z"/>
                    </svg>
                    DoorDash
                  </a>
                  <a
                    href={ORDER_LINKS.ubereats}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 bg-[#06C167] hover:bg-[#05A857] text-white py-2.5 rounded-lg transition-colors text-sm font-medium"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.5 15.5c0 .276-.224.5-.5.5h-8c-.276 0-.5-.224-.5-.5v-7c0-.276.224-.5.5-.5h8c.276 0 .5.224.5.5v7z"/>
                    </svg>
                    Uber Eats
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
