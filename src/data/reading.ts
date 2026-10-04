// ============================================================================
// READING ARCHIVE & BOOKSHELF DATA
// Pure real-world books, longform essays, research reports & video lectures.
// No stock photography. Supports live syncing via Telegram Webhook & LocalStorage.
// ============================================================================

export interface BookItem {
  id: string;
  title: string;
  author: string;
  year: string;
  note: string;
  h: number;  // spine height in px (180 - 240)
  w: number;  // spine width in px (32 - 48)
  c: string;  // spine background hex/rgb
  fg: string; // spine text color hex/rgb
  accent?: string;
  link?: string;
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
// PART 1: BOOKS (Animated 2.5D Bookshelf - 100% Real Authentic Books)
// ----------------------------------------------------------------------------
export const INITIAL_BOOKS: BookItem[] = [
  {
    id: 'b-0',
    title: 'Wishpers of the soul: A Journey',
    author: 'Vansh Lohia',
    year: '2024',
    note: 'My debut poetry ebook published on Amazon Kindle. Capturing personal reflections, emotional depth, and poetic perspectives.',
    h: 238,
    w: 46,
    c: '#1e3a8a', // Deep royal indigo
    fg: '#d2fd78', // Acid lime text accent
    link: 'https://www.amazon.in/Wishpers-soul-Journey-Vansh-Lohia-ebook/dp/B0CRBFN13S',
  },
  {
    id: 'b-1',
    title: 'A Brief History of Time',
    author: 'Stephen Hawking',
    year: '1988',
    note: 'Masterclass in demystifying black holes, cosmological singularities, and the cosmic arrow of time without losing intellectual wonder.',
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
    note: 'Adlerian psychology dialogue on interpersonal freedom, separation of tasks, self-reliance, and living in the absolute present.',
    h: 206,
    w: 38,
    c: '#eae8df',
    fg: '#18181b',
  },
  {
    id: 'b-3',
    title: 'Thinking in Systems',
    author: 'Donella H. Meadows',
    year: '2008',
    note: 'Essential primer on non-linear thinking, feedback loops, leverage points, delay dynamics, and complex emergent behaviors.',
    h: 218,
    w: 40,
    c: '#27272a',
    fg: '#d2fd78',
  },
  {
    id: 'b-4',
    title: 'Cosmos',
    author: 'Carl Sagan',
    year: '1980',
    note: 'Poetic synthesis of astrophysics, human curiosity, scientific reverence, and our fragile pale blue dot in the cosmic ocean.',
    h: 236,
    w: 44,
    c: '#0f172a',
    fg: '#f8fafc',
  },
  {
    id: 'b-5',
    title: 'The Design of Everyday Things',
    author: 'Don Norman',
    year: '2013',
    note: 'Foundational mental models on affordances, signifiers, tactile mapping, conceptual models, and human cognitive ergonomics.',
    h: 200,
    w: 36,
    c: '#f4f4f5',
    fg: '#09090b',
  },
  {
    id: 'b-6',
    title: 'Sapiens: A Brief History of Humankind',
    author: 'Yuval Noah Harari',
    year: '2011',
    note: 'How cognitive revolutions, shared imagined mythologies, and large-scale cooperative imagination shaped human civilization.',
    h: 224,
    w: 44,
    c: '#1c1917',
    fg: '#fafaf9',
  },
  {
    id: 'b-7',
    title: "Man's Search for Meaning",
    author: 'Viktor E. Frankl',
    year: '1946',
    note: 'Logotherapy and the profound psychological discovery that meaning can be cultivated through responsibility, love, and courage.',
    h: 194,
    w: 35,
    c: '#3f3f46',
    fg: '#f4f4f5',
  },
  {
    id: 'b-8',
    title: 'Zero to One',
    author: 'Peter Thiel',
    year: '2014',
    note: 'Contrarian thinking on technological progress: moving from 0 to 1 through vertical innovation rather than horizontal 1 to n copying.',
    h: 212,
    w: 39,
    c: '#09090b',
    fg: '#38bdf8',
  },
  {
    id: 'b-9',
    title: 'Atomic Habits',
    author: 'James Clear',
    year: '2018',
    note: 'Actionable compound engineering of daily behavioral feedback loops, identity-based habits, and friction reduction.',
    h: 220,
    w: 42,
    c: '#e4e4e7',
    fg: '#18181b',
  },
];

// ----------------------------------------------------------------------------
// PART 2: ESSAYS & REPORTS (100% Real Essays, Reports, Articles & Lectures)
// ----------------------------------------------------------------------------
export const INITIAL_ESSAYS: EssayItem[] = [
  {
    id: 'e-1',
    year: '2026',
    title: 'The Architecture of Smoothness: 120 FPS Interaction Engineering',
    type: 'Essay',
    source: 'van-sh.dev/writings',
    url: 'https://github.com/Vanshlohia05/Vansh',
    cap: 'Frame budgets, composite layers, and physics-based springs',
  },
  {
    id: 'e-2',
    year: '2024',
    title: 'Stanford HAI: Artificial Intelligence Index Report',
    type: 'Report',
    source: 'Stanford University (HAI)',
    url: 'https://aiindex.stanford.edu/report/',
    cap: 'Annual comprehensive benchmark of global AI capabilities & technical trends',
  },
  {
    id: 'e-3',
    year: '1994',
    title: 'Carl Sagan: Reflections on a Pale Blue Dot & Cosmic Perspective',
    type: 'Video',
    source: 'YouTube / Sagan Archive',
    url: 'https://www.youtube.com/watch?v=GO5FwsblpT8',
    cap: 'Reflections on human humility, preservation of Earth, and the cosmos',
  },
  {
    id: 'e-4',
    year: '2024',
    title: 'Non-Linear Thinking: How Complex Systems Evade Direct Logic',
    type: 'Article',
    source: 'Farnam Street (FS.blog)',
    url: 'https://fs.blog/mental-models/',
    cap: 'Second-order effects, feedback delays, and structural leverage points',
  },
  {
    id: 'e-5',
    year: '2024',
    title: 'Typography as Structural Architecture in Digital Spaces',
    type: 'Essay',
    source: 'Editorial Design Notes',
    url: 'https://github.com/Vanshlohia05/Vansh',
    cap: 'Swiss typography, negative space dynamics, and baseline grid alignment',
  },
  {
    id: 'e-6',
    year: '1964',
    title: 'Richard Feynman: The Character of Physical Law (Messenger Lectures)',
    type: 'Video',
    source: 'YouTube / Cornell Lectures',
    url: 'https://www.youtube.com/watch?v=j3mhkYbznBk',
    cap: 'Symmetry, conservation laws, and mathematical elegance in nature',
  },
];

// ----------------------------------------------------------------------------
// HELPER: Generate clean minimalist SVG preview cards for non-video items
// ----------------------------------------------------------------------------
export function generateSvgPreview(item: EssayItem): string {
  const typeBadgeColor =
    item.type === 'Report' ? '#3b82f6' : item.type === 'Video' ? '#ef4444' : item.type === 'Article' ? '#10b981' : '#d2fd78';
  const typeTextColor = item.type === 'Essay' ? '#000000' : '#ffffff';

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
    <rect width="600" height="400" fill="#09090b" />
    <defs>
      <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#27272a" stroke-width="0.75" />
      </pattern>
    </defs>
    <rect width="600" height="400" fill="url(#grid)" opacity="0.8" />
    
    <!-- Top Monospace Bar -->
    <text x="36" y="52" fill="#71717a" font-family="monospace" font-size="14" letter-spacing="1">INDEX // ${item.year} // ${item.source}</text>
    
    <!-- Category Pill -->
    <rect x="36" y="85" width="90" height="26" rx="4" fill="${typeBadgeColor}" />
    <text x="81" y="102" fill="${typeTextColor}" font-family="monospace" font-weight="bold" font-size="12" text-anchor="middle" letter-spacing="0.5">${item.type.toUpperCase()}</text>
    
    <!-- Title -->
    <text x="36" y="170" fill="#ffffff" font-family="sans-serif" font-weight="bold" font-size="22" width="520">
      <tspan x="36" dy="0">${item.title.length > 36 ? item.title.slice(0, 36) + '...' : item.title}</tspan>
    </text>
    
    <!-- Caption / Note -->
    <text x="36" y="220" fill="#a1a1aa" font-family="sans-serif" font-size="14">
      <tspan x="36" dy="0">${item.cap || item.source}</tspan>
    </text>
    
    <!-- Bottom Specimen Bar -->
    <line x1="36" y1="330" x2="564" y2="330" stroke="#27272a" stroke-width="1" />
    <text x="36" y="360" fill="#52525b" font-family="monospace" font-size="12">VANSH READING ARCHIVE • SWISS MINIMALISM</text>
    <text x="564" y="360" fill="#d2fd78" font-family="monospace" font-size="12" text-anchor="end">OPEN LINK ↗</text>
  </svg>
  `.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// ----------------------------------------------------------------------------
// HELPER: Resolve Image Preview (Auto YouTube Thumbnail + Clean SVG fallback)
// ----------------------------------------------------------------------------
export function getEssayPreviewImage(item: EssayItem): string | null {
  if (item.img && !item.img.includes('images.unsplash.com')) {
    return item.img;
  }
  if (!item.url) return generateSvgPreview(item);

  // Detect YouTube formats: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID
  const ytMatch = item.url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/))([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch && ytMatch[1]) {
    return `https://i.ytimg.com/vi/${ytMatch[1]}/hqdefault.jpg`;
  }

  return generateSvgPreview(item);
}

// ----------------------------------------------------------------------------
// LOCAL STORAGE & TELEGRAM SYNC STORAGE KEYS (v2 Clean Reset)
// ----------------------------------------------------------------------------
const BOOKS_STORAGE_KEY = 'vansh_portfolio_bookshelf_v2';
const ESSAYS_STORAGE_KEY = 'vansh_portfolio_essays_v2';

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
