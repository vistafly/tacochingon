'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MenuItem, CartItem } from '@/types';
import { SelectedCustomization } from '@/types/cart';
import { TAX_RATE } from '@/lib/constants';
import { mockMenuItems } from '@/data/mock-menu';

// Generate unique ID for cart items
const generateCartItemId = () => `cart-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  orderNotes: string;

  // Actions
  addItem: (item: MenuItem, notes?: string) => void;
  addItemWithCustomizations: (
    item: MenuItem,
    customizations: SelectedCustomization[],
    quantity: number
  ) => void;
  removeCartItem: (cartItemId: string) => void;
  updateCartItemQuantity: (cartItemId: string, quantity: number) => void;
  updateCartItemNotes: (cartItemId: string, notes: string) => void;
  updateCartItemCustomizations: (cartItemId: string, customizations: SelectedCustomization[]) => void;
  setOrderNotes: (notes: string) => void;
  isItemInCart: (itemId: string) => boolean;
  getItemQuantity: (itemId: string) => number;
  getItemCustomizations: (itemId: string) => SelectedCustomization[] | undefined;
  getFirstCartEntryForItem: (itemId: string) => CartItem | undefined;
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
      orderNotes: '',

      addItem: (item: MenuItem, notes?: string) => {
        set((state) => {
          // Find existing item with no customizations
          const existingItem = state.items.find(
            (i) => i.item.id === item.id && (!i.customizations || i.customizations.length === 0)
          );

          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.cartItemId === existingItem.cartItemId
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            };
          }

          return {
            items: [...state.items, { cartItemId: generateCartItemId(), item, quantity: 1, notes: notes || '' }],
          };
        });
      },

      addItemWithCustomizations: (
        item: MenuItem,
        customizations: SelectedCustomization[],
        quantity: number
      ) => {
        set((state) => {
          // Create a unique key based on item id and sorted customization ids
          const customizationKey = customizations
            .map((c) => c.id)
            .sort()
            .join(',');

          // Find existing item with same customizations
          const existingItemIndex = state.items.findIndex((i) => {
            if (i.item.id !== item.id) return false;
            const existingKey = (i.customizations || [])
              .map((c) => c.id)
              .sort()
              .join(',');
            return existingKey === customizationKey;
          });

          if (existingItemIndex !== -1) {
            // If item with same customizations exists, add to quantity
            return {
              items: state.items.map((i, index) =>
                index === existingItemIndex
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            };
          }

          // Add as new entry (different customizations or new item)
          return {
            items: [...state.items, { cartItemId: generateCartItemId(), item, quantity, customizations, notes: '' }],
          };
        });
      },

      removeCartItem: (cartItemId: string) => {
        set((state) => ({
          items: state.items.filter((i) => i.cartItemId !== cartItemId),
        }));
      },

      updateCartItemQuantity: (cartItemId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeCartItem(cartItemId);
          return;
        }

        set((state) => ({
          items: state.items.map((i) =>
            i.cartItemId === cartItemId ? { ...i, quantity } : i
          ),
        }));
      },

      updateCartItemNotes: (cartItemId: string, notes: string) => {
        const trimmedNotes = notes.slice(0, 100); // Limit to 100 chars
        set((state) => ({
          items: state.items.map((i) =>
            i.cartItemId === cartItemId ? { ...i, notes: trimmedNotes } : i
          ),
        }));
      },

      updateCartItemCustomizations: (cartItemId: string, customizations: SelectedCustomization[]) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.cartItemId === cartItemId ? { ...i, customizations } : i
          ),
        }));
      },

      setOrderNotes: (notes: string) => {
        set({ orderNotes: notes });
      },

      isItemInCart: (itemId: string) => {
        return get().items.some((i) => i.item.id === itemId);
      },

      getItemQuantity: (itemId: string) => {
        // Sum quantity across all entries with same item id
        return get().items
          .filter((i) => i.item.id === itemId)
          .reduce((sum, i) => sum + i.quantity, 0);
      },

      getItemCustomizations: (itemId: string) => {
        const item = get().items.find((i) => i.item.id === itemId);
        return item?.customizations;
      },

      getFirstCartEntryForItem: (itemId: string) => {
        return get().items.find((i) => i.item.id === itemId);
      },

      clearCart: () => {
        set({ items: [], orderNotes: '' });
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
        return get().items.reduce((total, cartItem) => {
          // Base price
          let itemPrice = cartItem.item.price;

          // Add customization prices (for add-ons)
          if (cartItem.customizations) {
            const addOnCost = cartItem.customizations
              .filter((c) => c.type === 'add' && c.price)
              .reduce((sum, c) => sum + (c.price || 0), 0);
            itemPrice += addOnCost;
          }

          return total + itemPrice * cartItem.quantity;
        }, 0);
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
      partialize: (state) => ({ items: state.items, orderNotes: state.orderNotes }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<CartState>;
        const menuMap = new Map(mockMenuItems.map(i => [i.id, i]));
        // Remove stale items and refresh item data (image, price, name) from current menu
        const freshItems = (persisted.items || [])
          .filter(cartItem => menuMap.has(cartItem.item.id))
          .map(cartItem => ({
            ...cartItem,
            item: menuMap.get(cartItem.item.id)!,
          }));
        return {
          ...currentState,
          ...persisted,
          items: freshItems,
        };
      },
    }
  )
);
