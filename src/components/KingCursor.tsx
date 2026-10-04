import React, { useEffect, useRef, useState, useCallback } from 'react';
import { playClickSound } from '../utils/sound';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
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

interface StrikeRays {
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
  rays: StrikeRays[];
}

// ─────────────────────────────────────────────
// Geometry: King sprite & spear tip
// In the 1024x1024 sprite, the spear tip is at pixel (44, 46).
// Rendered dimensions: 110 x 110 px
// ─────────────────────────────────────────────
const KING_W = 110;
const KING_H = 110;
const TIP_X = Math.round((44 / 1024) * KING_W); // 5px
const TIP_Y = Math.round((46 / 1024) * KING_H); // 5px

export const KingCursor: React.FC = () => {
  const mousePosRef = useRef({ x: -400, y: -400 });
  const [cursorPos, setCursorPos] = useState({ x: -400, y: -400 });
  const [strikes, setStrikes] = useState<Strike[]>([]);
  const [particles, setParticles] = useState<StrikeParticle[]>([]);
  const [wisps, setWisps] = useState<BlueWisp[]>([]);
  const [isThrusting, setIsThrusting] = useState(false);
  
  const strikeIdCounter = useRef(0);
  const particleIdCounter = useRef(0);
  const wispIdCounter = useRef(0);
  const rafId = useRef<number>();

  // Smooth cursor follow with minimal latency
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const loop = () => {
      setCursorPos((prev) => {
        const dx = mousePosRef.current.x - prev.x;
        const dy = mousePosRef.current.y - prev.y;
        // Ultra-responsive spring
        if (Math.abs(dx) < 0.2 && Math.abs(dy) < 0.2) return prev;
        return {
          x: prev.x + dx * 0.45,
          y: prev.y + dy * 0.45,
        };
      });
      rafId.current = requestAnimationFrame(loop);
    };
    rafId.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  // Click handler: spear strike + word blue light emission
  const handleStrike = useCallback((e: MouseEvent) => {
    const cx = e.clientX;
    const cy = e.clientY;

    // Trigger king thrust animation
    setIsThrusting(true);
    setTimeout(() => setIsThrusting(false), 140);

    // Play spear hit sound
    playClickSound('spear');

    // 1. Emit Blue Lights on Words around the spear tip
    const textSelectors = 'h1, h2, h3, h4, p, span, a, button, td, th, li, code';
    const elements = document.querySelectorAll<HTMLElement>(textSelectors);
    const newWisps: BlueWisp[] = [];

    elements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const elCx = rect.left + rect.width / 2;
      const elCy = rect.top + rect.height / 2;
      const dist = Math.hypot(elCx - cx, elCy - cy);

      // Elements within 220px of spear strike ignite with blue lights
      if (dist < 220) {
        el.classList.remove('king-struck');
        void el.offsetWidth; // Trigger DOM reflow to restart CSS animation
        el.classList.add('king-struck');

        // Spawn floating blue light embers from the struck word
        const wispCount = Math.min(6, Math.max(2, Math.floor(rect.width / 40)));
        for (let i = 0; i < wispCount; i++) {
          newWisps.push({
            id: ++wispIdCounter.current,
            x: rect.left + Math.random() * rect.width,
            y: rect.top + Math.random() * rect.height,
            size: 3 + Math.random() * 5,
            opacity: 1,
            born: Date.now(),
          });
        }

        setTimeout(() => el.classList.remove('king-struck'), 1400);
      }
    });

    if (newWisps.length > 0) {
      setWisps((prev) => [...prev, ...newWisps]);
      setTimeout(() => {
        setWisps((prev) => prev.filter((w) => !newWisps.find((nw) => nw.id === w.id)));
      }, 1200);
    }

    // 2. Spear Strike visual fx at the exact spear point
    const sid = ++strikeIdCounter.current;
    const rays: StrikeRays[] = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: cx,
      y: cy,
      angle: (i * 45) + (Math.random() * 20 - 10),
      length: 28 + Math.random() * 24,
    }));

    setStrikes((prev) => [...prev, { id: sid, x: cx, y: cy, born: Date.now(), rays }]);
    setTimeout(() => setStrikes((prev) => prev.filter((s) => s.id !== sid)), 600);

    // 3. High-velocity electric blue particles
    const particleColors = ['#93c5fd', '#60a5fa', '#3b82f6', '#38bdf8', '#ffffff'];
    const pCount = 18 + Math.floor(Math.random() * 10);
    const newParticles: StrikeParticle[] = Array.from({ length: pCount }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.5 + Math.random() * 6.5;
      return {
        id: ++particleIdCounter.current,
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 4,
        opacity: 1,
        color: particleColors[Math.floor(Math.random() * particleColors.length)],
        born: Date.now(),
      };
    });

    setParticles((prev) => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.find((np) => np.id === p.id)));
    }, 750);
  }, []);

  // Attach global click and mousedown listeners
  useEffect(() => {
    window.addEventListener('click', handleStrike);
    return () => {
      window.removeEventListener('click', handleStrike);
    };
  }, [handleStrike]);

  // Particle & Wisp physics animation loop
  useEffect(() => {
    if (particles.length === 0 && wisps.length === 0) return;
    const tick = () => {
      const now = Date.now();
      setParticles((prev) =>
        prev
          .map((p) => {
            const age = (now - p.born) / 750;
            return {
              ...p,
              x: p.x + p.vx * 0.94,
              y: p.y + p.vy * 0.94,
              opacity: Math.max(0, 1 - age),
              size: p.size * (1 - age * 0.4),
            };
          })
          .filter((p) => p.opacity > 0)
      );

      setWisps((prev) =>
        prev
          .map((w) => {
            const age = (now - w.born) / 1200;
            return {
              ...w,
              y: w.y - 1.2, // Float upward like glowing blue spirits
              x: w.x + Math.sin(age * 8) * 0.6,
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

  // Spear tip alignment:
  // Mouse position (cursorPos.x, cursorPos.y) aligns precisely with spear tip (TIP_X, TIP_Y).
  // When thrusting, spear lunges -8px along spear axis (up-left) and returns!
  const thrustOffset = isThrusting ? -10 : 0;
  const kingLeft = cursorPos.x - TIP_X + thrustOffset;
  const kingTop = cursorPos.y - TIP_Y + thrustOffset;

  return (
    <>
      {/* ── Indian King with Spear Cursor ───────────────── */}
      <div
        style={{
          position: 'fixed',
          left: kingLeft,
          top: kingTop,
          width: KING_W,
          height: KING_H,
          pointerEvents: 'none',
          zIndex: 999999,
          willChange: 'transform, left, top',
          transform: isThrusting
            ? 'scale(1.08) rotate(-6deg)'
            : 'scale(1) rotate(0deg)',
          transition: 'transform 0.08s cubic-bezier(0.16, 1, 0.3, 1)',
          filter: isThrusting
            ? 'drop-shadow(0 0 16px rgba(56, 189, 248, 0.95)) drop-shadow(0 0 5px #ffffff)'
            : 'drop-shadow(0 3px 6px rgba(0, 0, 0, 0.35))',
        }}
      >
        <img
          src="/king-cursor.png"
          alt="King Cursor"
          draggable={false}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            objectPosition: 'top left',
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        />
        {/* Glowing aura at the tip of the spear */}
        <div
          style={{
            position: 'absolute',
            left: TIP_X - 4,
            top: TIP_Y - 4,
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: 'radial-gradient(circle, #ffffff 0%, #38bdf8 60%, rgba(37,99,235,0) 100%)',
            boxShadow: '0 0 10px #38bdf8, 0 0 18px #2563eb',
            animation: 'tipPulse 1.8s infinite ease-in-out',
          }}
        />
      </div>

      {/* ── Spear Strike Impact Burst at (cx, cy) ──────── */}
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
          {/* Shockwave expanding ring */}
          <div
            style={{
              position: 'absolute',
              left: -48,
              top: -48,
              width: 96,
              height: 96,
              borderRadius: '50%',
              border: '2px solid rgba(56, 189, 248, 0.9)',
              background: 'radial-gradient(circle, rgba(56, 189, 248, 0.4) 0%, rgba(37, 99, 235, 0.15) 50%, transparent 75%)',
              animation: 'kingStrikeRing 0.5s ease-out forwards',
            }}
          />

          {/* Piercing white-blue core impact spark */}
          <div
            style={{
              position: 'absolute',
              left: -14,
              top: -14,
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'radial-gradient(circle, #ffffff 10%, #60a5fa 60%, transparent 100%)',
              boxShadow: '0 0 20px #38bdf8, 0 0 40px #2563eb',
              animation: 'kingStrikeCore 0.35s ease-out forwards',
            }}
          />

          {/* Electric energy rays radiating from spear point */}
          {s.rays.map((ray) => (
            <div
              key={ray.id}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: 2,
                height: ray.length,
                background: 'linear-gradient(to bottom, #ffffff, #38bdf8 40%, transparent)',
                transformOrigin: 'top center',
                transform: `rotate(${ray.angle}deg)`,
                animation: 'kingStrikeRay 0.45s ease-out forwards',
              }}
            />
          ))}
        </div>
      ))}

      {/* ── Electric Blue Particles ────────────────────── */}
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'fixed',
            left: p.x - p.size / 2,
            top: p.y - p.size / 2,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            backgroundColor: p.color,
            boxShadow: `0 0 8px ${p.color}, 0 0 16px rgba(56,189,248,${p.opacity})`,
            opacity: p.opacity,
            pointerEvents: 'none',
            zIndex: 999997,
          }}
        />
      ))}

      {/* ── Blue Wisps rising from struck words ────────── */}
      {wisps.map((w) => (
        <div
          key={w.id}
          style={{
            position: 'fixed',
            left: w.x - w.size / 2,
            top: w.y - w.size / 2,
            width: w.size,
            height: w.size,
            borderRadius: '50%',
            background: 'radial-gradient(circle, #ffffff 0%, #38bdf8 50%, #2563eb 100%)',
            boxShadow: `0 0 10px #38bdf8, 0 0 20px rgba(37,99,235,${w.opacity})`,
            opacity: w.opacity,
            pointerEvents: 'none',
            zIndex: 999996,
          }}
        />
      ))}
    </>
  );
};
