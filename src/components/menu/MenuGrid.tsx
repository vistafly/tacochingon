'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { MenuItem as MenuItemType, Category } from '@/types';
import { MenuItem } from './MenuItem';
import { CategoryFilter } from './CategoryFilter';
import { MenuCarousel } from './MenuCarousel';
import { CategoryCarouselSection } from './CategoryCarouselSection';

interface MenuGridProps {
  items: MenuItemType[];
  categories: Category[];
  showFilter?: boolean;
  initialItemId?: string;
}

export function MenuGrid({ items, categories, showFilter = true, initialItemId }: MenuGridProps) {
  const t = useTranslations('menu');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isCarouselView, setIsCarouselView] = useState(false);
  const [openModalItemId, setOpenModalItemId] = useState<string | null>(initialItemId || null);

  useEffect(() => {
    const checkWidth = () => setIsCarouselView(window.innerWidth < 1024);
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  // Clear the URL param after modal closes (to prevent re-opening on refresh)
  const handleModalClose = (itemId: string) => {
    if (openModalItemId === itemId) {
      setOpenModalItemId(null);
      // Clear the URL param
      window.history.replaceState({}, '', window.location.pathname);
    }
  };

  const filteredItems = useMemo(() => {
    if (!selectedCategory) return items;
    return items.filter((item) => item.categoryId === selectedCategory);
  }, [items, selectedCategory]);

  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => a.sortOrder - b.sortOrder);
  }, [categories]);

  const itemsByCategory = useMemo(() => {
    const grouped = new Map<string, MenuItemType[]>();
    categories.forEach((cat) => {
      const categoryItems = items.filter((item) => item.categoryId === cat.id);
      if (categoryItems.length > 0) {
        grouped.set(cat.id, categoryItems);
      }
    });
    return grouped;
  }, [items, categories]);

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

      {isCarouselView ? (
        selectedCategory === null ? (
          <div className="space-y-2">
            {sortedCategories.map((category) => {
              const categoryItems = itemsByCategory.get(category.id) || [];
              return (
                <CategoryCarouselSection
                  key={category.id}
                  category={category}
                  items={categoryItems}
                  openModalItemId={openModalItemId}
                  onModalClose={handleModalClose}
                />
              );
            })}
          </div>
        ) : (
          <MenuCarousel items={filteredItems} openModalItemId={openModalItemId} onModalClose={handleModalClose} />
        )
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <MenuItem
              key={item.id}
              item={item}
              forceModalOpen={openModalItemId === item.id}
              onModalClose={() => handleModalClose(item.id)}
            />
          ))}
        </div>
      )}

      {filteredItems.length === 0 && !isCarouselView && (
        <div className="text-center py-12">
          <p className="text-gray-400">No items found in this category.</p>
        </div>
      )}
    </div>
  );
}
