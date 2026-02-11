'use client';

import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import Image from 'next/image';

export function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Simulated progress stages
  useEffect(() => {
    const timers = [
      setTimeout(() => setProgress(20), 200),
      setTimeout(() => setProgress(40), 400),
      setTimeout(() => setProgress(60), 600),
      setTimeout(() => setProgress(80), 800),
      setTimeout(() => setProgress(100), 1000),
    ];

    // Fade out after progress completes + minimum display time
    const fadeTimer = setTimeout(() => {
      if (containerRef.current) {
        gsap.to(containerRef.current, {
          opacity: 0,
          y: -30,
          duration: 0.5,
          ease: 'power2.inOut',
          onComplete: () => setIsVisible(false),
        });
      }
    }, 1500);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(fadeTimer);
    };
  }, []);

  // Body scroll lock
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] bg-negro flex flex-col items-center justify-center"
    >
      {/* Mexican flag stripe - top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-verde via-white to-rojo" />

      {/* Content container */}
      <div className="flex flex-col items-center">
        {/* Logo with glow */}
        <div
          className="relative w-64 h-44 md:w-80 md:h-56 overflow-hidden mb-6"
          style={{ maskImage: 'radial-gradient(ellipse 80% 75% at center, black 45%, transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse 80% 75% at center, black 45%, transparent 100%)' }}
        >
          <Image
            src="/images/brand/logo.png"
            alt="El Taco Chingon"
            fill
            sizes="320px"
            className="object-contain"
            priority
          />
        </div>

        {/* Tagline */}
        <p className="font-accent text-xl md:text-2xl text-amarillo mb-8 -rotate-2">
          Real street tacos.
        </p>

        {/* Progress bar */}
        <div className="w-64 md:w-72 h-1.5 bg-negro-light/50 rounded-full border border-gray-700 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-verde via-amarillo to-rojo rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Mexican flag stripe - bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-verde via-white to-rojo" />
    </div>
  );
}
