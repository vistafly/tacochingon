'use client';

import { useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Star } from 'lucide-react';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { mockMenuItems } from '@/data/mock-menu';
import { ORDER_LINKS } from '@/lib/constants';
import type { Locale } from '@/types';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export function FeaturedSection() {
  const t = useTranslations('home');
  const tCommon = useTranslations('common');
  const locale = useLocale() as Locale;
  const sectionRef = useRef<HTMLElement>(null);

  const featuredItems = mockMenuItems.filter(item => item.isFeatured).slice(0, 4);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.featured-card',
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.featured-grid',
            start: 'top 80%',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  if (featuredItems.length === 0) return null;

  return (
    <section ref={sectionRef} className="relative py-20 bg-negro">
      {/* Section header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amarillo text-negro rounded mb-4">
            <Star className="w-4 h-4 fill-current" />
            <span className="font-display text-sm">CUSTOMER FAVORITES</span>
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

        {/* Cards grid */}
        <div className="featured-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
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
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                    <span className="text-4xl">🌮</span>
                  </div>
                )}

                {/* Featured badge */}
                <div className="absolute top-3 left-3 bg-amarillo text-negro px-3 py-1 rounded">
                  <span className="font-display text-xs flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    FEATURED
                  </span>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-negro/80 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <Link href="/menu">
                    <button className="btn-order text-sm py-2 px-6">
                      ORDER NOW
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
