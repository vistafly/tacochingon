'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Minus, Plus, Trash2, Check, MessageSquare, Pencil } from 'lucide-react';
import { CartItem as CartItemType, type Locale } from '@/types';
import { SelectedCustomization } from '@/types/cart';
import { useCartStore } from '@/store/cart-store';
import { formatPrice } from '@/lib/utils';

interface CartItemProps {
  cartItem: CartItemType;
  showNotesEditor?: boolean;
}

export function CartItem({ cartItem, showNotesEditor = false }: CartItemProps) {
  const t = useTranslations('cart');
  const tCustom = useTranslations('customization');
  const locale = useLocale() as Locale;
  const { updateCartItemQuantity, removeCartItem, updateCartItemNotes, updateCartItemCustomizations } = useCartStore();
  const { cartItemId, item, quantity, notes, customizations } = cartItem;
  const [isSelected, setIsSelected] = useState(true);
  const [showNotes, setShowNotes] = useState(!!notes);
  const [localNotes, setLocalNotes] = useState(notes || '');
  const [showCustomizations, setShowCustomizations] = useState(false);

  const handleCheckboxToggle = () => {
    if (isSelected) {
      removeCartItem(cartItemId);
    }
    setIsSelected(!isSelected);
  };

  const handleNotesChange = (value: string) => {
    const trimmed = value.slice(0, 100);
    setLocalNotes(trimmed);
    updateCartItemNotes(cartItemId, trimmed);
  };

  const handleCustomizationToggle = (customizationId: string, type: 'remove' | 'add', price?: number) => {
    const currentCustomizations = customizations || [];
    const isCurrentlySelected = currentCustomizations.some(c => c.id === customizationId);

    let newCustomizations: SelectedCustomization[];
    if (isCurrentlySelected) {
      newCustomizations = currentCustomizations.filter(c => c.id !== customizationId);
    } else {
      newCustomizations = [...currentCustomizations, { id: customizationId, type, price }];
    }

    updateCartItemCustomizations(cartItemId, newCustomizations);
  };

  const isCustomizationSelected = (customizationId: string) => {
    return customizations?.some(c => c.id === customizationId) || false;
  };

  const removeOptions = item.customizations?.filter(c => c.type === 'remove') || [];
  const addOptions = item.customizations?.filter(c => c.type === 'add') || [];
  const hasCustomizations = item.customizations && item.customizations.length > 0;

  const addOnCost = customizations?.filter(c => c.type === 'add' && c.price).reduce((sum, c) => sum + (c.price || 0), 0) || 0;
  const itemTotalPrice = (item.price + addOnCost) * quantity;

  // Format customizations text
  const getCustomizationsText = () => {
    if (!customizations || customizations.length === 0) return null;
    return customizations.map((c) => {
      const option = item.customizations?.find(opt => opt.id === c.id);
      if (!option) return null;
      return c.type === 'remove' ? `No ${option.name[locale].replace('No ', '')}` : option.name[locale];
    }).filter(Boolean).join(', ');
  };

  const customizationsText = getCustomizationsText();

  return (
    <div className="bg-negro-light rounded-lg p-4 border border-gray-700">
      {/* Main content row */}
      <div className="flex gap-3">
        {/* Checkbox */}
        <button
          onClick={handleCheckboxToggle}
          className="flex-shrink-0 self-start mt-1"
          aria-label={isSelected ? t('remove') : t('addBack')}
        >
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
            isSelected
              ? 'bg-verde border-verde'
              : 'border-gray-500 hover:border-rojo'
          }`}>
            {isSelected && <Check className="w-3 h-3 text-white" />}
          </div>
        </button>

        {/* Image */}
        <div className="relative w-14 h-14 rounded-md overflow-hidden flex-shrink-0 bg-gray-800">
          <Image
            src={item.image || '/images/menu/placeholder-default.svg'}
            alt={item.name[locale]}
            fill
            className="object-cover"
            sizes="56px"
          />
        </div>

        {/* Item details */}
        <div className="flex-1 min-w-0">
          {/* Name and price row */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-white text-sm leading-tight">
                {item.name[locale]}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {formatPrice(item.price)} each
              </p>
            </div>

            {/* Price column */}
            <div className="text-right flex-shrink-0">
              <span className="font-display text-amarillo text-lg">
                {formatPrice(itemTotalPrice)}
              </span>
              {addOnCost > 0 && (
                <p className="text-xs text-gray-500">
                  +{formatPrice(addOnCost * quantity)} {tCustom('extras')}
                </p>
              )}
            </div>
          </div>

          {/* Customizations text - subtle below name */}
          {customizationsText && (
            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
              {customizationsText}
            </p>
          )}
        </div>
      </div>

      {/* Quantity, Edit customizations, and Delete - full width row */}
      <div className="flex items-center justify-between mt-3">
        {/* Quantity controls */}
        <div className="flex items-center bg-negro rounded border border-gray-600">
          <button
            onClick={() => updateCartItemQuantity(cartItemId, quantity - 1)}
            className="p-1.5 text-gray-400 hover:text-white transition-colors"
            aria-label="Decrease quantity"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="px-3 text-sm font-medium text-white min-w-[2rem] text-center">
            {quantity}
          </span>
          <button
            onClick={() => updateCartItemQuantity(cartItemId, quantity + 1)}
            className="p-1.5 text-gray-400 hover:text-white transition-colors"
            aria-label="Increase quantity"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Edit customizations button */}
        {hasCustomizations && (
          <button
            onClick={() => setShowCustomizations(!showCustomizations)}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-amarillo transition-colors"
          >
            <Pencil className="w-3 h-3" />
            <span>{t('editCustomizations')}</span>
            {customizations && customizations.length > 0 && (
              <span className="text-amarillo/70">({customizations.length})</span>
            )}
          </button>
        )}

        {/* Notes button (if enabled) */}
        {showNotesEditor && (
          <button
            onClick={() => setShowNotes(!showNotes)}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-amarillo transition-colors"
          >
            <MessageSquare className="w-3 h-3" />
            <span>{notes ? t('editNotes') : t('addNotes')}</span>
          </button>
        )}

        {/* Delete button */}
        <button
          onClick={() => removeCartItem(cartItemId)}
          className="p-1.5 text-gray-500 hover:text-rojo transition-colors"
          aria-label={t('remove')}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Display existing notes */}
      {!showNotes && notes && (
        <p className="mt-2 text-xs text-gray-500 italic">
          &quot;{notes}&quot;
        </p>
      )}

      {/* Customizations editor panel */}
      {showCustomizations && hasCustomizations && (
        <div className="mt-3 pt-3 border-t border-t-gray-700/50 space-y-3">
          {removeOptions.length > 0 && (
            <div>
              <p className="text-xs text-gray-600 mb-2">{tCustom('removeIngredients')}</p>
              <div className="flex flex-wrap gap-1.5">
                {removeOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleCustomizationToggle(option.id, 'remove')}
                    className={`px-2.5 py-1 text-xs rounded border transition-all ${
                      isCustomizationSelected(option.id)
                        ? 'bg-rojo/20 border-rojo/50 text-rojo'
                        : 'border-gray-600 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    {isCustomizationSelected(option.id) && <span className="mr-1">✕</span>}
                    {option.name[locale]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {addOptions.length > 0 && (
            <div>
              <p className="text-xs text-gray-600 mb-2">{tCustom('addExtras')}</p>
              <div className="flex flex-wrap gap-1.5">
                {addOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleCustomizationToggle(option.id, 'add', option.price)}
                    className={`px-2.5 py-1 text-xs rounded border transition-all ${
                      isCustomizationSelected(option.id)
                        ? 'bg-verde/20 border-verde/50 text-verde'
                        : 'border-gray-600 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    {isCustomizationSelected(option.id) && <span className="mr-1">✓</span>}
                    {option.name[locale]}
                    {option.price && <span className="ml-1 text-amarillo">+{formatPrice(option.price)}</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Notes editor panel */}
      {showNotes && (
        <div className="mt-3 pt-3 border-t border-t-gray-700/50">
          <input
            type="text"
            value={localNotes}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder={t('notesPlaceholder')}
            maxLength={100}
            className="w-full px-3 py-2 text-sm bg-negro border border-gray-600 rounded text-white placeholder-gray-500 focus:border-amarillo focus:outline-none"
          />
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-600">
              {t('notesHint')}
            </span>
            <span className="text-xs text-gray-600">
              {localNotes.length}/100
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
