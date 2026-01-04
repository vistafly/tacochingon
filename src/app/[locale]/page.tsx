'use client';

import { useTranslations } from 'next-intl';
import { ArrowRight, MapPin, Clock, Phone, Star } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturedSection } from '@/components/home/FeaturedSection';
import { BUSINESS_INFO, ORDER_LINKS, REVIEW_LINKS } from '@/lib/constants';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="bg-negro">
      <HeroSection />
      <FeaturedSection />
      <AboutSection />
      <TestimonialsSection />
      <LocationSection />
      <CTASection />
    </div>
  );
}

function AboutSection() {
  const t = useTranslations('home');

  return (
    <section className="relative py-20 bg-negro-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className="relative">
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden border-4 border-amarillo">
              <Image
                src="/images/menu/mobile cart.jpg"
                alt="El Taco Chingon Food Truck"
                fill
                className="object-cover"
              />
            </div>
            {/* Badge */}
            <div className="absolute -bottom-4 -right-4 bg-rojo text-white px-6 py-3 rounded transform rotate-3 border-2 border-amarillo">
              <span className="font-display text-xl">EST. 2024</span>
            </div>
          </div>

          {/* Content */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-verde/20 text-verde rounded mb-6">
              <span className="font-display text-sm">OUR STORY</span>
            </div>

            <h2 className="font-display text-4xl md:text-5xl text-white mb-6">
              {t('aboutTitle')}
            </h2>

            {/* Mexican flag divider */}
            <div className="flex items-center gap-0 w-32 h-1 mb-6">
              <div className="flex-1 h-full bg-verde" />
              <div className="flex-1 h-full bg-white" />
              <div className="flex-1 h-full bg-rojo" />
            </div>

            <p className="text-lg text-gray-300 leading-relaxed mb-8">
              {t('aboutText')}
            </p>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3 p-4 bg-negro rounded border border-gray-700">
                <span className="text-2xl">🔥</span>
                <span className="font-medium text-white">Made Fresh Daily</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-negro rounded border border-gray-700">
                <span className="text-2xl">👨‍👩‍👧‍👦</span>
                <span className="font-medium text-white">Family Recipes</span>
              </div>
            </div>

            <Link href="/location">
              <button className="btn-verde flex items-center gap-2">
                {t('locationTitle')}
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
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

  // Business rating info
  const overallRating = 4.3;
  const totalReviews = 200;

  // Use centralized review URLs from constants
  const googleSearchUrl = REVIEW_LINKS.google;
  const yelpUrl = REVIEW_LINKS.yelp;

  return (
    <section className="relative py-20 bg-negro">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amarillo text-negro rounded mb-4">
            <Star className="w-4 h-4 fill-current" />
            <span className="font-display text-sm">REVIEWS</span>
          </div>

          <h2 className="font-display text-4xl md:text-5xl text-white mb-4">
            WHAT PEOPLE SAY
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
            <span className="text-gray-400 text-sm">Based on {totalReviews}+ reviews</span>
          </div>
        </div>

        {/* Testimonials grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
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
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={yelpUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#FF1A1A] hover:bg-[#D32323] text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21.111 18.226c-.141.969-2.119 3.483-3.029 3.847-.311.124-.611.094-.85-.09-.154-.12-.314-.396-2.529-4.146l-.438-.742a.625.625 0 0 0-.2-.205.498.498 0 0 0-.519.021.638.638 0 0 0-.218.246l-.707 1.217c-.108.186-.107.375.003.564.119.206 2.153 3.624 2.274 3.84.121.216.153.404.104.582-.077.281-.411.484-.856.545-.636.086-3.747-.597-4.098-.914-.156-.142-.211-.332-.173-.558.022-.13.053-.199.606-2.063l.561-1.88a.627.627 0 0 0 .019-.224.503.503 0 0 0-.386-.344.593.593 0 0 0-.315.032l-1.314.509c-.199.076-.332.227-.397.448-.071.239-.892 3.904-.987 4.202-.066.209-.168.337-.318.396-.234.091-.594.03-.963-.164-.855-.451-2.812-2.869-2.978-3.799-.056-.313.015-.551.217-.712.133-.107.288-.163 3.479-1.167l.636-.2a.667.667 0 0 0 .247-.128.507.507 0 0 0 .118-.519.632.632 0 0 0-.167-.27l-1.009-.946c-.155-.144-.351-.191-.58-.14-.246.055-3.918.896-4.218.967-.213.05-.375.026-.502-.077-.193-.156-.243-.477-.138-.865.256-.952 1.626-3.696 2.355-4.191.24-.164.481-.183.716-.055.156.084.303.236 3.201 3.224l.574.593a.616.616 0 0 0 .196.139.499.499 0 0 0 .506-.103.618.618 0 0 0 .158-.288l.226-1.392c.034-.212-.023-.389-.171-.524-.16-.147-2.814-2.907-2.971-3.076-.158-.169-.218-.326-.188-.49.046-.255.335-.424.707-.449.927-.063 4.058.504 4.498.749.158.087.251.226.281.408.019.112-.006.258-.362 2.182l-.36 1.94a.63.63 0 0 0 .001.241.5.5 0 0 0 .417.318.607.607 0 0 0 .312-.055l1.266-.581c.191-.087.312-.248.361-.478.053-.248.671-3.993.72-4.297.035-.215.131-.356.299-.437.255-.122.612-.101 1.01.061.905.367 3.097 2.484 3.323 3.433.075.316.023.561-.16.735-.12.114-.276.188-3.37 1.569l-.617.275a.658.658 0 0 0-.23.156.502.502 0 0 0-.064.526c.04.097.1.177.182.239l1.101.829c.168.126.365.151.581.074.233-.083 3.854-1.245 4.147-1.339.207-.067.374-.054.516.041.214.143.297.446.225.845z"/>
            </svg>
            Read Reviews on Yelp
          </a>
          <a
            href={googleSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-800 font-bold py-3 px-6 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Review on Google Maps
          </a>
        </div>
      </div>
    </section>
  );
}

function LocationSection() {
  const t = useTranslations('home');
  const tLocation = useTranslations('location');
  const address = `${BUSINESS_INFO.address.street}, ${BUSINESS_INFO.address.city}, ${BUSINESS_INFO.address.state} ${BUSINESS_INFO.address.zip}`;
  const embedUrl = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    ? `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(address)}`
    : `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;

  return (
    <section className="relative py-20 bg-negro-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-verde text-white rounded mb-4">
            <MapPin className="w-4 h-4" />
            <span className="font-display text-sm">FIND US</span>
          </div>

          <h2 className="font-display text-4xl md:text-5xl text-white mb-4">
            {t('locationTitle')}
          </h2>

          {/* Mexican flag divider */}
          <div className="flex items-center justify-center gap-0 w-48 h-1 mx-auto">
            <div className="flex-1 h-full bg-verde" />
            <div className="flex-1 h-full bg-white" />
            <div className="flex-1 h-full bg-rojo" />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Embedded Google Map */}
          <div className="relative aspect-video md:aspect-[4/3] rounded-lg overflow-hidden border-2 border-gray-700">
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
          <div className="space-y-6">
            {/* Address */}
            <div className="bg-negro rounded-lg p-6 border-2 border-gray-700 border-l-4 border-l-rojo">
              <div className="flex items-start gap-4">
                <MapPin className="w-6 h-6 text-rojo flex-shrink-0" />
                <div>
                  <h3 className="font-display text-lg text-white mb-2">{tLocation('address')}</h3>
                  <p className="text-gray-400">
                    {BUSINESS_INFO.address.street}<br />
                    {BUSINESS_INFO.address.city}, {BUSINESS_INFO.address.state} {BUSINESS_INFO.address.zip}
                  </p>
                </div>
              </div>
            </div>

            {/* Hours */}
            <div className="bg-negro rounded-lg p-6 border-2 border-gray-700 border-l-4 border-l-amarillo">
              <div className="flex items-start gap-4">
                <Clock className="w-6 h-6 text-amarillo flex-shrink-0" />
                <div>
                  <h3 className="font-display text-lg text-white mb-2">{tLocation('hours')}</h3>
                  <div className="text-gray-400 space-y-1">
                    <p className="flex justify-between gap-8">
                      <span>{tLocation('monday')}:</span>
                      <span className="text-rojo font-medium">{tLocation('closedDay')}</span>
                    </p>
                    <p className="flex justify-between gap-8">
                      <span>{tLocation('tuesday')} - {tLocation('sunday')}:</span>
                      <span>5:30 PM - 11:30 PM</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className="bg-negro rounded-lg p-6 border-2 border-gray-700 border-l-4 border-l-verde">
              <div className="flex items-start gap-4">
                <Phone className="w-6 h-6 text-verde flex-shrink-0" />
                <div>
                  <h3 className="font-display text-lg text-white mb-2">Call Us</h3>
                  <a href={`tel:${BUSINESS_INFO.phone}`} className="text-amarillo hover:text-amarillo/80 transition-colors">
                    {BUSINESS_INFO.phone}
                  </a>
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
  const tCommon = useTranslations('common');

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src="/images/menu/asadafries.jpg"
          alt="Asada Fries"
          fill
          className="object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-negro via-negro/90 to-negro/70" />
      </div>

      {/* Mexican flag stripe */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-verde via-white to-rojo" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-display text-5xl md:text-7xl text-white mb-4">
          READY TO EAT?
        </h2>

        <p className="font-accent text-2xl text-amarillo mb-8 rotate-[-1deg]">
          Real street tacos. Real flavor. No BS.
        </p>

        {/* Mexican flag divider */}
        <div className="flex items-center justify-center gap-0 w-48 h-1 mx-auto mb-10">
          <div className="flex-1 h-full bg-verde" />
          <div className="flex-1 h-full bg-white" />
          <div className="flex-1 h-full bg-rojo" />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/menu">
            <button className="btn-order text-lg py-4 px-10 flex items-center justify-center gap-3 animate-pulse-glow">
              {tCommon('orderNow')}
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
          <Link href="/menu">
            <button className="btn-secondary text-lg py-4 px-10">
              {tCommon('viewMenu')}
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
