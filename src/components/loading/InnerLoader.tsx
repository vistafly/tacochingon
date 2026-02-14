'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useLoading } from '@/components/providers/LoadingProvider';

export function InnerLoader() {
  const { isLoading, loadingMessage } = useLoading();
  const containerRef = useRef<HTMLDivElement>(null);
  const tacoRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // Animate in/out
  useEffect(() => {
    if (!containerRef.current) return;

    if (isLoading) {
      // Animate in
      gsap.fromTo(
        containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.2, ease: 'power2.out' }
      );
    } else {
      // Animate out
      gsap.to(containerRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
      });
    }
  }, [isLoading]);

  // Taco bounce animation
  useEffect(() => {
    if (!tacoRef.current || !isLoading) return;

    const tl = gsap.timeline({ repeat: -1 });
    tl.to(tacoRef.current, {
      y: -8,
      rotation: -5,
      duration: 0.4,
      ease: 'power2.out',
    })
      .to(tacoRef.current, {
        y: 0,
        rotation: 5,
        duration: 0.4,
        ease: 'power2.in',
      })
      .to(tacoRef.current, {
        y: -8,
        rotation: 0,
        duration: 0.4,
        ease: 'power2.out',
      })
      .to(tacoRef.current, {
        y: 0,
        rotation: 0,
        duration: 0.4,
        ease: 'power2.in',
      });

    return () => {
      tl.kill();
    };
  }, [isLoading]);

  // Progress bar animation
  useEffect(() => {
    if (!progressRef.current || !isLoading) return;

    const tl = gsap.timeline({ repeat: -1 });
    tl.fromTo(
      progressRef.current,
      { x: '-100%' },
      { x: '100%', duration: 1.2, ease: 'power1.inOut' }
    );

    return () => {
      tl.kill();
    };
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-90 flex items-center justify-center pointer-events-auto"
      style={{ backgroundColor: 'rgba(26, 26, 26, 0.85)' }}
    >
      {/* Backdrop blur layer */}
      <div className="absolute inset-0 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Taco icon with glow */}
        <div
          ref={tacoRef}
          className="relative mb-4"
        >
          <div className="text-6xl md:text-7xl animate-inner-glow">
            🌮
          </div>
          {/* Glow effect behind taco */}
          <div className="absolute inset-0 blur-xl bg-amarillo/30 rounded-full -z-10 scale-150" />
        </div>

        {/* Progress bar container */}
        <div className="w-48 md:w-56 h-1 bg-negro-light/80 rounded-full overflow-hidden border border-gray-700 mb-3">
          {/* Animated progress bar */}
          <div
            ref={progressRef}
            className="h-full w-1/2 bg-linear-to-r from-verde via-amarillo to-rojo rounded-full"
          />
        </div>

        {/* Loading message */}
        {loadingMessage && (
          <p className="font-body text-sm text-crema/80 text-center max-w-xs">
            {loadingMessage}
          </p>
        )}

        {/* Mexican flag accent dots */}
        <div className="flex gap-2 mt-4">
          <div className="w-2 h-2 rounded-full bg-verde animate-pulse-dot" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-white animate-pulse-dot" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-rojo animate-pulse-dot" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
