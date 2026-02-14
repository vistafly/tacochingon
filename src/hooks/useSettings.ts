'use client';

import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { BusinessSettings } from '@/types/settings';
import { mockSettings } from '@/data/mock-settings';

// Cache the last Firestore snapshot so re-mounts (e.g. language switch) don't flash mock data
let cachedSettings: BusinessSettings | null = null;

export function useSettings() {
  const [settings, setSettings] = useState<BusinessSettings>(cachedSettings ?? mockSettings);
  const [loading, setLoading] = useState(!cachedSettings);

  useEffect(() => {
    const docRef = doc(db, 'settings', 'business');
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as BusinessSettings;
          cachedSettings = data;
          setSettings(data);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Firestore real-time listener failed, falling back to API:', error);
        // Fallback: fetch from API if real-time listener fails (e.g. permissions)
        fetch('/api/settings')
          .then((res) => res.json())
          .then((data) => {
            if (data.settings) {
              cachedSettings = data.settings;
              setSettings(data.settings);
            }
          })
          .catch((err) => console.error('API fallback also failed:', err))
          .finally(() => setLoading(false));
      }
    );

    return () => unsubscribe();
  }, []);

  return { settings, loading };
}
