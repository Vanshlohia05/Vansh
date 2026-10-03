import React, { useState, useEffect } from 'react';
import { STUFF_ITEMS, StuffItem } from '../data/stuff';
import { playClickSound } from '../utils/sound';
import { ArrowUpRight, Shuffle, LayoutGrid, List } from 'lucide-react';

interface StuffViewProps {
  galleryMode: 'gallery' | 'index';
  setGalleryMode: (mode: 'gallery' | 'index') => void;
  onSelectItem: (item: StuffItem) => void;
  shuffledItems: StuffItem[];
  onShuffle: () => void;
}

export const StuffView: React.FC<StuffViewProps> = ({
  galleryMode,
  setGalleryMode,
  onSelectItem,
  shuffledItems,
  onShuffle,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [hoveredItem, setHoveredItem] = useState<StuffItem | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const categories = ['All', 'Projects', 'Experiments', 'Visuals', 'Tools'];

  // Track mouse coordinates for floating preview in Index mode
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const filteredItems = shuffledItems.filter((item) => {
    if (selectedFilter === 'All') return true;
    return item.category === selectedFilter;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 pt-20 pb-24">
      
      {/* Top Bar: Title, Category Filters, Shuffle & View Switcher */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-100 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl md:text-2xl font-normal tracking-tight text-black">
              Stuff
            </h1>
            <span className="text-micro font-mono text-neutral-400">
              ({filteredItems.length} items)
            </span>
          </div>
          <p className="text-sub text-neutral-500 mt-1 max-w-lg">
            A living archive of digital products, raymarching shaders, hardware builds, and visual curiosities.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Category Chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  playClickSound('tick');
                  setSelectedFilter(cat);
                }}
                className={`text-micro px-2.5 py-1 rounded transition-colors ${
                  selectedFilter === cat
                    ? 'bg-black text-white font-medium'
                    : 'text-neutral-500 hover:text-black bg-neutral-100/70 hover:bg-neutral-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-neutral-200 hidden sm:block" />

          {/* Shuffle button */}
          <button
            onClick={() => {
              playClickSound('pop');
              onShuffle();
            }}
            title="Randomize order"
            className="flex items-center gap-1 text-micro text-neutral-600 hover:text-black font-medium transition-colors bg-neutral-100/80 hover:bg-neutral-200/80 px-2.5 py-1 rounded"
          >
            <Shuffle size={11} />
            <span>Shuffle</span>
          </button>

          {/* Gallery / Index Toggle */}
          <div className="flex items-center bg-neutral-100 p-0.5 rounded text-micro">
            <button
              onClick={() => {
                playClickSound('tick');
                setGalleryMode('gallery');
              }}
              title="Gallery Grid View"
              className={`flex items-center gap-1 px-2 py-0.5 rounded transition-all ${
                galleryMode === 'gallery'
                  ? 'bg-white text-black shadow-sm font-medium'
                  : 'text-neutral-500 hover:text-black'
              }`}
            >
              <LayoutGrid size={11} />
              <span>Gallery</span>
            </button>
            <button
              onClick={() => {
                playClickSound('tick');
                setGalleryMode('index');
              }}
              title="Index Table View"
              className={`flex items-center gap-1 px-2 py-0.5 rounded transition-all ${
                galleryMode === 'index'
                  ? 'bg-white text-black shadow-sm font-medium'
                  : 'text-neutral-500 hover:text-black'
              }`}
            >
              <List size={11} />
              <span>Index</span>
            </button>
          </div>
        </div>
      </div>

      {/* GALLERY MODE: Visual Masonry / Grid with urfd-style hover dimming */}
      {galleryMode === 'gallery' ? (
        <div className="gallery-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                playClickSound('paper');
                onSelectItem(item);
              }}
              className="gallery-item group cursor-pointer flex flex-col transition-all duration-300"
            >
              {/* Image Frame */}
              <div className="relative w-full overflow-hidden bg-neutral-100 rounded-sm border border-neutral-200/60 aspect-[4/3] group-hover:shadow-md transition-all duration-300">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  loading="lazy"
                />

                {/* Hover reveal overlay with full title */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3 text-white">
                  <div className="text-sub font-medium">{item.title}</div>
                  <div className="text-micro text-neutral-200 font-mono mt-0.5 flex items-center justify-between">
                    <span>{item.category}</span>
                    <span>View project ↗</span>
                  </div>
                </div>
              </div>

              {/* Caption beneath (Exact urfd signature: codeName small) */}
              <div className="mt-2 flex items-baseline justify-between text-micro px-0.5">
                <span className="font-mono text-neutral-600 group-hover:text-black transition-colors truncate">
                  {item.codeName}
                </span>
                <span className="text-neutral-400 font-mono text-[10px]">
                  {item.year}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* INDEX MODE: High-density Swiss Table */
        <div className="relative">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-sub border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 text-micro text-neutral-400 font-mono uppercase tracking-wider">
                  <th className="py-2.5 pr-4 font-normal">Year</th>
                  <th className="py-2.5 px-4 font-normal">Project</th>
                  <th className="py-2.5 px-4 font-normal hidden sm:table-cell">Category</th>
                  <th className="py-2.5 px-4 font-normal hidden md:table-cell">Role</th>
                  <th className="py-2.5 px-4 font-normal hidden lg:table-cell">Stack</th>
                  <th className="py-2.5 pl-4 font-normal text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-normal">
                {filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => {
                      playClickSound('paper');
                      onSelectItem(item);
                    }}
                    onMouseEnter={() => setHoveredItem(item)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className="hover:bg-neutral-50/90 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 pr-4 font-mono text-micro text-neutral-400">
                      {item.year}
                    </td>
                    <td className="py-3 px-4 font-medium text-black group-hover:text-neutral-700">
                      {item.title}
                    </td>
                    <td className="py-3 px-4 text-neutral-500 text-micro hidden sm:table-cell">
                      {item.category}
                    </td>
                    <td className="py-3 px-4 text-neutral-500 text-micro hidden md:table-cell">
                      {item.role}
                    </td>
                    <td className="py-3 px-4 text-neutral-400 text-micro hidden lg:table-cell">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {item.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="bg-neutral-100 px-1.5 py-0.5 rounded text-[10px]">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 pl-4 text-right">
                      <span className="inline-flex items-center gap-1 text-micro text-neutral-400 group-hover:text-black">
                        <span>Inspect</span>
                        <ArrowUpRight size={12} />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Floating Cursor Image Preview for Index Mode (urfd signature .hover--image) */}
          {hoveredItem && (
            <div
              className="pointer-events-none fixed z-50 overflow-hidden rounded shadow-2xl border border-white/20 transition-opacity duration-200 hidden md:block"
              style={{
                left: `${mousePos.x + 24}px`,
                top: `${mousePos.y - 100}px`,
                width: '280px',
                height: '190px',
              }}
            >
              <img
                src={hoveredItem.imageUrl}
                alt={hoveredItem.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2.5 text-white">
                <span className="text-sub font-medium truncate">{hoveredItem.title}</span>
                <span className="text-micro font-mono text-neutral-300">{hoveredItem.codeName}</span>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
