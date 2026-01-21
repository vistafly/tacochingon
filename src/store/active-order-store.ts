'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ActiveOrder {
  paymentIntentId: string;
  orderNumber?: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  createdAt: string;
  pickupTime?: string;
  total?: number;
}

interface ActiveOrderState {
  activeOrder: ActiveOrder | null;

  // Actions
  setActiveOrder: (order: ActiveOrder) => void;
  updateOrderStatus: (status: ActiveOrder['status'], orderNumber?: number) => void;
  clearActiveOrder: () => void;
  hasActiveOrder: () => boolean;
}

export const useActiveOrderStore = create<ActiveOrderState>()(
  persist(
    (set, get) => ({
      activeOrder: null,

      setActiveOrder: (order) => set({ activeOrder: order }),

      updateOrderStatus: (status, orderNumber) => {
        const current = get().activeOrder;
        if (current) {
          set({
            activeOrder: {
              ...current,
              status,
              orderNumber: orderNumber ?? current.orderNumber,
            },
          });
        }
      },

      clearActiveOrder: () => set({ activeOrder: null }),

      hasActiveOrder: () => {
        const order = get().activeOrder;
        if (!order) return false;

        // Clear if order is completed, cancelled, or older than 24 hours
        const orderAge = Date.now() - new Date(order.createdAt).getTime();
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours

        if (order.status === 'completed' || order.status === 'cancelled' || orderAge > maxAge) {
          set({ activeOrder: null });
          return false;
        }

        return true;
      },
    }),
    {
      name: 'el-taco-chingon-active-order',
    }
  )
);
