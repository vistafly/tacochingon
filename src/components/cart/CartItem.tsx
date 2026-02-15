'use client';

import { useState, useRef, useEffect } from 'react';
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
  const [imgError, setImgError] = useState(false);
  const customizationsRef = useRef<HTMLDivElement>(null);
  const editButtonRef = useRef<HTMLButtonElement>(null);

  // Close customizations panel when clicking outside
  useEffect(() => {
    if (!showCustomizations) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        customizationsRef.current &&
        !customizationsRef.current.contains(target) &&
        editButtonRef.current &&
        !editButtonRef.current.contains(target)
      ) {
        setShowCustomizations(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCustomizations]);

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

    // Con Todo: toggling ON clears all removes
    if (customizationId === 'con-todo') {
      const wasSelected = currentCustomizations.some(c => c.id === 'con-todo');
      if (wasSelected) {
        updateCartItemCustomizations(cartItemId, currentCustomizations.filter(c => c.id !== 'con-todo'));
      } else {
        updateCartItemCustomizations(cartItemId, [...currentCustomizations.filter(c => c.type !== 'remove'), { id: 'con-todo', type: 'add' as const, price: 0 }]);
      }
      return;
    }

    // Selecting a remove option auto-deselects Con Todo;
    // deselecting the last remove re-activates Con Todo
    if (type === 'remove') {
      const isCurrentlySelected = currentCustomizations.some(c => c.id === customizationId);
      if (isCurrentlySelected) {
        const remaining = currentCustomizations.filter(c => c.id !== customizationId);
        const hasRemainingRemoves = remaining.some(c => c.type === 'remove');
        if (!hasRemainingRemoves && conTodoOption) {
          updateCartItemCustomizations(cartItemId, [...remaining, { id: 'con-todo', type: 'add' as const, price: 0 }]);
        } else {
          updateCartItemCustomizations(cartItemId, remaining);
        }
      } else {
        updateCartItemCustomizations(cartItemId, [...currentCustomizations.filter(c => c.id !== 'con-todo'), { id: customizationId, type, price }]);
      }
      return;
    }

    const isCurrentlySelected = currentCustomizations.some(c => c.id === customizationId);
    let newCustomizations: SelectedCustomization[];
    if (isCurrentlySelected) {
      newCustomizations = currentCustomizations.filter(c => c.id !== customizationId);
    } else {
      newCustomizations = [...currentCustomizations, { id: customizationId, type, price }];
    }
    updateCartItemCustomizations(cartItemId, newCustomizations);
  };

  const handleSelectOption = (customizationId: string, group: string) => {
    const currentCustomizations = customizations || [];
    const filtered = currentCustomizations.filter(c => c.group !== group);
    updateCartItemCustomizations(cartItemId, [...filtered, { id: customizationId, type: 'select', group }]);
  };

  const isCustomizationSelected = (customizationId: string) => {
    return customizations?.some(c => c.id === customizationId) || false;
  };

  const removeOptions = item.customizations?.filter(c => c.type === 'remove') || [];
  const addOptions = item.customizations?.filter(c => c.type === 'add') || [];
  const hasCustomizations = item.customizations && item.customizations.length > 0;

  // Separate Con Todo from other add options
  const conTodoOption = addOptions.find(c => c.id === 'con-todo');
  const addGroups = (() => {
    const groups: Record<string, { label?: { en: string; es: string }; options: import('@/types/menu').ItemCustomization[] }> = {};
    addOptions.filter(c => c.group !== 'contodo').forEach(c => {
      const group = c.group || 'default';
      if (!groups[group]) groups[group] = { options: [] };
      if (c.groupLabel) groups[group].label = c.groupLabel;
      groups[group].options.push(c);
    });
    return groups;
  })();

  const addOnCost = customizations?.filter(c => c.type === 'add' && c.price).reduce((sum, c) => sum + (c.price || 0), 0) || 0;
  const itemTotalPrice = (item.price + addOnCost) * quantity;

  // Get select groups from item customizations
  const selectGroups = (() => {
    const groups: Record<string, { label?: { en: string; es: string }; options: import('@/types/menu').ItemCustomization[] }> = {};
    item.customizations?.filter(c => c.type === 'select').forEach(c => {
      const group = c.group || 'default';
      if (!groups[group]) groups[group] = { options: [] };
      if (c.groupLabel) groups[group].label = c.groupLabel;
      groups[group].options.push(c);
    });
    return groups;
  })();

  // Format customizations text
  const getCustomizationsText = () => {
    if (!customizations || customizations.length === 0) return null;
    return customizations.map((c) => {
      const option = item.customizations?.find(opt => opt.id === c.id);
      if (!option) return null;
      return option.name[locale];
    }).filter(Boolean).join(', ');
  };

  const customizationsText = getCustomizationsText();

  return (
    <div className="bg-negro-light rounded-xl p-5 border border-gray-700/80 shadow-lg">
      {/* Main content row */}
      <div className="flex gap-4">
        {/* Checkbox */}
        <button
          onClick={handleCheckboxToggle}
          className="shrink-0 self-center"
          aria-label={isSelected ? t('remove') : t('addBack')}
        >
          <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
            isSelected
              ? 'bg-verde border-verde shadow-sm shadow-verde/30'
              : 'border-gray-500 hover:border-rojo'
          }`}>
            {isSelected && <Check className="w-4 h-4 text-white" />}
          </div>
        </button>

        {/* Image */}
        <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-800 shadow-md">
          {item.image && !imgError ? (
            <Image
              src={item.image}
              alt={item.name[locale]}
              fill
              className="object-cover"
              sizes="64px"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl">🌮</span>
            </div>
          )}
        </div>

        {/* Item details */}
        <div className="flex-1 min-w-0">
          {/* Name and price row */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-white text-base font-semibold leading-tight">
                {item.name[locale]}
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                {formatPrice(item.price)} each
              </p>
            </div>

            {/* Price column */}
            <div className="text-right shrink-0">
              <span className="font-display text-amarillo text-xl font-bold">
                {formatPrice(itemTotalPrice)}
              </span>
              {addOnCost > 0 && (
                <p className="text-xs text-gray-400 mt-0.5">
                  +{formatPrice(addOnCost * quantity)} {tCustom('extras')}
                </p>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Customizations text - full width below main content */}
      {customizationsText && (
        <p className="text-sm text-gray-500 mt-3 leading-relaxed">
          {customizationsText}
        </p>
      )}

      {/* Quantity, Edit customizations, and Delete - full width row */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700/50">
        {/* Quantity controls */}
        <div className="flex items-center bg-negro rounded-lg border border-gray-600">
          <button
            onClick={() => updateCartItemQuantity(cartItemId, quantity - 1)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-l-lg transition-colors"
            aria-label="Decrease quantity"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="px-4 text-base font-semibold text-white min-w-10 text-center">
            {quantity}
          </span>
          <button
            onClick={() => updateCartItemQuantity(cartItemId, quantity + 1)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-r-lg transition-colors"
            aria-label="Increase quantity"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Action buttons - grouped on right */}
        <div className="flex items-center gap-2">
          {/* Edit customizations button */}
          {hasCustomizations && (
            <button
              ref={editButtonRef}
              onClick={() => setShowCustomizations(!showCustomizations)}
              className={`flex items-center gap-1.5 px-2 py-1.5 text-sm rounded-lg transition-colors ${
                showCustomizations
                  ? 'text-amarillo bg-amarillo/15'
                  : 'text-gray-400 hover:text-amarillo hover:bg-amarillo/10'
              }`}
              title={t('editCustomizations')}
            >
              <Pencil className="w-4 h-4" />
              <span className="hidden sm:inline">{t('editCustomizations')}</span>
              {customizations && customizations.length > 0 && (
                <span className={`font-medium ${showCustomizations ? 'text-amarillo' : 'text-amarillo'}`}>({customizations.length})</span>
              )}
            </button>
          )}

          {/* Notes button (if enabled) */}
          {showNotesEditor && (
            <button
              onClick={() => setShowNotes(!showNotes)}
              className={`flex items-center gap-1.5 px-2 py-1.5 text-sm rounded-lg transition-colors ${
                showNotes
                  ? 'text-amarillo bg-amarillo/15'
                  : 'text-gray-400 hover:text-amarillo hover:bg-amarillo/10'
              }`}
              title={notes ? t('editNotes') : t('addNotes')}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">{notes ? t('editNotes') : t('addNotes')}</span>
            </button>
          )}

          {/* Delete button */}
          <button
            onClick={() => removeCartItem(cartItemId)}
            className="p-2 text-gray-400 hover:text-rojo hover:bg-rojo/10 rounded-lg transition-colors"
            aria-label={t('remove')}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Display existing notes */}
      {!showNotes && notes && (
        <p className="mt-3 text-sm text-gray-400 italic pl-1 border-l-2 border-amarillo/30">
          &quot;{notes}&quot;
        </p>
      )}

      {/* Customizations editor panel */}
      {showCustomizations && hasCustomizations && (
        <div ref={customizationsRef} className="mt-3 pt-3 border-t border-t-gray-700/50 space-y-3">
          {/* Select groups (meat/flavor choices) */}
          {Object.entries(selectGroups).map(([groupName, group]) => (
            <div key={groupName}>
              <p className="text-xs text-gray-600 mb-2">
                {group.label ? group.label[locale] : groupName}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {group.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleSelectOption(option.id, groupName)}
                    className={`px-2.5 py-1 text-xs rounded border transition-all ${
                      isCustomizationSelected(option.id)
                        ? 'bg-amarillo/20 border-amarillo/50 text-amarillo'
                        : 'border-gray-600 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    {isCustomizationSelected(option.id) && <span className="mr-1">●</span>}
                    {option.name[locale]}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {removeOptions.length > 0 && (
            <div>
              <p className="text-xs text-gray-600 mb-2">{tCustom('removeIngredients')}</p>
              <div className="flex flex-wrap gap-1.5">
                {conTodoOption && (
                  <button
                    onClick={() => handleCustomizationToggle('con-todo', 'add', 0)}
                    className={`px-2.5 py-1 text-xs rounded border transition-all font-semibold ${
                      isCustomizationSelected('con-todo')
                        ? 'bg-amarillo/20 border-amarillo/50 text-amarillo'
                        : 'border-gray-600 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    {isCustomizationSelected('con-todo') && <span className="mr-1">&bull;</span>}
                    Con Todo
                  </button>
                )}
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
                    {isCustomizationSelected(option.id) && <span className="mr-1">&times;</span>}
                    {option.name[locale]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {Object.entries(addGroups).map(([groupName, group]) => (
            <div key={groupName}>
              <p className="text-xs text-gray-600 mb-2">
                {group.label ? group.label[locale] : tCustom('addExtras')}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {group.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleCustomizationToggle(option.id, 'add', option.price)}
                    className={`px-2.5 py-1 text-xs rounded border transition-all ${
                      isCustomizationSelected(option.id)
                        ? 'bg-verde/20 border-verde/50 text-verde'
                        : 'border-gray-600 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    {isCustomizationSelected(option.id) && <span className="mr-1">&check;</span>}
                    {option.name[locale]}
                    {option.price ? <span className="ml-1 text-amarillo">+{formatPrice(option.price)}</span> : null}
                  </button>
                ))}
              </div>
            </div>
          ))}
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
