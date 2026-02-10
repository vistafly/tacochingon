'use client';

import { useState, useEffect, useCallback, useRef, useMemo, memo } from 'react';
import { useRouter } from 'next/navigation';
import {
  RefreshCw,
  Phone,
  Clock,
  ChefHat,
  Package,
  CheckCircle,
  Volume2,
  VolumeX,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Order, OrderStatus } from '@/types/order';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { formatPrice, formatCustomizations } from '@/lib/utils';
import { useNewOrderSound } from '@/hooks/useNewOrderSound';
import { AdminNav } from '@/components/admin/AdminNav';
import { useAdminLocale } from '@/components/admin/AdminLocaleProvider';

const statusTabKeys: { status: OrderStatus | 'all'; labelKey: string }[] = [
  { status: 'pending', labelKey: 'new' },
  { status: 'preparing', labelKey: 'preparing' },
  { status: 'ready', labelKey: 'ready' },
  { status: 'completed', labelKey: 'completed' },
];

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-amarillo text-negro',
  preparing: 'bg-orange-500 text-white',
  ready: 'bg-verde text-white',
  completed: 'bg-gray-600 text-white',
  cancelled: 'bg-rojo text-white',
};

const nextStatus: Record<OrderStatus, OrderStatus | null> = {
  pending: 'preparing',
  preparing: 'ready',
  ready: 'completed',
  completed: null,
  cancelled: null,
};

export default function AdminOrdersPage() {
  const router = useRouter();
  const t = useTranslations('admin');
  const { locale } = useAdminLocale();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<OrderStatus | 'all'>('pending');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const previousOrdersRef = useRef<string[]>([]);
  const { playSound, isMuted, toggleMute } = useNewOrderSound();

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const response = await fetch('/api/admin/auth');
      if (!response.ok) {
        router.push('/admin/login');
      }
    };
    checkAuth();
  }, [router]);

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/orders?date=today');
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/admin/login');
          return;
        }
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();

      // Check for new orders
      const currentOrderIds = data.orders.map((o: Order) => o.id);
      const newOrders = currentOrderIds.filter(
        (id: string) => !previousOrdersRef.current.includes(id)
      );

      if (newOrders.length > 0 && previousOrdersRef.current.length > 0) {
        playSound();
      }

      previousOrdersRef.current = currentOrderIds;
      setOrders(data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }, [router, playSound]);

  // Real-time subscription via Firestore onSnapshot — single source of truth
  // Also does initial fetch and acts as a fallback polling every 60s
  useEffect(() => {
    // Initial fetch
    fetchOrders();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const ordersQuery = query(
      collection(db, 'orders'),
      where('created_at', '>=', today.toISOString()),
      orderBy('created_at', 'desc')
    );

    const unsubscribe = onSnapshot(
      ordersQuery,
      () => {
        fetchOrders();
      },
      (error) => {
        console.error('Firestore snapshot error:', error);
      }
    );

    // Fallback polling at 60s in case Firestore connection drops
    const fallbackInterval = setInterval(fetchOrders, 60000);

    return () => {
      unsubscribe();
      clearInterval(fallbackInterval);
    };
  }, [fetchOrders]);

  // Update order status
  const updateStatus = useCallback(async (orderId: string, newStatus: OrderStatus) => {
    if (updatingOrderId) return; // Prevent double-tap
    setUpdatingOrderId(orderId);

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        await fetchOrders();
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(null);
        }
      }
    } catch (error) {
      console.error('Error updating order:', error);
    } finally {
      setUpdatingOrderId(null);
    }
  }, [updatingOrderId, fetchOrders, selectedOrder?.id]);

  // Logout
  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    router.push('/admin/login');
  };

  // Memoize filtered orders
  const filteredOrders = useMemo(() => {
    if (activeTab === 'all') return orders;
    return orders.filter((order) => order.status === activeTab);
  }, [orders, activeTab]);

  // Memoize order counts
  const orderCounts = useMemo(() => {
    return statusTabKeys.reduce(
      (acc, tab) => {
        acc[tab.status] = orders.filter((o) => o.status === tab.status).length;
        return acc;
      },
      {} as Record<string, number>
    );
  }, [orders]);

  if (loading) {
    return (
      <div className="min-h-screen bg-negro flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amarillo animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-negro">
      {/* Header */}
      <header className="bg-negro-light border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <h1 className="font-display text-amarillo text-lg sm:text-xl whitespace-nowrap">
            <span className="sm:hidden">{t('orders')}</span>
            <span className="hidden sm:inline">{t('pageOrders')}</span>
          </h1>
          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleMute}
              className={`p-2.5 rounded-lg transition-colors ${
                isMuted ? 'bg-gray-700 text-gray-400' : 'bg-verde/20 text-verde'
              }`}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <button
              onClick={fetchOrders}
              className="p-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <div className="w-px h-6 bg-gray-600 mx-0.5 hidden sm:block" />
            <AdminNav onLogout={handleLogout} />
          </div>
        </div>

        {/* Status Tabs */}
        <div className="max-w-7xl mx-auto px-4 pb-3 flex gap-2 sm:gap-3">
          {statusTabKeys.map((tab) => (
            <button
              key={tab.status}
              onClick={() => setActiveTab(tab.status)}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.status
                  ? 'bg-amarillo text-negro'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {t(tab.labelKey)}
              {orderCounts[tab.status] > 0 && (
                <span
                  className={`w-5 h-5 sm:w-5 sm:h-5 inline-flex items-center justify-center text-[10px] sm:text-[10px] font-bold rounded-full shrink-0 ${
                    tab.status === 'pending'
                      ? 'bg-rojo text-white'
                      : activeTab === tab.status
                      ? 'bg-negro text-amarillo'
                      : 'bg-gray-500 text-white'
                  }`}
                >
                  {orderCounts[tab.status]}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Orders Grid */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-20">
            <AlertCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">{t('noOrders')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                locale={locale}
                onStatusUpdate={updateStatus}
                onSelect={() => setSelectedOrder(order)}
                isUpdating={updatingOrderId === order.stripe_payment_intent_id}
              />
            ))}
          </div>
        )}
      </main>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          locale={locale}
          onClose={() => setSelectedOrder(null)}
          onStatusUpdate={updateStatus}
          isUpdating={updatingOrderId === selectedOrder.stripe_payment_intent_id}
        />
      )}
    </div>
  );
}

interface OrderCardProps {
  order: Order;
  locale: string;
  onStatusUpdate: (orderId: string, status: OrderStatus) => void;
  onSelect: () => void;
  isUpdating: boolean;
}

const OrderCard = memo(function OrderCard({ order, locale, onStatusUpdate, onSelect, isUpdating }: OrderCardProps) {
  const t = useTranslations('admin');
  const localeStr = locale === 'es' ? 'es-US' : 'en-US';

  const pickupTime = new Date(order.pickup_time).toLocaleTimeString(localeStr, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const timeAgo = getTimeAgo(new Date(order.created_at), t);
  const next = nextStatus[order.status as OrderStatus];

  const statusLabelMap: Record<OrderStatus, string> = {
    pending: t('new'),
    preparing: t('preparing'),
    ready: t('ready'),
    completed: t('completed'),
    cancelled: t('completed'),
  };

  const nextLabelMap: Record<string, string> = {
    preparing: t('startPreparing'),
    ready: t('markReady'),
    completed: t('complete'),
  };

  // Compact item display
  const lang = locale as 'en' | 'es';
  const itemsSummary = order.items
    .map((item) => {
      let text = `${item.quantity}x ${item.name[lang] || item.name.en}`;
      if (item.customizations && item.customizations.length > 0) {
        const mods = formatCustomizations(item.customizations, lang);
        if (mods) text += ` (${mods})`;
      }
      return text;
    })
    .slice(0, 3);

  return (
    <div
      className={`bg-negro-light rounded-lg border ${
        order.status === 'pending' ? 'border-amarillo' : 'border-gray-700'
      } overflow-hidden`}
    >
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-gray-700 flex items-center justify-between">
        <div>
          <p className="font-display text-sm sm:text-base text-white">#{order.order_number}</p>
          <p className="text-xs text-gray-400">{timeAgo}</p>
        </div>
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            statusColors[order.status as OrderStatus]
          }`}
        >
          {statusLabelMap[order.status as OrderStatus]}
        </span>
      </div>

      {/* Body */}
      <div className="px-3 py-2.5 space-y-1.5">
        {/* Customer */}
        <p className="text-white font-medium text-sm truncate">{order.customer_name}</p>

        {/* Pickup Time */}
        <div className="flex items-center gap-1 text-amarillo">
          <Clock className="w-3 h-3 shrink-0" />
          <span className="text-xs">{pickupTime}</span>
        </div>

        {/* Items Preview */}
        <div className="text-xs text-gray-300 space-y-0.5">
          {itemsSummary.map((item, i) => (
            <p key={i} className="truncate">
              {item}
            </p>
          ))}
          {order.items.length > 3 && (
            <p className="text-gray-500">{t('moreItems', { count: order.items.length - 3 })}</p>
          )}
        </div>

        {/* Special Instructions */}
        {order.special_instructions && (
          <p className="text-xs text-rojo italic truncate">
            {t('note')}: {order.special_instructions}
          </p>
        )}

        {/* Total */}
        <p className="text-sm font-display text-amarillo">
          {formatPrice(order.total)}
        </p>
      </div>

      {/* Actions */}
      <div className="px-3 py-2.5 border-t border-gray-700 flex flex-col sm:flex-row gap-1.5">
        <button
          onClick={onSelect}
          className="flex-1 px-3 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs transition-colors"
        >
          {t('viewDetails')}
        </button>
        {next && (
          <button
            onClick={() => onStatusUpdate(order.stripe_payment_intent_id, next)}
            disabled={isUpdating}
            className="flex-1 px-3 py-2.5 bg-verde hover:bg-verde/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1"
          >
            {isUpdating ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <>
                {next === 'preparing' && <ChefHat className="w-3 h-3" />}
                {next === 'ready' && <Package className="w-3 h-3" />}
                {next === 'completed' && <CheckCircle className="w-3 h-3" />}
              </>
            )}
            {nextLabelMap[next]}
          </button>
        )}
      </div>
    </div>
  );
});

interface OrderDetailsModalProps {
  order: Order;
  locale: string;
  onClose: () => void;
  onStatusUpdate: (orderId: string, status: OrderStatus) => void;
  isUpdating: boolean;
}

const OrderDetailsModal = memo(function OrderDetailsModal({ order, locale, onClose, onStatusUpdate, isUpdating }: OrderDetailsModalProps) {
  const t = useTranslations('admin');
  const localeStr = locale === 'es' ? 'es-US' : 'en-US';
  const lang = locale as 'en' | 'es';

  const pickupTime = new Date(order.pickup_time).toLocaleTimeString(localeStr, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const statusLabelMap: Record<OrderStatus, string> = {
    pending: t('new'),
    preparing: t('preparing'),
    ready: t('ready'),
    completed: t('completed'),
    cancelled: t('completed'),
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-negro-light rounded-t-xl sm:rounded-lg max-w-lg w-full max-h-[85vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-700 flex items-center justify-between sticky top-0 bg-negro-light z-10">
          <div>
            <p className="font-display text-xl sm:text-2xl text-white">{t('order')} #{order.order_number}</p>
            <span
              className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                statusColors[order.status as OrderStatus]
              }`}
            >
              {statusLabelMap[order.status as OrderStatus]}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-3xl p-2 -mr-2"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
          {/* Customer Info */}
          <div>
            <h3 className="text-sm text-gray-400 mb-2">{t('customer')}</h3>
            <p className="text-white font-medium">{order.customer_name}</p>
            <a
              href={`tel:${order.customer_phone}`}
              className="text-verde hover:underline flex items-center gap-1"
            >
              <Phone className="w-4 h-4" />
              {order.customer_phone}
            </a>
            <p className="text-gray-400 text-sm">{order.customer_email}</p>
          </div>

          {/* Pickup Time */}
          <div>
            <h3 className="text-sm text-gray-400 mb-2">{t('pickupTime')}</h3>
            <p className="text-amarillo font-medium flex items-center gap-2">
              <Clock className="w-5 h-5" />
              {pickupTime}
            </p>
          </div>

          {/* Items */}
          <div>
            <h3 className="text-sm text-gray-400 mb-2">{t('items')}</h3>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="bg-negro rounded-lg p-3">
                  <div className="flex justify-between">
                    <span className="text-white">
                      {item.quantity}x {item.name[lang] || item.name.en}
                    </span>
                    <span className="text-gray-300">{formatPrice(item.itemTotal)}</span>
                  </div>
                  {item.customizations && item.customizations.length > 0 && (
                    <p className="text-sm text-gray-400 mt-1">
                      {formatCustomizations(item.customizations, lang)}
                    </p>
                  )}
                  {item.itemNotes && (
                    <p className="text-sm text-amarillo italic mt-1">{item.itemNotes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Special Instructions */}
          {order.special_instructions && (
            <div>
              <h3 className="text-sm text-gray-400 mb-2">{t('specialInstructions')}</h3>
              <p className="text-rojo bg-rojo/10 rounded-lg p-3 italic">
                {order.special_instructions}
              </p>
            </div>
          )}

          {/* Totals */}
          <div className="border-t border-gray-700 pt-4">
            <div className="flex justify-between text-gray-400 mb-1">
              <span>{t('subtotal')}</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-400 mb-2">
              <span>{t('tax')}</span>
              <span>{formatPrice(order.tax)}</span>
            </div>
            <div className="flex justify-between text-lg font-display">
              <span className="text-white">{t('total')}</span>
              <span className="text-amarillo">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Status Actions */}
        <div className="p-4 sm:p-6 border-t border-gray-700 flex gap-2 sticky bottom-0 bg-negro-light">
          {order.status !== 'completed' && order.status !== 'cancelled' && (
            <>
              {order.status === 'pending' && (
                <button
                  onClick={() => onStatusUpdate(order.stripe_payment_intent_id, 'preparing')}
                  disabled={isUpdating}
                  className="flex-1 px-4 py-3.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <ChefHat className="w-5 h-5" />}
                  {t('startPreparing')}
                </button>
              )}
              {order.status === 'preparing' && (
                <button
                  onClick={() => onStatusUpdate(order.stripe_payment_intent_id, 'ready')}
                  disabled={isUpdating}
                  className="flex-1 px-4 py-3.5 bg-verde hover:bg-verde/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Package className="w-5 h-5" />}
                  {t('markReady')}
                </button>
              )}
              {order.status === 'ready' && (
                <button
                  onClick={() => onStatusUpdate(order.stripe_payment_intent_id, 'completed')}
                  disabled={isUpdating}
                  className="flex-1 px-4 py-3.5 bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                  {t('complete')}
                </button>
              )}
            </>
          )}
          <button
            onClick={onClose}
            className="px-6 py-3.5 bg-gray-700 hover:bg-gray-600 rounded-lg"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
});

function getTimeAgo(date: Date, t: ReturnType<typeof useTranslations>): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return t('justNow');
  if (diffMins < 60) return t('minutesAgo', { count: diffMins });

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return t('hoursAgo', { count: diffHours });

  return date.toLocaleDateString();
}
