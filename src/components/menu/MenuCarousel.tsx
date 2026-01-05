'use client';

import { MenuItem as MenuItemType } from '@/types';
import { MenuItem } from './MenuItem';

interface MenuCarouselProps {
  items: MenuItemType[];
  openModalItemId?: string | null;
  onModalClose?: (itemId: string) => void;
}

export function MenuCarousel({ items, openModalItemId, onModalClose }: MenuCarouselProps) {
  if (items.length === 0) return null;

  return (
    <div className="carousel-scroll flex gap-4 pb-4 px-[12.5vw] sm:px-[27.5vw]">
      {items.map((item) => (
        <div
          key={item.id}
          className="carousel-item-center w-[75vw] sm:w-[45vw]"
        >
          <MenuItem
            item={item}
            forceModalOpen={openModalItemId === item.id}
            onModalClose={() => onModalClose?.(item.id)}
          />
        </div>
      ))}
    </div>
  );
}
