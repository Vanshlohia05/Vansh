import React, { useCallback, useEffect, useRef } from 'react';
import { StickmanHero } from './StickmanHero';
import { playClickSound } from '../utils/sound';
import { ArrowDown } from 'lucide-react';

interface StoryViewProps {
  onSlideChange?: (current: number, total: number, title: string) => void;
  onNavigateToHomeCV?: () => void;
  onNavigateToWritings?: () => void;
  onNavigateToStuff?: () => void;
}

export const StoryView: React.FC<StoryViewProps> = ({
  onSlideChange,
  onNavigateToHomeCV,
  onNavigateToWritings,
  onNavigateToStuff,
}) => {
  const isNavigatingRef = useRef(false);
  const touchStartY = useRef<number | null>(null);

  const handleActivityChange = useCallback(
    (title: string, step: number) => {
      onSlideChange?.(step, 4, title);
    },
    [onSlideChange]
  );

  const triggerScrollToHomeCV = useCallback(() => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    playClickSound('high');
    onNavigateToHomeCV?.();
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 1200);
  }, [onNavigateToHomeCV]);

  // Automatic Scroll Down -> Navigate to Home/CV page
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY > 40) {
        triggerScrollToHomeCV();
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartY.current !== null) {
        const delta = touchStartY.current - e.changedTouches[0].clientY;
        if (delta > 50) {
          triggerScrollToHomeCV();
        }
        touchStartY.current = null;
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        triggerScrollToHomeCV();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [triggerScrollToHomeCV]);

  return (
    <div className="relative w-full min-h-[calc(100vh-80px)] flex flex-col justify-between pt-16 pb-8 select-none px-4 page-transition">
      {/* Top Narrative Introduction */}
      <div className="max-w-4xl mx-auto w-full pt-2 pb-1 flex flex-col sm:flex-row items-start sm:items-baseline justify-between gap-2 border-b border-black/10">
        <div>
          <h1 className="text-base font-semibold tracking-tight text-black">
            Vansh Lohia <span className="font-normal text-neutral-400 font-mono text-xs">/ Interactive Story Lab [Page 1]</span>
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Articulated physics simulation • Story of a creative engineer, writer & founder
          </p>
        </div>

        <div className="text-micro font-mono text-neutral-400 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>STATUS: ALL SYSTEMS LIVE</span>
        </div>
      </div>

      {/* Main Centerpiece: Stickman Physics & Story Animation */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center my-3 w-full">
        <StickmanHero onActivityChange={handleActivityChange} />
      </div>

      {/* Bottom Navigation & Scroll Cue */}
      <div className="max-w-4xl mx-auto w-full pt-3 border-t border-black/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-4 text-neutral-500">
          <span className="text-black font-medium">Pages:</span>

          {onNavigateToHomeCV && (
            <button
              onClick={() => {
                playClickSound('high');
                onNavigateToHomeCV();
              }}
              className="hover:text-black ul-link transition-colors cursor-pointer text-black font-medium"
            >
              (Next: Home / CV →)
            </button>
          )}

          {onNavigateToWritings && (
            <button
              onClick={() => {
                playClickSound('high');
                onNavigateToWritings();
              }}
              className="hover:text-black ul-link transition-colors cursor-pointer"
            >
              (Writings)
            </button>
          )}

          {onNavigateToStuff && (
            <button
              onClick={() => {
                playClickSound('high');
                onNavigateToStuff();
              }}
              className="hover:text-black ul-link transition-colors cursor-pointer"
            >
              (Stuff)
            </button>
          )}
        </div>

        {/* Scroll Cue Button */}
        <button
          onClick={triggerScrollToHomeCV}
          className="flex items-center gap-1.5 text-micro text-neutral-500 hover:text-black transition-colors font-mono cursor-pointer animate-pulse"
          title="Scroll down to automatically open Home / CV"
        >
          <span>Scroll down for Home / CV</span>
          <ArrowDown size={11} className="animate-bounce" />
        </button>
      </div>
    </div>
  );
};
