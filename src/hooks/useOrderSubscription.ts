'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Order } from '@/types/order';

const MAX_RETRIES = 10;
const RETRY_DELAY = 2000; // 2 seconds
const POLL_INTERVAL = 15000; // Poll every 15 seconds for updates
const MAX_POLL_DURATION = 30 * 60 * 1000; // Stop polling after 30 minutes

export function useOrderSubscription(orderId: string) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const retryCountRef = useRef(0);
  const orderRef = useRef<Order | null>(null);
  const pollStartTimeRef = useRef<number>(0);
  const isPollingRef = useRef(false);

  // Stable fetch function using ref for orderId
  const orderIdRef = useRef(orderId);
  orderIdRef.current = orderId;

  const fetchOrder = useCallback(async (isRetry = false) => {
    if (!isRetry) {
      setLoading(true);
      setError(null);
      retryCountRef.current = 0;
    }

    try {
      const currentOrderId = orderIdRef.current;
      const customerEmail = localStorage.getItem(`order_${currentOrderId}_email`);

      const url = customerEmail
        ? `/api/orders/${currentOrderId}?email=${encodeURIComponent(customerEmail)}`
        : `/api/orders/${currentOrderId}`;

      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        setOrder(data.order);
        orderRef.current = data.order;
        setError(null);
        setLoading(false);
        retryCountRef.current = 0;
      } else if (response.status === 404 && retryCountRef.current < MAX_RETRIES) {
        retryCountRef.current += 1;
        setTimeout(() => fetchOrder(true), RETRY_DELAY);
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
  }, []); // No dependencies - uses refs

  useEffect(() => {
    // Reset on orderId change
    pollStartTimeRef.current = Date.now();
    isPollingRef.current = true;

    // Initial fetch
    fetchOrder();

    // Set up polling
    const intervalId = setInterval(() => {
      const currentOrder = orderRef.current;
      const elapsed = Date.now() - pollStartTimeRef.current;

      // Stop polling conditions
      if (
        !isPollingRef.current ||
        currentOrder?.status === 'completed' ||
        currentOrder?.status === 'cancelled' ||
        elapsed > MAX_POLL_DURATION
      ) {
        clearInterval(intervalId);
        isPollingRef.current = false;
        return;
      }

      // Only poll if we have an order (not during initial retries)
      if (currentOrder) {
        fetchOrder(true);
      }
    }, POLL_INTERVAL);

    return () => {
      clearInterval(intervalId);
      isPollingRef.current = false;
    };
  }, [orderId, fetchOrder]);

  return { order, loading, error, refetch: fetchOrder };
}
