'use client';

import { useCallback, useRef, useState } from 'react';

export function useNewOrderSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const isMutedRef = useRef(false);

  const playSound = useCallback(() => {
    if (isMutedRef.current) return;

    if (!audioRef.current) {
      audioRef.current = new Audio('/sounds/new-order.mp3');
      audioRef.current.volume = 0.5;
    }

    audioRef.current.currentTime = 0;
    audioRef.current.play().catch((err) => {
      console.log('Could not play notification sound:', err);
    });
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      isMutedRef.current = !prev;
      return !prev;
    });
  }, []);

  return { playSound, isMuted, toggleMute };
}
