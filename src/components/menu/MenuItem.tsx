'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Plus, Star } from 'lucide-react';
import { MenuItem as MenuItemType, type Locale } from '@/types';
import { SelectedCustomization } from '@/types/cart';
import { useCartStore } from '@/store/cart-store';
import { formatPrice } from '@/lib/utils';
import { ItemCustomizationModal } from './ItemCustomizationModal';

interface MenuItemProps {
  item: MenuItemType;
  forceModalOpen?: boolean;
  onModalClose?: () => void;
}

export function MenuItem({ item, forceModalOpen = false, onModalClose }: MenuItemProps) {
  const t = useTranslations('common');
  const locale = useLocale() as Locale;
  const { addItemWithCustomizations, getItemQuantity, getFirstCartEntryForItem } = useCartStore();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(forceModalOpen);

  // Sync with forceModalOpen prop
  useEffect(() => {
    if (forceModalOpen) {
      setIsModalOpen(true);
    }
  }, [forceModalOpen]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    onModalClose?.();
  };

  const quantityInCart = getItemQuantity(item.id);
  const existingCartEntry = getFirstCartEntryForItem(item.id);

  const handleAddToCart = () => {
    if (item.isAvailable) {
      // If item has customizations, open modal
      if (item.customizations && item.customizations.length > 0) {
        setIsModalOpen(true);
      } else {
        // No customizations, add directly
        addItemWithCustomizations(item, [], 1);
      }
    }
  };

  const handleAddWithCustomizations = (
    customizations: SelectedCustomization[],
    quantity: number
  ) => {
    addItemWithCustomizations(item, customizations, quantity);
  };

  return (
    <>
      <div
        ref={cardRef}
        className={`group relative h-full flex flex-col bg-negro-light border-2 rounded-lg overflow-hidden transition-all duration-200 ${
          !item.isAvailable
            ? 'opacity-60 border-gray-700'
            : 'border-gray-700 hover:border-amarillo'
        }`}
      >
        {/* Cart quantity badge - top right corner */}
        {quantityInCart > 0 && item.isAvailable && (
          <div className="absolute top-3 right-3 z-30 min-w-[24px] h-6 px-2 bg-verde text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
            {quantityInCart}
          </div>
        )}

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

        {/* Spice level indicator - move to bottom left when item is in cart */}
        {item.spiceLevel && item.spiceLevel > 0 && item.isAvailable && (
          <div className={`absolute z-20 flex items-center gap-0.5 px-2 py-1 bg-negro/80 backdrop-blur-sm rounded ${
            quantityInCart > 0 ? 'bottom-[calc(100%-3.5rem)] right-3' : 'top-3 right-3'
          }`}>
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
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
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

          {/* Description - limit to 2 lines */}
          <p className="text-sm text-gray-400 mb-4 line-clamp-2">
            {item.description[locale]}
          </p>

          {/* Spacer to push button to bottom */}
          <div className="flex-1" />

          {/* Add to cart button */}
          {item.isAvailable && (
            <button
              onClick={handleAddToCart}
              className="w-full btn-order text-sm py-3 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {quantityInCart > 0 ? t('addMore') : t('addToCart')}
            </button>
          )}

          {/* Unavailable message */}
          {!item.isAvailable && (
            <button
              disabled
              className="w-full py-2.5 rounded font-display text-sm bg-gray-700 text-gray-500 cursor-not-allowed"
            >
              {t('soldOut')}
            </button>
          )}
        </div>
      </div>

      {/* Customization Modal */}
      <ItemCustomizationModal
        item={item}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAddToCart={handleAddWithCustomizations}
        initialCustomizations={existingCartEntry?.customizations || []}
      />
    </>
  );
}
