'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { MenuItem as MenuItemType, Category } from '@/types';
import { MenuItem } from './MenuItem';
import { CategoryFilter } from './CategoryFilter';

interface MenuGridProps {
  items: MenuItemType[];
  categories: Category[];
  showFilter?: boolean;
}

export function MenuGrid({ items, categories, showFilter = true }: MenuGridProps) {
  const t = useTranslations('menu');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    if (!selectedCategory) return items;
    return items.filter((item) => item.categoryId === selectedCategory);
  }, [items, selectedCategory]);

  return (
    <div className="space-y-6">
      {showFilter && (
        <div className="mb-8">
          <p className="text-sm text-gray-400 mb-3">{t('filterBy')}</p>
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map((item) => (
          <MenuItem key={item.id} item={item} />
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">No items found in this category.</p>
        </div>
      )}
    </div>
  );
}
