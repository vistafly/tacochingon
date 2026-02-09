'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import {
  CheckCircle,
  Clock,
  ChefHat,
  Package,
  Phone,
  RefreshCw,
  AlertCircle,
  Loader2,
  MapPin,
} from 'lucide-react';
import { useOrderSubscription } from '@/hooks/useOrderSubscription';
import { useActiveOrderStore } from '@/store/active-order-store';
import { useSettings } from '@/hooks/useSettings';
import { formatPrice, formatCustomizations } from '@/lib/utils';
import { OrderStatus } from '@/types/order';

const statusIcons: Record<OrderStatus, React.ReactNode> = {
  pending: <Clock className="w-6 h-6" />,
  preparing: <ChefHat className="w-6 h-6" />,
  ready: <Package className="w-6 h-6" />,
  completed: <CheckCircle className="w-6 h-6" />,
  cancelled: <AlertCircle className="w-6 h-6" />,
};

const statusColors: Record<OrderStatus, string> = {
  pending: 'text-amarillo',
  preparing: 'text-orange-400',
  ready: 'text-verde',
  completed: 'text-verde',
  cancelled: 'text-rojo',
};

const statusSteps: OrderStatus[] = ['pending', 'preparing', 'ready'];

export default function OrderStatusPage() {
  const params = useParams();
  const t = useTranslations('order');
  const orderId = params.id as string;

  const { order, loading, error, refetch } = useOrderSubscription(orderId);
  const { setActiveOrder, clearActiveOrder } = useActiveOrderStore();
  const { settings } = useSettings();

  // Sync order status with active order store
  useEffect(() => {
    if (order) {
      if (order.status === 'completed' || order.status === 'cancelled') {
        // Clear active order when completed or cancelled
        clearActiveOrder();
      } else {
        // Update or set active order
        setActiveOrder({
          paymentIntentId: orderId,
          orderNumber: order.order_number,
          status: order.status as 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled',
          createdAt: order.created_at,
          pickupTime: order.pickup_time,
          total: order.total,
        });
      }
    }
  }, [order, orderId, setActiveOrder, clearActiveOrder]);

  if (loading) {
    return (
      <div className="min-h-screen bg-negro py-12 md:py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-amarillo animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-negro py-12 md:py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <AlertCircle className="w-16 h-16 text-rojo mx-auto mb-4" />
            <h1 className="text-2xl font-display text-white mb-2">
              {t('orderNotFound')}
            </h1>
            <p className="text-gray-400 mb-8">{t('orderNotFoundDesc')}</p>
            <Link href="/menu">
              <button className="btn-order">{t('backToMenu')}</button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentStepIndex = statusSteps.indexOf(order.status as OrderStatus);
  const locale = params.locale as string || 'en';

  // Add admin buffer on top of the customer's selected pickup time
  // This ensures admin buffer changes are always reflected (e.g. rush hour adjustments)
  const pickupDate = new Date(order.pickup_time);
  const adminBuffer = settings.prepTime; // admin "extra buffer" slider value
  const estimatedReady = new Date(pickupDate.getTime() + adminBuffer * 60 * 1000);

  const localeStr = locale === 'es' ? 'es-US' : 'en-US';
  const pickupTimeFormatted = estimatedReady.toLocaleTimeString(localeStr, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div className="min-h-screen bg-negro py-12 md:py-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${statusColors[order.status as OrderStatus]} bg-current/10 mb-4`}
          >
            {statusIcons[order.status as OrderStatus]}
          </div>
          <h1 className="text-3xl font-display text-white mb-2">
            {t('orderNumber', { number: order.order_number })}
          </h1>
          <p className={`text-lg ${statusColors[order.status as OrderStatus]}`}>
            {t(order.status)}
          </p>
        </div>

        {/* Completed Success Banner */}
        {order.status === 'completed' && (
          <div className="bg-linear-to-r from-verde/20 to-verde/10 rounded-lg border border-verde/30 p-6 mb-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <CheckCircle className="w-6 h-6 text-verde" />
              <p className="text-xl font-display text-verde">{t('thankYou')}</p>
            </div>
            <p className="text-gray-300">
              {t(`status${order.status.charAt(0).toUpperCase() + order.status.slice(1)}Desc`)}
            </p>
          </div>
        )}

        {/* Status Tracker */}
        {order.status !== 'cancelled' && order.status !== 'completed' && (
          <div className="bg-negro-light rounded-lg border border-gray-700 p-6 mb-6">
            <div className="flex items-center">
              {statusSteps.map((step, index) => (
                <div key={step} className="flex items-center flex-1 last:flex-none">
                  {/* Step with icon and label */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full ${
                        index <= currentStepIndex
                          ? 'bg-amarillo text-negro'
                          : 'bg-gray-700 text-gray-500'
                      }`}
                    >
                      {index < currentStepIndex ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        statusIcons[step]
                      )}
                    </div>
                    <span
                      className={`mt-2 text-sm whitespace-nowrap ${
                        step === order.status ? 'text-amarillo' : 'text-gray-500'
                      }`}
                    >
                      {t(step)}
                    </span>
                  </div>
                  {/* Connector line */}
                  {index < statusSteps.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-3 mb-6 ${
                        index < currentStepIndex ? 'bg-amarillo' : 'bg-gray-700'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status Message (for non-completed statuses) */}
        {order.status !== 'completed' && (
          <div className="bg-negro-light rounded-lg border border-gray-700 p-6 mb-6">
            <p className="text-gray-300">
              {t(`status${order.status.charAt(0).toUpperCase() + order.status.slice(1)}Desc`)}
            </p>
          </div>
        )}

        {/* Pickup Time */}
        {order.status !== 'completed' && (
          <div className="bg-negro-light rounded-lg border border-gray-700 p-6 mb-6">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-amarillo" />
              <div>
                <p className="text-sm text-gray-400">{t('pickupTime')}</p>
                <p className="text-lg text-white font-medium">{pickupTimeFormatted}</p>
              </div>
            </div>
            {adminBuffer > 0 && order.status === 'pending' && (
              <p className="text-sm text-amarillo/80 mt-3 pt-3 border-t border-gray-700">
                {t('highDemandNotice')}
              </p>
            )}
          </div>
        )}

        {/* Order Items */}
        <div className="bg-negro-light rounded-lg border border-gray-700 p-6 mb-6">
          <h2 className="font-display text-lg text-white mb-4">{t('items')}</h2>
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between items-start">
                <div>
                  <p className="text-white">
                    {item.quantity}x {item.name[locale as 'en' | 'es'] || item.name.en}
                  </p>
                  {item.customizations && item.customizations.length > 0 && (
                    <p className="text-sm text-gray-400">
                      {formatCustomizations(item.customizations, locale as 'en' | 'es')}
                    </p>
                  )}
                  {item.itemNotes && (
                    <p className="text-sm text-amarillo italic">{item.itemNotes}</p>
                  )}
                </div>
                <p className="text-gray-300">{formatPrice(item.itemTotal)}</p>
              </div>
            ))}
          </div>

          {/* Special Instructions */}
          {order.special_instructions && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <p className="text-sm text-gray-400 mb-1">Special Instructions:</p>
              <p className="text-amarillo italic">{order.special_instructions}</p>
            </div>
          )}

          {/* Total */}
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="flex justify-between text-sm text-gray-400 mb-1">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Tax</span>
              <span>{formatPrice(order.tax)}</span>
            </div>
            <div className="flex justify-between font-display text-lg">
              <span className="text-white">{t('total')}</span>
              <span className="text-amarillo">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Contact & Actions */}
        <div className="bg-negro-light rounded-lg border border-gray-700 p-6">
          <p className="text-gray-400 mb-4">{t('questions')}</p>
          <div className="flex flex-col sm:flex-row gap-3 mb-3">
            <a
              href={`tel:${settings.phone.replace(/\D/g, '')}`}
              className="flex-1 flex items-center justify-center gap-2 bg-verde hover:bg-verde/90 text-white py-3 rounded-lg transition-colors"
            >
              <Phone className="w-5 h-5" />
              {t('callUs')} {settings.phone}
            </a>
            <button
              onClick={() => refetch()}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              {t('refreshStatus')}
            </button>
          </div>
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(`${settings.address.street} ${settings.address.city} ${settings.address.state} ${settings.address.zip}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-amarillo hover:bg-amarillo/90 text-negro font-semibold py-3 rounded-lg transition-colors"
          >
            <MapPin className="w-5 h-5" />
            {t('getDirections')}
          </a>
        </div>
      </div>
    </div>
  );
}
