'use client';

import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem as CartItemType, type Locale } from '@/types';
import { useCartStore } from '@/store/cart-store';
import { formatPrice } from '@/lib/utils';

interface CartItemProps {
  cartItem: CartItemType;
}

export function CartItem({ cartItem }: CartItemProps) {
  const t = useTranslations('cart');
  const locale = useLocale() as Locale;
  const { updateQuantity, removeItem } = useCartStore();
  const { item, quantity } = cartItem;

  return (
    <div className="flex gap-4 py-4 border-b border-gray-700 last:border-0">
      {/* Image */}
      <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-800">
        <Image
          src={item.image || '/images/menu/placeholder-default.svg'}
          alt={item.name[locale]}
          fill
          className="object-cover"
          sizes="80px"
        />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <h3 className="font-display text-white truncate">
          {item.name[locale]}
        </h3>
        <p className="text-sm text-gray-400">
          {formatPrice(item.price)} each
        </p>

        {/* Quantity Controls */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center border border-gray-600 rounded">
            <button
              onClick={() => updateQuantity(item.id, quantity - 1)}
              className="p-1.5 text-gray-400 hover:text-white transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-3 text-sm font-medium text-white">{quantity}</span>
            <button
              onClick={() => updateQuantity(item.id, quantity + 1)}
              className="p-1.5 text-gray-400 hover:text-white transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => removeItem(item.id)}
            className="p-1.5 text-gray-400 hover:text-rojo transition-colors"
            aria-label={t('remove')}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Subtotal */}
      <div className="text-right">
        <span className="font-display text-amarillo">
          {formatPrice(item.price * quantity)}
        </span>
      </div>
    </div>
  );
}
