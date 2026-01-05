'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { X, ShoppingBag, ExternalLink } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { Link } from '@/i18n/routing';
import { CartItem } from './CartItem';
import { formatPrice } from '@/lib/utils';
import { ORDER_LINKS } from '@/lib/constants';

export function CartDrawer() {
  const t = useTranslations('cart');
  const {
    items,
    isOpen,
    closeCart,
    getSubtotal,
    getTax,
    getTotal,
  } = useCartStore();

  // Prevent body scroll when cart is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const subtotal = getSubtotal();
  const tax = getTax();
  const total = getTotal();

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-negro/80 z-50 transition-opacity"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-negro-light z-50 shadow-xl flex flex-col border-l border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="font-display text-xl text-white">
            {t('title')}
          </h2>
          <button
            onClick={closeCart}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            aria-label="Close cart"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-4 text-center">
              <ShoppingBag className="w-16 h-16 text-gray-600 mb-4" />
              <p className="text-lg font-display text-white mb-2">
                {t('empty')}
              </p>
              <p className="text-gray-400 mb-6">{t('emptyMessage')}</p>
              <button onClick={closeCart} className="btn-order">
                {t('continueShopping')}
              </button>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {items.map((cartItem) => (
                <CartItem key={cartItem.cartItemId} cartItem={cartItem} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-700 p-4 space-y-4">
            {/* Summary */}
            <div className="space-y-2">
              <div className="flex justify-between text-gray-400">
                <span>{t('subtotal')}</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>{t('tax')}</span>
                <span>{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between font-display text-xl text-amarillo">
                <span>{t('total')}</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            {/* Checkout Options */}
            <Link href="/cart" onClick={closeCart}>
              <button className="w-full btn-order py-4 mb-3">
                {t('checkout')}
              </button>
            </Link>

            {/* Quick Order Options */}
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
        )}
      </div>
    </>
  );
}
