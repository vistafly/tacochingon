'use client';

import { useEffect, useState } from 'react';
import { useSettings } from './useSettings';

interface PrepTimeData {
  /** Queue-based prep time (from active order count) */
  basePrepTime: number;
  /** Admin-set extra buffer */
  adminBuffer: number;
  /** Total: basePrepTime + adminBuffer */
  totalPrepTime: number;
  /** Number of orders currently in queue */
  queueSize: number;
  loading: boolean;
}

export function usePrepTime(): PrepTimeData {
  const { settings, loading: settingsLoading } = useSettings();
  const [queueData, setQueueData] = useState({ queueSize: 0, basePrepTime: 10 });
  const [queueLoading, setQueueLoading] = useState(true);

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const res = await fetch('/api/orders/queue');
        if (res.ok) {
          const data = await res.json();
          setQueueData(data);
        }
      } catch {
        // Use defaults on error
      } finally {
        setQueueLoading(false);
      }
    };

    fetchQueue();
  }, []);

  return {
    basePrepTime: queueData.basePrepTime,
    adminBuffer: settings.prepTime,
    totalPrepTime: queueData.basePrepTime + settings.prepTime,
    queueSize: queueData.queueSize,
    loading: settingsLoading || queueLoading,
  };
}
