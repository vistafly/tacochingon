'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { X, Plus, Minus, Check } from 'lucide-react';
import { MenuItem as MenuItemType, ItemCustomization, type Locale } from '@/types';
import { SelectedCustomization } from '@/types/cart';
import { formatPrice } from '@/lib/utils';

interface ItemCustomizationModalProps {
  item: MenuItemType;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (customizations: SelectedCustomization[], quantity: number) => void;
  initialCustomizations?: SelectedCustomization[];
}

export function ItemCustomizationModal({
  item,
  isOpen,
  onClose,
  onAddToCart,
  initialCustomizations = [],
}: ItemCustomizationModalProps) {
  const t = useTranslations('customization');
  const tCommon = useTranslations('common');
  const locale = useLocale() as Locale;

  const [quantity, setQuantity] = useState(1);
  const [selectedCustomizations, setSelectedCustomizations] = useState<SelectedCustomization[]>([]);

  // Get select groups from customizations
  const selectGroups = (() => {
    const groups: Record<string, { label?: { en: string; es: string }; options: ItemCustomization[] }> = {};
    item.customizations?.filter(c => c.type === 'select').forEach(c => {
      const group = c.group || 'default';
      if (!groups[group]) groups[group] = { options: [] };
      if (c.groupLabel) groups[group].label = c.groupLabel;
      groups[group].options.push(c);
    });
    return groups;
  })();

  // Reset state when modal opens with new item, pre-fill with initial customizations
  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      if (initialCustomizations.length > 0) {
        setSelectedCustomizations(initialCustomizations);
      } else {
        // Pre-select first option of each select group
        const defaults: SelectedCustomization[] = [];
        Object.entries(selectGroups).forEach(([groupName, group]) => {
          if (group.options.length > 0) {
            defaults.push({ id: group.options[0].id, type: 'select', group: groupName });
          }
        });
        setSelectedCustomizations(defaults);
      }
    }
  }, [isOpen, item.id]);

  // Lock body scroll when modal is open
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

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const removeOptions = item.customizations?.filter((c) => c.type === 'remove') || [];
  const addOptions = item.customizations?.filter((c) => c.type === 'add') || [];
  const hasMeatOnly = removeOptions.some((c) => c.id === 'meat-only');
  const isMeatOnlySelected = selectedCustomizations.some((c) => c.id === 'meat-only');

  const handleToggleCustomization = (customization: ItemCustomization) => {
    setSelectedCustomizations((prev) => {
      // Special handling for "Meat Only" toggle
      if (customization.id === 'meat-only') {
        const wasSelected = prev.some((c) => c.id === 'meat-only');
        if (wasSelected) {
          // Turning OFF: remove meat-only and all other remove options
          const removeIds = new Set(removeOptions.map((r) => r.id));
          return prev.filter((c) => !removeIds.has(c.id));
        } else {
          // Turning ON: add meat-only and all other remove options
          const existingNonRemove = prev.filter((c) => c.type !== 'remove');
          const allRemoveSelections = removeOptions.map((r) => ({
            id: r.id,
            type: 'remove' as const,
          }));
          return [...existingNonRemove, ...allRemoveSelections];
        }
      }

      const exists = prev.find((c) => c.id === customization.id);
      if (exists) {
        return prev.filter((c) => c.id !== customization.id);
      }
      return [
        ...prev,
        {
          id: customization.id,
          type: customization.type,
          price: customization.price,
        },
      ];
    });
  };

  const handleSelectOption = (customization: ItemCustomization) => {
    const group = customization.group || 'default';
    setSelectedCustomizations((prev) => {
      // Remove any existing selection from this group, then add the new one
      const filtered = prev.filter((c) => c.group !== group);
      return [...filtered, { id: customization.id, type: 'select' as const, group }];
    });
  };

  const isCustomizationSelected = (id: string) => {
    return selectedCustomizations.some((c) => c.id === id);
  };

  // Calculate additional cost from add-ons
  const additionalCost = selectedCustomizations
    .filter((c) => c.type === 'add' && c.price)
    .reduce((sum, c) => sum + (c.price || 0), 0);

  const itemTotal = (item.price + additionalCost) * quantity;

  const handleAddToCart = () => {
    onAddToCart(selectedCustomizations, quantity);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-negro/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-negro-light border border-gray-700 rounded-xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[calc(100dvh-2rem)]">
        {/* Header with image */}
        <div className="relative h-36 bg-gray-800 shrink-0">
          {item.image && !item.image.includes('placeholder') ? (
            <Image
              src={item.image}
              alt={item.name[locale]}
              fill
              className="object-cover"
              sizes="(max-width: 512px) 100vw, 512px"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl">🌮</span>
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-t from-negro-light to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-negro/60 rounded-full text-white hover:bg-negro transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Item name overlay */}
          <div className="absolute bottom-3 left-3 right-3">
            <h2 className="font-display text-xl text-white">
              {item.name[locale]}
            </h2>
            <p className="text-amarillo font-display text-lg">
              {formatPrice(item.price)}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Description */}
          <div className="px-3 py-2 border-b border-gray-700">
            <p className="text-gray-300 text-xs">{item.description[locale]}</p>
          </div>

          {/* Select groups (meat/flavor choices) */}
          {Object.entries(selectGroups).map(([groupName, group]) => (
            <div key={groupName} className="px-3 py-2 border-b border-gray-700">
              <h3 className="font-display text-white text-sm mb-2">
                {group.label ? group.label[locale] : groupName}
              </h3>
              <div className="grid grid-cols-2 gap-1.5">
                {group.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleSelectOption(option)}
                    className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
                      isCustomizationSelected(option.id)
                        ? 'border-amarillo bg-amarillo/10 text-amarillo'
                        : 'border-gray-600 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <span className="text-xs">{option.name[locale]}</span>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        isCustomizationSelected(option.id)
                          ? 'bg-amarillo border-amarillo'
                          : 'border-gray-500'
                      }`}
                    >
                      {isCustomizationSelected(option.id) && (
                        <div className="w-2 h-2 rounded-full bg-negro" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Remove options */}
          {removeOptions.length > 0 && (
            <div className="px-3 py-2 border-b border-gray-700">
              <h3 className="font-display text-white text-sm mb-2">{t('removeIngredients')}</h3>
              <div className="grid grid-cols-2 gap-1.5">
                {removeOptions.map((option) => {
                  const isMeatOnlyBtn = option.id === 'meat-only';
                  const forcedByMeatOnly = !isMeatOnlyBtn && isMeatOnlySelected;
                  return (
                    <button
                      key={option.id}
                      onClick={() => !forcedByMeatOnly && handleToggleCustomization(option)}
                      className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
                        isMeatOnlyBtn && isMeatOnlySelected
                          ? 'border-rojo bg-rojo/20 text-rojo ring-1 ring-rojo/30'
                          : isCustomizationSelected(option.id)
                            ? 'border-rojo bg-rojo/10 text-rojo'
                            : 'border-gray-600 text-gray-300 hover:border-gray-500'
                      } ${forcedByMeatOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span className={`text-xs ${forcedByMeatOnly ? 'line-through' : ''}`}>
                        {option.name[locale]}
                      </span>
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          isCustomizationSelected(option.id)
                            ? 'bg-rojo border-rojo'
                            : 'border-gray-500'
                        }`}
                      >
                        {isCustomizationSelected(option.id) && (
                          <X className="w-2.5 h-2.5 text-white" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add options */}
          {addOptions.length > 0 && (
            <div className="px-3 py-2 border-b border-gray-700">
              <h3 className="font-display text-white text-sm mb-2">{t('addExtras')}</h3>
              <div className="grid grid-cols-2 gap-1.5">
                {addOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleToggleCustomization(option)}
                    className={`flex items-start justify-between p-2 rounded-lg border transition-all ${
                      isCustomizationSelected(option.id)
                        ? 'border-verde bg-verde/10 text-verde'
                        : 'border-gray-600 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex flex-col items-start">
                      <span className="text-xs">{option.name[locale]}</span>
                      {option.price && (
                        <span className="text-[10px] text-amarillo">
                          +{formatPrice(option.price)}
                        </span>
                      )}
                    </div>
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                        isCustomizationSelected(option.id)
                          ? 'bg-verde border-verde'
                          : 'border-gray-500'
                      }`}
                    >
                      {isCustomizationSelected(option.id) && (
                        <Check className="w-2.5 h-2.5 text-white" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No customizations message */}
          {!item.customizations?.length && (
            <div className="px-3 py-2 text-center text-gray-400">
              <p className="text-xs">{t('noCustomizations')}</p>
            </div>
          )}
        </div>

        {/* Footer with quantity and add to cart */}
        <div className="px-3 py-3 border-t border-gray-700 bg-negro-light shrink-0">
          <div className="flex items-center justify-between mb-3">
            {/* Quantity selector */}
            <div className="flex items-center border border-gray-600 rounded-lg">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-1.5 text-gray-400 hover:text-white transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-3 text-base font-medium text-white">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="p-1.5 text-gray-400 hover:text-white transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Total price */}
            <div className="text-right">
              <p className="text-xs text-gray-400">{t('total')}</p>
              <p className="font-display text-lg text-amarillo">
                {formatPrice(itemTotal)}
              </p>
            </div>
          </div>

          {/* Add to cart button */}
          <button
            onClick={handleAddToCart}
            className="w-full btn-order py-3 text-base"
          >
            {tCommon('addToCart')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
