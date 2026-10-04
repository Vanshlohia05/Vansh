import React, { useEffect, useRef, useCallback } from 'react';
import { ReadingSection } from './ReadingSection';
import { playClickSound } from '../utils/sound';
import { ArrowDown } from 'lucide-react';

interface StuffViewProps {
  onNavigateToWritings?: () => void;
  onNavigateToGuestbook?: () => void;
  onNavigateToStory?: () => void;
  onNavigateToHomeCV?: () => void;
  externalShuffleTrigger?: number;
}

export const StuffView: React.FC<StuffViewProps> = ({
  onNavigateToWritings,
  onNavigateToGuestbook,
  onNavigateToStory,
  onNavigateToHomeCV,
  externalShuffleTrigger,
}) => {
  const isNavigatingRef = useRef(false);
  const touchStartY = useRef<number | null>(null);
  const mountTimeRef = useRef<number>(Date.now());

  const triggerScrollToGuestbook = useCallback(() => {
    if (isNavigatingRef.current) return;
    if (Date.now() - mountTimeRef.current < 700) return; // Prevent momentum bleed-through
    isNavigatingRef.current = true;
    playClickSound('high');
    onNavigateToGuestbook?.();
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 1200);
  }, [onNavigateToGuestbook]);

  // Scroll Down only — No scroll up navigation
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (Date.now() - mountTimeRef.current < 700) return;
      const scrollPos = window.innerHeight + window.scrollY;
      const isBottom = scrollPos >= document.documentElement.scrollHeight - 20;

      if (e.deltaY > 45 && isBottom) {
        triggerScrollToGuestbook();
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (Date.now() - mountTimeRef.current < 700) return;
      if (touchStartY.current !== null) {
        const delta = touchStartY.current - e.changedTouches[0].clientY;
        const scrollPos = window.innerHeight + window.scrollY;
        const isBottom = scrollPos >= document.documentElement.scrollHeight - 20;

        if (delta > 60 && isBottom) {
          triggerScrollToGuestbook();
        }
        touchStartY.current = null;
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [triggerScrollToGuestbook]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 pt-20 pb-20 select-text page-transition font-sans">
      
      {/* ── Page 4: Pure Reading Archive & Bookshelf ───────────── */}
      <ReadingSection externalShuffleTrigger={externalShuffleTrigger} />

      {/* ── Bottom Page Continuation Bar ────────────────────── */}
      <div className="mt-16 pt-8 border-t border-neutral-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
        <div className="flex items-center gap-3">
          {onNavigateToWritings && (
            <button
              onClick={() => {
                playClickSound('tick');
                onNavigateToWritings();
              }}
              className="hover:text-black ul-link transition-colors cursor-pointer text-neutral-500"
            >
              (Writings)
            </button>
          )}

          {onNavigateToHomeCV && (
            <button
              onClick={() => {
                playClickSound('tick');
                onNavigateToHomeCV();
              }}
              className="hover:text-black ul-link transition-colors cursor-pointer text-neutral-500"
            >
              (Home/CV)
            </button>
          )}

          {onNavigateToStory && (
            <button
              onClick={() => {
                playClickSound('tick');
                onNavigateToStory();
              }}
              className="hover:text-black ul-link transition-colors cursor-pointer text-neutral-500"
            >
              (Story Lab)
            </button>
          )}
        </div>

        {/* Scroll Next Page Cue */}
        <button
          onClick={triggerScrollToGuestbook}
          className="flex items-center gap-1.5 text-xs text-black font-semibold hover:text-blue-600 transition-colors cursor-pointer animate-pulse"
        >
          <span>Scroll down for Page 5: Guestbook</span>
          <ArrowDown size={13} className="animate-bounce" />
        </button>
      </div>

    </div>
  );
};
