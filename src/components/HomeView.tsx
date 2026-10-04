import React, { useCallback } from 'react';
import { StickmanHero } from './StickmanHero';
import { playClickSound } from '../utils/sound';

interface HomeViewProps {
  onSlideChange?: (current: number, total: number, title: string) => void;
  onNavigateToStuff?: () => void;
  onNavigateToWritings?: () => void;
  onNavigateToGuestbook?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onSlideChange,
  onNavigateToStuff,
  onNavigateToWritings,
  onNavigateToGuestbook,
}) => {
  const handleActivityChange = useCallback(
    (title: string, step: number) => {
      onSlideChange?.(step, 5, title);
    },
    [onSlideChange]
  );

  return (
    <div className="relative w-full min-h-[calc(100vh-80px)] flex flex-col justify-between pt-16 pb-8 select-none px-4">
      {/* Top Narrative Introduction (Minimalist urfd aesthetic) */}
      <div className="max-w-4xl mx-auto w-full pt-2 pb-1 flex flex-col sm:flex-row items-start sm:items-baseline justify-between gap-2 border-b border-black/10">
        <div>
          <h1 className="text-base font-semibold tracking-tight text-black">
            Vansh Lohia <span className="font-normal text-neutral-400 font-mono text-xs">/ Creative Engineering Lab</span>
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Real-time articulated physics simulation • 60 FPS Verlet Kinematics & Interactive Story
          </p>
        </div>

        <div className="text-micro font-mono text-neutral-400 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>STATUS: ALL SYSTEMS LIVE</span>
        </div>
      </div>

      {/* Main Centerpiece: Proper Physics Stickman Animation */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center my-3 w-full">
        <StickmanHero onActivityChange={handleActivityChange} />
      </div>

      {/* Bottom Navigation & Contextual Explore Links */}
      <div className="max-w-4xl mx-auto w-full pt-3 border-t border-black/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-4 text-neutral-500">
          <span className="text-black font-medium">Explore:</span>

          {onNavigateToStuff && (
            <button
              onClick={() => {
                playClickSound('high');
                onNavigateToStuff();
              }}
              className="hover:text-black ul-link transition-colors cursor-pointer"
            >
              (Stuff & Projects)
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
              (Writings & Essays)
            </button>
          )}

          {onNavigateToGuestbook && (
            <button
              onClick={() => {
                playClickSound('high');
                onNavigateToGuestbook();
              }}
              className="hover:text-black ul-link transition-colors cursor-pointer"
            >
              (Sign Guestbook)
            </button>
          )}
        </div>

        <div className="text-micro text-neutral-400">
          Click canvas to drop physics props • Hotkeys [1-4]
        </div>
      </div>
    </div>
  );
};
