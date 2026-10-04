import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  BookItem,
  EssayItem,
  getEssayPreviewImage,
  loadBooks,
  saveBooks,
  loadEssays,
  saveEssays,
} from '../data/reading';
import { playClickSound } from '../utils/sound';
import {
  ArrowUpRight,
  BookOpen,
  FileText,
  Send,
  X,
  Check,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

interface ReadingSectionProps {
  externalShuffleTrigger?: number; // Prop to trigger shuffle from top header
}

export const ReadingSection: React.FC<ReadingSectionProps> = ({ externalShuffleTrigger }) => {
  // Books & Essays state
  const [books, setBooks] = useState<BookItem[]>([]);
  const [essays, setEssays] = useState<EssayItem[]>([]);
  const [selectedBook, setSelectedBook] = useState<BookItem | null>(null);

  // Essays category filtering & sorting
  const [selectedEssayCategory, setSelectedEssayCategory] = useState<string>('All');

  // Shelf horizontal scrolling ref
  const shelfScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Floating hover preview state for Essays
  const [hoveredEssay, setHoveredEssay] = useState<EssayItem | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [canHover, setCanHover] = useState(false);

  // Smooth lerp coordinates for cursor preview card
  const mouseTargetRef = useRef({ x: 0, y: 0 });
  const mouseCurrentRef = useRef({ x: 0, y: 0 });
  const [previewPos, setPreviewPos] = useState({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  // Telegram webhook panel state
  const [telegramModalOpen, setTelegramModalOpen] = useState(false);
  const [rawPayloadInput, setRawPayloadInput] = useState('');
  const [syncSuccessMsg, setSyncSuccessMsg] = useState('');

  // 1. Initialize data & hover capability check
  useEffect(() => {
    setBooks(loadBooks());
    setEssays(loadEssays());

    const hoverQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    setCanHover(hoverQuery.matches);

    const handleQueryChange = (e: MediaQueryListEvent) => {
      setCanHover(e.matches);
    };

    hoverQuery.addEventListener('change', handleQueryChange);
    return () => hoverQuery.removeEventListener('change', handleQueryChange);
  }, []);

  // Update shelf scroll indicators
  const checkShelfScroll = useCallback(() => {
    if (!shelfScrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = shelfScrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = shelfScrollRef.current;
    if (!el) return;
    checkShelfScroll();
    el.addEventListener('scroll', checkShelfScroll, { passive: true });
    window.addEventListener('resize', checkShelfScroll);
    return () => {
      el.removeEventListener('scroll', checkShelfScroll);
      window.removeEventListener('resize', checkShelfScroll);
    };
  }, [books, checkShelfScroll]);

  // Scroll shelf left/right
  const scrollShelf = (direction: 'left' | 'right') => {
    if (!shelfScrollRef.current) return;
    playClickSound('tick');
    const scrollAmount = direction === 'left' ? -320 : 320;
    shelfScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  // 2. Shuffle Handlers
  const handleShuffleBooks = useCallback(() => {
    playClickSound('pop');
    setBooks((prev) => {
      const items = [...prev];
      for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [items[i], items[j]] = [items[j], items[i]];
      }
      return items;
    });
  }, []);

  const handleShuffleEssays = useCallback(() => {
    playClickSound('pop');
    setEssays((prev) => {
      const items = [...prev];
      for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [items[i], items[j]] = [items[j], items[i]];
      }
      return items;
    });
  }, []);

  // Sync external header shuffle trigger
  useEffect(() => {
    if (externalShuffleTrigger && externalShuffleTrigger > 0) {
      handleShuffleBooks();
    }
  }, [externalShuffleTrigger, handleShuffleBooks]);

  // 3. Smooth Lerp Animation for Floating Hover Card (Part 2)
  const updateCursorLerp = useCallback(() => {
    if (!previewVisible) return;

    const factor = 0.16;
    const dx = mouseTargetRef.current.x - mouseCurrentRef.current.x;
    const dy = mouseTargetRef.current.y - mouseCurrentRef.current.y;

    mouseCurrentRef.current.x += dx * factor;
    mouseCurrentRef.current.y += dy * factor;

    const cardWidth = 300;
    const cardHeight = 200;
    const padding = 20;

    let posX = mouseCurrentRef.current.x + 20;
    let posY = mouseCurrentRef.current.y - cardHeight / 2;

    if (posX + cardWidth > window.innerWidth - padding) {
      posX = mouseCurrentRef.current.x - cardWidth - 20;
    }
    if (posY < padding) posY = padding;
    if (posY + cardHeight > window.innerHeight - padding) {
      posY = window.innerHeight - cardHeight - padding;
    }

    setPreviewPos({ x: posX, y: posY });
    rafRef.current = requestAnimationFrame(updateCursorLerp);
  }, [previewVisible]);

  useEffect(() => {
    if (previewVisible && canHover) {
      rafRef.current = requestAnimationFrame(updateCursorLerp);
    } else if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [previewVisible, canHover, updateCursorLerp]);

  const handleMouseMove = (e: React.MouseEvent) => {
    mouseTargetRef.current = { x: e.clientX, y: e.clientY };
    if (!previewVisible && hoveredEssay) {
      mouseCurrentRef.current = { x: e.clientX, y: e.clientY };
      setPreviewVisible(true);
    }
  };

  const handleEssayMouseEnter = (item: EssayItem, e: React.MouseEvent) => {
    if (!canHover) return;
    const previewImg = getEssayPreviewImage(item);
    if (!previewImg) {
      setHoveredEssay(null);
      setPreviewVisible(false);
      return;
    }
    mouseTargetRef.current = { x: e.clientX, y: e.clientY };
    mouseCurrentRef.current = { x: e.clientX, y: e.clientY };
    setHoveredEssay(item);
    setPreviewVisible(true);
  };

  const handleEssayMouseLeave = () => {
    setHoveredEssay(null);
    setPreviewVisible(false);
  };

  // 4. Book Selection with Realistic Shelf Slide Sound & Elevation Animation
  const handleBookClick = (book: BookItem) => {
    if (selectedBook?.id === book.id) {
      // Push book back into shelf
      playClickSound('book-push');
      setSelectedBook(null);
    } else {
      // Pull book out of shelf sound
      playClickSound('book-slide');
      setSelectedBook(book);
    }
  };

  // 5. Telegram Webhook Payload Processor
  const handleProcessTelegramPayload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawPayloadInput.trim()) return;

    try {
      const parsed = JSON.parse(rawPayloadInput.trim());

      if (parsed.type === 'book') {
        const newBook: BookItem = {
          id: `tg-b-${Date.now()}`,
          title: parsed.title || 'Untitled Book',
          author: parsed.author || 'Unknown Author',
          year: parsed.year || String(new Date().getFullYear()),
          note: parsed.note || 'Pushed via Telegram Bot',
          h: parsed.h || Math.floor(Math.random() * 35 + 200),
          w: parsed.w || Math.floor(Math.random() * 10 + 36),
          c: parsed.c || '#18181b',
          fg: parsed.fg || '#ffffff',
          link: parsed.link,
        };
        const updated = [newBook, ...books];
        setBooks(updated);
        saveBooks(updated);
        setSyncSuccessMsg(`Successfully added book: "${newBook.title}"`);
      } else if (
        parsed.type === 'essay' ||
        parsed.type === 'article' ||
        parsed.type === 'report' ||
        parsed.type === 'video'
      ) {
        const newEssay: EssayItem = {
          id: `tg-e-${Date.now()}`,
          title: parsed.title || 'Untitled Article',
          type: (parsed.type.charAt(0).toUpperCase() + parsed.type.slice(1)) as any,
          source: parsed.source || 'Web Source',
          year: parsed.year || String(new Date().getFullYear()),
          url: parsed.url || '#',
          img: parsed.img,
          cap: parsed.cap || parsed.source,
        };
        const updated = [newEssay, ...essays];
        setEssays(updated);
        saveEssays(updated);
        setSyncSuccessMsg(`Successfully added essay: "${newEssay.title}"`);
      }

      setRawPayloadInput('');
      playClickSound('high');
      setTimeout(() => setSyncSuccessMsg(''), 4000);
    } catch (err) {
      alert('Invalid JSON format. Please check syntax.');
    }
  };

  // Filtered essays
  const essayCategories = ['All', 'Essay', 'Report', 'Article', 'Video'];
  const filteredEssays = essays.filter((item) => {
    if (selectedEssayCategory === 'All') return true;
    return item.type.toLowerCase() === selectedEssayCategory.toLowerCase();
  });

  return (
    <div
      onMouseMove={handleMouseMove}
      className="w-full font-sans select-text"
    >
      
      {/* ── Page 4 Header & Telegram Live Sync Badge ─────────────── */}
      <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4 mb-8 pb-4 border-b border-neutral-100">
        <div>
          <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded bg-black text-white text-[11px] font-mono mb-2 tracking-wide">
            <span>PAGE 4</span>
            <span>•</span>
            <span>READING ARCHIVE & BOOKSHELF</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-black flex items-center gap-3">
            <span>Bookshelf & Writings</span>
            <span className="text-micro font-mono text-neutral-400 font-normal">
              ({books.length} books, {essays.length} essays)
            </span>
          </h1>
          <p className="text-sub text-neutral-500 mt-1 max-w-xl">
            An infinite, tactile bookshelf of foundational readings, system theory, and computational design essays.
          </p>
        </div>

        {/* Action Controls & Telegram Status */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Shuffle Entire Library Button */}
          <button
            onClick={handleShuffleBooks}
            title="Randomize shelf order"
            className="flex items-center gap-1.5 px-3 py-1 rounded text-micro font-mono bg-neutral-100 hover:bg-neutral-200 text-black transition-colors cursor-pointer border border-neutral-200 font-medium"
          >
            <Shuffle size={12} />
            <span>Shuffle Shelf</span>
          </button>

          {/* Telegram Live Sync Status */}
          <button
            onClick={() => {
              playClickSound('tick');
              setTelegramModalOpen(true);
            }}
            title="Configure / Test Telegram Webhook Sync"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-micro font-mono bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors cursor-pointer border border-neutral-200/60"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Telegram Sync</span>
            <Send size={10} className="text-neutral-400 ml-0.5" />
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          PART 1: BOOKS (2.5D Animated Shelf with Pull-Out Sound & Scroll)
          ═══════════════════════════════════════════════════════════════ */}
      <div className="mb-16">
        <div className="flex items-baseline justify-between gap-2 mb-4 border-b border-neutral-100 pb-2">
          <div className="flex items-center gap-2">
            <BookOpen size={15} className="text-neutral-800" />
            <h2 className="text-sm font-bold tracking-tight text-black">
              Books
            </h2>
            <span className="text-micro font-mono text-neutral-400 font-normal">
              ({books.length} books)
            </span>
          </div>

          {/* Left/Right Scroll Controls for 100+ Books */}
          <div className="flex items-center gap-1">
            <span className="text-micro font-mono text-neutral-400 hidden sm:inline mr-2">
              Scroll horizontally for more books • Click spine to draw out
            </span>
            <button
              onClick={() => scrollShelf('left')}
              disabled={!canScrollLeft}
              title="Scroll left"
              className={`p-1 rounded border border-neutral-200 transition-colors ${
                canScrollLeft
                  ? 'text-black hover:bg-neutral-100 cursor-pointer'
                  : 'text-neutral-300 opacity-40 cursor-not-allowed'
              }`}
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => scrollShelf('right')}
              disabled={!canScrollRight}
              title="Scroll right"
              className={`p-1 rounded border border-neutral-200 transition-colors ${
                canScrollRight
                  ? 'text-black hover:bg-neutral-100 cursor-pointer'
                  : 'text-neutral-300 opacity-40 cursor-not-allowed'
              }`}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Shelf Frame (Smooth touch scroll & scalable for 100+ books) */}
        <div className="relative pt-8 pb-3">
          <div
            ref={shelfScrollRef}
            className="w-full overflow-x-auto scroll-smooth pb-4 no-scrollbar"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <div className="inline-flex items-end justify-start gap-2.5 px-3 min-w-max h-[270px]">
              {books.map((book, idx) => {
                const isSelected = selectedBook?.id === book.id;

                return (
                  <button
                    key={book.id}
                    onClick={() => handleBookClick(book)}
                    aria-pressed={isSelected}
                    title={`${book.title} by ${book.author} (${book.year})`}
                    style={{
                      height: `${book.h}px`,
                      width: `${book.w}px`,
                      backgroundColor: book.c,
                      color: book.fg,
                      animationDelay: `${idx * 40}ms`,
                    }}
                    className={`relative group rounded-t-xs transition-all duration-300 ease-out cursor-pointer flex flex-col justify-between items-center py-3 px-1 border border-black/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-black book-spine shrink-0 select-none ${
                      isSelected
                        ? '-translate-y-7 shadow-2xl ring-2 ring-black scale-[1.04] z-30'
                        : 'hover:-translate-y-4 hover:rotate-[-1.5deg] hover:shadow-xl z-10'
                    }`}
                  >
                    {/* 2D-to-3D Illusion Shading Overlays */}
                    <div
                      className="absolute inset-0 rounded-t-xs pointer-events-none"
                      style={{
                        background:
                          'linear-gradient(90deg, rgba(0,0,0,0.28) 0%, rgba(255,255,255,0.18) 7%, rgba(0,0,0,0) 25%, rgba(0,0,0,0.02) 80%, rgba(0,0,0,0.26) 100%)',
                      }}
                    />

                    {/* Spine Top Bevel */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/25 rounded-t-xs pointer-events-none" />

                    {/* Top Year Tag */}
                    <span
                      className="text-[9px] font-mono tracking-tighter opacity-80 shrink-0 select-none"
                      style={{ color: book.fg }}
                    >
                      {book.year}
                    </span>

                    {/* Spine Title (Vertical Writing Mode) */}
                    <span
                      className="text-xs font-medium tracking-tight whitespace-nowrap overflow-hidden select-none px-0.5 leading-none"
                      style={{
                        writingMode: 'vertical-rl',
                        textOrientation: 'mixed',
                        transform: 'rotate(180deg)',
                        color: book.fg,
                        maxHeight: `${book.h - 55}px`,
                      }}
                    >
                      {book.title}
                    </span>

                    {/* Bottom Author Tag */}
                    <span
                      className="text-[9px] font-mono tracking-tighter opacity-80 truncate max-w-[90%] select-none shrink-0"
                      style={{ color: book.fg }}
                    >
                      {book.author.split(' ').pop()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Solid 2.5D Wooden Shelf Base Plank */}
          <div className="w-full h-3.5 bg-neutral-900 rounded-xs shadow-md border-t border-white/20 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 opacity-90 rounded-xs" />
          </div>
        </div>

        {/* Selected Book Detail Card (Appears smoothly BELOW shelf when drawn out) */}
        {selectedBook ? (
          <div className="mt-4 p-5 bg-neutral-50 border border-neutral-200/90 rounded-lg shadow-sm animate-fadeIn relative">
            <button
              onClick={() => {
                playClickSound('book-push');
                setSelectedBook(null);
              }}
              className="absolute top-4 right-4 text-neutral-400 hover:text-black transition-colors p-1 cursor-pointer"
              title="Put book back into shelf"
            >
              <X size={15} />
            </button>

            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-1.5 pr-8">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-base font-bold text-black">
                  {selectedBook.title}
                </h3>
                {selectedBook.link && (
                  <a
                    href={selectedBook.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 font-semibold border-b border-blue-600 hover:text-blue-800 transition-colors pb-0.5"
                  >
                    <span>View on Amazon India ↗</span>
                  </a>
                )}
              </div>
              <span className="text-xs font-mono text-neutral-500">
                {selectedBook.author} • {selectedBook.year}
              </span>
            </div>

            <p className="text-sub text-neutral-700 leading-relaxed mt-2 pl-3 border-l-2 border-black">
              "{selectedBook.note}"
            </p>

            <div className="mt-3 text-micro font-mono text-neutral-400 flex items-center justify-between">
              <span>Personal library collection</span>
              <span>Click spine again to put back on shelf</span>
            </div>
          </div>
        ) : (
          <div className="mt-2 text-center py-2 text-micro font-mono text-neutral-400">
            [ Click on any book spine to pull it out and reveal reading notes ]
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          PART 2: ESSAYS & REPORTS (Numbered Table with Category Filters)
          ═══════════════════════════════════════════════════════════════ */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4 border-b border-neutral-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <FileText size={15} className="text-neutral-800" />
              <h2 className="text-sm font-bold tracking-tight text-black">
                Essays & Reports
              </h2>
              <span className="text-micro font-mono text-neutral-400 font-normal">
                ({filteredEssays.length} items)
              </span>
            </div>
            <p className="text-micro text-neutral-400 font-mono mt-0.5">
              Hover to preview • Click row to open source in new tab
            </p>
          </div>

          {/* Category Filter Chips & Shuffle for Essays */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-neutral-100 p-0.5 rounded text-micro font-mono">
              {essayCategories.map((cat) => {
                const count =
                  cat === 'All'
                    ? essays.length
                    : essays.filter((e) => e.type.toLowerCase() === cat.toLowerCase()).length;
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      playClickSound('tick');
                      setSelectedEssayCategory(cat);
                    }}
                    className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                      selectedEssayCategory === cat
                        ? 'bg-black text-white font-medium shadow-xs'
                        : 'text-neutral-500 hover:text-black'
                    }`}
                  >
                    <span>{cat}</span>
                    <span className="text-[10px] opacity-70 ml-1">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Shuffle Essays Button */}
            <button
              onClick={handleShuffleEssays}
              title="Shuffle Essays"
              className="flex items-center gap-1 px-2 py-1 rounded text-micro font-mono bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors cursor-pointer border border-neutral-200/60"
            >
              <Shuffle size={10} />
              <span>Shuffle</span>
            </button>
          </div>
        </div>

        {/* Index Table Grid with Numbering Column */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-sub border-collapse">
            <thead>
              <tr className="border-b border-neutral-900 text-micro text-neutral-400 font-mono uppercase tracking-wider">
                <th className="py-2.5 pr-2 font-normal w-12 text-center">No.</th>
                <th className="py-2.5 px-3 font-normal w-16">Year</th>
                <th className="py-2.5 px-3 font-normal">Title</th>
                <th className="py-2.5 px-3 font-normal hidden sm:table-cell w-24">Category</th>
                <th className="py-2.5 px-3 font-normal hidden md:table-cell w-44">Source</th>
                <th className="py-2.5 pl-3 font-normal text-right w-20">Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-normal">
              {filteredEssays.map((item, idx) => (
                <tr
                  key={item.id}
                  onMouseEnter={(e) => handleEssayMouseEnter(item, e)}
                  onMouseLeave={handleEssayMouseLeave}
                  onClick={() => playClickSound('paper')}
                  className="hover:bg-neutral-50/90 transition-colors group cursor-pointer"
                >
                  {/* Numbering */}
                  <td className="py-3 pr-2 font-mono text-micro text-neutral-400 text-center">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-inherit"
                    >
                      {String(idx + 1).padStart(2, '0')}
                    </a>
                  </td>
                  {/* Year */}
                  <td className="py-3 px-3 font-mono text-micro text-neutral-400">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-inherit"
                    >
                      {item.year}
                    </a>
                  </td>
                  {/* Title */}
                  <td className="py-3 px-3 font-medium text-black group-hover:text-blue-600 transition-colors">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-inherit"
                    >
                      {item.title}
                    </a>
                  </td>
                  {/* Category Badge */}
                  <td className="py-3 px-3 text-neutral-500 text-micro hidden sm:table-cell">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-inherit"
                    >
                      <span className="inline-block px-1.5 py-0.5 rounded bg-neutral-100 text-[10px] font-mono text-neutral-700">
                        {item.type}
                      </span>
                    </a>
                  </td>
                  {/* Source */}
                  <td className="py-3 px-3 text-neutral-400 text-micro font-mono truncate max-w-[180px] hidden md:table-cell">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-inherit"
                    >
                      {item.source}
                    </a>
                  </td>
                  {/* Read Link */}
                  <td className="py-3 pl-3 text-right">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-micro text-neutral-400 group-hover:text-black font-mono transition-colors"
                    >
                      <span>Read</span>
                      <ArrowUpRight size={11} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          FLOATING CURSOR PREVIEW CARD (Lerped, Part 2 Only)
          ═══════════════════════════════════════════════════════════════ */}
      {previewVisible && hoveredEssay && canHover && (
        <div
          className="pointer-events-none fixed z-50 overflow-hidden rounded-md shadow-2xl border border-white/20 transition-opacity duration-200 hidden md:block"
          style={{
            left: `${previewPos.x}px`,
            top: `${previewPos.y}px`,
            width: '300px',
            height: '200px',
          }}
        >
          {getEssayPreviewImage(hoveredEssay) && (
            <img
              src={getEssayPreviewImage(hoveredEssay)!}
              alt={hoveredEssay.title}
              className="w-full h-full object-cover"
            />
          )}

          {/* Title & Caption Bottom Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-3 text-white">
            <span className="text-xs font-semibold leading-snug line-clamp-2">
              {hoveredEssay.title}
            </span>
            <span className="text-[10px] font-mono text-neutral-300 mt-1 truncate">
              {hoveredEssay.cap || hoveredEssay.source}
            </span>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          TELEGRAM WEBHOOK INTEGRATION MODAL
          ═══════════════════════════════════════════════════════════════ */}
      {telegramModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-200 rounded-lg max-w-lg w-full p-6 shadow-2xl space-y-4 animate-fadeIn text-sub">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <Send size={15} className="text-black" />
                <h3 className="font-bold text-black text-sm">
                  Telegram Bot Sync & Webhook Setup
                </h3>
              </div>
              <button
                onClick={() => setTelegramModalOpen(false)}
                className="text-neutral-400 hover:text-black p-1 cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed">
              When you send a book or link to your Telegram Bot, the serverless webhook pushes it directly to this bookshelf & essays archive in real time.
            </p>

            <form onSubmit={handleProcessTelegramPayload} className="space-y-3 pt-2">
              <label className="block text-micro font-mono text-neutral-500">
                Push Test Item (JSON Webhook Payload):
              </label>
              <textarea
                rows={4}
                value={rawPayloadInput}
                onChange={(e) => setRawPayloadInput(e.target.value)}
                placeholder={`{\n  "type": "book",\n  "title": "Klara and the Sun",\n  "author": "Kazuo Ishiguro",\n  "year": "2021",\n  "note": "Profound exploration of AI consciousness, human uniqueness, and love.",\n  "c": "#1e293b",\n  "fg": "#f8fafc"\n}`}
                className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded font-mono text-[11px] focus:outline-none focus:border-black transition-colors"
              />

              {syncSuccessMsg && (
                <div className="p-2 rounded bg-emerald-50 text-emerald-800 text-xs font-mono flex items-center gap-1.5 border border-emerald-200">
                  <Check size={12} />
                  <span>{syncSuccessMsg}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setRawPayloadInput(
                      JSON.stringify(
                        {
                          type: 'essay',
                          title: 'Why Software Needs Poetry & Aesthetics',
                          type_label: 'Essay',
                          source: 'van-sh.dev/writings',
                          year: '2026',
                          url: 'https://github.com/Vanshlohia05/Vansh',
                          cap: 'Exploring software design as an editorial canvas',
                        },
                        null,
                        2
                      )
                    );
                  }}
                  className="text-micro font-mono text-neutral-500 hover:text-black ul-link"
                >
                  Load Sample Essay Payload
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setTelegramModalOpen(false)}
                    className="px-3 py-1 text-micro text-neutral-500 hover:text-black cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="bg-black text-white px-3.5 py-1 rounded text-micro font-mono hover:bg-neutral-800 transition-colors shadow-sm cursor-pointer"
                  >
                    Push to Reading Archive ↗
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
