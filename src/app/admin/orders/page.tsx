'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  RefreshCw,
  LogOut,
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
import { Order, OrderStatus } from '@/lib/supabase/types';
import { supabase } from '@/lib/supabase/client';
import { formatPrice } from '@/lib/utils';
import { useNewOrderSound } from '@/hooks/useNewOrderSound';

const statusTabs: { status: OrderStatus | 'all'; label: string }[] = [
  { status: 'pending', label: 'New' },
  { status: 'preparing', label: 'Preparing' },
  { status: 'ready', label: 'Ready' },
  { status: 'completed', label: 'Completed' },
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
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<OrderStatus | 'all'>('pending');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
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

  // Initial fetch and auto-refresh
  useEffect(() => {
    fetchOrders();

    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchOrders, 30000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [fetchOrders, autoRefresh]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('admin-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchOrders]);

  // Update order status
  const updateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchOrders();
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(null);
        }
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  // Logout
  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    router.push('/admin/login');
  };

  // Filter orders by tab
  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'all') return true;
    return order.status === activeTab;
  });

  // Count orders per status
  const orderCounts = statusTabs.reduce(
    (acc, tab) => {
      acc[tab.status] = orders.filter((o) => o.status === tab.status).length;
      return acc;
    },
    {} as Record<string, number>
  );

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
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-display text-amarillo">
            El Taco Chingon - Orders
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleMute}
              className={`p-2 rounded-lg transition-colors ${
                isMuted ? 'bg-gray-700 text-gray-400' : 'bg-verde/20 text-verde'
              }`}
              title={isMuted ? 'Unmute notifications' : 'Mute notifications'}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`p-2 rounded-lg transition-colors ${
                autoRefresh ? 'bg-verde/20 text-verde' : 'bg-gray-700 text-gray-400'
              }`}
              title={autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
            >
              <RefreshCw className={`w-5 h-5 ${autoRefresh ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={fetchOrders}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              title="Refresh now"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 bg-rojo/20 hover:bg-rojo/30 text-rojo rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="max-w-7xl mx-auto px-4 pb-4 flex gap-2 overflow-x-auto">
          {statusTabs.map((tab) => (
            <button
              key={tab.status}
              onClick={() => setActiveTab(tab.status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.status
                  ? 'bg-amarillo text-negro'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {tab.label}
              {orderCounts[tab.status] > 0 && (
                <span
                  className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                    activeTab === tab.status
                      ? 'bg-negro text-amarillo'
                      : tab.status === 'pending'
                      ? 'bg-rojo text-white'
                      : 'bg-gray-600 text-white'
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
            <p className="text-gray-400">No orders in this category</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onStatusUpdate={updateStatus}
                onSelect={() => setSelectedOrder(order)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusUpdate={updateStatus}
        />
      )}
    </div>
  );
}

interface OrderCardProps {
  order: Order;
  onStatusUpdate: (orderId: string, status: OrderStatus) => void;
  onSelect: () => void;
}

function OrderCard({ order, onStatusUpdate, onSelect }: OrderCardProps) {
  const pickupTime = new Date(order.pickup_time).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const timeAgo = getTimeAgo(new Date(order.created_at));
  const next = nextStatus[order.status as OrderStatus];

  // Compact item display
  const itemsSummary = order.items
    .map((item) => {
      let text = `${item.quantity}x ${item.name.en}`;
      if (item.customizations && item.customizations.length > 0) {
        const mods = item.customizations
          .map((c) => (c.type === 'remove' ? `No ${c.name.en}` : `+${c.name.en}`))
          .join(', ');
        text += ` (${mods})`;
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
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <div>
          <p className="font-display text-lg text-white">#{order.order_number}</p>
          <p className="text-sm text-gray-400">{timeAgo}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            statusColors[order.status as OrderStatus]
          }`}
        >
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </span>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        {/* Customer */}
        <div className="flex items-center gap-2">
          <span className="text-white font-medium">{order.customer_name}</span>
          <a
            href={`tel:${order.customer_phone}`}
            className="text-verde hover:underline flex items-center gap-1 text-sm"
          >
            <Phone className="w-4 h-4" />
            {order.customer_phone}
          </a>
        </div>

        {/* Pickup Time */}
        <div className="flex items-center gap-2 text-amarillo">
          <Clock className="w-4 h-4" />
          <span className="text-sm">Pickup: {pickupTime}</span>
        </div>

        {/* Items Preview */}
        <div className="text-sm text-gray-300 space-y-1">
          {itemsSummary.map((item, i) => (
            <p key={i} className="truncate">
              {item}
            </p>
          ))}
          {order.items.length > 3 && (
            <p className="text-gray-500">+{order.items.length - 3} more items</p>
          )}
        </div>

        {/* Special Instructions */}
        {order.special_instructions && (
          <p className="text-sm text-rojo italic truncate">
            Note: {order.special_instructions}
          </p>
        )}

        {/* Total */}
        <p className="text-lg font-display text-amarillo">
          {formatPrice(order.total)}
        </p>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-700 flex gap-2">
        <button
          onClick={onSelect}
          className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
        >
          View Details
        </button>
        {next && (
          <button
            onClick={() => onStatusUpdate(order.stripe_payment_intent_id, next)}
            className="flex-1 px-4 py-2 bg-verde hover:bg-verde/90 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
          >
            {next === 'preparing' && <ChefHat className="w-4 h-4" />}
            {next === 'ready' && <Package className="w-4 h-4" />}
            {next === 'completed' && <CheckCircle className="w-4 h-4" />}
            {next.charAt(0).toUpperCase() + next.slice(1)}
          </button>
        )}
      </div>
    </div>
  );
}

interface OrderDetailsModalProps {
  order: Order;
  onClose: () => void;
  onStatusUpdate: (orderId: string, status: OrderStatus) => void;
}

function OrderDetailsModal({ order, onClose, onStatusUpdate }: OrderDetailsModalProps) {
  const pickupTime = new Date(order.pickup_time).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-negro-light rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <div>
            <p className="font-display text-2xl text-white">Order #{order.order_number}</p>
            <span
              className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                statusColors[order.status as OrderStatus]
              }`}
            >
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Customer Info */}
          <div>
            <h3 className="text-sm text-gray-400 mb-2">Customer</h3>
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
            <h3 className="text-sm text-gray-400 mb-2">Pickup Time</h3>
            <p className="text-amarillo font-medium flex items-center gap-2">
              <Clock className="w-5 h-5" />
              {pickupTime}
            </p>
          </div>

          {/* Items */}
          <div>
            <h3 className="text-sm text-gray-400 mb-2">Items</h3>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="bg-negro rounded-lg p-3">
                  <div className="flex justify-between">
                    <span className="text-white">
                      {item.quantity}x {item.name.en}
                    </span>
                    <span className="text-gray-300">{formatPrice(item.itemTotal)}</span>
                  </div>
                  {item.customizations && item.customizations.length > 0 && (
                    <p className="text-sm text-gray-400 mt-1">
                      {item.customizations
                        .map((c) => (c.type === 'remove' ? `No ${c.name.en}` : `+${c.name.en}`))
                        .join(', ')}
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
              <h3 className="text-sm text-gray-400 mb-2">Special Instructions</h3>
              <p className="text-rojo bg-rojo/10 rounded-lg p-3 italic">
                {order.special_instructions}
              </p>
            </div>
          )}

          {/* Totals */}
          <div className="border-t border-gray-700 pt-4">
            <div className="flex justify-between text-gray-400 mb-1">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-400 mb-2">
              <span>Tax</span>
              <span>{formatPrice(order.tax)}</span>
            </div>
            <div className="flex justify-between text-lg font-display">
              <span className="text-white">Total</span>
              <span className="text-amarillo">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Status Actions */}
        <div className="p-6 border-t border-gray-700 flex gap-2">
          {order.status !== 'completed' && order.status !== 'cancelled' && (
            <>
              {order.status === 'pending' && (
                <button
                  onClick={() => onStatusUpdate(order.stripe_payment_intent_id, 'preparing')}
                  className="flex-1 px-4 py-3 bg-orange-500 hover:bg-orange-600 rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  <ChefHat className="w-5 h-5" />
                  Start Preparing
                </button>
              )}
              {order.status === 'preparing' && (
                <button
                  onClick={() => onStatusUpdate(order.stripe_payment_intent_id, 'ready')}
                  className="flex-1 px-4 py-3 bg-verde hover:bg-verde/90 rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  <Package className="w-5 h-5" />
                  Mark Ready
                </button>
              )}
              {order.status === 'ready' && (
                <button
                  onClick={() => onStatusUpdate(order.stripe_payment_intent_id, 'completed')}
                  className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-500 rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Complete
                </button>
              )}
            </>
          )}
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  return date.toLocaleDateString();
}
