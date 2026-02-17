'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export function useNewOrderSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const isMutedRef = useRef(false);
  const unlockedRef = useRef(false);

  // Pre-create audio and unlock playback on first user interaction
  useEffect(() => {
    audioRef.current = new Audio('/sounds/new-order.mp3');
    audioRef.current.volume = 0.5;

    const unlock = () => {
      if (unlockedRef.current || !audioRef.current) return;
      audioRef.current.play().then(() => {
        audioRef.current!.pause();
        audioRef.current!.currentTime = 0;
        unlockedRef.current = true;
        document.removeEventListener('click', unlock);
      }).catch(() => {});
    };

    document.addEventListener('click', unlock);
    return () => document.removeEventListener('click', unlock);
  }, []);

  const playSound = useCallback(() => {
    if (isMutedRef.current || !audioRef.current) return;

    audioRef.current.currentTime = 0;
    audioRef.current.play().catch((err) => {
      console.log('Could not play notification sound:', err);
    });

    // Vibrate on mobile devices (3 short pulses)
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 200]);
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      isMutedRef.current = !prev;
      return !prev;
    });
  }, []);

  return { playSound, isMuted, toggleMute };
}
