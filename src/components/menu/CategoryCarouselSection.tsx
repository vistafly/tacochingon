'use client';

import { useLocale } from 'next-intl';
import { Category, MenuItem as MenuItemType, type Locale } from '@/types';
import { MenuCarousel } from './MenuCarousel';

interface CategoryCarouselSectionProps {
  category: Category;
  items: MenuItemType[];
  openModalItemId?: string | null;
  onModalClose?: (itemId: string) => void;
}

export function CategoryCarouselSection({
  category,
  items,
  openModalItemId,
  onModalClose,
}: CategoryCarouselSectionProps) {
  const locale = useLocale() as Locale;

  if (items.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="px-4 mb-4">
        <h3 className="font-display text-2xl text-white mb-2">
          {category.name[locale]}
        </h3>
        <div className="flex items-center gap-0 w-24 h-0.5">
          <div className="flex-1 h-full bg-verde" />
          <div className="flex-1 h-full bg-white" />
          <div className="flex-1 h-full bg-rojo" />
        </div>
      </div>

      <MenuCarousel items={items} openModalItemId={openModalItemId} onModalClose={onModalClose} />
    </section>
  );
}
