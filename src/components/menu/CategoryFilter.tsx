'use client';

import { useState, useRef, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ChevronDown } from 'lucide-react';
import { Category, type Locale } from '@/types';
import { cn } from '@/lib/utils';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  const t = useTranslations('menu');
  const locale = useLocale() as Locale;
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedLabel = selectedCategory
    ? categories.find((c) => c.id === selectedCategory)?.name[locale]
    : t('allCategories');

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (categoryId: string | null) => {
    onSelectCategory(categoryId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile: Custom Dropdown */}
      <div className="md:hidden relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between bg-negro-light text-white border border-gray-600 rounded px-4 py-3 font-display text-sm focus:border-amarillo focus:outline-none"
        >
          <span>{selectedLabel}</span>
          <ChevronDown className={cn('w-5 h-5 text-gray-400 transition-transform', isOpen && 'rotate-180')} />
        </button>

        {isOpen && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-negro-light border border-gray-600 rounded shadow-lg max-h-64 overflow-y-auto">
            <button
              onClick={() => handleSelect(null)}
              className={cn(
                'w-full px-4 py-3 text-center font-display text-sm transition-colors',
                selectedCategory === null
                  ? 'bg-amarillo text-negro'
                  : 'text-white hover:bg-gray-700'
              )}
            >
              {t('allCategories')}
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleSelect(category.id)}
                className={cn(
                  'w-full px-4 py-3 text-center font-display text-sm transition-colors',
                  selectedCategory === category.id
                    ? 'bg-amarillo text-negro'
                    : 'text-white hover:bg-gray-700'
                )}
              >
                {category.name[locale]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Desktop: Pills */}
      <div className="hidden md:flex flex-wrap gap-2">
        <button
          onClick={() => onSelectCategory(null)}
          className={cn(
            'px-4 py-2 rounded font-display text-sm transition-all duration-200',
            selectedCategory === null
              ? 'bg-amarillo text-negro'
              : 'bg-negro-light text-white border border-gray-600 hover:border-amarillo hover:text-amarillo'
          )}
        >
          {t('allCategories')}
        </button>

        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={cn(
              'px-4 py-2 rounded font-display text-sm transition-all duration-200',
              selectedCategory === category.id
                ? 'bg-amarillo text-negro'
                : 'bg-negro-light text-white border border-gray-600 hover:border-amarillo hover:text-amarillo'
            )}
          >
            {category.name[locale]}
          </button>
        ))}
      </div>
    </>
  );
}
