import React, { useState, useEffect, useCallback } from 'react';
import { HOME_ARTWORKS, Artwork } from '../data/homeArtworks';
import { playClickSound } from '../utils/sound';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { StickmanHero } from './StickmanHero';

interface HomeViewProps {
  onSlideChange?: (current: number, total: number, title: string) => void;
  onOpenArtworkModal?: (artwork: Artwork) => void;
  onNavigateToStuff?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onSlideChange,
  onOpenArtworkModal,
  onNavigateToStuff,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const activeArtwork = HOME_ARTWORKS[currentIndex];

  const goToNext = useCallback(() => {
    playClickSound('tick');
    setCurrentIndex((prev) => (prev + 1) % HOME_ARTWORKS.length);
  }, []);

  const goToPrev = useCallback(() => {
    playClickSound('tick');
    setCurrentIndex((prev) => (prev - 1 + HOME_ARTWORKS.length) % HOME_ARTWORKS.length);
  }, []);

  // Update parent for header indicator
  useEffect(() => {
    if (onSlideChange && activeArtwork) {
      onSlideChange(currentIndex + 1, HOME_ARTWORKS.length, activeArtwork.title);
    }
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev]);

  return (
    <div className="relative w-full min-h-screen flex flex-col justify-between pt-16 pb-8 select-none">
      
      {/* Stickman Storytelling Hero Animation (Desktop / Laptop Only) */}
      <div className="relative z-30 w-full">
        <StickmanHero />
      </div>

      {/* Invisible Interactive Click Zones (Left half = prev, Right half = next) */}
      <div className="absolute inset-0 z-10 flex">
        <button
          onClick={goToPrev}
          title="Previous (or Left Arrow)"
          className="w-1/2 h-full cursor-w-resize focus:outline-none"
          aria-label="Previous artwork"
        />
        <button
          onClick={goToNext}
          title="Next (or Right Arrow / Space)"
          className="w-1/2 h-full cursor-e-resize focus:outline-none"
          aria-label="Next artwork"
        />
      </div>

      {/* Main Center Artwork Stage */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center px-4 py-6">
        <div 
          className="relative max-w-lg md:max-w-xl w-full flex flex-col items-center group cursor-pointer"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onClick={(e) => {
            // If clicking image directly, can open inspect or cycle
            e.stopPropagation();
            goToNext();
          }}
        >
          {/* Main Visual Frame */}
          <div className="relative w-full overflow-hidden bg-neutral-100 shadow-sm border border-neutral-200/60 rounded-sm transition-transform duration-500 ease-out group-hover:scale-[1.01]">
            <img
              key={activeArtwork.id}
              src={activeArtwork.imageUrl}
              alt={activeArtwork.title}
              className="w-full h-[52vh] sm:h-[58vh] md:h-[62vh] object-cover transition-opacity duration-500 animate-fadeIn"
              loading="eager"
            />

            {/* Subtle overlay inspect button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                playClickSound('high');
                if (onOpenArtworkModal) onOpenArtworkModal(activeArtwork);
              }}
              title="Inspect details"
              className="absolute top-3 right-3 p-1.5 bg-black/70 backdrop-blur-sm text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black"
            >
              <Maximize2 size={13} />
            </button>

            {/* Micro pill counter on image */}
            <div className="absolute bottom-3 left-3 px-2 py-0.5 bg-black/60 backdrop-blur-sm text-white text-[11px] font-mono rounded tracking-tight">
              {String(currentIndex + 1).padStart(2, '0')} / {String(HOME_ARTWORKS.length).padStart(2, '0')}
            </div>
          </div>

          {/* Under-Artwork Caption Details (Exact urfd aesthetic) */}
          <div className="w-full mt-3 flex items-baseline justify-between text-sub px-0.5">
            <div>
              <span className="font-medium text-black">
                {activeArtwork.title}
              </span>
              <span className="text-neutral-400 mx-1.5">•</span>
              <span className="text-neutral-500">
                {activeArtwork.category}
              </span>
            </div>
            <div className="text-neutral-400 font-mono text-micro">
              {activeArtwork.year}
            </div>
          </div>

          {/* Narrative Excerpt */}
          <p className="w-full text-micro text-neutral-500 mt-1 text-left line-clamp-2">
            {activeArtwork.caption}
          </p>
        </div>
      </div>

      {/* Bottom Footer Controls: "Tap for more" indicator & Quick Thumbnails */}
      <div className="relative z-20 w-full px-4 flex flex-col items-center gap-3">
        {/* "Tap for more" urfd signature micro-text */}
        <div className="flex items-center gap-2 text-micro">
          <button
            onClick={goToPrev}
            className="p-1 text-neutral-400 hover:text-black transition-colors"
            title="Previous"
          >
            <ChevronLeft size={14} />
          </button>
          
          <button
            onClick={goToNext}
            className="text-neutral-400 hover:text-black transition-colors op-50 font-normal tracking-wide"
          >
            Click or Tap for next ({currentIndex + 1}/{HOME_ARTWORKS.length})
          </button>

          <button
            onClick={goToNext}
            className="p-1 text-neutral-400 hover:text-black transition-colors"
            title="Next"
          >
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Thumbnail Dots Bar */}
        <div className="flex items-center gap-1.5">
          {HOME_ARTWORKS.map((artwork, idx) => (
            <button
              key={artwork.id}
              onClick={(e) => {
                e.stopPropagation();
                playClickSound('tick');
                setCurrentIndex(idx);
              }}
              title={artwork.title}
              className={`transition-all duration-300 rounded-full ${
                idx === currentIndex
                  ? 'w-6 h-1.5 bg-black'
                  : 'w-1.5 h-1.5 bg-neutral-300 hover:bg-neutral-500'
              }`}
            />
          ))}
        </div>

        {/* Quick jump to Stuff */}
        {onNavigateToStuff && (
          <button
            onClick={() => {
              playClickSound('high');
              onNavigateToStuff();
            }}
            className="text-micro text-neutral-400 hover:text-black ul-link mt-1"
          >
            Explore all projects & journal entries →
          </button>
        )}
      </div>

    </div>
  );
};
