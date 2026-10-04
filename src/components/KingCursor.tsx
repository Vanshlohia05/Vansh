import React, { useEffect, useRef, useState, useCallback } from 'react';
import { playClickSound } from '../utils/sound';

interface KingCursorProps {
  disabled?: boolean;
}

interface StrikeParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  born: number;
}

interface StrikeRay {
  id: number;
  x: number;
  y: number;
  angle: number;
  length: number;
}

interface BlueWisp {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  born: number;
}

interface Strike {
  id: number;
  x: number;
  y: number;
  born: number;
  rays: StrikeRay[];
}

const KING_W = 46;
const KING_H = 46;
const TIP_X = Math.round((25 / 1024) * KING_W); // 1px
const TIP_Y = Math.round((10 / 1024) * KING_H); // 0px

export const KingCursor: React.FC<KingCursorProps> = ({ disabled = false }) => {
  const [isMobile, setIsMobile] = useState<boolean>(true);
  const mousePosRef = useRef({ x: -200, y: -200 });
  const [cursorPos, setCursorPos] = useState({ x: -200, y: -200 });
  const [isVisible, setIsVisible] = useState(false);
  const [strikes, setStrikes] = useState<Strike[]>([]);
  const [particles, setParticles] = useState<StrikeParticle[]>([]);
  const [wisps, setWisps] = useState<BlueWisp[]>([]);
  const [isThrusting, setIsThrusting] = useState(false);

  const strikeIdCounter = useRef(0);
  const particleIdCounter = useRef(0);
  const wispIdCounter = useRef(0);
  const rafId = useRef<number | undefined>(undefined);

  // 1. Mobile Detection
  useEffect(() => {
    const checkMobile = () => {
      const isTouch =
        window.innerWidth < 768 ||
        window.matchMedia('(pointer: coarse)').matches ||
        'ontouchstart' in window;
      setIsMobile(isTouch);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 2. Mouse tracking for desktop
  useEffect(() => {
    if (isMobile || disabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    const loop = () => {
      setCursorPos((prev) => {
        const dx = mousePosRef.current.x - prev.x;
        const dy = mousePosRef.current.y - prev.y;
        if (Math.abs(dx) < 0.2 && Math.abs(dy) < 0.2) return prev;
        return {
          x: prev.x + dx * 0.55,
          y: prev.y + dy * 0.55,
        };
      });
      rafId.current = requestAnimationFrame(loop);
    };
    rafId.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [isMobile, disabled, isVisible]);

  // 3. Spear Strike & Word Blue Light Emission on Click
  const handleStrike = useCallback(
    (e: MouseEvent) => {
      if (isMobile || disabled) return;

      const cx = e.clientX;
      const cy = e.clientY;

      setIsThrusting(true);
      setTimeout(() => setIsThrusting(false), 120);

      playClickSound('spear');

      const textSelectors = 'h1, h2, h3, h4, p, span, a, button, td, th, li, code';
      const elements = document.querySelectorAll<HTMLElement>(textSelectors);
      const newWisps: BlueWisp[] = [];

      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const elCx = rect.left + rect.width / 2;
        const elCy = rect.top + rect.height / 2;
        const dist = Math.hypot(elCx - cx, elCy - cy);

        if (dist < 180) {
          el.classList.remove('king-struck');
          void el.offsetWidth;
          el.classList.add('king-struck');

          const wispCount = Math.min(4, Math.max(1, Math.floor(rect.width / 50)));
          for (let i = 0; i < wispCount; i++) {
            newWisps.push({
              id: ++wispIdCounter.current,
              x: rect.left + Math.random() * rect.width,
              y: rect.top + Math.random() * rect.height,
              size: 2 + Math.random() * 4,
              opacity: 1,
              born: Date.now(),
            });
          }

          setTimeout(() => el.classList.remove('king-struck'), 1300);
        }
      });

      if (newWisps.length > 0) {
        setWisps((prev) => [...prev, ...newWisps]);
        setTimeout(() => {
          setWisps((prev) => prev.filter((w) => !newWisps.find((nw) => nw.id === w.id)));
        }, 1100);
      }

      const sid = ++strikeIdCounter.current;
      const rays: StrikeRay[] = Array.from({ length: 6 }, (_, i) => ({
        id: i,
        x: cx,
        y: cy,
        angle: i * 60 + (Math.random() * 20 - 10),
        length: 18 + Math.random() * 16,
      }));

      setStrikes((prev) => [...prev, { id: sid, x: cx, y: cy, born: Date.now(), rays }]);
      setTimeout(() => setStrikes((prev) => prev.filter((s) => s.id !== sid)), 500);

      const particleColors = ['#93c5fd', '#38bdf8', '#60a5fa', '#2563eb', '#ffffff'];
      const pCount = 12 + Math.floor(Math.random() * 6);
      const newParticles: StrikeParticle[] = Array.from({ length: pCount }, () => {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 4.5;
        return {
          id: ++particleIdCounter.current,
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 2 + Math.random() * 3,
          opacity: 1,
          color: particleColors[Math.floor(Math.random() * particleColors.length)],
          born: Date.now(),
        };
      });

      setParticles((prev) => [...prev, ...newParticles]);
      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => !newParticles.find((np) => np.id === p.id)));
      }, 650);
    },
    [isMobile, disabled]
  );

  useEffect(() => {
    if (isMobile || disabled) return;
    window.addEventListener('click', handleStrike);
    return () => window.removeEventListener('click', handleStrike);
  }, [handleStrike, isMobile, disabled]);

  // 4. Particle and Wisp physics loop
  useEffect(() => {
    if (particles.length === 0 && wisps.length === 0) return;
    const tick = () => {
      const now = Date.now();
      setParticles((prev) =>
        prev
          .map((p) => {
            const age = (now - p.born) / 650;
            return {
              ...p,
              x: p.x + p.vx * 0.93,
              y: p.y + p.vy * 0.93,
              opacity: Math.max(0, 1 - age),
              size: p.size * (1 - age * 0.4),
            };
          })
          .filter((p) => p.opacity > 0)
      );

      setWisps((prev) =>
        prev
          .map((w) => {
            const age = (now - w.born) / 1100;
            return {
              ...w,
              y: w.y - 1.0,
              x: w.x + Math.sin(age * 6) * 0.4,
              opacity: Math.max(0, 1 - age),
              size: w.size * (1 + age * 0.2),
            };
          })
          .filter((w) => w.opacity > 0)
      );
    };

    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [particles, wisps]);

  if (isMobile || disabled) {
    return null;
  }

  const thrustOffset = isThrusting ? -5 : 0;
  const kingLeft = cursorPos.x - TIP_X + thrustOffset;
  const kingTop = cursorPos.y - TIP_Y + thrustOffset;

  return (
    <>
      <div
        style={{
          position: 'fixed',
          left: kingLeft,
          top: kingTop,
          width: KING_W,
          height: KING_H,
          pointerEvents: 'none',
          zIndex: 999999,
          opacity: isVisible ? 1 : 0,
          willChange: 'transform, left, top',
          transform: isThrusting
            ? 'scale(1.1) rotate(-6deg)'
            : 'scale(1) rotate(0deg)',
          transition: 'transform 0.07s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.15s ease',
          filter: isThrusting
            ? 'drop-shadow(0 0 8px rgba(56, 189, 248, 0.9)) drop-shadow(0 0 3px #ffffff)'
            : 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
        }}
      >
        <img
          src="/king-pixel.png"
          alt="Pixel King Cursor"
          draggable={false}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            objectPosition: 'top left',
            imageRendering: 'pixelated',
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: TIP_X - 2,
            top: TIP_Y - 2,
            width: 4,
            height: 4,
            borderRadius: '1px',
            backgroundColor: '#ffffff',
            boxShadow: '0 0 6px #38bdf8, 0 0 10px #2563eb',
            animation: 'tipPulse 1.8s infinite ease-in-out',
          }}
        />
      </div>

      {strikes.map((s) => (
        <div
          key={s.id}
          style={{
            position: 'fixed',
            left: s.x,
            top: s.y,
            pointerEvents: 'none',
            zIndex: 999998,
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: -24,
              top: -24,
              width: 48,
              height: 48,
              borderRadius: '50%',
              border: '2px solid rgba(56, 189, 248, 0.9)',
              background: 'radial-gradient(circle, rgba(56, 189, 248, 0.4) 0%, transparent 70%)',
              animation: 'kingStrikeRing 0.45s ease-out forwards',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: -6,
              top: -6,
              width: 12,
              height: 12,
              borderRadius: '2px',
              background: 'radial-gradient(circle, #ffffff 20%, #38bdf8 80%)',
              boxShadow: '0 0 12px #38bdf8, 0 0 24px #2563eb',
              animation: 'kingStrikeCore 0.3s ease-out forwards',
            }}
          />
          {s.rays.map((ray) => (
            <div
              key={ray.id}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: 2,
                height: ray.length,
                background: 'linear-gradient(to bottom, #ffffff, #38bdf8 60%, transparent)',
                transformOrigin: 'top center',
                transform: `rotate(${ray.angle}deg)`,
                animation: 'kingStrikeRay 0.4s ease-out forwards',
              }}
            />
          ))}
        </div>
      ))}

      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'fixed',
            left: p.x - p.size / 2,
            top: p.y - p.size / 2,
            width: p.size,
            height: p.size,
            borderRadius: '1px',
            backgroundColor: p.color,
            boxShadow: `0 0 4px ${p.color}, 0 0 8px rgba(56,189,248,${p.opacity})`,
            opacity: p.opacity,
            pointerEvents: 'none',
            zIndex: 999997,
          }}
        />
      ))}

      {wisps.map((w) => (
        <div
          key={w.id}
          style={{
            position: 'fixed',
            left: w.x - w.size / 2,
            top: w.y - w.size / 2,
            width: w.size,
            height: w.size,
            borderRadius: '1px',
            backgroundColor: '#38bdf8',
            boxShadow: `0 0 6px #38bdf8, 0 0 12px rgba(37,99,235,${w.opacity})`,
            opacity: w.opacity,
            pointerEvents: 'none',
            zIndex: 999996,
          }}
        />
      ))}
    </>
  );
};
