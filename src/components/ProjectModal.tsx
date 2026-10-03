import React, { useEffect } from 'react';
import { StuffItem } from '../data/stuff';
import { Artwork } from '../data/homeArtworks';
import { playClickSound } from '../utils/sound';
import { X, ArrowUpRight, Code2, ExternalLink } from 'lucide-react';

interface ProjectModalProps {
  item: StuffItem | Artwork | null;
  onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ item, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        playClickSound('tick');
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!item) return null;

  const isStuffItem = 'codeName' in item;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop (exact urfd signature .project--underlay blur) */}
      <div
        onClick={() => {
          playClickSound('tick');
          onClose();
        }}
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-300 animate-fadeIn"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-2xl overflow-hidden z-10 my-auto border border-neutral-200 animate-scaleUp">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-100 bg-neutral-50/50">
          <div className="flex items-center gap-2 text-micro font-mono text-neutral-500">
            <span>{isStuffItem ? (item as StuffItem).codeName : `artwork_${item.id}.pic`}</span>
            <span>•</span>
            <span>{item.year}</span>
          </div>

          <button
            onClick={() => {
              playClickSound('tick');
              onClose();
            }}
            title="Close (Esc)"
            className="p-1 rounded-full text-neutral-400 hover:text-black hover:bg-neutral-100 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Media Preview Frame */}
        <div className="relative w-full max-h-[50vh] bg-neutral-900 overflow-hidden flex items-center justify-center">
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full max-h-[50vh] object-cover"
          />
        </div>

        {/* Project Info Body */}
        <div className="p-6 space-y-4">
          <div>
            <div className="flex items-baseline justify-between gap-2 mb-1">
              <h2 className="text-xl font-medium tracking-tight text-black">
                {item.title}
              </h2>
              <span className="text-micro font-mono uppercase tracking-wider px-2 py-0.5 bg-neutral-100 rounded text-neutral-600">
                {item.category}
              </span>
            </div>

            <p className="text-sub text-neutral-600 leading-relaxed">
              {'description' in item ? item.description : item.caption}
            </p>
          </div>

          {/* Deep dive architecture notes */}
          {'details' in item && (
            <div className="pt-3 border-t border-neutral-100">
              <h4 className="text-micro uppercase tracking-wider text-neutral-400 font-mono mb-1.5">
                Technical Architecture & Process
              </h4>
              <p className="text-sub text-neutral-700 leading-relaxed font-sans">
                {(item as StuffItem).details}
              </p>
            </div>
          )}

          {/* Tags and Metadata */}
          {'tags' in item && (
            <div className="flex items-center gap-1.5 flex-wrap pt-2">
              {(item as StuffItem).tags.map((tag) => (
                <span
                  key={tag}
                  className="text-micro font-mono px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Links & CTA Bar */}
          <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
            <div className="text-micro text-neutral-400 font-mono">
              {'role' in item ? `Role: ${(item as StuffItem).role}` : 'Visual Study'}
            </div>

            <div className="flex items-center gap-3">
              {'github' in item && (item as StuffItem).github && (
                <a
                  href={(item as StuffItem).github}
                  target="_blank"
                  rel="noreferrer"
                  className="ul-link text-sub font-medium text-black inline-flex items-center gap-1"
                >
                  <Code2 size={13} />
                  <span>Source</span>
                </a>
              )}
              {'link' in item && (item as StuffItem).link && (
                <a
                  href={(item as StuffItem).link}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-black text-white hover:bg-neutral-800 transition-colors px-3 py-1 rounded text-sub font-medium inline-flex items-center gap-1 shadow-sm"
                >
                  <span>Launch Live</span>
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
