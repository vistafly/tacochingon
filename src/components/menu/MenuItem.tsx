'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Plus, Star } from 'lucide-react';
import { MenuItem as MenuItemType, type Locale } from '@/types';
import { useCartStore } from '@/store/cart-store';
import { formatPrice } from '@/lib/utils';

interface MenuItemProps {
  item: MenuItemType;
}

export function MenuItem({ item }: MenuItemProps) {
  const t = useTranslations('common');
  const locale = useLocale() as Locale;
  const addItem = useCartStore((state) => state.addItem);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleAddToCart = () => {
    if (item.isAvailable) {
      addItem(item);
    }
  };

  return (
    <div
      ref={cardRef}
      className={`group relative bg-negro-light border-2 rounded-lg overflow-hidden transition-all duration-200 ${
        !item.isAvailable
          ? 'opacity-60 border-gray-700'
          : 'border-gray-700 hover:border-amarillo'
      }`}
    >
      {/* Featured badge */}
      {item.isFeatured && (
        <div className="absolute top-3 left-3 z-20 flex items-center gap-1 px-3 py-1 bg-amarillo text-negro text-xs font-bold rounded">
          <Star className="w-3 h-3 fill-current" />
          FEATURED
        </div>
      )}

      {/* Sold out badge */}
      {!item.isAvailable && (
        <div className="absolute top-3 right-3 z-20 px-3 py-1 bg-rojo text-white text-xs font-bold rounded">
          {t('soldOut')}
        </div>
      )}

      {/* Spice level indicator */}
      {item.spiceLevel && item.spiceLevel > 0 && item.isAvailable && (
        <div className="absolute top-3 right-3 z-20 flex items-center gap-0.5 px-2 py-1 bg-negro/80 backdrop-blur-sm rounded">
          {[...Array(item.spiceLevel)].map((_, i) => (
            <span key={i} className="text-xs">🌶️</span>
          ))}
        </div>
      )}

      {/* Image container */}
      <div className="relative aspect-square overflow-hidden bg-gray-800">
        {item.image && !item.image.includes('placeholder') ? (
          <Image
            src={item.image}
            alt={item.name[locale]}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl">🌮</span>
          </div>
        )}

        {/* Unavailable overlay */}
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-negro/60 flex items-center justify-center">
            <span className="font-display text-xl text-white">{t('soldOut')}</span>
          </div>
        )}

        {/* Hover overlay with add button */}
        {item.isAvailable && (
          <div className="absolute inset-0 bg-negro/80 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end p-4">
            <button
              onClick={handleAddToCart}
              className="w-full btn-order text-sm py-3 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {t('addToCart')}
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category tag */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-amarillo font-medium uppercase">
            {item.categoryId}
          </span>
          {item.isVegetarian && (
            <span className="text-xs bg-verde/20 text-verde px-2 py-0.5 rounded">
              🥬 Veggie
            </span>
          )}
        </div>

        {/* Name and price */}
        <div className="flex justify-between items-start gap-3 mb-2">
          <h3 className="font-display text-lg text-white leading-tight group-hover:text-amarillo transition-colors">
            {item.name[locale]}
          </h3>
          <span className="font-display text-xl text-amarillo whitespace-nowrap">
            {formatPrice(item.price)}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-400 line-clamp-2 mb-4">
          {item.description[locale]}
        </p>

        {/* Mobile add button */}
        <button
          onClick={handleAddToCart}
          disabled={!item.isAvailable}
          className={`w-full py-2.5 rounded font-display text-sm transition-all duration-200 flex items-center justify-center gap-2 md:hidden ${
            item.isAvailable
              ? 'bg-rojo text-white border-2 border-amarillo hover:bg-rojo-dark'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Plus className="w-4 h-4" />
          {t('addToCart')}
        </button>
      </div>
    </div>
  );
}
