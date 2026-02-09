'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowRight, ChevronLeft, ChevronRight, MapPin, Clock, Phone, Star } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturedSection } from '@/components/home/FeaturedSection';
import { REVIEW_LINKS } from '@/lib/constants';
import { useSettings } from '@/hooks/useSettings';
import { formatTime } from '@/lib/utils';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="bg-negro">
      <HeroSection />
      <FeaturedSection />
      <TestimonialsSection />
      <LocationSection />
      <CTASection />
    </div>
  );
}

function TestimonialsSection() {
  const t = useTranslations('home');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartRef = useRef<number>(0);
  const touchEndRef = useRef<number>(0);

  // Real reviews from Yelp and DoorDash
  const testimonials = [
    {
      name: 'Local Foodie',
      text: 'If you want a quick and tasty bite, El Taco Chingon is a good taco truck to stop by. They have a small menu of different authentic food like burritos, tacos, tortas, etc. and all priced decently.',
      rating: 5,
      source: 'Yelp',
    },
    {
      name: 'Night Shift Crew',
      text: 'Me and my co workers agreed that this is our go to dinner choice for Thursday and Friday night shift. The Handmade Tacos are amazing and the salsa they come with adds even more deliciousness to it.',
      rating: 5,
      source: 'Yelp',
    },
    {
      name: 'Fresno Regular',
      text: 'Food is absolutely delicious! It comes out hot and with salsa. The salsa is tasty and very spicy. Portion sizes are decent, and 2 asada tacos were enough to fill me up.',
      rating: 5,
      source: 'Yelp',
    },
  ];

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
    setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    pauseAutoScroll();
  }, [testimonials.length, pauseAutoScroll]);

  const goToNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    pauseAutoScroll();
  }, [testimonials.length, pauseAutoScroll]);

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

  // Check for mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-play carousel on mobile (respects pause)
  useEffect(() => {
    if (!isMobile || testimonials.length === 0 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isMobile, testimonials.length, isPaused]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
    };
  }, []);

  // Business rating info
  const overallRating = 4.3;
  const totalReviews = 200;

  // Use centralized review URLs from constants
  const googleSearchUrl = REVIEW_LINKS.google;
  const yelpUrl = REVIEW_LINKS.yelp;

  return (
    <section className="relative py-20 bg-negro-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amarillo text-negro rounded mb-4">
            <Star className="w-4 h-4 fill-current" />
            <span className="font-display text-sm uppercase">{t('reviews')}</span>
          </div>

          <h2 className="font-display text-4xl md:text-5xl text-white mb-4">
            {t('whatPeopleSay')}
          </h2>

          {/* Mexican flag divider */}
          <div className="flex items-center justify-center gap-0 w-48 h-1 mx-auto mb-6">
            <div className="flex-1 h-full bg-verde" />
            <div className="flex-1 h-full bg-white" />
            <div className="flex-1 h-full bg-rojo" />
          </div>

          {/* Overall Rating */}
          <div className="inline-flex flex-col items-center bg-negro-light border-2 border-amarillo rounded-xl px-8 py-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-display text-4xl text-amarillo">{overallRating}</span>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-6 h-6 ${
                      star <= Math.floor(overallRating)
                        ? 'text-amarillo fill-current'
                        : star <= overallRating + 0.5
                        ? 'text-amarillo fill-current opacity-50'
                        : 'text-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>
            <span className="text-gray-400 text-sm">{t('basedOnReviews', { count: totalReviews })}</span>
          </div>
        </div>

        {/* Mobile Carousel */}
        <div className="md:hidden mb-4">
          <div className="relative">
            {/* Previous Arrow */}
            <button
              onClick={goToPrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-negro/80 border border-gray-600 rounded-full flex items-center justify-center text-white hover:bg-amarillo hover:text-negro hover:border-amarillo transition-colors"
              aria-label="Previous review"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Next Arrow */}
            <button
              onClick={goToNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-negro/80 border border-gray-600 rounded-full flex items-center justify-center text-white hover:bg-amarillo hover:text-negro hover:border-amarillo transition-colors"
              aria-label="Next review"
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
                {testimonials.map((testimonial, index) => (
                  <div
                    key={index}
                    className="w-full flex-shrink-0 px-2"
                  >
                    <div className="bg-negro-light border-2 border-gray-700 rounded-lg p-6">
                      {/* Stars */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex gap-1">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="w-5 h-5 text-amarillo fill-current" />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
                          {testimonial.source}
                        </span>
                      </div>

                      <p className="text-gray-300 mb-6 italic leading-relaxed">&quot;{testimonial.text}&quot;</p>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-rojo flex items-center justify-center text-white font-bold">
                          {testimonial.name[0]}
                        </div>
                        <span className="font-medium text-white">{testimonial.name}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Dot indicators */}
          <div className="flex justify-center gap-2 mt-4">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? 'bg-amarillo w-6'
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
                aria-label={`Go to review ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 mb-4">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-negro-light border-2 border-gray-700 rounded-lg p-6 hover:border-amarillo transition-colors"
            >
              {/* Stars */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-amarillo fill-current" />
                  ))}
                </div>
                <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
                  {testimonial.source}
                </span>
              </div>

              <p className="text-gray-300 mb-6 italic leading-relaxed">&quot;{testimonial.text}&quot;</p>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rojo flex items-center justify-center text-white font-bold">
                  {testimonial.name[0]}
                </div>
                <span className="font-medium text-white">{testimonial.name}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Review Buttons */}
        <div className="flex flex-row items-center justify-center gap-3">
          <a
            href={yelpUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#FF1A1A] hover:bg-[#D32323] text-white font-bold py-3 px-5 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 16 16" fill="currentColor">
              <path d="m4.188 10.095.736-.17.073-.02A.813.813 0 0 0 5.45 8.65a1 1 0 0 0-.3-.258 3 3 0 0 0-.428-.198l-.808-.295a76 76 0 0 0-1.364-.493C2.253 7.3 2 7.208 1.783 7.14c-.041-.013-.087-.025-.124-.038a2.1 2.1 0 0 0-.606-.116.72.72 0 0 0-.572.245 2 2 0 0 0-.105.132 1.6 1.6 0 0 0-.155.309c-.15.443-.225.908-.22 1.376.002.423.013.966.246 1.334a.8.8 0 0 0 .22.24c.166.114.333.129.507.141.26.019.513-.045.764-.103l2.447-.566zm8.219-3.911a4.2 4.2 0 0 0-.8-1.14 1.6 1.6 0 0 0-.275-.21 2 2 0 0 0-.15-.073.72.72 0 0 0-.621.031c-.142.07-.294.182-.496.37-.028.028-.063.06-.094.089-.167.156-.353.35-.574.575q-.51.516-1.01 1.042l-.598.62a3 3 0 0 0-.298.365 1 1 0 0 0-.157.364.8.8 0 0 0 .007.301q0 .007.003.013a.81.81 0 0 0 .945.616l.074-.014 3.185-.736c.251-.058.506-.112.732-.242.151-.088.295-.175.394-.35a.8.8 0 0 0 .093-.313c.05-.434-.178-.927-.36-1.308M6.706 7.523c.23-.29.23-.722.25-1.075.07-1.181.143-2.362.201-3.543.022-.448.07-.89.044-1.34-.022-.372-.025-.799-.26-1.104C6.528-.077 5.644-.033 5.04.05q-.278.038-.553.104a8 8 0 0 0-.543.149c-.58.19-1.393.537-1.53 1.204-.078.377.106.763.249 1.107.173.417.41.792.625 1.185.57 1.036 1.15 2.066 1.728 3.097.172.308.36.697.695.857q.033.015.068.025c.15.057.313.068.469.032l.028-.007a.8.8 0 0 0 .377-.226zm-.276 3.161a.74.74 0 0 0-.923-.234 1 1 0 0 0-.145.09 2 2 0 0 0-.346.354c-.026.033-.05.077-.08.104l-.512.705q-.435.591-.861 1.193c-.185.26-.346.479-.472.673l-.072.11c-.152.235-.238.406-.282.559a.7.7 0 0 0-.03.314c.013.11.05.217.108.312q.046.07.1.138a1.6 1.6 0 0 0 .257.237 4.5 4.5 0 0 0 2.196.76 1.6 1.6 0 0 0 .349-.027 2 2 0 0 0 .163-.048.8.8 0 0 0 .278-.178.7.7 0 0 0 .17-.266c.059-.147.098-.335.123-.613l.012-.13c.02-.231.03-.502.045-.821q.037-.735.06-1.469l.033-.87a2.1 2.1 0 0 0-.055-.623 1 1 0 0 0-.117-.27Zm5.783 1.362a2.2 2.2 0 0 0-.498-.378l-.112-.067c-.199-.12-.438-.246-.719-.398q-.644-.353-1.295-.695l-.767-.407c-.04-.012-.08-.04-.118-.059a2 2 0 0 0-.466-.166 1 1 0 0 0-.17-.018.74.74 0 0 0-.725.616 1 1 0 0 0 .01.293c.038.204.13.406.224.583l.41.768q.341.65.696 1.294c.152.28.28.52.398.719q.036.057.068.112c.145.239.261.39.379.497a.73.73 0 0 0 .596.201 2 2 0 0 0 .168-.029 1.6 1.6 0 0 0 .325-.129 4 4 0 0 0 .855-.64c.306-.3.577-.63.788-1.006q.045-.08.076-.165a2 2 0 0 0 .051-.161q.019-.083.029-.168a.8.8 0 0 0-.038-.327.7.7 0 0 0-.165-.27"/>
            </svg>
            Yelp
          </a>
          <a
            href={googleSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-800 font-bold py-3 px-5 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </a>
        </div>
      </div>
    </section>
  );
}

function LocationSection() {
  const t = useTranslations('home');
  const tLocation = useTranslations('location');
  const { settings } = useSettings();
  const addr = settings.address;
  const address = `${addr.street}, ${addr.city}, ${addr.state} ${addr.zip}`;
  const embedUrl = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    ? `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(address)}`
    : `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;

  return (
    <section className="relative py-12 md:py-20 bg-negro">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-6 md:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-verde text-white rounded mb-4">
            <MapPin className="w-4 h-4" />
            <span className="font-display text-sm uppercase">{tLocation('findUs')}</span>
          </div>

          <h2 className="font-display text-3xl md:text-5xl text-white mb-4">
            {t('locationTitle')}
          </h2>

          {/* Mexican flag divider */}
          <div className="flex items-center justify-center gap-0 w-48 h-1 mx-auto">
            <div className="flex-1 h-full bg-verde" />
            <div className="flex-1 h-full bg-white" />
            <div className="flex-1 h-full bg-rojo" />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5 md:gap-8">
          {/* Embedded Google Map */}
          <div className="relative aspect-[4/3] md:aspect-[4/3] rounded-lg overflow-hidden border-2 border-gray-700">
            <iframe
              src={embedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="El Taco Chingon Location"
              className="w-full h-full"
            />
          </div>

          {/* Info */}
          <div className="space-y-3 md:space-y-6">
            {/* Address & Phone row on mobile */}
            <div className="grid grid-cols-2 md:grid-cols-1 gap-3 md:gap-6">
              {/* Address */}
              <div className="bg-negro rounded-lg p-4 md:p-6 border-2 border-gray-700 border-l-4 border-l-rojo">
                <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-4">
                  <div className="w-9 h-9 rounded-full bg-rojo/20 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-rojo" />
                  </div>
                  <div>
                    <h3 className="font-display text-sm md:text-lg text-white mb-1 md:mb-2">{tLocation('address')}</h3>
                    <p className="text-gray-400 text-xs md:text-base leading-relaxed">
                      {addr.street}<br />
                      {addr.city}, {addr.state} {addr.zip}
                    </p>
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div className="bg-negro rounded-lg p-4 md:p-6 border-2 border-gray-700 border-l-4 border-l-verde">
                <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-4">
                  <div className="w-9 h-9 rounded-full bg-verde/20 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-verde" />
                  </div>
                  <div>
                    <h3 className="font-display text-sm md:text-lg text-white mb-1 md:mb-2">{tLocation('callUs')}</h3>
                    <a href={`tel:${settings.phone}`} className="text-amarillo hover:text-amarillo/80 transition-colors text-xs md:text-base">
                      {settings.phone}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Hours - full width */}
            <div className="bg-negro rounded-lg p-4 md:p-6 border-2 border-gray-700 border-l-4 border-l-amarillo">
              <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-4">
                <div className="w-9 h-9 rounded-full bg-amarillo/20 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-amarillo" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-sm md:text-lg text-white mb-1 md:mb-2">{tLocation('hours')}</h3>
                  <div className="text-gray-400 text-xs md:text-base space-y-1">
                    {([
                      { key: 'monday', label: tLocation('monday') },
                      { key: 'tuesday', label: tLocation('tuesday') },
                      { key: 'wednesday', label: tLocation('wednesday') },
                      { key: 'thursday', label: tLocation('thursday') },
                      { key: 'friday', label: tLocation('friday') },
                      { key: 'saturday', label: tLocation('saturday') },
                      { key: 'sunday', label: tLocation('sunday') },
                    ] as const).map((day) => {
                      const h = settings.hours[day.key];
                      return (
                        <p key={day.key} className="flex justify-between gap-4">
                          <span>{day.label}:</span>
                          {h?.open && h?.close ? (
                            <span>{formatTime(h.open)} - {formatTime(h.close)}</span>
                          ) : (
                            <span className="text-rojo font-medium">{tLocation('closedDay')}</span>
                          )}
                        </p>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <Link href="/location">
              <button className="w-full btn-order flex items-center justify-center gap-2">
                {tLocation('getDirections')}
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  const t = useTranslations('home');
  const tCommon = useTranslations('common');

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src="/images/menu/quesabirria.jpg"
          alt="Quesabirria Tacos"
          fill
          className="object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-negro via-negro/90 to-negro/70" />
      </div>

      {/* Mexican flag stripe */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-verde via-white to-rojo" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-display text-5xl md:text-7xl text-white mb-4">
          {t('readyToEat')}
        </h2>

        <p className="font-accent text-2xl text-amarillo mb-8 rotate-[-1deg]">
          {t('ctaTagline')}
        </p>

        {/* Mexican flag divider */}
        <div className="flex items-center justify-center gap-0 w-48 h-1 mx-auto mb-6">
          <div className="flex-1 h-full bg-verde" />
          <div className="flex-1 h-full bg-white" />
          <div className="flex-1 h-full bg-rojo" />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/menu">
            <button className="btn-order text-lg py-4 px-10 flex items-center justify-center gap-3 animate-pulse-glow">
              {tCommon('orderNow')}
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
