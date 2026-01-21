'use client';

import { useEffect } from 'react';

/**
 * DEV ONLY: Quick fill checkout form with test data using Ctrl+Shift+D
 *
 * TO REMOVE: Delete this file and remove the <DevQuickFill /> component from CheckoutForm.tsx
 */

interface DevQuickFillProps {
  onFill: (data: {
    name: string;
    email: string;
    phone: string;
    pickupTime: string;
  }) => void;
  minTime: string; // Format: "HH:MM"
}

// Test data - modify as needed
const TEST_DATA = {
  name: 'Test Customer',
  email: 'test@example.com',
  phone: '(555) 123-4567',
};

export function DevQuickFill({ onFill, minTime }: DevQuickFillProps) {
  useEffect(() => {
    // Only enable in development
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Shift+D (or Cmd+Shift+D on Mac)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();

        // Use minTime as the pickup time (first available slot)
        const pickupTime = minTime || '12:00';

        onFill({
          ...TEST_DATA,
          pickupTime,
        });

        console.log('[DevQuickFill] Form filled with test data');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onFill, minTime]);

  // Only show hint in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-500/90 text-black text-xs px-3 py-1.5 rounded-full font-medium z-50">
      Ctrl+Shift+D to quick fill
    </div>
  );
}
