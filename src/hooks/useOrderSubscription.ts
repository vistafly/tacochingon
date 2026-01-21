'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Order } from '@/lib/supabase/types';

const MAX_RETRIES = 10;
const RETRY_DELAY = 2000; // 2 seconds
const POLL_INTERVAL = 3000; // Poll every 3 seconds for updates

export function useOrderSubscription(orderId: string) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const retryCountRef = useRef(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchOrder = useCallback(async (isRetry = false) => {
    if (!isRetry) {
      setLoading(true);
      setError(null);
      retryCountRef.current = 0;
    }

    try {
      // Get customer email from localStorage
      const customerEmail = localStorage.getItem(`order_${orderId}_email`);

      // Build API URL with email parameter for authentication
      const url = customerEmail
        ? `/api/orders/${orderId}?email=${encodeURIComponent(customerEmail)}`
        : `/api/orders/${orderId}`;

      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        setOrder(data.order);
        setError(null);
        setLoading(false);
        retryCountRef.current = 0;
      } else if (response.status === 404 && retryCountRef.current < MAX_RETRIES) {
        // Order not found yet - webhook may still be processing
        retryCountRef.current += 1;
        retryTimeoutRef.current = setTimeout(() => {
          fetchOrder(true);
        }, RETRY_DELAY);
      } else if (response.status === 401) {
        setError('Unauthorized - invalid order access');
        setOrder(null);
        setLoading(false);
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

    // Set up polling for order updates (instead of real-time subscription)
    // This replaces the Supabase subscription which won't work with RLS enabled
    pollIntervalRef.current = setInterval(() => {
      // Only poll if we have an order and it's not in a terminal state
      if (order && order.status !== 'completed' && order.status !== 'cancelled') {
        fetchOrder(true);
      }
    }, POLL_INTERVAL);

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [orderId, fetchOrder, order]);

  return { order, loading, error, refetch: fetchOrder };
}
