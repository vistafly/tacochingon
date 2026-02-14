'use client';

import { useEffect, useRef, useCallback } from 'react';

/**
 * SCarlo Developer Credit — morphing logo + text animation.
 * Animation logic from navbarlogoanimation.js,
 * CSS from src/styles.css (.navbar-logo-*, .navbar-text-*).
 * Both stacks animate in perfect sync (ping-pong at 120ms/frame).
 */

const TOTAL_FRAMES = 20;
const FRAME_INTERVAL = 120;

export function ScarloCredit() {
  const logoStackRef = useRef<HTMLSpanElement>(null);
  const textStackRef = useRef<HTMLSpanElement>(null);
  const rafRef = useRef<number>(0);

  const startLoop = useCallback(() => {
    const logoStack = logoStackRef.current;
    const textStack = textStackRef.current;
    if (!logoStack) return;

    const logoFrames = logoStack.querySelectorAll<HTMLImageElement>('.sc-frame');
    const textFrames = textStack?.querySelectorAll<HTMLImageElement>('.sc-frame');
    if (logoFrames.length === 0) return;

    let current = 0;
    let direction = 1;
    let lastTime = performance.now();

    const tick = (now: number) => {
      if (now - lastTime >= FRAME_INTERVAL) {
        // Hide current frame on both stacks
        logoFrames[current].classList.remove('visible');
        textFrames?.[current]?.classList.remove('visible');

        // Advance (ping-pong)
        current += direction;
        if (current >= logoFrames.length - 1) {
          current = logoFrames.length - 1;
          direction = -1;
        } else if (current <= 0) {
          current = 0;
          direction = 1;
        }

        // Show new frame on both stacks
        logoFrames[current].classList.add('visible');
        textFrames?.[current]?.classList.add('visible');

        lastTime = now;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    const logoStack = logoStackRef.current;
    const textStack = textStackRef.current;
    if (!logoStack) return;

    const allImgs = [
      ...logoStack.querySelectorAll<HTMLImageElement>('img'),
      ...(textStack?.querySelectorAll<HTMLImageElement>('img') ?? []),
    ];

    let loaded = 0;
    const check = () => {
      loaded++;
      if (loaded >= allImgs.length) startLoop();
    };

    allImgs.forEach((img) => {
      if (img.complete) check();
      else {
        img.onload = check;
        img.onerror = check;
      }
    });

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [startLoop]);

  // Build frame elements
  const logoFrames = [];
  const textFrames = [];
  for (let i = 0; i < TOTAL_FRAMES; i++) {
    const pad = i < 10 ? '0' + i : '' + i;
    logoFrames.push(
      <img
        key={i}
        src={`/images/brand/morph/morph-logo${pad}.png`}
        alt={i === 0 ? 'SCarlo' : ''}
        className={`sc-frame${i === 0 ? ' visible' : ''}`}
        loading="eager"
        draggable={false}
      />
    );
    textFrames.push(
      <img
        key={i}
        src={`/images/brand/morph-text/morph-text${pad}.png`}
        alt={i === 0 ? 'carlo' : ''}
        className={`sc-frame${i === 0 ? ' visible' : ''}`}
        loading="eager"
        draggable={false}
      />
    );
  }

  return (
    <>
      <style>{STYLES}</style>
      <div className="sc-credit-outer">
        <a
          href="https://scarlo.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="sc-credit-link"
          aria-label="Developed by SCarlo"
        >
          <span className="sc-text">Developed by</span>
          <span className="sc-brand">
            <span className="sc-logo-animated">
              <span className="sc-ambient" />
              <span className="sc-logo-stack" ref={logoStackRef}>
                {logoFrames}
              </span>
            </span>
            <span className="sc-text-animated">
              <span className="sc-ambient" />
              <span className="sc-text-stack" ref={textStackRef}>
                {textFrames}
              </span>
            </span>
          </span>
        </a>
      </div>
    </>
  );
}

/*
 * CSS pulled directly from scarlo src/styles.css
 * .navbar-brand, .navbar-logo-animated, .navbar-logo-stack,
 * .navbar-text-animated, .navbar-text-stack, .navbar-logo-ambient
 *
 * Scaled down ~55% for credit-badge size:
 *   Logo: 90×50 → 50×28
 *   Text: 100×50 → 55×28
 *   margin-left: -26px → -14px
 */
const STYLES = `
  @keyframes navbarAmbientPulse {
    0%, 100% { opacity: 0.6; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.08); }
  }

  .sc-credit-outer {
    display: flex;
    justify-content: center;
    padding: 10px 0 4px;
  }

  .sc-credit-link {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    text-decoration: none;
    cursor: pointer;
    position: relative;
    padding: 4px 8px;
    border-radius: 8px;
  }

  .sc-text {
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif;
    font-size: 0.8125rem;
    letter-spacing: 0.03em;
    color: #86868b;
    transition: color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    animation: textGlow 3s ease-in-out infinite;
  }

  .sc-credit-link:hover .sc-text {
    color: #c7c7cc;
    text-shadow: 0 0 12px rgba(255, 255, 255, 0.1);
  }

  /* Ambient glow spanning the whole link */
  .sc-credit-link::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 200%;
    border-radius: 50%;
    background: radial-gradient(circle,
      rgba(255, 255, 255, 0.03) 0%,
      transparent 60%);
    filter: blur(24px);
    pointer-events: none;
    z-index: -1;
    animation: navbarAmbientPulse 3s ease-in-out infinite;
  }

  .sc-credit-link:hover::before {
    background: radial-gradient(circle,
      rgba(255, 255, 255, 0.07) 0%,
      transparent 60%);
  }

  .sc-brand {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    isolation: isolate;
  }

  /* navbar-logo-animated (90×50 → 50×28) */
  .sc-logo-animated {
    position: relative;
    width: 50px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    pointer-events: none;
    isolation: isolate;
  }

  /* navbar-logo-stack */
  .sc-logo-stack {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
  }

  /* navbar-logo-stack img */
  .sc-logo-stack .sc-frame {
    position: absolute;
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    opacity: 0;
    will-change: opacity;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    transform: translateZ(0);
  }

  .sc-logo-stack .sc-frame.visible {
    opacity: 1;
  }

  /* navbar-text-animated (100×50 → 55×28, margin -26 → -14) */
  .sc-text-animated {
    position: relative;
    width: 55px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-left: -14px;
    opacity: 0.57;
    bottom: 2px;
    pointer-events: none;
    isolation: isolate;
  }

  /* navbar-text-stack */
  .sc-text-stack {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
  }

  /* navbar-text-stack img */
  .sc-text-stack .sc-frame {
    position: absolute;
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    opacity: 0;
    will-change: opacity;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    transform: translateZ(0);
    margin-left: -3px;
  }

  .sc-text-stack .sc-frame.visible {
    opacity: 1;
  }

  /* navbar-logo-ambient / navbar-text-ambient */
  .sc-ambient {
    position: absolute;
    width: 150%;
    height: 150%;
    border-radius: 50%;
    background: radial-gradient(circle,
      rgba(255, 255, 255, 0.05) 0%,
      transparent 60%);
    filter: blur(20px);
    opacity: 0.8;
    pointer-events: none;
    z-index: -1;
    animation: navbarAmbientPulse 3s ease-in-out infinite;
  }

  /* Hover — brighten the ambient glow */
  .sc-credit-link:hover .sc-ambient {
    background: radial-gradient(circle,
      rgba(255, 255, 255, 0.1) 0%,
      transparent 60%);
  }

  @media (prefers-reduced-motion: reduce) {
    .sc-ambient { animation: none; }
  }
`;
