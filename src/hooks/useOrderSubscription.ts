'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Order } from '@/lib/supabase/types';

const MAX_RETRIES = 10;
const RETRY_DELAY = 2000; // 2 seconds

export function useOrderSubscription(orderId: string) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const retryCountRef = useRef(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchOrder = useCallback(async (isRetry = false) => {
    if (!isRetry) {
      setLoading(true);
      setError(null);
      retryCountRef.current = 0;
    }

    try {
      // Try by payment intent ID first (use maybeSingle to avoid 406 on no results)
      let { data } = await supabase
        .from('orders')
        .select('*')
        .eq('stripe_payment_intent_id', orderId)
        .maybeSingle();

      // If not found, try by order number
      if (!data && !isNaN(Number(orderId))) {
        const result = await supabase
          .from('orders')
          .select('*')
          .eq('order_number', Number(orderId))
          .maybeSingle();
        data = result.data;
      }

      if (data) {
        setOrder(data);
        setError(null);
        setLoading(false);
        retryCountRef.current = 0;
      } else if (retryCountRef.current < MAX_RETRIES) {
        // Order not found yet - webhook may still be processing
        retryCountRef.current += 1;
        retryTimeoutRef.current = setTimeout(() => {
          fetchOrder(true);
        }, RETRY_DELAY);
      } else {
        setError('Order not found');
        setOrder(null);
        setLoading(false);
      }
    } catch (err) {
      console.error('Error fetching order:', err);
      setError('Failed to fetch order');
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `stripe_payment_intent_id=eq.${orderId}`,
        },
        (payload) => {
          setOrder(payload.new as Order);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [orderId, fetchOrder]);

  return { order, loading, error, refetch: fetchOrder };
}
