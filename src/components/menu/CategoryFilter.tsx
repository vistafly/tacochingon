'use client';

import { useLocale, useTranslations } from 'next-intl';
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

  return (
    <div className="flex flex-wrap gap-2">
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
  );
}
