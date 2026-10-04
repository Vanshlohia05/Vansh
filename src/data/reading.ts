// ============================================================================
// READING ARCHIVE & BOOKSHELF DATA
// Add new items by copying one line to INITIAL_BOOKS or INITIAL_ESSAYS
// Supports live syncing via Telegram Webhook & LocalStorage
// ============================================================================

export interface BookItem {
  id: string;
  title: string;
  author: string;
  year: string;
  note: string;
  h: number;  // spine height in px (170 - 240)
  w: number;  // spine width in px (30 - 48)
  c: string;  // spine background hex/rgb
  fg: string; // spine text color hex/rgb
}

export interface EssayItem {
  id: string;
  year: string;
  title: string;
  type: 'Essay' | 'Report' | 'Video' | 'Article';
  source: string;
  url: string;
  img?: string;
  cap?: string;
}

// ----------------------------------------------------------------------------
// PART 1: BOOKS (Animated 2.5D Bookshelf)
// ----------------------------------------------------------------------------
export const INITIAL_BOOKS: BookItem[] = [
  {
    id: 'b-1',
    title: 'A Brief History of Time',
    author: 'Stephen Hawking',
    year: '1988',
    note: 'Masterclass in demystifying black holes, cosmological horizons, and the arrow of time without losing wonder.',
    h: 228,
    w: 42,
    c: '#111111',
    fg: '#ffffff',
  },
  {
    id: 'b-2',
    title: 'The Courage to Be Disliked',
    author: 'Ichiro Kishimi & Fumitake Koga',
    year: '2013',
    note: 'Adlerian psychology dialogue on interpersonal freedom, separation of tasks, and living in the present.',
    h: 205,
    w: 38,
    c: '#e9e8e3',
    fg: '#18181b',
  },
  {
    id: 'b-3',
    title: 'Thinking in Systems',
    author: 'Donella H. Meadows',
    year: '2008',
    note: 'Essential primer on non-linear thinking, feedback loops, leverage points, and complex emergent behavior.',
    h: 218,
    w: 40,
    c: '#262626',
    fg: '#d2fd78',
  },
  {
    id: 'b-4',
    title: 'Cosmos',
    author: 'Carl Sagan',
    year: '1980',
    note: 'Poetic synthesis of astrophysics, human curiosity, and our fragile pale blue dot in the cosmic ocean.',
    h: 236,
    w: 46,
    c: '#0f172a',
    fg: '#f8fafc',
  },
  {
    id: 'b-5',
    title: 'The Design of Everyday Things',
    author: 'Don Norman',
    year: '2013',
    note: 'Foundational mental models on affordances, signifiers, tactile mapping, and cognitive ergonomics.',
    h: 198,
    w: 36,
    c: '#f4f4f5',
    fg: '#09090b',
  },
  {
    id: 'b-6',
    title: 'Sapiens: A Brief History of Humankind',
    author: 'Yuval Noah Harari',
    year: '2011',
    note: 'How cognitive revolutions, shared myths, and cooperative imagination shaped human civilization.',
    h: 222,
    w: 44,
    c: '#18181b',
    fg: '#fafafa',
  },
];

// ----------------------------------------------------------------------------
// PART 2: ESSAYS & REPORTS
// ----------------------------------------------------------------------------
export const INITIAL_ESSAYS: EssayItem[] = [
  {
    id: 'e-1',
    year: '2026',
    title: 'The Architecture of Smoothness: 120 FPS Interaction Engineering',
    type: 'Essay',
    source: 'van-sh.dev/writings',
    url: 'https://github.com/Vanshlohia05/Vansh',
    img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=85',
    cap: 'Frame budget, composite layers & physics springs',
  },
  {
    id: 'e-2',
    year: '2025',
    title: 'The State of Generative AI in Creative Fullstack Workflows',
    type: 'Report',
    source: 'arxiv.org / Stanford HAI',
    url: 'https://arxiv.org',
    img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=85',
    cap: 'Benchmarking agentic iteration & vibe coding models',
  },
  {
    id: 'e-3',
    year: '2025',
    title: 'Carl Sagan’s Pale Blue Dot & Cosmic Perspective',
    type: 'Video',
    source: 'YouTube / Sagan Archive',
    url: 'https://www.youtube.com/watch?v=GO5FwsblpT8',
    cap: 'Reflections on human humility & the cosmos',
  },
  {
    id: 'e-4',
    year: '2024',
    title: 'Non-Linear Thinking: How Complex Systems Evade Direct Logic',
    type: 'Article',
    source: 'Farnam Street (FS.blog)',
    url: 'https://fs.blog/mental-models/',
    img: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=85',
    cap: 'Second-order effects, delays & feedback dynamics',
  },
  {
    id: 'e-5',
    year: '2024',
    title: 'Typography as Structural Architecture in Digital Spaces',
    type: 'Essay',
    source: 'Substack / Editorial Design Notes',
    url: 'https://substack.com',
    img: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=85',
    cap: 'Swiss typography, negative space & baseline grids',
  },
  {
    id: 'e-6',
    year: '2023',
    title: 'Richard Feynman on the Character of Physical Law',
    type: 'Video',
    source: 'YouTube / Cornell Messenger Lectures',
    url: 'https://www.youtube.com/watch?v=j3mhkYbznBk',
    cap: 'Symmetry, conservation laws & mathematical elegance',
  },
];

// ----------------------------------------------------------------------------
// HELPER: Resolve Image Preview (Auto YouTube Thumbnail + Custom Img fallback)
// ----------------------------------------------------------------------------
export function getEssayPreviewImage(item: EssayItem): string | null {
  if (item.img) return item.img;
  if (!item.url) return null;

  // Detect YouTube formats: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID
  const ytMatch = item.url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/))([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch && ytMatch[1]) {
    return `https://i.ytimg.com/vi/${ytMatch[1]}/hqdefault.jpg`;
  }

  return null;
}

// ----------------------------------------------------------------------------
// LOCAL STORAGE & TELEGRAM SYNC STORAGE KEYS
// ----------------------------------------------------------------------------
const BOOKS_STORAGE_KEY = 'vansh_portfolio_bookshelf_v1';
const ESSAYS_STORAGE_KEY = 'vansh_portfolio_essays_v1';

export function loadBooks(): BookItem[] {
  try {
    const saved = localStorage.getItem(BOOKS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error loading books from storage:', e);
  }
  return INITIAL_BOOKS;
}

export function saveBooks(books: BookItem[]): void {
  try {
    localStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(books));
  } catch (e) {
    console.error('Error saving books to storage:', e);
  }
}

export function loadEssays(): EssayItem[] {
  try {
    const saved = localStorage.getItem(ESSAYS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error loading essays from storage:', e);
  }
  return INITIAL_ESSAYS;
}

export function saveEssays(essays: EssayItem[]): void {
  try {
    localStorage.setItem(ESSAYS_STORAGE_KEY, JSON.stringify(essays));
  } catch (e) {
    console.error('Error saving essays to storage:', e);
  }
}
