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

const TESTIMONIALS = [
  {
    name: 'Lulu C.',
    highlight: 'Melt in your mouth delicious',
    text: 'Fresh tacos you can taste in every bite. Corn tortillas, fresh and warm. The salsa was incredible — herbiness, brightness, and heat. 100% try this place!',
    rating: 5,
    source: 'Yelp',
    accentColor: 'verde' as const,
    image: '/images/menu/tacos.jpg',
    imageAlt: 'Fresh carne asada street tacos with cilantro and lime from El Taco Chingón Fresno',
  },
  {
    name: 'Cecilia S.',
    highlight: 'Fast, tasty, and HOT food',
    text: 'Authentic burritos, tacos, tortas — all priced right. Food comes out hot with salsa that\'s tasty and very spicy. This is the spot.',
    rating: 5,
    source: 'Yelp',
    accentColor: 'amarillo' as const,
    image: '/images/menu/quesabirria.jpg',
    imageAlt: 'Crispy quesabirria tacos with melted cheese and consomé at El Taco Chingón',
  },
  {
    name: "Andre' J S.",
    highlight: 'Sooo good — ordering again',
    text: 'Adobada fries, asada taco, chorizo taco, carnitas taco. Everything was incredible and the red salsa was nice and spicy. Definitely coming back.',
    rating: 5,
    source: 'Yelp',
    accentColor: 'rojo' as const,
    image: '/images/menu/adobada.png',
    imageAlt: 'Adobada loaded fries topped with seasoned pork and fresh salsa at El Taco Chingón',
  },
];

const ACCENT_STYLES = {
  verde: { border: 'border-verde/40 hover:border-verde', glow: 'hover:shadow-[0_0_30px_rgba(0,135,81,0.15)]', dot: 'bg-verde', gradient: 'from-verde/20' },
  amarillo: { border: 'border-amarillo/40 hover:border-amarillo', glow: 'hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]', dot: 'bg-amarillo', gradient: 'from-amarillo/20' },
  rojo: { border: 'border-rojo/40 hover:border-rojo', glow: 'hover:shadow-[0_0_30px_rgba(239,68,68,0.15)]', dot: 'bg-rojo', gradient: 'from-rojo/20' },
};

function ReviewCard({ testimonial, index, isVisible, className = '' }: { testimonial: typeof TESTIMONIALS[0] & { imageAlt?: string }; index: number; isVisible: boolean; className?: string }) {
  const styles = ACCENT_STYLES[testimonial.accentColor];
  return (
    <div
      className={`group relative bg-negro rounded-2xl border-2 flex flex-col ${styles.border} ${styles.glow} transition-all duration-500 overflow-hidden ${className}`}
      style={{
        transitionDelay: isVisible ? `${index * 150}ms` : '0ms',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
      }}
    >
      {/* Food image */}
      <div className="relative h-44 overflow-hidden shrink-0">
        <Image
          src={testimonial.image}
          alt={testimonial.imageAlt || 'Authentic Mexican food from El Taco Chingón Fresno'}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          loading="eager"
        />
        <div className="absolute inset-0 bg-linear-to-t from-negro via-negro/40 to-transparent" />
        {/* Stars floating over image */}
        <div className="absolute bottom-3 left-4 flex gap-0.5">
          {[...Array(testimonial.rating)].map((_, i) => (
            <Star key={i} className="w-4 h-4 text-amarillo fill-current drop-shadow-lg" />
          ))}
        </div>
        <span className="absolute bottom-3 right-4 text-[10px] uppercase tracking-widest text-white/70 font-medium drop-shadow-lg">
          {testimonial.source}
        </span>
      </div>

      {/* Subtle gradient bg */}
      <div className={`absolute inset-0 bg-linear-to-br ${styles.gradient} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

      <div className="relative z-10 p-6 md:p-8 pt-5 md:pt-6 flex flex-col flex-1">
        {/* Large decorative quote */}
        <span className="absolute top-3 -left-1 text-7xl font-serif text-white/5 select-none leading-none">&ldquo;</span>

        {/* Highlight phrase */}
        <p className="font-display text-xl md:text-2xl text-white mb-3 leading-tight">
          &ldquo;{testimonial.highlight}&rdquo;
        </p>

        {/* Body text */}
        <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-1">
          {testimonial.text}
        </p>

        {/* Divider */}
        <div className="flex items-center gap-0 w-12 h-0.5 mb-4">
          <div className="flex-1 h-full bg-verde" />
          <div className="flex-1 h-full bg-white/60" />
          <div className="flex-1 h-full bg-rojo" />
        </div>

        {/* Author */}
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full ${styles.dot} flex items-center justify-center text-white text-sm font-bold`}>
            {testimonial.name[0]}
          </div>
          <div>
            <span className="font-medium text-white text-sm">{testimonial.name}</span>
            <span className="block text-gray-500 text-xs">Fresno, CA</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TestimonialsSection() {
  const t = useTranslations('home');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [ratingFlipped, setRatingFlipped] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartRef = useRef<number>(0);
  const touchEndRef = useRef<number>(0);

  const testimonials = TESTIMONIALS;

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

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = e.targetTouches[0].clientX;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndRef.current = e.targetTouches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    const diff = touchStartRef.current - touchEndRef.current;
    if (Math.abs(diff) > 50) {
      diff > 0 ? goToNext() : goToPrev();
    }
  }, [goToNext, goToPrev]);

  // Intersection observer for staggered entrance
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const checkMobile = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => setIsMobile(window.innerWidth < 768), 150);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile, { passive: true });
    return () => { clearTimeout(timeout); window.removeEventListener('resize', checkMobile); };
  }, []);

  useEffect(() => {
    if (!isMobile || testimonials.length === 0 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isMobile, testimonials.length, isPaused]);

  useEffect(() => {
    return () => { if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current); };
  }, []);

  const overallRating = 4.3;
  const totalReviews = 200;
  const googleSearchUrl = REVIEW_LINKS.google;
  const yelpUrl = REVIEW_LINKS.yelp;

  return (
    <section ref={sectionRef} className="relative py-20 bg-negro-light overflow-hidden">
      {/* Subtle background texture */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
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

          {/* Overall Rating — hover on desktop, tap on mobile */}
          <div
            className="inline-block cursor-pointer"
            style={{ perspective: '600px' }}
            onClick={() => { if (isMobile) setRatingFlipped((f) => !f); }}
            onMouseEnter={() => { if (!isMobile) setRatingFlipped(true); }}
            onMouseLeave={() => { if (!isMobile) setRatingFlipped(false); }}
          >
            <div
              className="relative transition-transform duration-600 ease-in-out"
              style={{
                transformStyle: 'preserve-3d',
                transform: ratingFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
            >
              {/* Front — rating */}
              <div
                className="inline-flex flex-col items-center bg-negro border-2 border-amarillo/30 rounded-xl px-8 py-4"
                style={{ backfaceVisibility: 'hidden' }}
              >
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
                <span className="text-gray-600 text-xs mt-1 md:hidden">{t('tapToReview')}</span>
                <span className="text-gray-600 text-xs mt-1 hidden md:inline">{t('hoverToReview')}</span>
              </div>

              {/* Back — review links */}
              <div
                className="absolute inset-0 flex items-center justify-center gap-3 bg-negro border-2 border-amarillo/30 rounded-xl px-8 py-4"
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                <a
                  href={yelpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-2 bg-[#FF1A1A] hover:bg-[#D32323] text-white font-bold py-2.5 px-4 rounded-lg transition-colors text-sm"
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
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-800 font-bold py-2.5 px-4 rounded-lg transition-colors text-sm"
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
          </div>
        </div>

        {/* Mobile Carousel */}
        <div className="md:hidden mb-6" aria-hidden="true">
          <div className="relative">
            <button
              onClick={goToPrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-negro/80 border border-gray-600 rounded-full flex items-center justify-center text-white hover:bg-amarillo hover:text-negro hover:border-amarillo transition-colors"
              aria-label="Previous review"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

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
                className="flex items-stretch transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="w-full shrink-0 px-2 flex">
                    <ReviewCard testimonial={testimonial} index={0} isVisible={isVisible} className="opacity-100! translate-y-0! w-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Dot indicators */}
          <div className="flex justify-center gap-2 mt-4">
            {testimonials.map((testimonial, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? `${ACCENT_STYLES[testimonial.accentColor].dot} w-6`
                    : 'bg-gray-600 hover:bg-gray-500 w-2.5'
                }`}
                aria-label={`Go to review ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <ReviewCard key={index} testimonial={testimonial} index={index} isVisible={isVisible} />
          ))}
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
            {t('locationHeading')}
          </h2>

          {/* Mexican flag divider */}
          <div className="flex items-center justify-center gap-0 w-48 h-1 mx-auto">
            <div className="flex-1 h-full bg-verde" />
            <div className="flex-1 h-full bg-white" />
            <div className="flex-1 h-full bg-rojo" />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5 md:gap-8 md:items-stretch">
          {/* Left column: Map + Button */}
          <div className="flex flex-col gap-3 md:gap-4">
            <div className="relative aspect-4/3 md:aspect-auto md:flex-1 rounded-lg overflow-hidden border-2 border-gray-700">
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
            <a href="https://www.google.com/maps/dir/?api=1&destination=3649+N+Blackstone+Ave,+Fresno,+CA+93726" target="_blank" rel="noopener noreferrer">
              <button className="w-full btn-order flex items-center justify-center gap-2">
                {tLocation('getDirections')}
                <ArrowRight className="w-5 h-5" />
              </button>
            </a>
          </div>

          {/* Info */}
          <div className="space-y-3 md:space-y-6">
            {/* Address & Phone row on mobile */}
            <div className="grid grid-cols-2 md:grid-cols-1 gap-3 md:gap-6">
              {/* Address */}
              <div className="bg-negro rounded-lg p-4 md:p-6 border-2 border-gray-700 border-l-4 border-l-rojo">
                <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-4">
                  <div className="w-9 h-9 rounded-full bg-rojo/20 flex items-center justify-center shrink-0">
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
                  <div className="w-9 h-9 rounded-full bg-verde/20 flex items-center justify-center shrink-0">
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
                <div className="w-9 h-9 rounded-full bg-amarillo/20 flex items-center justify-center shrink-0">
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
          alt="Quesabirria tacos with melted cheese and birria consomé at El Taco Chingón Fresno"
          fill
          className="object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-linear-to-t from-negro via-negro/90 to-negro/70" />
      </div>

      {/* Mexican flag stripe */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-verde via-white to-rojo" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-display text-5xl md:text-7xl text-white mb-4">
          {t('readyToEat')}
        </h2>

        <p className="font-accent text-2xl text-amarillo mb-8 -rotate-1">
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
              {tCommon('startYourOrder')}
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
