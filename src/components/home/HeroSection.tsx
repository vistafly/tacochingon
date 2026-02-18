'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { gsap } from 'gsap';
import { ArrowRight, ArrowLeft, MapPin, Star } from 'lucide-react';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { mockMenuItems } from '@/data/mock-menu';
import { useSettings } from '@/hooks/useSettings';

import type { Locale } from '@/types';
import { ImageLoadingDots } from '@/components/ui/ImageLoadingDots';

const SLIDE_DURATION = 6000;
const PAUSE_DURATION = 8000;

// ── WebGL Smoke Shader ──
const VERT = `attribute vec2 a_pos;void main(){gl_Position=vec4(a_pos,0,1);}`;

const FRAG = `
precision highp float;
uniform float u_time;
uniform vec2 u_res;
uniform vec2 u_mouse;

float hash(vec2 p){
  vec3 p3=fract(vec3(p.xyx)*vec3(.1031,.1030,.0973));
  p3+=dot(p3,p3.yxz+33.33);
  return fract((p3.x+p3.y)*p3.z);
}

float noise(vec2 p){
  vec2 i=floor(p),f=fract(p);
  f=f*f*(3.0-2.0*f);
  float a=hash(i),b=hash(i+vec2(1,0)),c=hash(i+vec2(0,1)),d=hash(i+vec2(1,1));
  return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);
}

float fbm(vec2 p){
  float v=0.0,a=0.5;
  mat2 rot=mat2(0.8,-0.6,0.6,0.8);
  for(int i=0;i<5;i++){
    v+=a*noise(p);
    p=rot*p*2.0;
    a*=0.5;
  }
  return v;
}

void main(){
  vec2 uv=gl_FragCoord.xy/u_res;
  uv.y=1.0-uv.y;
  float t=u_time;

  // Mouse interaction — gentle smoke parting
  vec2 mDelta=uv-u_mouse;
  float mDist=length(mDelta);
  float mFalloff=smoothstep(0.18,0.0,mDist);
  uv-=normalize(mDelta+vec2(0.0001))*mFalloff*0.025;

  // Domain warping pass 1
  vec2 q=vec2(
    fbm(uv*2.5+vec2(t*0.08,1.7)),
    fbm(uv*2.5+vec2(4.3,t*0.06+2.9))
  );

  // Domain warping pass 2
  vec2 w=uv+0.65*q;
  vec2 r=vec2(
    fbm(w*2.5+vec2(t*0.04+1.7,3.2)),
    fbm(w*2.5+vec2(8.1,t*0.035+5.8))
  );

  // Final smoke
  vec2 f=uv+0.5*r;
  float smoke=fbm(f*3.0+vec2(t*0.05,0.0));
  smoke=pow(smoke,0.8)*1.1;
  smoke=clamp(smoke,0.0,1.0);

  // Vertical fade — visible across full height, slightly thicker at bottom
  smoke*=0.6+0.4*uv.y;

  // Soft vignette — only darken far edges
  vec2 vc=uv-0.5;
  float vig=1.0-dot(vc*vec2(0.8,1.0),vc*vec2(0.8,1.0));
  vig=clamp(vig,0.0,1.0);
  smoke*=smoothstep(0.0,0.4,vig);

  // Soft gaussian dimming at cursor center
  float ar=u_res.x/u_res.y;
  float md=length(mDelta*vec2(ar,1.0));
  smoke*=1.0-0.2*exp(-md*md*1200.0);

  // Color — visible warm gray
  vec3 col=vec3(smoke*0.7,smoke*0.6,smoke*0.48);

  gl_FragColor=vec4(col,smoke);
}
`;

function initSmoke(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false });
  if (!gl) return null;

  function compile(type: number, src: string) {
    const s = gl!.createShader(type)!;
    gl!.shaderSource(s, src);
    gl!.compileShader(s);
    return s;
  }

  const prog = gl.createProgram()!;
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  // Full-screen quad
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, 'a_pos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uTime = gl.getUniformLocation(prog, 'u_time');
  const uRes = gl.getUniformLocation(prog, 'u_res');
  const uMouse = gl.getUniformLocation(prog, 'u_mouse');

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  let time = 0;
  let animId: number | null = null;
  let mouseX = -1, mouseY = -1;
  let targetMouseX = -1, targetMouseY = -1;
  let paused = false;

  function render() {
    if (!gl || paused) { animId = null; return; }

    // Smooth mouse lerp for natural trailing
    mouseX += (targetMouseX - mouseX) * 0.3;
    mouseY += (targetMouseY - mouseY) * 0.3;

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniform1f(uTime, time);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform2f(uMouse!, mouseX, mouseY);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    time += 0.01;
    animId = requestAnimationFrame(render);
  }

  render();

  return {
    destroy: () => { if (animId != null) cancelAnimationFrame(animId); },
    setMouse: (x: number, y: number) => { targetMouseX = x; targetMouseY = y; },
    pause: () => { paused = true; },
    resume: () => { if (paused) { paused = false; if (animId == null) render(); } },
  };
}

export function HeroSection() {
  const t = useTranslations('home');
  const tCommon = useTranslations('common');
  const locale = useLocale() as Locale;
  const heroRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const smokeRef = useRef<{ destroy: () => void; setMouse: (x: number, y: number) => void; pause: () => void; resume: () => void } | null>(null);
  const slideRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { settings } = useSettings();

  // Combine toggle + schedule for accurate open/closed status
  const isStoreOpen = useMemo(() => {
    if (!settings.isOpen || !settings.isAcceptingOrders) return false;
    const now = new Date();
    const dayKey = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof typeof settings.hours;
    const dayHours = settings.hours[dayKey];
    if (!dayHours) return false;
    const [oH, oM] = dayHours.open.split(':').map(Number);
    const [cH, cM] = dayHours.close.split(':').map(Number);
    const mins = now.getHours() * 60 + now.getMinutes();
    return mins >= oH * 60 + oM && mins < cH * 60 + cM;
  }, [settings]);

  const featuredItems = mockMenuItems.filter(item => item.isFeatured);

  const pauseAutoScroll = useCallback(() => {
    setIsPaused(true);
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    pauseTimeoutRef.current = setTimeout(() => setIsPaused(false), PAUSE_DURATION);
  }, []);

  const animateSlide = useCallback((direction: 'next' | 'prev' | 'jump', targetIndex?: number) => {
    if (isAnimating || !slideRef.current) return;
    setIsAnimating(true);
    const newIndex = direction === 'jump' && targetIndex !== undefined
      ? targetIndex
      : direction === 'next'
        ? (currentIndex + 1) % featuredItems.length
        : (currentIndex - 1 + featuredItems.length) % featuredItems.length;

    gsap.to(slideRef.current, {
      opacity: 0, scale: 0.95, duration: 0.25, ease: 'power2.in',
      onComplete: () => {
        setCurrentIndex(newIndex);
        requestAnimationFrame(() => {
          if (slideRef.current) {
            gsap.to(slideRef.current, {
              opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out',
              onComplete: () => setIsAnimating(false),
            });
          } else setIsAnimating(false);
        });
      },
    });
  }, [isAnimating, featuredItems.length, currentIndex]);

  const goToNext = useCallback(() => { animateSlide('next'); pauseAutoScroll(); }, [animateSlide, pauseAutoScroll]);
  const goToPrev = useCallback(() => { animateSlide('prev'); pauseAutoScroll(); }, [animateSlide, pauseAutoScroll]);
  const goToSlide = useCallback((index: number) => {
    if (index === currentIndex) return;
    animateSlide('jump', index); pauseAutoScroll();
  }, [currentIndex, animateSlide, pauseAutoScroll]);

  useEffect(() => {
    if (featuredItems.length === 0 || isPaused) return;
    const interval = setInterval(() => { if (!isAnimating) animateSlide('next'); }, SLIDE_DURATION);
    return () => clearInterval(interval);
  }, [isAnimating, animateSlide, featuredItems.length, isPaused]);

  useEffect(() => { return () => { if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current); }; }, []);

  // ── WebGL smoke setup ──
  useEffect(() => {
    const canvas = canvasRef.current;
    const hero = heroRef.current;
    if (!canvas || !hero) return;

    let resizeTimeout: NodeJS.Timeout;
    function resize() {
      if (!canvas || !hero) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = hero.offsetHeight * dpr;
    }
    function debouncedResize() {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resize, 200);
    }
    resize();

    window.addEventListener('resize', debouncedResize, { passive: true });

    smokeRef.current = initSmoke(canvas);

    // Pause WebGL rendering when hero is scrolled out of view
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          smokeRef.current?.resume();
        } else {
          smokeRef.current?.pause();
        }
      },
      { threshold: 0 }
    );
    observer.observe(hero);

    return () => {
      observer.disconnect();
      clearTimeout(resizeTimeout);
      smokeRef.current?.destroy();
      smokeRef.current = null;
      window.removeEventListener('resize', debouncedResize);
    };
  }, []);

  // GSAP entrance animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to('.hero-badge', { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
      gsap.to('.hero-title', { opacity: 1, y: 0, duration: 0.6, delay: 0.1, ease: 'power2.out' });
      gsap.to('.hero-subtitle', { opacity: 1, y: 0, duration: 0.6, delay: 0.3, ease: 'power2.out' });
      gsap.to('.hero-buttons', { opacity: 1, y: 0, duration: 0.6, delay: 0.5, ease: 'power2.out' });
      gsap.to('.hero-carousel', { opacity: 1, scale: 1, duration: 0.8, delay: 0.4, ease: 'power2.out' });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  const currentItem = featuredItems.length > 0 ? featuredItems[currentIndex] : null;

  return (
    <section
      ref={heroRef}
      className="relative min-h-[90vh] bg-negro overflow-hidden cursor-none"
      onMouseMove={(e) => {
        const rect = heroRef.current?.getBoundingClientRect();
        if (!rect || !smokeRef.current) return;
        smokeRef.current.setMouse(
          (e.clientX - rect.left) / rect.width,
          (e.clientY - rect.top) / rect.height
        );
      }}
      onMouseLeave={() => {
        smokeRef.current?.setMouse(-1, -1);
      }}
      onTouchStart={(e) => {
        const touch = e.touches[0];
        const rect = heroRef.current?.getBoundingClientRect();
        if (!rect || !smokeRef.current || !touch) return;
        smokeRef.current.setMouse(
          (touch.clientX - rect.left) / rect.width,
          (touch.clientY - rect.top) / rect.height
        );
      }}
      onTouchMove={(e) => {
        const touch = e.touches[0];
        const rect = heroRef.current?.getBoundingClientRect();
        if (!rect || !smokeRef.current || !touch) return;
        smokeRef.current.setMouse(
          (touch.clientX - rect.left) / rect.width,
          (touch.clientY - rect.top) / rect.height
        );
      }}
      onTouchEnd={() => smokeRef.current?.setMouse(-1, -1)}
    >

      {/* === WebGL smoke — full resolution, GPU rendered === */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Text */}
          <div>
            <div className="hero-badge flex items-center justify-center sm:justify-start gap-2 sm:gap-3 mb-6 opacity-0" style={{ transform: 'translateY(20px)' }}>
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-negro-light border border-amarillo/30 rounded">
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amarillo" />
                <span className="text-xs sm:text-sm text-white font-medium">{settings.address.city}, {settings.address.state}</span>
              </div>
              <div className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded ${
                isStoreOpen ? 'bg-verde/20 border border-verde/30' : 'bg-rojo/20 border border-rojo/30'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isStoreOpen ? 'bg-verde animate-pulse' : 'bg-rojo'}`} />
                <span className={`text-xs sm:text-sm font-medium ${isStoreOpen ? 'text-verde' : 'text-rojo'}`}>
                  {isStoreOpen ? tCommon('openNow') : tCommon('closed')}
                </span>
              </div>
            </div>

            <h1 className="hero-title mb-6 opacity-0 whitespace-nowrap lg:whitespace-normal" style={{ transform: 'translateY(40px)' }}>
              <span className="font-display text-[clamp(4rem,15vw,7rem)] md:text-8xl lg:text-9xl text-white leading-none" style={{ textShadow: '0 0 0.03em rgba(255,255,255,0.5), 0 0 0.09em rgba(255,255,255,0.2), 0 0 0.27em rgba(255,255,255,0.08), 0.04em 0.03em 0.01em rgba(0,0,0,0.8), 0.08em 0.06em 0.04em rgba(0,0,0,0.55), 0.12em 0.09em 0.09em rgba(0,0,0,0.3), 0.19em 0.14em 0.23em rgba(0,0,0,0.15)' }}>
                EL TACO{' '}
              </span>
              <span className="font-display text-[clamp(4rem,15vw,7rem)] md:text-8xl lg:text-9xl text-amarillo leading-none lg:block" style={{ textShadow: '0.04em 0.03em 0 #E31C25, 0 0 0.03em rgba(255,230,100,0.9), 0 0 0.085em rgba(245,180,50,0.7), 0 0 0.2em rgba(240,130,30,0.45), 0 0 0.4em rgba(227,28,37,0.35), 0 0 0.6em rgba(227,28,37,0.15), 0.05em 0.04em 0.12em rgba(200,20,30,0.6), 0.08em 0.06em 0.015em rgba(0,0,0,0.8), 0.12em 0.09em 0.05em rgba(0,0,0,0.5), 0.17em 0.14em 0.12em rgba(0,0,0,0.28), 0.23em 0.19em 0.27em rgba(0,0,0,0.15)' }}>
                CHINGON
              </span>
            </h1>

            <p className="hero-subtitle text-[clamp(0.85rem,3.5vw,1.5rem)] md:text-2xl text-gray-300 mb-6 opacity-0 lg:hidden" style={{ transform: 'translateY(30px)' }}>
              {t('heroSubtitle')}
            </p>

            <p className="hero-subtitle font-accent text-2xl md:text-3xl text-amarillo mb-12 sm:mb-16 -rotate-2 opacity-0" style={{ transform: 'translateY(30px)' }}>
              {t('heroTagline')}
            </p>

            <div className="hero-buttons flex flex-row gap-5 opacity-0" style={{ transform: 'translateY(20px)' }}>
              <Link href="/menu" className="cursor-pointer">
                <button className="btn-order flex items-center justify-center gap-1.5 sm:gap-3 text-xs sm:text-base py-1.5 px-3 sm:py-3 sm:px-6 whitespace-nowrap cursor-pointer">
                  {tCommon('browseOurMenu')}
                  <ArrowRight className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                </button>
              </Link>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(`${settings.address.street} ${settings.address.city} ${settings.address.state} ${settings.address.zip}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer"
              >
                <button className="btn-verde flex items-center justify-center gap-1.5 sm:gap-3 text-xs sm:text-base py-1.5 px-3 sm:py-3 sm:px-6 whitespace-nowrap cursor-pointer">
                  <MapPin className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                  {t('locationTitle')}
                </button>
              </a>
            </div>
          </div>

          {/* Right side - Featured Carousel */}
          <div className="hero-carousel relative hidden lg:block opacity-0" style={{ transform: 'scale(0.9)' }}>
            {currentItem && (
              <div className="relative">
                <div className="relative w-full max-w-md mx-auto">
                  <div className="absolute inset-0 bg-amarillo rounded-lg transform rotate-3" />
                  <div className="absolute inset-0 bg-rojo rounded-lg transform -rotate-3" />

                  <div
                    ref={slideRef}
                    className="relative bg-negro-light rounded-lg overflow-hidden border-4 border-amarillo cursor-auto"
                  >
                    <div className="relative aspect-square">
                      {/* Pre-render all featured images stacked — eliminates
                          flicker by keeping them loaded in the DOM */}
                      {featuredItems.map((item, index) => (
                        <div
                          key={item.id}
                          className={`absolute inset-0 ${index === currentIndex ? 'z-1' : 'z-0 invisible'}`}
                        >
                          <ImageLoadingDots />
                          {item.image && !item.image.includes('placeholder') && (
                            <Image
                              src={item.image}
                              alt={item.name[locale]}
                              fill
                              sizes="(max-width: 768px) 100vw, 50vw"
                              className="object-cover"
                            />
                          )}
                        </div>
                      ))}

                      <div className="absolute top-3 left-3 bg-amarillo text-negro px-3 py-1 rounded z-2">
                        <span className="font-display text-xs flex items-center gap-1 uppercase">
                          <Star className="w-3 h-3 fill-current" />
                          {tCommon('featured')}
                        </span>
                      </div>

                      <div className="absolute inset-0 bg-linear-to-t from-negro via-transparent to-transparent z-2" />
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-4 pt-16">
                      <span className="text-xs text-amarillo font-display uppercase">
                        {currentItem.categoryId}
                      </span>
                      <p className="font-display text-xl text-white mt-1">
                        {currentItem.name[locale]}
                      </p>
                      <div className="flex items-center justify-end mt-3">
                        <Link href="/menu" className="cursor-pointer">
                          <button className="btn-order text-sm py-2 px-6 uppercase cursor-pointer">
                            {tCommon('order')}
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={goToPrev}
                    disabled={isAnimating}
                    className="absolute -left-14 top-1/2 -translate-y-1/2 w-10 h-10 bg-negro-light border-2 border-amarillo rounded-full flex items-center justify-center text-white hover:bg-amarillo hover:text-negro transition-colors duration-200 disabled:opacity-50 shadow-lg z-10 cursor-pointer"
                    aria-label="Previous slide"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <button
                    onClick={goToNext}
                    disabled={isAnimating}
                    className="absolute -right-14 top-1/2 -translate-y-1/2 w-10 h-10 bg-negro-light border-2 border-amarillo rounded-full flex items-center justify-center text-white hover:bg-amarillo hover:text-negro transition-colors duration-200 disabled:opacity-50 shadow-lg z-10 cursor-pointer"
                    aria-label="Next slide"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2 mt-6">
                  {featuredItems.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      disabled={isAnimating}
                      className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                        index === currentIndex
                          ? 'bg-amarillo w-6'
                          : 'bg-gray-600 hover:bg-gray-500 w-2'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>

                <div className="absolute -top-6 right-9 z-10 bg-rojo text-white px-5 py-2 rounded transform rotate-6 border-2 border-amarillo">
                  <span className="font-display text-xl uppercase">${currentItem.price.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0 z-1">
        <svg viewBox="0 0 1440 50" fill="none" className="w-full" preserveAspectRatio="none">
          <path
            d="M0 50V35C240 12 480 0 720 0C960 0 1200 12 1440 35V50H0Z"
            fill="#1A1A1A"
          />
        </svg>
      </div>
    </section>
  );
}