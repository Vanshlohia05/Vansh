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
import { supabase } from '../utils/supabase';
import { playClickSound } from '../utils/sound';
import {
  playSwarNote,
  playSoftClosingNote,
  ensureAudioContext,
  SWAR_CYCLE,
  PC_KEY_CYCLE,
  SWAR_FREQUENCIES,
  SwarName,
  InstrumentType,
} from '../utils/sargamSynth';
import { SargamPanel } from './SargamPanel';
import {
  ArrowUpRight,
  BookOpen,
  FileText,
  X,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
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
  const [isAutoScrolling, setIsAutoScrolling] = useState<boolean>(false);
  const autoScrollRafRef = useRef<number | null>(null);

  // Sargam Synth interactive state
  const [sargamPanelOpen, setSargamPanelOpen] = useState(false);
  const [instrument, setInstrument] = useState<InstrumentType>('flute');
  const [activeSwar, setActiveSwar] = useState<SwarName | null>(null);
  const [targetNote, setTargetNote] = useState<SwarName | null>(null);
  const [isPlayItYourself, setIsPlayItYourself] = useState<boolean>(false);
  const [advanceTrigger, setAdvanceTrigger] = useState<number>(0);

  // Timers & Mute during shuffle
  const isShufflingRef = useRef<boolean>(false);
  const shuffleTimeoutRef = useRef<number | null>(null);
  const activeSwarTimerRef = useRef<number | null>(null);
  const lastPlayedSlotRef = useRef<number>(-1);
  const lastNoteTimeRef = useRef<number>(0);

  // Edge hover auto-scroll refs
  const edgeScrollDirRef = useRef<'left' | 'right' | null>(null);
  const edgeScrollRafRef = useRef<number | null>(null);
  const hasHoveredShelfRef = useRef<boolean>(false);
  const hasPlayedClosingNoteRef = useRef<boolean>(false);

  // Book spine long press & sound refs
  const activeBookVoiceStopperRef = useRef<(() => void) | null>(null);
  const bookPointerDownTimeRef = useRef<number>(0);

  // Floating hover preview state for Essays
  const [hoveredEssay, setHoveredEssay] = useState<EssayItem | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [canHover, setCanHover] = useState(false);

  // Smooth lerp coordinates for cursor preview card
  const mouseTargetRef = useRef({ x: 0, y: 0 });
  const mouseCurrentRef = useRef({ x: 0, y: 0 });
  const [previewPos, setPreviewPos] = useState({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  // 1. Initialize data & hover capability check
  useEffect(() => {
    // 1. Load initial cached data
    const localB = loadBooks();
    const localE = loadEssays();
    setBooks(localB);
    setEssays(localE);

    // 2. Fetch live data from Supabase
    const fetchLiveData = async () => {
      try {
        const [booksRes, essaysRes] = await Promise.all([
          supabase.from('books').select('*').order('created_at', { ascending: false }),
          supabase.from('essays').select('*').order('created_at', { ascending: false }),
        ]);

        if (booksRes.data && Array.isArray(booksRes.data) && booksRes.data.length > 0) {
          const liveBooks: BookItem[] = booksRes.data.map((b: any) => ({
            id: b.id,
            title: b.title,
            author: b.author,
            year: b.year || '2026',
            note: b.note || '',
            h: b.h || 220,
            w: b.w || 40,
            c: b.c || '#1e293b',
            fg: b.fg || '#ffffff',
            link: b.link || undefined,
            status: (b.status as any) || 'Finished',
          }));
          setBooks(liveBooks);
          saveBooks(liveBooks);
        }

        if (essaysRes.data && Array.isArray(essaysRes.data) && essaysRes.data.length > 0) {
          const liveEssays: EssayItem[] = essaysRes.data.map((e: any) => ({
            id: e.id,
            title: e.title,
            year: e.year || '2026',
            type: e.type || 'Essay',
            source: e.source || 'Web',
            url: e.url || '',
            cap: e.cap || e.source || 'Archive',
            status: (e.status as any) || 'Finished',
          }));
          setEssays(liveEssays);
          saveEssays(liveEssays);
        }
      } catch (err) {
        console.warn('Supabase direct fetch fallback:', err);
      }
    };
    fetchLiveData();

    // 3. Realtime Supabase live listener for newly added books & essays
    const channel = supabase
      .channel('reading-section-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'books' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const b = payload.new as any;
            const newBook: BookItem = {
              id: b.id,
              title: b.title,
              author: b.author,
              year: b.year || '2026',
              note: b.note || '',
              h: b.h || 220,
              w: b.w || 40,
              c: b.c || '#1e293b',
              fg: b.fg || '#ffffff',
              link: b.link || undefined,
              status: b.status || 'Finished',
            };
            setBooks((prev) => [newBook, ...prev.filter((item) => item.id !== newBook.id)]);
          } else if (payload.eventType === 'UPDATE') {
            const b = payload.new as any;
            setBooks((prev) =>
              prev.map((item) =>
                item.id === b.id
                  ? {
                      ...item,
                      title: b.title,
                      author: b.author,
                      year: b.year || item.year,
                      note: b.note || item.note,
                      h: b.h || item.h,
                      w: b.w || item.w,
                      c: b.c || item.c,
                      fg: b.fg || item.fg,
                      link: b.link || item.link,
                      status: b.status || item.status || 'Finished',
                    }
                  : item
              )
            );
          } else if (payload.eventType === 'DELETE') {
            if (payload.old && payload.old.id) {
              setBooks((prev) => prev.filter((item) => item.id !== payload.old.id));
            }
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'essays' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const e = payload.new as any;
            const newEssay: EssayItem = {
              id: e.id,
              title: e.title,
              year: e.year || '2026',
              type: e.type || 'Essay',
              source: e.source || 'Web',
              url: e.url || '',
              cap: e.cap || e.source || 'Archive',
              status: e.status || 'Finished',
            };
            setEssays((prev) => [newEssay, ...prev.filter((item) => item.id !== newEssay.id)]);
          } else if (payload.eventType === 'UPDATE') {
            const e = payload.new as any;
            setEssays((prev) =>
              prev.map((item) =>
                item.id === e.id
                  ? {
                      ...item,
                      title: e.title,
                      year: e.year || item.year,
                      type: e.type || item.type,
                      source: e.source || item.source,
                      url: e.url || item.url,
                      cap: e.cap || item.cap,
                      status: e.status || item.status || 'Finished',
                    }
                  : item
              )
            );
          } else if (payload.eventType === 'DELETE') {
            if (payload.old && payload.old.id) {
              setEssays((prev) => prev.filter((item) => item.id !== payload.old.id));
            }
          }
        }
      )
      .subscribe();

    const hoverQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    setCanHover(hoverQuery.matches);

    const handleQueryChange = (e: MediaQueryListEvent) => {
      setCanHover(e.matches);
    };

    hoverQuery.addEventListener('change', handleQueryChange);
    return () => {
      hoverQuery.removeEventListener('change', handleQueryChange);
      supabase.removeChannel(channel);
    };
  }, []);

  // Update shelf scroll indicators
  const checkShelfScroll = useCallback(() => {
    if (!shelfScrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = shelfScrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  // Highlight all books that share the same note for 400ms
  const triggerNoteHighlight = useCallback((swar: SwarName) => {
    if (isShufflingRef.current) return;
    setActiveSwar(swar);
    if (activeSwarTimerRef.current) {
      clearTimeout(activeSwarTimerRef.current);
    }
    activeSwarTimerRef.current = window.setTimeout(() => {
      setActiveSwar(null);
    }, 400);
  }, []);

  // Play a slot note with the current instrument
  const playSlotNote = useCallback(
    (swar: SwarName, duration: number = 0.35, vol: number = 0.08) => {
      if (isShufflingRef.current) return;
      ensureAudioContext();
      const freq = SWAR_FREQUENCIES[swar];
      if (freq) {
        playSwarNote(freq, instrument, duration, vol);
        triggerNoteHighlight(swar);
      }
    },
    [instrument, triggerNoteHighlight]
  );

  // Scroll listener: playing repeating 8-scale notes as books pass by
  const handleShelfScrollWithSound = useCallback(() => {
    checkShelfScroll();
    if (isShufflingRef.current) return;
    const el = shelfScrollRef.current;
    if (!el || books.length === 0) return;

    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll > 15) {
      const progress = Math.max(0, Math.min(1, el.scrollLeft / maxScroll));
      const currentSlot = Math.min(books.length - 1, Math.floor(progress * books.length));
      const noteIndex = currentSlot % 8;
      const swar = SWAR_CYCLE[noteIndex];

      const now = Date.now();
      if (currentSlot !== lastPlayedSlotRef.current && now - lastNoteTimeRef.current > 45) {
        ensureAudioContext();
        playSlotNote(swar, 0.28, 0.08);
        lastPlayedSlotRef.current = currentSlot;
        lastNoteTimeRef.current = now;
      }
    }
  }, [books.length, checkShelfScroll, playSlotNote]);

  // Autoscroll stop callback
  const stopAutoscroll = useCallback(() => {
    setIsAutoScrolling(false);
    if (autoScrollRafRef.current) {
      cancelAnimationFrame(autoScrollRafRef.current);
      autoScrollRafRef.current = null;
    }
  }, []);

  // Autoscroll toggle
  const toggleAutoscroll = () => {
    if (isAutoScrolling) {
      stopAutoscroll();
      return;
    }

    const el = shelfScrollRef.current;
    if (!el) return;

    ensureAudioContext();
    stopEdgeScroll();
    setIsAutoScrolling(true);
    playClickSound('high');

    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0) return;

    if (el.scrollLeft >= maxScroll - 30) {
      el.scrollLeft = 0;
    }

    const startPos = el.scrollLeft;
    const distance = maxScroll - startPos;
    const duration = Math.max(5000, (distance / maxScroll) * 11000);
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);

      el.scrollLeft = startPos + distance * progress;

      if (progress < 1) {
        autoScrollRafRef.current = requestAnimationFrame(step);
      } else {
        stopAutoscroll();
      }
    };

    autoScrollRafRef.current = requestAnimationFrame(step);
  };

  // Hover over individual book spine plays corresponding slot note (bookIndex % 8)
  const handleBookMouseEnter = (slotIndex: number) => {
    if (!canHover || isShufflingRef.current) return;
    ensureAudioContext();
    const noteIndex = slotIndex % 8;
    const swar = SWAR_CYCLE[noteIndex];
    playSlotNote(swar, 0.35, 0.08);
  };

  // Hover-edge autoscroll: edge stop function
  const stopEdgeScroll = useCallback(() => {
    edgeScrollDirRef.current = null;
    if (edgeScrollRafRef.current) {
      cancelAnimationFrame(edgeScrollRafRef.current);
      edgeScrollRafRef.current = null;
    }
  }, []);

  // Hover keeps going past the edge: smoothly auto-scrolls shelf with notes playing as books pass
  const startEdgeScroll = useCallback(
    (dir: 'left' | 'right') => {
      if (edgeScrollDirRef.current === dir && edgeScrollRafRef.current) return;
      stopAutoscroll();
      edgeScrollDirRef.current = dir;
      if (edgeScrollRafRef.current) {
        cancelAnimationFrame(edgeScrollRafRef.current);
      }

      const step = () => {
        const el = shelfScrollRef.current;
        if (!el || !edgeScrollDirRef.current) return;

        const maxScroll = el.scrollWidth - el.clientWidth;
        if (maxScroll <= 0) {
          stopEdgeScroll();
          return;
        }

        if (edgeScrollDirRef.current === 'right') {
          if (el.scrollLeft >= maxScroll - 1) {
            // Reached right edge (last book) -> soft closing note
            if (!hasPlayedClosingNoteRef.current) {
              playSoftClosingNote();
              hasPlayedClosingNoteRef.current = true;
            }
            stopEdgeScroll();
            return;
          }
          el.scrollLeft += 4.5;
          edgeScrollRafRef.current = requestAnimationFrame(step);
        } else if (edgeScrollDirRef.current === 'left') {
          if (el.scrollLeft <= 1) {
            // Reached left edge (first book) -> soft closing note
            if (!hasPlayedClosingNoteRef.current) {
              playSoftClosingNote();
              hasPlayedClosingNoteRef.current = true;
            }
            stopEdgeScroll();
            return;
          }
          el.scrollLeft -= 4.5;
          edgeScrollRafRef.current = requestAnimationFrame(step);
        }
      };

      edgeScrollRafRef.current = requestAnimationFrame(step);
    },
    [stopAutoscroll, stopEdgeScroll]
  );

  // Hover-edge autoscroll on PC: gliding gently when listening while hovering near edges
  const handleShelfHoverMove = (e: React.MouseEvent<HTMLDivElement>) => {
    hasHoveredShelfRef.current = true;
    if (isAutoScrolling || !canHover || !shelfScrollRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    if (x > width * 0.88) {
      shelfScrollRef.current.scrollBy({ left: 6, behavior: 'auto' });
    } else if (x < width * 0.12) {
      shelfScrollRef.current.scrollBy({ left: -6, behavior: 'auto' });
    }
  };

  // Global mouse & interaction tracking:
  // When cursor leaves the shelf off left/right into blank area, shelf keeps auto-scrolling
  // Stops when cursor returns, clicks/touches anything, reaches the end, or tab loses focus.
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!canHover || !shelfScrollRef.current) return;

      const rect = shelfScrollRef.current.getBoundingClientRect();
      const inVerticalBand = e.clientY >= rect.top - 120 && e.clientY <= rect.bottom + 120;

      if (!inVerticalBand) {
        if (edgeScrollDirRef.current) {
          stopEdgeScroll();
        }
        return;
      }

      // Inside shelf horizontally: cursor has returned!
      if (e.clientX >= rect.left && e.clientX <= rect.right) {
        hasHoveredShelfRef.current = true;
        hasPlayedClosingNoteRef.current = false;
        if (edgeScrollDirRef.current) {
          stopEdgeScroll();
        }
        return;
      }

      // Cursor moves off the left or right end into blank area:
      if (hasHoveredShelfRef.current && !isAutoScrolling) {
        if (e.clientX < rect.left) {
          startEdgeScroll('left');
        } else if (e.clientX > rect.right) {
          startEdgeScroll('right');
        }
      }
    };

    const handleInteractionStop = () => {
      stopEdgeScroll();
      ensureAudioContext();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopEdgeScroll();
      }
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('pointerdown', handleInteractionStop);
    window.addEventListener('touchstart', handleInteractionStop);
    window.addEventListener('blur', stopEdgeScroll);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('pointerdown', handleInteractionStop);
      window.removeEventListener('touchstart', handleInteractionStop);
      window.removeEventListener('blur', stopEdgeScroll);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      stopEdgeScroll();
    };
  }, [canHover, startEdgeScroll, stopEdgeScroll]);

  useEffect(() => {
    return () => {
      if (autoScrollRafRef.current) cancelAnimationFrame(autoScrollRafRef.current);
      stopEdgeScroll();
      if (activeBookVoiceStopperRef.current) {
        activeBookVoiceStopperRef.current();
      }
    };
  }, [stopEdgeScroll]);

  useEffect(() => {
    const el = shelfScrollRef.current;
    if (!el) return;
    checkShelfScroll();
    el.addEventListener('scroll', handleShelfScrollWithSound, { passive: true });
    window.addEventListener('resize', checkShelfScroll);
    return () => {
      el.removeEventListener('scroll', handleShelfScrollWithSound);
      window.removeEventListener('resize', checkShelfScroll);
    };
  }, [books, checkShelfScroll, handleShelfScrollWithSound]);

  // Scroll shelf left/right
  const scrollShelf = (direction: 'left' | 'right') => {
    if (!shelfScrollRef.current) return;
    stopAutoscroll();
    stopEdgeScroll();
    ensureAudioContext();
    playClickSound('tick');
    const scrollAmount = direction === 'left' ? -320 : 320;
    shelfScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  // 2. Shuffle Handlers (Shuffle-safe: positions retain their notes)
  const handleShuffleBooks = useCallback(() => {
    isShufflingRef.current = true;
    setActiveSwar(null);
    if (shuffleTimeoutRef.current) clearTimeout(shuffleTimeoutRef.current);
    shuffleTimeoutRef.current = window.setTimeout(() => {
      isShufflingRef.current = false;
    }, 450);

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

  // 4. Book Selection & Sound (Slot-based repeating 8-scale notes)
  const handleBookPointerDown = (slotIndex: number, e: React.PointerEvent) => {
    if (isShufflingRef.current) return;
    ensureAudioContext();
    bookPointerDownTimeRef.current = Date.now();
    const noteIndex = slotIndex % 8;
    const swar = SWAR_CYCLE[noteIndex];
    const freq = SWAR_FREQUENCIES[swar];

    if (activeBookVoiceStopperRef.current) {
      activeBookVoiceStopperRef.current();
      activeBookVoiceStopperRef.current = null;
    }

    // Sustain note while held down (long press like a real instrument)
    activeBookVoiceStopperRef.current = playSwarNote(freq, instrument, -1, 0.08);
    triggerNoteHighlight(swar);
  };

  const releaseBookVoice = () => {
    if (activeBookVoiceStopperRef.current) {
      activeBookVoiceStopperRef.current();
      activeBookVoiceStopperRef.current = null;
    }
  };

  const handleBookClick = (book: BookItem, slotIndex: number) => {
    ensureAudioContext();
    const noteIndex = slotIndex % 8;
    const swar = SWAR_CYCLE[noteIndex];
    const heldMs = Date.now() - bookPointerDownTimeRef.current;

    if (!isShufflingRef.current) {
      if (heldMs < 200) {
        playSlotNote(swar, 0.45, 0.085);
      } else {
        triggerNoteHighlight(swar);
      }

      // In "Play it yourself" practice mode: check if this is the required note
      if (isPlayItYourself && targetNote && swar === targetNote) {
        setAdvanceTrigger((prev) => prev + 1);
      }
    }

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

  // PC Keyboard listeners for playing notes: [S, R, G, M, P, D, N, Z, K]
  useEffect(() => {
    const keyMap: Record<string, SwarName> = {
      s: 'Sa',
      S: 'Sa',
      r: 'Re',
      R: 'Re',
      g: 'Ga',
      G: 'Ga',
      m: 'Ma',
      M: 'Ma',
      p: 'Pa',
      P: 'Pa',
      d: 'Dha',
      D: 'Dha',
      n: 'Ni',
      N: 'Ni',
      z: "Sa'",
      Z: "Sa'",
      k: 'ni',
      K: 'ni',
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (targetTag === 'input' || targetTag === 'textarea') return;

      const swar = keyMap[e.key];
      if (swar && !e.repeat && !isShufflingRef.current) {
        playSlotNote(swar, 0.35, 0.08);
        if (isPlayItYourself && targetNote && swar === targetNote) {
          setAdvanceTrigger((prev) => prev + 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlayItYourself, playSlotNote, targetNote]);

  // Filtered essays & Pagination (10 items per page)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ESSAYS_PER_PAGE = 10;

  const essayCategories = ['All', 'Essay', 'Report', 'Article', 'Video'];
  const filteredEssays = essays.filter((item) => {
    if (selectedEssayCategory === 'All') return true;
    return item.type.toLowerCase() === selectedEssayCategory.toLowerCase();
  });

  const totalPages = Math.max(1, Math.ceil(filteredEssays.length / ESSAYS_PER_PAGE));
  const effectiveCurrentPage = Math.min(currentPage, totalPages);

  const paginatedEssays = filteredEssays.slice(
    (effectiveCurrentPage - 1) * ESSAYS_PER_PAGE,
    effectiveCurrentPage * ESSAYS_PER_PAGE
  );

  return (
    <div
      onMouseMove={handleMouseMove}
      className="w-full font-sans select-text"
    >
      
      {/* ── Page 4 Header & Controls ─────────────────────────────── */}
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

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Autoscroll with Indian Classical Symphony */}
          <button
            onClick={toggleAutoscroll}
            title="Autoscroll bookshelf with Indian symphony melody"
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-micro font-mono transition-all cursor-pointer border ${
              isAutoScrolling
                ? 'bg-black text-[#d2fd78] border-black font-semibold shadow-xs scale-105'
                : 'bg-neutral-100 hover:bg-neutral-200 text-black border-neutral-200 font-medium'
            }`}
          >
            <span>{isAutoScrolling ? 'Stop Symphony' : 'Autoscroll 🎶'}</span>
          </button>

          {/* Shuffle Entire Library Button */}
          <button
            onClick={handleShuffleBooks}
            title="Randomize shelf order"
            className="flex items-center gap-1.5 px-3 py-1 rounded text-micro font-mono bg-neutral-100 hover:bg-neutral-200 text-black transition-colors cursor-pointer border border-neutral-200 font-medium"
          >
            <Shuffle size={12} />
            <span>Shuffle Shelf</span>
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

          {/* Left/Right Scroll Controls & Interactive Sargam Synth Toggle */}
          <div className="flex items-center gap-1">
            <span className="text-micro font-mono text-neutral-400 hidden sm:inline mr-2">
              Hover across shelf for symphony • Click spine to draw out
            </span>
            <button
              onClick={() => {
                ensureAudioContext();
                setSargamPanelOpen((prev) => !prev);
              }}
              title={sargamPanelOpen ? 'Hide Sargam synth' : 'Open Sargam synth'}
              aria-label={sargamPanelOpen ? 'Hide Sargam synth' : 'Open Sargam synth'}
              className={`p-1 rounded border transition-colors cursor-pointer mr-0.5 ${
                sargamPanelOpen
                  ? 'bg-black text-[#d2fd78] border-black shadow-xs'
                  : 'border-neutral-200 text-black hover:bg-neutral-100'
              }`}
            >
              {sargamPanelOpen ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
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
        <div
          onMouseMove={handleShelfHoverMove}
          onMouseEnter={() => {
            hasHoveredShelfRef.current = true;
            hasPlayedClosingNoteRef.current = false;
            stopEdgeScroll();
          }}
          onPointerDown={() => ensureAudioContext()}
          className="relative pt-8 pb-3"
        >
          <div
            ref={shelfScrollRef}
            className="w-full overflow-x-auto pb-3 no-scrollbar"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <div className="inline-flex flex-col min-w-full px-3">
              {/* Row 1: Books + Note names directly under books (above wooden plank) */}
              <div className="inline-flex items-end justify-start gap-2.5 min-w-max h-[278px]">
                {books.map((book, idx) => {
                  const isSelected = selectedBook?.id === book.id;
                  const swar = SWAR_CYCLE[idx % 8];
                  const isNoteActive = activeSwar === swar;
                  const isTarget = isPlayItYourself && targetNote === swar;

                  return (
                    <div
                      key={book.id}
                      style={{ width: `${book.w}px` }}
                      className="flex flex-col items-center justify-end h-full shrink-0"
                    >
                      <button
                        onClick={() => handleBookClick(book, idx)}
                        onMouseEnter={() => handleBookMouseEnter(idx)}
                        onPointerDown={(e) => handleBookPointerDown(idx, e)}
                        onPointerUp={releaseBookVoice}
                        onPointerLeave={releaseBookVoice}
                        onPointerCancel={releaseBookVoice}
                        aria-pressed={isSelected}
                        title={`${book.title} by ${book.author} (${book.year})`}
                        style={{
                          height: `${book.h}px`,
                          width: `${book.w}px`,
                          backgroundColor: book.c,
                          color: book.fg,
                          animationDelay: `${idx * 40}ms`,
                          touchAction: 'manipulation',
                        }}
                        className={`relative group rounded-t-xs transition-all duration-300 ease-out cursor-pointer flex flex-col justify-between items-center py-3 px-1 border border-black/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-black book-spine shrink-0 select-none ${
                          isSelected
                            ? '-translate-y-7 shadow-2xl ring-2 ring-black scale-[1.04] z-30'
                            : isNoteActive
                            ? 'note-active z-20'
                            : isTarget
                            ? 'note-target z-20'
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

                        {/* Top Year Tag & Status Indicator */}
                        <div className="flex flex-col items-center shrink-0">
                          {book.status === 'On it' && (
                            <span
                              className="w-1.5 h-1.5 rounded-full bg-[#d2fd78] shadow-xs mb-0.5 animate-pulse"
                              title="Currently Reading (On it)"
                            />
                          )}
                          <span
                            className="text-[9px] font-mono tracking-tighter opacity-80 select-none"
                            style={{ color: book.fg }}
                          >
                            {book.year}
                          </span>
                        </div>

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

                      {/* Note Name directly under the book, just above the wooden shelf plank */}
                      <div
                        className={`w-full flex items-center justify-center font-mono text-[10px] select-none transition-all duration-200 ${
                          sargamPanelOpen
                            ? 'opacity-100 max-h-5 py-0.5'
                            : 'opacity-0 max-h-0 overflow-hidden py-0'
                        } ${
                          isNoteActive
                            ? 'text-black font-bold scale-110'
                            : isTarget
                            ? 'text-black font-bold animate-pulse'
                            : 'text-neutral-500'
                        }`}
                      >
                        {swar}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Row 2: Solid 2.5D Wooden Shelf Base Plank */}
              <div className="w-full h-3.5 bg-neutral-900 rounded-xs shadow-md border-t border-white/20 relative my-0.5">
                <div className="absolute inset-0 bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 opacity-90 rounded-xs" />
              </div>

              {/* Row 3: PC Key Labels in square brackets below shelf plank */}
              <div
                className={`inline-flex items-center justify-start gap-2.5 transition-all duration-200 min-w-max pc-key-row ${
                  sargamPanelOpen
                    ? 'opacity-100 max-h-6 py-1'
                    : 'opacity-0 max-h-0 overflow-hidden py-0'
                }`}
              >
                {books.map((book, slotIndex) => {
                  const swar = SWAR_CYCLE[slotIndex % 8];
                  const isNoteActive = activeSwar === swar;
                  const isTarget = isPlayItYourself && targetNote === swar;
                  return (
                    <div
                      key={slotIndex}
                      style={{ width: `${book.w}px` }}
                      className="flex items-center justify-center shrink-0"
                    >
                      <span
                        className={`font-mono text-[9px] select-none transition-all duration-150 ${
                          isNoteActive
                            ? 'text-black font-bold scale-110'
                            : isTarget
                            ? 'text-black font-bold animate-pulse'
                            : 'text-neutral-400'
                        }`}
                      >
                        [{PC_KEY_CYCLE[slotIndex % 8]}]
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Sargam Synth Panel (Opens smoothly in gap below shelf) */}
        <SargamPanel
          isOpen={sargamPanelOpen}
          instrument={instrument}
          onInstrumentChange={setInstrument}
          targetNote={targetNote}
          onTargetNoteChange={setTargetNote}
          isPlayItYourself={isPlayItYourself}
          onTogglePlayItYourself={() => setIsPlayItYourself((prev) => !prev)}
          advanceTrigger={advanceTrigger}
          onPlaySwar={(swar) => playSlotNote(swar, 0.45, 0.085)}
          onClose={() => setSargamPanelOpen(false)}
        />

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
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                    selectedBook.status === 'On it'
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-neutral-100 text-neutral-700 border-neutral-200'
                  }`}
                >
                  {selectedBook.status === 'On it' ? '📖 Currently Reading (On it)' : '✓ Finished'}
                </span>
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
                      setCurrentPage(1);
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
              onClick={() => {
                handleShuffleEssays();
                setCurrentPage(1);
              }}
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
              {paginatedEssays.map((item, idx) => {
                const itemNumber = (effectiveCurrentPage - 1) * ESSAYS_PER_PAGE + idx + 1;

                return (
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
                        {String(itemNumber).padStart(2, '0')}
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
                    {/* Title & Status Badge */}
                    <td className="py-3 px-3 font-medium text-black group-hover:text-blue-600 transition-colors">
                      <div className="flex items-center gap-2 flex-wrap">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-inherit"
                        >
                          {item.title}
                        </a>
                        {item.status === 'On it' && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-300 font-mono text-[9px] font-bold shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            <span>On it</span>
                          </span>
                        )}
                      </div>
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
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar (Page 1, 2, 3...) for 10+ items */}
        {totalPages > 1 && (
          <div className="mt-5 pt-4 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs">
            <span className="text-neutral-400 text-micro">
              Showing {(effectiveCurrentPage - 1) * ESSAYS_PER_PAGE + 1}–
              {Math.min(effectiveCurrentPage * ESSAYS_PER_PAGE, filteredEssays.length)} of {filteredEssays.length} items
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  if (effectiveCurrentPage > 1) {
                    playClickSound('tick');
                    setCurrentPage(effectiveCurrentPage - 1);
                  }
                }}
                disabled={effectiveCurrentPage === 1}
                className={`px-2.5 py-1 rounded text-micro border transition-colors ${
                  effectiveCurrentPage === 1
                    ? 'border-neutral-200 text-neutral-300 cursor-not-allowed'
                    : 'border-neutral-300 text-neutral-700 hover:bg-neutral-100 cursor-pointer'
                }`}
              >
                Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                <button
                  key={pg}
                  type="button"
                  onClick={() => {
                    playClickSound('tick');
                    setCurrentPage(pg);
                  }}
                  className={`min-w-[28px] h-7 px-2 rounded text-micro transition-colors cursor-pointer border ${
                    effectiveCurrentPage === pg
                      ? 'bg-black text-white border-black font-bold'
                      : 'border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  {pg}
                </button>
              ))}

              <button
                type="button"
                onClick={() => {
                  if (effectiveCurrentPage < totalPages) {
                    playClickSound('tick');
                    setCurrentPage(effectiveCurrentPage + 1);
                  }
                }}
                disabled={effectiveCurrentPage === totalPages}
                className={`px-2.5 py-1 rounded text-micro border transition-colors ${
                  effectiveCurrentPage === totalPages
                    ? 'border-neutral-200 text-neutral-300 cursor-not-allowed'
                    : 'border-neutral-300 text-neutral-700 hover:bg-neutral-100 cursor-pointer'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
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

    </div>
  );
};
