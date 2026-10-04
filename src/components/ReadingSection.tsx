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
import { ArrowUpRight, BookOpen, FileText, Send, X, Check, ExternalLink } from 'lucide-react';

export const ReadingSection: React.FC = () => {
  // Books & Essays state (with localStorage fallback & Telegram sync support)
  const [books, setBooks] = useState<BookItem[]>([]);
  const [essays, setEssays] = useState<EssayItem[]>([]);
  const [selectedBook, setSelectedBook] = useState<BookItem | null>(null);

  // Floating hover preview state for Essays (Part 2)
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

    // Check pointer hover capability
    const hoverQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    setCanHover(hoverQuery.matches);

    const handleQueryChange = (e: MediaQueryListEvent) => {
      setCanHover(e.matches);
    };

    hoverQuery.addEventListener('change', handleQueryChange);
    return () => hoverQuery.removeEventListener('change', handleQueryChange);
  }, []);

  // 2. Smooth Lerp Animation for Floating Hover Card (runs only while hovered)
  const updateCursorLerp = useCallback(() => {
    if (!previewVisible) return;

    // Linear interpolation: current + (target - current) * factor
    const factor = 0.16;
    const dx = mouseTargetRef.current.x - mouseCurrentRef.current.x;
    const dy = mouseTargetRef.current.y - mouseCurrentRef.current.y;

    mouseCurrentRef.current.x += dx * factor;
    mouseCurrentRef.current.y += dy * factor;

    // Viewport clamping (keep card within screen bounds)
    const cardWidth = 300;
    const cardHeight = 200;
    const padding = 20;

    let posX = mouseCurrentRef.current.x + 20;
    let posY = mouseCurrentRef.current.y - cardHeight / 2;

    // Flip to left if card overflows right
    if (posX + cardWidth > window.innerWidth - padding) {
      posX = mouseCurrentRef.current.x - cardWidth - 20;
    }
    // Clamp vertical
    if (posY < padding) posY = padding;
    if (posY + cardHeight > window.innerHeight - padding) {
      posY = window.innerHeight - cardHeight - padding;
    }

    setPreviewPos({ x: posX, y: posY });

    // Continue frame loop only while card is active
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

  // 3. Book Selection Toggle
  const handleBookClick = (book: BookItem) => {
    playClickSound('paper');
    if (selectedBook?.id === book.id) {
      setSelectedBook(null);
    } else {
      setSelectedBook(book);
    }
  };

  // 4. Telegram Webhook Payload Processor
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

  return (
    <div
      onMouseMove={handleMouseMove}
      className="w-full font-sans select-text"
    >
      
      {/* ── Header & Telegram Live Sync Badge ─────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 mb-6 pb-4 border-b border-neutral-100">
        <div>
          <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded bg-black text-white text-[11px] font-mono mb-2 tracking-wide">
            <span>READING ARCHIVE</span>
            <span>•</span>
            <span>BOOKSHELF & ESSAYS</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-black flex items-center gap-2.5">
            <span>Bookshelf & Reading</span>
            <span className="text-micro font-mono text-neutral-400 font-normal">
              ({books.length} books, {essays.length} essays)
            </span>
          </h2>
          <p className="text-sub text-neutral-500 mt-1 max-w-xl">
            A curated library of foundational literature, physics lectures, system theory, and design essays.
          </p>
        </div>

        {/* Telegram Live Sync Status Pill */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              playClickSound('tick');
              setTelegramModalOpen(true);
            }}
            title="Configure / Test Telegram Webhook Sync"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-micro font-mono bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors cursor-pointer border border-neutral-200/60"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Telegram Webhook: Active</span>
            <Send size={10} className="text-neutral-400 ml-0.5" />
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          PART 1: BOOKS (2.5D Animated Tactile Bookshelf)
          ═══════════════════════════════════════════════════════════════ */}
      <div className="mb-14">
        <div className="flex items-baseline justify-between gap-2 mb-4 border-b border-neutral-100 pb-2">
          <h3 className="text-sm font-semibold tracking-tight text-black flex items-center gap-2">
            <BookOpen size={14} className="text-neutral-700" />
            <span>Books</span>
            <span className="text-micro font-mono text-neutral-400 font-normal">
              ({books.length} books)
            </span>
          </h3>
          <span className="text-micro font-mono text-neutral-400 hidden sm:inline">
            Click any spine to inspect personal notes & links
          </span>
        </div>

        {/* Shelf Frame (Horizontally Scrollable on Mobile) */}
        <div className="relative pt-6 pb-2 overflow-x-auto no-scrollbar">
          <div className="min-w-[660px] flex items-end justify-start gap-2.5 px-4 h-[260px]">
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
                    animationDelay: `${idx * 60}ms`,
                  }}
                  className={`relative group rounded-t-xs transition-all duration-300 ease-out cursor-pointer flex flex-col justify-between items-center py-3 px-1 border border-black/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-black book-spine ${
                    isSelected
                      ? '-translate-y-5 shadow-2xl ring-2 ring-black scale-[1.02] z-20'
                      : 'hover:-translate-y-3.5 hover:rotate-[-1.5deg] hover:shadow-xl z-10'
                  }`}
                >
                  {/* 2D-to-3D Illusion Shading Overlays */}
                  <div
                    className="absolute inset-0 rounded-t-xs pointer-events-none"
                    style={{
                      background:
                        'linear-gradient(90deg, rgba(0,0,0,0.24) 0%, rgba(255,255,255,0.18) 7%, rgba(0,0,0,0) 25%, rgba(0,0,0,0.02) 80%, rgba(0,0,0,0.22) 100%)',
                    }}
                  />

                  {/* Spine Top Bevel */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-white/25 rounded-t-xs pointer-events-none" />

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

          {/* Minimalist 2.5D Shelf Plank */}
          <div className="w-full h-3 bg-neutral-900 rounded-xs shadow-md border-t border-white/20 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 opacity-90 rounded-xs" />
          </div>
        </div>

        {/* Selected Book Detail Card (Appears smoothly BELOW shelf) */}
        {selectedBook ? (
          <div className="mt-4 p-5 bg-neutral-50 border border-neutral-200/90 rounded-lg shadow-sm animate-fadeIn relative">
            <button
              onClick={() => setSelectedBook(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-black transition-colors p-1"
              title="Close book notes"
            >
              <X size={14} />
            </button>

            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-1.5 pr-6">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-base font-bold text-black">
                  {selectedBook.title}
                </h4>
                {selectedBook.link && (
                  <a
                    href={selectedBook.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 font-semibold border-b border-blue-600 hover:text-blue-800 transition-colors pb-0.5"
                  >
                    <span>Amazon Kindle ↗</span>
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
              <span>Click spine again to close</span>
            </div>
          </div>
        ) : (
          <div className="mt-2 text-center py-2 text-micro font-mono text-neutral-400">
            [ Select any book spine above to reveal notes & impressions ]
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          PART 2: ESSAYS & REPORTS (Index list with Hover Preview)
          ═══════════════════════════════════════════════════════════════ */}
      <div className="mb-14">
        <div className="flex items-baseline justify-between gap-2 mb-4 border-b border-neutral-100 pb-2">
          <h3 className="text-sm font-semibold tracking-tight text-black flex items-center gap-2">
            <FileText size={14} className="text-neutral-700" />
            <span>Essays & Reports</span>
            <span className="text-micro font-mono text-neutral-400 font-normal">
              ({essays.length} items)
            </span>
          </h3>
          <span className="text-micro font-mono text-neutral-400 hidden sm:inline">
            Hover to preview • Click to open source
          </span>
        </div>

        {/* Index Table Grid */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-sub border-collapse">
            <thead>
              <tr className="border-b border-neutral-900 text-micro text-neutral-400 font-mono uppercase tracking-wider">
                <th className="py-2.5 pr-4 font-normal w-16">Year</th>
                <th className="py-2.5 px-3 font-normal">Title</th>
                <th className="py-2.5 px-3 font-normal hidden sm:table-cell w-24">Type</th>
                <th className="py-2.5 px-3 font-normal hidden md:table-cell w-48">Source</th>
                <th className="py-2.5 pl-3 font-normal text-right w-20">Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-normal">
              {essays.map((item) => (
                <tr
                  key={item.id}
                  onMouseEnter={(e) => handleEssayMouseEnter(item, e)}
                  onMouseLeave={handleEssayMouseLeave}
                  onClick={() => playClickSound('paper')}
                  className="hover:bg-neutral-50/90 transition-colors group cursor-pointer"
                >
                  <td className="py-3 pr-4 font-mono text-micro text-neutral-400">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-inherit"
                    >
                      {item.year}
                    </a>
                  </td>
                  <td className="py-3 px-3 font-medium text-black group-hover:text-neutral-700">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-inherit"
                    >
                      {item.title}
                    </a>
                  </td>
                  <td className="py-3 px-3 text-neutral-500 text-micro hidden sm:table-cell">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-inherit"
                    >
                      <span className="inline-block px-1.5 py-0.5 rounded bg-neutral-100 text-[10px] font-mono">
                        {item.type}
                      </span>
                    </a>
                  </td>
                  <td className="py-3 px-3 text-neutral-400 text-micro font-mono truncate max-w-[200px] hidden md:table-cell">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-inherit"
                    >
                      {item.source}
                    </a>
                  </td>
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
                className="text-neutral-400 hover:text-black p-1"
              >
                <X size={15} />
              </button>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed">
              When you send a book or link to your Telegram Bot, the serverless webhook pushes it directly to this bookshelf & essays archive in real time.
            </p>

            {/* Live Webhook Simulator / Test Form */}
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
                    className="px-3 py-1 text-micro text-neutral-500 hover:text-black"
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
