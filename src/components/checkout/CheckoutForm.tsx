'use client';

import { useState, FormEvent, useMemo } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { User, Mail, Phone, AlertCircle } from 'lucide-react';
import { mockSettings } from '@/data/mock-settings';
import { useCartStore } from '@/store/cart-store';
import { TimePillPicker } from './TimePillPicker';

interface CheckoutFormProps {
  total: number;
}

export function CheckoutForm({ total }: CheckoutFormProps) {
  const t = useTranslations('checkout');
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { clearCart } = useCartStore();

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Customer info state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [pickupTime, setPickupTime] = useState('');

  // Calculate available pickup times
  const { isOpen, minTime, maxTime, closedMessage } = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof typeof mockSettings.hours;
    const todayHours = mockSettings.hours[dayOfWeek];

    if (!todayHours) {
      return {
        isOpen: false,
        minTime: '',
        maxTime: '',
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
        closedMessage: t('closedForToday'),
      };
    }

    // If current time is after closing
    if (now >= closeTime) {
      return {
        isOpen: false,
        minTime: '',
        maxTime: '',
        closedMessage: t('closedForToday'),
      };
    }

    const formatTime = (date: Date) => {
      return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    };

    return {
      isOpen: true,
      minTime: formatTime(minPickupTime),
      maxTime: todayHours.close,
      closedMessage: null,
    };
  }, [t]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

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

    setIsProcessing(true);
    setError(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message || t('paymentError'));
        setIsProcessing(false);
        return;
      }

      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/en/checkout/success`,
          payment_method_data: {
            billing_details: {
              name,
              email,
              phone,
            },
          },
        },
        redirect: 'if_required',
      });

      if (confirmError) {
        setError(confirmError.message || t('paymentError'));
        setIsProcessing(false);
      } else {
        // Payment succeeded without redirect
        clearCart();
        router.push('/checkout/success');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(t('paymentError'));
      setIsProcessing(false);
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Information */}
      <div className="bg-negro-light rounded-lg border border-gray-700 p-6">
        <h2 className="font-display text-lg text-white mb-4">{t('customerInfo')}</h2>

        <div className="space-y-4">
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
            hint={t('pickupTimeHint', { min: minTime, max: maxTime })}
          />
        </div>
      </div>

      {/* Payment Section */}
      <div className="bg-negro-light rounded-lg border border-gray-700 p-6">
        <h2 className="font-display text-lg text-white mb-4">{t('paymentInfo')}</h2>
        <PaymentElement />
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-rojo bg-rojo/10 border border-rojo/20 rounded-lg p-4">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full btn-order py-4 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? t('processing') : t('payAmount', { amount: `$${total.toFixed(2)}` })}
      </button>

      {/* Secure Payment Notice */}
      <p className="text-xs text-gray-500 text-center">
        {t('securePayment')}
      </p>
    </form>
  );
}
