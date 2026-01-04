'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MenuItem, CartItem } from '@/types';
import { TAX_RATE } from '@/lib/constants';

interface CartState {
  items: CartItem[];
  isOpen: boolean;

  // Actions
  addItem: (item: MenuItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;

  // Computed values (as functions for reactivity)
  getItemCount: () => number;
  getSubtotal: () => number;
  getTax: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item: MenuItem) => {
        set((state) => {
          const existingItem = state.items.find((i) => i.item.id === item.id);

          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.item.id === item.id
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            };
          }

          return {
            items: [...state.items, { item, quantity: 1 }],
          };
        });
      },

      removeItem: (itemId: string) => {
        set((state) => ({
          items: state.items.filter((i) => i.item.id !== itemId),
        }));
      },

      updateQuantity: (itemId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }

        set((state) => ({
          items: state.items.map((i) =>
            i.item.id === itemId ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      toggleCart: () => {
        set((state) => ({ isOpen: !state.isOpen }));
      },

      openCart: () => {
        set({ isOpen: true });
      },

      closeCart: () => {
        set({ isOpen: false });
      },

      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce(
          (total, item) => total + item.item.price * item.quantity,
          0
        );
      },

      getTax: () => {
        return get().getSubtotal() * TAX_RATE;
      },

      getTotal: () => {
        return get().getSubtotal() + get().getTax();
      },
    }),
    {
      name: 'el-taco-chingon-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
