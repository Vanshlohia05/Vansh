import React, { useState } from 'react';
import { ARTICLES, Article } from '../data/writings';
import { playClickSound } from '../utils/sound';
import { ArrowUpRight, Search, Clock, Calendar } from 'lucide-react';

interface WritingsViewProps {
  onSelectArticle: (article: Article) => void;
}

export const WritingsView: React.FC<WritingsViewProps> = ({ onSelectArticle }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['All', 'Design Philosophy', 'Creative Engineering', 'Aesthetics', 'Experiments'];

  const filteredArticles = ARTICLES.filter((article) => {
    const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pt-24 pb-20">
      
      {/* Header Info */}
      <div className="mb-10">
        <h1 className="text-xl md:text-2xl font-normal tracking-tight text-black mb-2">
          Writings
        </h1>
        <p className="text-sub text-neutral-500 max-w-xl">
          Observations on software tactility, high-framerate engineering, typography, and personal web experiments.
        </p>

        {/* Filter bar & Search */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
          
          {/* Category Chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  playClickSound('tick');
                  setSelectedCategory(cat);
                }}
                className={`text-micro px-2.5 py-1 rounded transition-colors ${
                  selectedCategory === cat
                    ? 'bg-black text-white font-medium'
                    : 'text-neutral-500 hover:text-black bg-neutral-100/70 hover:bg-neutral-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-48">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-7 pr-3 py-1 text-micro bg-neutral-50 border border-neutral-200 rounded focus:outline-none focus:border-black transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Articles Feed */}
      <div className="space-y-8">
        {filteredArticles.length === 0 ? (
          <div className="py-12 text-center text-neutral-400 text-sub">
            No writings found matching your filter.
          </div>
        ) : (
          filteredArticles.map((article) => (
            <article
              key={article.id}
              onClick={() => {
                playClickSound('paper');
                onSelectArticle(article);
              }}
              className="group cursor-pointer p-4 -mx-4 rounded-lg transition-colors hover:bg-neutral-50/80 border border-transparent hover:border-neutral-100"
            >
              <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-1 mb-2">
                <h2 className="text-base font-medium text-black group-hover:text-neutral-700 transition-colors flex items-center gap-1.5">
                  <span>{article.title}</span>
                  <ArrowUpRight
                    size={14}
                    className="text-neutral-400 group-hover:text-black transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </h2>
                
                <div className="flex items-center gap-3 text-micro text-neutral-400 font-mono whitespace-nowrap">
                  <span className="flex items-center gap-1">
                    <Clock size={10} />
                    {article.readTime}
                  </span>
                  <span>•</span>
                  <span>{article.date}</span>
                </div>
              </div>

              <p className="text-sub text-neutral-600 line-clamp-2 leading-relaxed">
                {article.excerpt}
              </p>

              <div className="mt-3 flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded">
                  {article.category}
                </span>
                <span className="text-micro text-neutral-400 ul-link group-hover:text-black">
                  Read essay →
                </span>
              </div>
            </article>
          ))
        )}
      </div>

    </div>
  );
};
