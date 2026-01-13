'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Order } from '@/lib/supabase/types';

export function useOrderSubscription(orderId: string) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Try by payment intent ID first
      let { data, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('stripe_payment_intent_id', orderId)
        .single();

      // If not found, try by order number
      if (!data && !isNaN(Number(orderId))) {
        const result = await supabase
          .from('orders')
          .select('*')
          .eq('order_number', Number(orderId))
          .single();
        data = result.data;
        fetchError = result.error;
      }

      if (fetchError) {
        setError('Order not found');
        setOrder(null);
      } else {
        setOrder(data);
      }
    } catch (err) {
      console.error('Error fetching order:', err);
      setError('Failed to fetch order');
    } finally {
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
    };
  }, [orderId, fetchOrder]);

  return { order, loading, error, refetch: fetchOrder };
}
