'use client';

import { useState, FormEvent, useMemo } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { User, Mail, Phone, AlertCircle, Loader2 } from 'lucide-react';
import { mockSettings } from '@/data/mock-settings';
import { useCartStore } from '@/store/cart-store';
import { TimePillPicker } from './TimePillPicker';
import { PaymentMethods } from '@/components/ui/PaymentMethods';
import { OrderItem } from '@/types/order';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
);

interface CheckoutFormProps {
  total: number;
  subtotal: number;
  tax: number;
  orderItems: OrderItem[];
  specialInstructions?: string;
}

interface PaymentFormProps {
  total: number;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    pickupTime: string;
  };
  paymentIntentId: string;
  onError: (error: string) => void;
}

function PaymentForm({
  total,
  customerInfo,
  paymentIntentId,
  onError,
}: PaymentFormProps) {
  const t = useTranslations('checkout');
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { clearCart } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        onError(submitError.message || t('paymentError'));
        setIsProcessing(false);
        return;
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/en/order/${paymentIntentId}`,
          payment_method_data: {
            billing_details: {
              name: customerInfo.name,
              email: customerInfo.email,
              phone: customerInfo.phone,
            },
          },
        },
        redirect: 'if_required',
      });

      if (confirmError) {
        onError(confirmError.message || t('paymentError'));
        setIsProcessing(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment succeeded without redirect
        clearCart();
        // Redirect to order status page with payment intent ID
        router.push(`/order/${paymentIntentId}`);
      }
    } catch (err) {
      console.error('Payment error:', err);
      onError(t('paymentError'));
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-negro-light rounded-lg border border-gray-700 p-6">
        <h2 className="font-display text-lg text-white mb-4">{t('paymentInfo')}</h2>
        <PaymentElement />
      </div>

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full btn-order py-4 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? t('processing') : t('payAmount', { amount: `$${total.toFixed(2)}` })}
      </button>

      <p className="text-xs text-gray-500 text-center">{t('securePayment')}</p>
      <PaymentMethods className="mt-4" />
    </form>
  );
}

export function CheckoutForm({
  total,
  subtotal,
  tax,
  orderItems,
  specialInstructions,
}: CheckoutFormProps) {
  const t = useTranslations('checkout');

  const [isCreatingIntent, setIsCreatingIntent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);

  // Customer info state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [pickupTime, setPickupTime] = useState('');

  // Calculate available pickup times
  const { isOpen, minTime, maxTime, minTime12hr, maxTime12hr, closedMessage } = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now
      .toLocaleDateString('en-US', { weekday: 'long' })
      .toLowerCase() as keyof typeof mockSettings.hours;
    const todayHours = mockSettings.hours[dayOfWeek];

    if (!todayHours) {
      return {
        isOpen: false,
        minTime: '',
        maxTime: '',
        minTime12hr: '',
        maxTime12hr: '',
        closedMessage: t('closedToday'),
      };
    }

    const [openHour, openMin] = todayHours.open.split(':').map(Number);
    const [closeHour, closeMin] = todayHours.close.split(':').map(Number);

    const openTime = new Date(now);
    openTime.setHours(openHour, openMin, 0, 0);

    const closeTime = new Date(now);
    closeTime.setHours(closeHour, closeMin, 0, 0);

    // Minimum pickup time is now + prep time
    const minPickupTime = new Date(now.getTime() + mockSettings.prepTime * 60 * 1000);

    // If we're before opening, set min to opening time + prep
    if (now < openTime) {
      minPickupTime.setTime(openTime.getTime() + mockSettings.prepTime * 60 * 1000);
    }

    // If min pickup time is after closing, we're closed for orders
    if (minPickupTime >= closeTime) {
      return {
        isOpen: false,
        minTime: '',
        maxTime: '',
        minTime12hr: '',
        maxTime12hr: '',
        closedMessage: t('closedForToday'),
      };
    }

    // If current time is after closing
    if (now >= closeTime) {
      return {
        isOpen: false,
        minTime: '',
        maxTime: '',
        minTime12hr: '',
        maxTime12hr: '',
        closedMessage: t('closedForToday'),
      };
    }

    const formatTime = (date: Date) => {
      return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    };

    const formatTime12hr = (time24: string) => {
      const [hours, mins] = time24.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${String(mins).padStart(2, '0')} ${period}`;
    };

    return {
      isOpen: true,
      minTime: formatTime(minPickupTime),
      maxTime: todayHours.close,
      minTime12hr: formatTime12hr(formatTime(minPickupTime)),
      maxTime12hr: formatTime12hr(todayHours.close),
      closedMessage: null,
    };
  }, [t]);

  const handleContinueToPayment = async () => {
    // Validate form
    if (!name.trim() || !email.trim() || !phone.trim() || !pickupTime) {
      setError(t('fillAllFields'));
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t('invalidEmail'));
      return;
    }

    // Validate phone format (basic)
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      setError(t('invalidPhone'));
      return;
    }

    setIsCreatingIntent(true);
    setError(null);

    try {
      // Create pickup time as ISO string
      const now = new Date();
      const [hours, minutes] = pickupTime.split(':').map(Number);
      const pickupDate = new Date(now);
      pickupDate.setHours(hours, minutes, 0, 0);

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(total * 100), // Convert to cents
          customerEmail: email,
          customerName: name,
          customerPhone: phone,
          pickupTime: pickupDate.toISOString(),
          items: orderItems,
          specialInstructions,
          subtotal,
          tax,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment intent');
      }

      setClientSecret(data.clientSecret);
      setPaymentIntentId(data.paymentIntentId);
    } catch (err) {
      console.error('Error creating payment intent:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsCreatingIntent(false);
    }
  };

  // Format phone number as user types
  const handlePhoneChange = (value: string) => {
    const digits = value.replace(/\D/g, '');
    let formatted = '';

    if (digits.length > 0) {
      formatted = '(' + digits.substring(0, 3);
    }
    if (digits.length >= 3) {
      formatted += ') ' + digits.substring(3, 6);
    }
    if (digits.length >= 6) {
      formatted += '-' + digits.substring(6, 10);
    }

    setPhone(formatted);
  };

  if (!isOpen) {
    return (
      <div className="bg-negro-light rounded-lg border border-gray-700 p-6">
        <div className="flex items-center gap-3 text-rojo mb-4">
          <AlertCircle className="w-6 h-6" />
          <h3 className="font-display text-lg">{t('storeClosed')}</h3>
        </div>
        <p className="text-gray-400">{closedMessage}</p>
        <p className="text-gray-500 text-sm mt-2">{t('tryAgainDuringHours')}</p>
      </div>
    );
  }

  // Show payment form if we have a client secret
  if (clientSecret && paymentIntentId) {
    return (
      <>
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: 'night',
              variables: {
                colorPrimary: '#F5A623',
                colorBackground: '#1a1a1a',
                colorText: '#ffffff',
                colorDanger: '#ef4444',
                fontFamily: 'system-ui, sans-serif',
                borderRadius: '8px',
              },
            },
          }}
        >
          <PaymentForm
            total={total}
            customerInfo={{ name, email, phone, pickupTime }}
            paymentIntentId={paymentIntentId}
            onError={setError}
          />
        </Elements>
        {error && (
          <div className="flex items-center gap-2 text-rojo bg-rojo/10 border border-rojo/20 rounded-lg p-4 mt-4">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="space-y-6">
      {/* Customer Information */}
      <div className="bg-negro-light rounded-lg border border-gray-700 p-6">
        <h2 className="font-display text-lg text-white mb-4">{t('customerInfo')}</h2>

        <div className="space-y-4">
          {/* Name and Email - side by side */}
          <div className="grid grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                {t('name')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-negro border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-amarillo focus:outline-none"
                placeholder={t('namePlaceholder')}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                {t('email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-negro border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-amarillo focus:outline-none"
                placeholder={t('emailPlaceholder')}
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              <Phone className="w-4 h-4 inline mr-2" />
              {t('phone')}
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              required
              className="w-full px-4 py-3 bg-negro border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-amarillo focus:outline-none"
              placeholder="(555) 123-4567"
            />
          </div>

          {/* Pickup Time */}
          <TimePillPicker
            value={pickupTime}
            onChange={setPickupTime}
            minTime={minTime}
            maxTime={maxTime}
            label={t('pickupTime')}
            hint={t('pickupTimeHint', { min: minTime12hr, max: maxTime12hr })}
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-rojo bg-rojo/10 border border-rojo/20 rounded-lg p-4">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Continue to Payment Button */}
      <button
        type="button"
        onClick={handleContinueToPayment}
        disabled={isCreatingIntent}
        className="w-full btn-order py-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isCreatingIntent ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            {t('loadingPayment')}
          </>
        ) : (
          t('continueToPayment')
        )}
      </button>

      {/* Secure Payment Notice */}
      <p className="text-xs text-gray-500 text-center">{t('securePayment')}</p>
      <PaymentMethods className="mt-4" />
    </div>
  );
}
