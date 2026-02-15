'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { mockMenuItems } from '@/data/mock-menu';
import type { Locale } from '@/types';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export function FeaturedSection() {
  const t = useTranslations('home');
  const tCommon = useTranslations('common');
  const locale = useLocale() as Locale;
  const sectionRef = useRef<HTMLElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartRef = useRef<number>(0);
  const touchEndRef = useRef<number>(0);

  const featuredItems = mockMenuItems.filter(item => item.isFeatured).slice(0, 4);

  // Pause auto-scroll for 8 seconds after manual interaction
  const pauseAutoScroll = useCallback(() => {
    setIsPaused(true);
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }
    pauseTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 8000);
  }, []);

  // Navigation functions
  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
    pauseAutoScroll();
  }, [pauseAutoScroll]);

  const goToPrev = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + featuredItems.length) % featuredItems.length);
    pauseAutoScroll();
  }, [featuredItems.length, pauseAutoScroll]);

  const goToNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % featuredItems.length);
    pauseAutoScroll();
  }, [featuredItems.length, pauseAutoScroll]);

  // Touch handlers for swipe
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = e.targetTouches[0].clientX;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndRef.current = e.targetTouches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    const swipeThreshold = 50;
    const diff = touchStartRef.current - touchEndRef.current;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        goToNext();
      } else {
        goToPrev();
      }
    }
  }, [goToNext, goToPrev]);

  // Check for mobile screen size (debounced)
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const checkMobile = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => setIsMobile(window.innerWidth < 640), 150);
    };

    setIsMobile(window.innerWidth < 640); // initial check
    window.addEventListener('resize', checkMobile, { passive: true });
    return () => { clearTimeout(timeout); window.removeEventListener('resize', checkMobile); };
  }, []);

  // Auto-play carousel on mobile (respects pause)
  useEffect(() => {
    if (!isMobile || featuredItems.length === 0 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredItems.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isMobile, featuredItems.length, isPaused]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
    };
  }, []);

  // GSAP animation for desktop grid
  useEffect(() => {
    if (isMobile) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.featured-card',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.3,
          stagger: 0.05,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.featured-grid',
            start: 'top 80%',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [isMobile]);

  if (featuredItems.length === 0) return null;

  return (
    <section ref={sectionRef} className="relative py-20 bg-negro">
      {/* Section header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amarillo text-negro rounded mb-4">
            <Star className="w-4 h-4 fill-current" />
            <span className="font-display text-sm uppercase">{t('customerFavorites')}</span>
          </div>

          <h2 className="font-display text-4xl md:text-5xl text-white mb-4">
            {t('featuredTitle')}
          </h2>

          {/* Mexican flag divider */}
          <div className="flex items-center justify-center gap-0 w-48 h-1 mx-auto">
            <div className="flex-1 h-full bg-verde" />
            <div className="flex-1 h-full bg-white" />
            <div className="flex-1 h-full bg-rojo" />
          </div>
        </div>

        {/* Mobile Carousel */}
        <div className="sm:hidden mb-12">
          <div className="relative">
            {/* Previous Arrow */}
            <button
              onClick={goToPrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-negro/80 border border-gray-600 rounded-full flex items-center justify-center text-white hover:bg-amarillo hover:text-negro hover:border-amarillo transition-colors"
              aria-label="Previous item"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Next Arrow */}
            <button
              onClick={goToNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-negro/80 border border-gray-600 rounded-full flex items-center justify-center text-white hover:bg-amarillo hover:text-negro hover:border-amarillo transition-colors"
              aria-label="Next item"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div
              className="overflow-hidden mx-10"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {featuredItems.map((item) => (
                  <div
                    key={item.id}
                    className="w-full shrink-0 px-2"
                  >
                    <div className="featured-card group bg-negro-light border-2 border-gray-700 rounded-lg overflow-hidden">
                      {/* Image */}
                      <div className="relative aspect-square overflow-hidden">
                        {item.image && !item.image.includes('placeholder') ? (
                          <Image
                            src={item.image}
                            alt={item.name[locale]}
                            fill
                            sizes="calc(100vw - 16px)"
                            className="object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                            <span className="text-4xl">🌮</span>
                          </div>
                        )}

                        {/* Featured badge */}
                        <div className="absolute top-3 left-3 bg-amarillo text-negro px-3 py-1 rounded">
                          <span className="font-display text-xs flex items-center gap-1 uppercase">
                            <Star className="w-3 h-3 fill-current" />
                            {tCommon('featured')}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <span className="text-xs text-amarillo font-medium uppercase">
                          {item.categoryId}
                        </span>
                        <h3 className="font-display text-lg text-white mt-1">
                          {item.name[locale]}
                        </h3>
                        <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                          {item.description[locale]}
                        </p>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="font-display text-xl text-amarillo">
                            ${item.price.toFixed(2)}
                          </span>
                          <Link href={`/menu?item=${item.id}`}>
                            <button className="btn-order text-sm py-2 px-4">
                              {tCommon('orderNow')}
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Dot indicators */}
          <div className="flex justify-center gap-2 mt-4">
            {featuredItems.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? 'bg-amarillo w-6'
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Desktop Grid */}
        <div className="featured-grid hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {featuredItems.map((item) => (
            <div
              key={item.id}
              className="featured-card group bg-negro-light border-2 border-gray-700 rounded-lg overflow-hidden hover:border-amarillo transition-all duration-200"
            >
              {/* Image */}
              <div className="relative aspect-square overflow-hidden">
                {item.image && !item.image.includes('placeholder') ? (
                  <Image
                    src={item.image}
                    alt={item.name[locale]}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                    <span className="text-4xl">🌮</span>
                  </div>
                )}

                {/* Featured badge */}
                <div className="absolute top-3 left-3 bg-amarillo text-negro px-3 py-1 rounded">
                  <span className="font-display text-xs flex items-center gap-1 uppercase">
                    <Star className="w-3 h-3 fill-current" />
                    {tCommon('featured')}
                  </span>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-negro/80 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <Link href={`/menu?item=${item.id}`}>
                    <button className="btn-order text-sm py-2 px-6">
                      {tCommon('orderNow')}
                    </button>
                  </Link>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <span className="text-xs text-amarillo font-medium uppercase">
                  {item.categoryId}
                </span>
                <h3 className="font-display text-lg text-white mt-1 group-hover:text-amarillo transition-colors">
                  {item.name[locale]}
                </h3>
                <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                  {item.description[locale]}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-display text-xl text-amarillo">
                    ${item.price.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View all button */}
        <div className="text-center">
          <Link href="/menu">
            <button className="btn-verde inline-flex items-center gap-3">
              {tCommon('viewMenu')}
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
