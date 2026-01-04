'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { gsap } from 'gsap';
import { ArrowRight, ArrowLeft, MapPin, Star } from 'lucide-react';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { mockMenuItems } from '@/data/mock-menu';
import { ORDER_LINKS } from '@/lib/constants';
import type { Locale } from '@/types';

const SLIDE_DURATION = 6000; // 6 seconds per slide

export function HeroSection() {
  const t = useTranslations('home');
  const tCommon = useTranslations('common');
  const locale = useLocale() as Locale;
  const heroRef = useRef<HTMLElement>(null);
  const slideRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const featuredItems = mockMenuItems.filter(item => item.isFeatured);

  const animateSlide = useCallback((direction: 'next' | 'prev' | 'jump', targetIndex?: number) => {
    if (isAnimating || !slideRef.current) return;
    setIsAnimating(true);

    const tl = gsap.timeline({
      onComplete: () => {
        setIsAnimating(false);
        if (direction === 'jump' && targetIndex !== undefined) {
          setCurrentIndex(targetIndex);
        } else if (direction === 'next') {
          setCurrentIndex((prev) => (prev + 1) % featuredItems.length);
        } else {
          setCurrentIndex((prev) => (prev - 1 + featuredItems.length) % featuredItems.length);
        }
      },
    });

    tl.to(slideRef.current, {
      opacity: 0,
      scale: 0.95,
      duration: 0.4,
      ease: 'power2.in',
    });

    tl.to(slideRef.current, {
      opacity: 1,
      scale: 1,
      duration: 0.5,
      ease: 'power2.out',
    });
  }, [isAnimating, featuredItems.length]);

  const goToNext = useCallback(() => {
    animateSlide('next');
  }, [animateSlide]);

  const goToPrev = useCallback(() => {
    animateSlide('prev');
  }, [animateSlide]);

  const goToSlide = useCallback((index: number) => {
    if (index === currentIndex) return;
    animateSlide('jump', index);
  }, [currentIndex, animateSlide]);

  // Auto-advance slideshow
  useEffect(() => {
    if (featuredItems.length === 0) return;
    const interval = setInterval(() => {
      if (!isAnimating) {
        goToNext();
      }
    }, SLIDE_DURATION);

    return () => clearInterval(interval);
  }, [isAnimating, goToNext, featuredItems.length]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Simple, punchy animations - elements start hidden via CSS opacity-0
      gsap.to('.hero-badge', {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'power2.out',
      });

      gsap.to('.hero-title', {
        opacity: 1,
        y: 0,
        duration: 0.6,
        delay: 0.1,
        ease: 'power2.out',
      });

      gsap.to('.hero-subtitle', {
        opacity: 1,
        y: 0,
        duration: 0.6,
        delay: 0.3,
        ease: 'power2.out',
      });

      gsap.to('.hero-buttons', {
        opacity: 1,
        y: 0,
        duration: 0.6,
        delay: 0.5,
        ease: 'power2.out',
      });

      gsap.to('.hero-carousel', {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        delay: 0.4,
        ease: 'power2.out',
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const currentItem = featuredItems.length > 0 ? featuredItems[currentIndex] : null;

  return (
    <section
      ref={heroRef}
      className="relative min-h-[90vh] bg-negro overflow-hidden"
    >
      {/* Mexican flag stripe at top */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-verde via-white to-rojo z-20" />

      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <Image
          src="/images/menu/taco.jpg"
          alt="Street Tacos"
          fill
          className="object-cover opacity-30"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-negro via-negro/90 to-negro/70" />
      </div>

      {/* Glow effect */}
      <div className="absolute top-1/2 left-1/4 w-[600px] h-[600px] bg-rojo/10 rounded-full blur-[150px]" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Text */}
          <div>
            {/* Location badge */}
            <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 bg-negro-light border border-amarillo/30 rounded mb-6 opacity-0" style={{ transform: 'translateY(20px)' }}>
              <MapPin className="w-4 h-4 text-amarillo" />
              <span className="text-sm text-white font-medium">Fresno, CA</span>
            </div>

            {/* Title */}
            <h1 className="hero-title mb-6 opacity-0" style={{ transform: 'translateY(40px)' }}>
              <span className="block font-display text-6xl md:text-7xl lg:text-8xl text-white leading-none">
                EL TACO
              </span>
              <span className="block font-display text-6xl md:text-7xl lg:text-8xl text-amarillo leading-none" style={{ textShadow: '4px 4px 0 #E31C25' }}>
                CHINGON
              </span>
            </h1>

            {/* Subtitle */}
            <p className="hero-subtitle text-xl md:text-2xl text-gray-300 mb-8 max-w-lg opacity-0" style={{ transform: 'translateY(30px)' }}>
              {t('heroSubtitle')}
            </p>

            {/* Tagline */}
            <p className="hero-subtitle font-accent text-2xl text-amarillo mb-10 rotate-[-2deg] opacity-0" style={{ transform: 'translateY(30px)' }}>
              Real street tacos. No BS.
            </p>

            {/* Buttons */}
            <div className="hero-buttons flex flex-col sm:flex-row gap-4 opacity-0" style={{ transform: 'translateY(20px)' }}>
              <Link href="/menu">
                <button className="btn-order flex items-center justify-center gap-3 w-full sm:w-auto">
                  {tCommon('orderNow')}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              <Link href="/menu">
                <button className="btn-secondary flex items-center justify-center gap-3 w-full sm:w-auto">
                  {tCommon('viewMenu')}
                </button>
              </Link>
            </div>
          </div>

          {/* Right side - Featured Carousel */}
          <div className="hero-carousel relative hidden lg:block opacity-0" style={{ transform: 'scale(0.9)' }}>
            {currentItem && (
              <div className="relative">
                {/* Main carousel card */}
                <div className="relative w-full max-w-md mx-auto">
                  {/* Background layers */}
                  <div className="absolute inset-0 bg-amarillo rounded-lg transform rotate-3" />
                  <div className="absolute inset-0 bg-rojo rounded-lg transform -rotate-3" />

                  {/* Card content */}
                  <div
                    ref={slideRef}
                    className="relative bg-negro-light rounded-lg overflow-hidden border-4 border-amarillo"
                  >
                    {/* Image */}
                    <div className="relative aspect-square">
                      {currentItem.image && !currentItem.image.includes('placeholder') ? (
                        <Image
                          src={currentItem.image}
                          alt={currentItem.name[locale]}
                          fill
                          className="object-cover"
                          priority
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                          <span className="text-8xl">🌮</span>
                        </div>
                      )}

                      {/* Featured badge */}
                      <div className="absolute top-3 left-3 bg-amarillo text-negro px-3 py-1 rounded">
                        <span className="font-display text-xs flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" />
                          FEATURED
                        </span>
                      </div>

                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-negro via-transparent to-transparent" />
                    </div>

                    {/* Item info */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <span className="text-xs text-amarillo font-display uppercase">
                        {currentItem.categoryId}
                      </span>
                      <h3 className="font-display text-xl text-white mt-1">
                        {currentItem.name[locale]}
                      </h3>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-display text-2xl text-amarillo">
                          ${currentItem.price.toFixed(2)}
                        </span>
                        <Link href="/menu">
                          <button className="btn-order text-sm py-2 px-4">
                            ORDER
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Arrows */}
                  <button
                    onClick={goToPrev}
                    disabled={isAnimating}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 w-10 h-10 bg-negro-light border-2 border-amarillo rounded-full flex items-center justify-center text-white hover:bg-amarillo hover:text-negro transition-all duration-200 disabled:opacity-50 shadow-lg z-10"
                    aria-label="Previous slide"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <button
                    onClick={goToNext}
                    disabled={isAnimating}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 w-10 h-10 bg-negro-light border-2 border-amarillo rounded-full flex items-center justify-center text-white hover:bg-amarillo hover:text-negro transition-all duration-200 disabled:opacity-50 shadow-lg z-10"
                    aria-label="Next slide"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Dot Indicators */}
                <div className="flex items-center justify-center gap-2 mt-6">
                  {featuredItems.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      disabled={isAnimating}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        index === currentIndex
                          ? 'bg-amarillo w-6'
                          : 'bg-gray-600 hover:bg-gray-500 w-2'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>

                {/* Price badge */}
                <div className="absolute -bottom-2 -right-4 bg-rojo text-white px-5 py-2 rounded transform rotate-6 border-2 border-amarillo">
                  <span className="font-display text-xl">DESDE $3.10</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 100" fill="none" className="w-full">
          <path
            d="M0 100V60C240 20 480 0 720 0C960 0 1200 20 1440 60V100H0Z"
            fill="#1A1A1A"
          />
        </svg>
      </div>
    </section>
  );
}
