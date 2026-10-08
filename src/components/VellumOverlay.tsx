import React from 'react';

interface VellumOverlayProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const VellumOverlay: React.FC<VellumOverlayProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-30 overflow-hidden select-none transition-opacity duration-300"
      style={{
        backgroundColor: 'rgba(250, 250, 248, 0.08)',
        backdropFilter: 'contrast(1.02)',
      }}
    >
      {/* ── Outer Drafting Boundary & Dimensions (Framed cleanly below header, above footer) ── */}
      <div className="absolute top-14 bottom-8 left-4 right-4 border border-blue-900/20 pointer-events-none">
        {/* Corner alignment crosshairs */}
        <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-blue-900/40" />
        <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-blue-900/40" />
        <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-blue-900/40" />
        <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-blue-900/40" />

        {/* Blueprint Plate Title Block (Cartouche docked cleanly in bottom-right corner — zero overlap with header) */}
        <div className="absolute bottom-2 right-3 hidden sm:flex items-center gap-2 font-mono text-[9px] text-blue-900/70 tracking-widest uppercase bg-white/95 backdrop-blur-xs px-2.5 py-1 border border-blue-900/25 rounded-xs shadow-xs pointer-events-auto">
          <span className="font-bold text-blue-950">PLATE 01: SWISS 12-COL TECTONIC GRID</span>
          <span>•</span>
          <span className="hidden md:inline">MODULOR φ 1.618</span>
          <span className="hidden md:inline">•</span>
          <span className="hidden lg:inline">CALQUE D'ARCHITECTE</span>
        </div>

        {/* Right Dimension Indicator */}
        <div className="absolute right-2 top-8 bottom-14 hidden md:flex flex-col justify-between items-end font-mono text-[9px] text-blue-900/40">
          <span>0.00m (MASTHEAD)</span>
          <span>+1.618 (GOLDEN FOCAL)</span>
          <span>+2.40m (SHELF PLANK REVEAL)</span>
          <span>+4.00m (FOOTER BASELINE)</span>
        </div>
      </div>

      {/* ── 12-Column Architectural Column Guides (Spaced cleanly below header & plate label) ── */}
      <div className="max-w-7xl mx-auto h-full px-4 grid grid-cols-12 gap-3 opacity-25">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="h-full border-x border-dashed border-blue-900/30 flex flex-col justify-between pt-24 pb-8"
          >
            <span className="font-mono text-[8px] text-blue-900 text-center">C{i + 1}</span>
            <span className="font-mono text-[8px] text-blue-900 text-center opacity-60">8.33%</span>
          </div>
        ))}
      </div>

      {/* ── Baseline Horizontal Drafting Lines (Starting below header) ── */}
      <div
        className="absolute inset-0 opacity-15"
        style={{
          top: '56px',
          backgroundImage:
            'linear-gradient(to bottom, rgba(30, 58, 138, 0.4) 1px, transparent 1px)',
          backgroundSize: '100% 48px',
        }}
      />

      {/* ── Architectural Studio Annotations (Hidden on mobile view) ── */}
      <div className="hidden md:block absolute bottom-16 left-8 font-mono text-[10px] text-blue-900/80 bg-white/90 border border-blue-900/30 p-2.5 rounded shadow-xs max-w-xs pointer-events-auto">
        <div className="flex items-center justify-between pb-1 mb-1 border-b border-blue-900/20 font-bold">
          <span>📐 ARCHITECT's NOTES</span>
          {onClose && (
            <button
              onClick={onClose}
              className="text-neutral-500 hover:text-black cursor-pointer text-xs"
            >
              ✕
            </button>
          )}
        </div>
        <ul className="space-y-1 text-[9px] text-blue-950/80 leading-relaxed">
          <li>• Strict 1px tectonic reveals between elements.</li>
          <li>• Bookshelf perspective: 2.5D orthographic elevation.</li>
          <li>• Pure white (#ffffff) canvas treated as sunlit museum wall.</li>
        </ul>
      </div>
    </div>
  );
};
