'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { Package, X, ChefHat, Clock } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useActiveOrderStore } from '@/store/active-order-store';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Order } from '@/types/order';

const statusIcons = {
  pending: Clock,
  preparing: ChefHat,
  ready: Package,
  completed: Package,
  cancelled: X,
};

const statusColors = {
  pending: 'bg-amarillo/90',
  preparing: 'bg-orange-500/90',
  ready: 'bg-verde/90',
  completed: 'bg-gray-600/90',
  cancelled: 'bg-rojo/90',
};

export function ActiveOrderBanner() {
  const t = useTranslations('order');
  const pathname = usePathname();
  const { activeOrder, hasActiveOrder, updateOrderStatus, clearActiveOrder } = useActiveOrderStore();
  const [isVisible, setIsVisible] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Check if we're on an order page
  const isOrderPage = pathname?.includes('/order/');

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Subscribe to real-time order updates via Firestore
  useEffect(() => {
    if (!isHydrated || !activeOrder?.paymentIntentId || isOrderPage) return;

    const ordersQuery = query(
      collection(db, 'orders'),
      where('stripe_payment_intent_id', '==', activeOrder.paymentIntentId)
    );

    const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
      if (snapshot.empty) return;
      const updatedOrder = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Order;
      if (updatedOrder.status === 'completed' || updatedOrder.status === 'cancelled') {
        clearActiveOrder();
      } else {
        updateOrderStatus(
          updatedOrder.status as 'pending' | 'preparing' | 'ready',
          updatedOrder.order_number
        );
      }
    });

    return () => unsubscribe();
  }, [isHydrated, activeOrder?.paymentIntentId, isOrderPage, updateOrderStatus, clearActiveOrder]);

  useEffect(() => {
    // Only check after hydration to avoid SSR mismatch
    if (!isHydrated) return;

    // Check if there's an active order
    if (hasActiveOrder() && !isOrderPage) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [activeOrder, hasActiveOrder, isOrderPage, isHydrated]);

  // Don't render on order pages
  if (isOrderPage) {
    return null;
  }

  if (!isVisible || !activeOrder) {
    return null;
  }

  const StatusIcon = statusIcons[activeOrder.status] || Package;
  const bgColor = statusColors[activeOrder.status] || statusColors.pending;

  const getStatusText = () => {
    switch (activeOrder.status) {
      case 'pending':
        return t('pending');
      case 'preparing':
        return t('preparing');
      case 'ready':
        return t('ready');
      default:
        return t('pending');
    }
  };

  return (
    <div className={`${bgColor} text-white shadow-lg`}>
      <Link href={`/order/${activeOrder.paymentIntentId}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <StatusIcon className="w-5 h-5" />
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {activeOrder.orderNumber ? t('orderNumber', { number: activeOrder.orderNumber }) : t('yourOrder')}
                </span>
                <span className="text-white/80">-</span>
                <span className="text-white/90">{getStatusText()}</span>
              </div>
            </div>
            <span className="text-sm text-white/80">
              {t('tapToView')}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
