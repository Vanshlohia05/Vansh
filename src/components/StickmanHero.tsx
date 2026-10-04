import React, { useEffect, useRef } from 'react';

export const StickmanHero: React.FC = () => {
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Only initialize IntersectionObserver and visibility listeners on desktop/laptop pointer devices
    if (!window.matchMedia('(min-width: 1024px) and (hover: hover)').matches) return;
    const el = heroRef.current;
    if (!el) return;

    // 1. Pause animations when scrolled off-screen
    const observer = new IntersectionObserver(
      ([entry]) => {
        el.classList.toggle('is-paused', !entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    observer.observe(el);

    // 2. Pause animations when browser tab is hidden/inactive
    const handleVisibility = () => {
      el.classList.toggle('is-paused', document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return (
    <section ref={heroRef} id="stickman-hero" className="hero-stage" aria-label="Animated stickman storytelling intro">
      <div className="hero-container">
        <svg
          className="hero-svg"
          viewBox="0 0 1000 450"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-hidden="true"
        >
          {/* Floor baseline */}
          <line x1="60" y1="360" x2="940" y2="360" className="svg-stroke floor-line" />

          {/* ================= BACKGROUND: SKY & WINDOW ================= */}
          <g className="window-rig">
            <rect x="740" y="70" width="160" height="150" rx="8" className="svg-stroke" />
            <line x1="820" y1="70" x2="820" y2="220" className="svg-stroke thin" />
            <line x1="740" y1="145" x2="900" y2="145" className="svg-stroke thin" />

            {/* Sun (Daytime 0-9s) */}
            <g className="sun-icon">
              <circle cx="780" cy="110" r="16" className="svg-stroke" />
              <path
                d="M780 86v-6M780 140v-6M756 110h-6M810 110h-6M763 93l-4-4M801 131l-4-4M763 127l-4 4M801 89l-4 4"
                className="svg-stroke thin"
              />
            </g>

            {/* Moon (Nighttime 10s+) */}
            <g className="moon-icon">
              <path d="M860 100 A 18 18 0 1 1 842 124 A 14 14 0 0 0 860 100 Z" className="svg-stroke" />
              <circle cx="875" cy="130" r="1.5" className="svg-fill" />
              <circle cx="835" cy="95" r="1.5" className="svg-fill" />
              <circle cx="880" cy="85" r="2" className="svg-fill" />
            </g>
          </g>

          {/* ================= SCENE 1: BED & SLEEP ================= */}
          <g className="bed-rig">
            {/* Floor Mat & Pillow */}
            <path d="M120 360 L280 360 L270 340 L130 340 Z" className="svg-stroke" />
            <rect x="135" y="328" width="34" height="14" rx="4" className="svg-stroke" />
            {/* Sleeping Stickman (Lying flat) */}
            <circle cx="155" cy="320" r="12" className="svg-stroke" />
            <path d="M167 330 L250 330" className="svg-stroke" />
            <path d="M250 330 L268 344" className="svg-stroke" />
            <path d="M190 330 L230 335" className="svg-stroke" />
          </g>

          {/* Rising "Z" Sleep Letters */}
          <g className="sleep-particles">
            <text x="180" y="300" className="z-letter z-1">
              Z
            </text>
            <text x="195" y="285" className="z-letter z-2">
              z
            </text>
            <text x="210" y="270" className="z-letter z-3">
              z
            </text>
          </g>

          {/* ================= SCENE 2 & 3: PROPS (Coffee & Audio) ================= */}
          <g className="speaker-rig">
            <rect x="360" y="325" width="24" height="35" rx="3" className="svg-stroke" />
            <circle cx="372" cy="348" r="7" className="svg-stroke thin" />
            <circle cx="372" cy="334" r="3" className="svg-stroke thin" />
            {/* Music notes */}
            <path d="M374 315 v-10 h8 v10 M374 309 h8" className="svg-stroke thin music-note m-1" />
            <path d="M386 300 v-8 h6 v8 M386 295 h6" className="svg-stroke thin music-note m-2" />
          </g>

          <g className="coffee-rig">
            {/* Cup */}
            <path d="M495 305 h14 v12 a6 6 0 0 1 -6 6 h-2 a6 6 0 0 1 -6 -6 v-12 z" className="svg-stroke thin" />
            <path d="M509 308 h3 a3 3 0 0 1 3 3 v1 a3 3 0 0 1 -3 3 h-3" className="svg-stroke thin" />
            {/* Rising Steam Wisps */}
            <path d="M499 298 c -2 -4 2 -6 0 -10" className="svg-stroke thin steam-wisp s-1" />
            <path d="M505 296 c 2 -4 -2 -6 0 -10" className="svg-stroke thin steam-wisp s-2" />
          </g>

          {/* ================= SCENE 3 & 4: WORKSTATION DESK & PC ================= */}
          <g className="desk-rig">
            {/* Desk */}
            <path d="M520 295 L720 295 M545 295 L545 360 M695 295 L695 360" className="svg-stroke" />
            {/* Monitor Stand & Screen */}
            <path d="M605 295 L635 295 M620 295 L620 270" className="svg-stroke" />
            <rect x="580" y="195" width="80" height="75" rx="4" className="svg-stroke" />
            <rect x="586" y="201" width="68" height="55" rx="2" className="svg-stroke thin screen-glow" />
            {/* Keyboard */}
            <path d="M545 293 L575 293" className="svg-stroke" />

            {/* Blinking Code Lines on Screen */}
            <g className="code-lines">
              <line x1="592" y1="210" x2="612" y2="210" className="svg-stroke code-line c-1" />
              <line x1="592" y1="218" x2="644" y2="218" className="svg-stroke code-line c-2" />
              <line x1="598" y1="226" x2="632" y2="226" className="svg-stroke code-line c-3" />
              <line x1="598" y1="234" x2="620" y2="234" className="svg-stroke code-line c-4" />
              <line x1="592" y1="242" x2="606" y2="242" className="svg-stroke code-line c-5" />
            </g>
          </g>

          {/* Ergonomic Chair */}
          <g className="chair-rig">
            {/* Backrest, Seat, Stand, Wheels */}
            <path d="M425 240 L425 305 L465 305" className="svg-stroke" />
            <path d="M440 305 L440 345 M420 360 L460 360" className="svg-stroke" />
            <circle cx="422" cy="358" r="2" className="svg-fill" />
            <circle cx="458" cy="358" r="2" className="svg-fill" />
          </g>

          {/* ================= HERO CHARACTER (STICKMAN ACTOR) ================= */}
          <g className="actor-root">
            {/* Head */}
            <circle cx="0" cy="-60" r="14" className="svg-stroke" />

            {/* Torso */}
            <line x1="0" y1="-46" x2="0" y2="0" className="svg-stroke" />

            {/* Legs & Feet */}
            <g className="left-leg">
              <line x1="0" y1="0" x2="0" y2="32" className="svg-stroke leg-upper-l" />
              <line x1="0" y1="32" x2="4" y2="60" className="svg-stroke leg-lower-l" />
            </g>
            <g className="right-leg">
              <line x1="0" y1="0" x2="0" y2="32" className="svg-stroke leg-upper-r" />
              <line x1="0" y1="32" x2="4" y2="60" className="svg-stroke leg-lower-r" />
            </g>

            {/* Arms & Hands */}
            <g className="arm-left">
              <path d="M0 -40 L-14 -15 L-2 8" className="svg-stroke arm-path-l" />
            </g>
            <g className="arm-right">
              <path d="M0 -40 L16 -20 L24 -4" className="svg-stroke arm-path-r" />
            </g>
          </g>
        </svg>

        {/* Scene 5 End: Scroll Cue */}
        <div className="scroll-cue" aria-hidden="true">
          <span className="scroll-text">Scroll</span>
          <span className="scroll-arrow">↓</span>
        </div>
      </div>
    </section>
  );
};
