import React, { useEffect } from 'react';
import { Article } from '../data/writings';
import { playClickSound } from '../utils/sound';
import { X, Clock, Calendar, ArrowLeft } from 'lucide-react';

interface ArticleModalProps {
  article: Article | null;
  onClose: () => void;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({ article, onClose }) => {
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

  if (!article) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center overflow-y-auto bg-white/95 backdrop-blur-md animate-fadeIn">
      
      {/* Fixed Sticky Header for Close / Back */}
      <div className="fixed top-0 left-0 w-full z-40 bg-white/90 backdrop-blur-md border-b border-neutral-100 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => {
            playClickSound('tick');
            onClose();
          }}
          className="flex items-center gap-1.5 text-sub text-neutral-600 hover:text-black transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Writings</span>
        </button>

        <span className="text-micro font-mono text-neutral-400 hidden sm:inline">
          {article.readTime} • {article.date}
        </span>

        <button
          onClick={() => {
            playClickSound('tick');
            onClose();
          }}
          title="Close (Esc)"
          className="p-1 rounded-full text-neutral-400 hover:text-black hover:bg-neutral-100 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Reader Article Body */}
      <div className="w-full max-w-2xl px-6 pt-24 pb-28">
        
        {/* Category & Meta */}
        <div className="mb-4 flex items-center gap-2">
          <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded">
            {article.category}
          </span>
          <span className="text-micro text-neutral-400">•</span>
          <span className="text-micro text-neutral-400 font-mono">
            {article.date}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-normal tracking-tight text-black mb-6 leading-tight">
          {article.title}
        </h1>

        {/* Excerpt Lead */}
        <div className="p-4 bg-neutral-50 border-l-2 border-black rounded-r text-sub text-neutral-700 italic mb-8 leading-relaxed">
          {article.excerpt}
        </div>

        {/* Paragraphs */}
        <div className="space-y-6 text-sub sm:text-base text-neutral-800 leading-relaxed font-normal">
          {article.content.map((p, idx) => (
            <p key={idx} className="leading-relaxed">
              {p}
            </p>
          ))}
        </div>

        {/* Signoff & Author note */}
        <div className="mt-14 pt-8 border-t border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-micro text-neutral-500">
          <div>
            <span className="font-medium text-black">Written by Vansh</span>
            <p className="mt-0.5">Thoughts on code, human interfaces, and digital craft.</p>
          </div>

          <button
            onClick={() => {
              playClickSound('tick');
              onClose();
            }}
            className="ul-link text-black font-medium self-start sm:self-auto"
          >
            ← Return to index
          </button>
        </div>

      </div>
    </div>
  );
};
