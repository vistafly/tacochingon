'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import Image from 'next/image';

export function LoadingScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fade out after minimum display time
  useEffect(() => {
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

    return () => clearTimeout(fadeTimer);
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
      className="fixed inset-0 z-100 bg-negro flex flex-col items-center justify-center"
    >
      {/* Mexican flag stripe - top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-verde via-white to-rojo" />

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

        {/* Loading dots */}
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-amarillo animate-[loading-dot_1.2s_ease-in-out_infinite]"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>

      {/* Mexican flag stripe - bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-verde via-white to-rojo" />
    </div>
  );
}
