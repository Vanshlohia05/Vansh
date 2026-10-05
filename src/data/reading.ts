// ============================================================================
// READING ARCHIVE & BOOKSHELF DATA
// Pure real-world books, longform essays, research reports & video lectures.
// No stock photography. Supports live syncing via Supabase & LocalStorage.
// ============================================================================

export interface BookItem {
  id: string;
  title: string;
  author: string;
  year: string;
  note: string;
  h: number;  // spine height in px (180 - 245)
  w: number;  // spine width in px (32 - 48)
  c: string;  // spine background hex/rgb
  fg: string; // spine text color hex/rgb
  link?: string;
  status?: 'On it' | 'Finished';
}

export interface EssayItem {
  id: string;
  number?: string;
  year: string;
  title: string;
  type: 'Essay' | 'Report' | 'Video' | 'Article';
  source: string;
  url: string;
  img?: string;
  cap?: string;
  status?: 'On it' | 'Finished';
}

// ----------------------------------------------------------------------------
// PART 1: BOOKS (Animated 2.5D Bookshelf - Exactly 30 Genuinely Read Books)
// ----------------------------------------------------------------------------
export const INITIAL_BOOKS: BookItem[] = [
  {
    id: 'b-01',
    title: 'Wishpers of the soul: A Journey',
    author: 'Vansh Lohia',
    year: '2024',
    note: 'My debut poetry book published on Amazon Kindle. Capturing personal reflections, emotional depth, and poetic perspectives on life\'s quietest truths.',
    h: 242,
    w: 46,
    c: '#1e3a8a', // Deep royal indigo
    fg: '#d2fd78', // Acid lime text accent
    link: 'https://www.amazon.in/Wishpers-soul-Journey-Vansh-Lohia-ebook/dp/B0CRBFN13S',
    status: 'Finished',
  },
  {
    id: 'b-02',
    title: 'Rich Dad Poor Dad',
    author: 'Robert T. Kiyosaki',
    year: '1997',
    note: 'What the rich teach their kids about money that the poor and middle class do not. The power of acquiring income-generating assets over liabilities.',
    h: 220,
    w: 42,
    c: '#581c87', // Classic purple
    fg: '#fbbf24', // Gold accent
    status: 'Finished',
  },
  {
    id: 'b-03',
    title: 'A Brief History of Time',
    author: 'Stephen Hawking',
    year: '1988',
    note: 'Masterclass in demystifying black holes, cosmological singularities, expanding space-time, and the cosmic arrow of time without losing intellectual wonder.',
    h: 232,
    w: 42,
    c: '#0f172a',
    fg: '#ffffff',
    status: 'Finished',
  },
  {
    id: 'b-04',
    title: 'The Psychology of Money',
    author: 'Morgan Housel',
    year: '2020',
    note: 'Timeless lessons on wealth, greed, ego, risk, and human behavior that spreadsheets never teach. Doing well with money is about behavior, not math.',
    h: 212,
    w: 40,
    c: '#1c1917',
    fg: '#e2e8f0',
    status: 'Finished',
  },
  {
    id: 'b-05',
    title: 'Atomic Habits',
    author: 'James Clear',
    year: '2018',
    note: 'An easy & proven way to build good habits and break bad ones through 1% compound improvements, identity shifts, and environmental friction reduction.',
    h: 226,
    w: 44,
    c: '#f4f4f5',
    fg: '#18181b',
    status: 'Finished',
  },
  {
    id: 'b-06',
    title: 'Zero to One',
    author: 'Peter Thiel & Blake Masters',
    year: '2014',
    note: 'Notes on startups, or how to build the future. Going from 0 to 1 through contrarian vertical technological progress rather than horizontal 1 to n copying.',
    h: 218,
    w: 38,
    c: '#0a0a0a',
    fg: '#38bdf8',
    status: 'Finished',
  },
  {
    id: 'b-07',
    title: 'Sapiens: A Brief History of Humankind',
    author: 'Yuval Noah Harari',
    year: '2011',
    note: 'How cognitive revolutions, shared imagined mythologies, money, and large-scale cooperative imagination allowed Homo sapiens to rule planet Earth.',
    h: 236,
    w: 45,
    c: '#292524',
    fg: '#fafaf9',
    status: 'Finished',
  },
  {
    id: 'b-08',
    title: 'The Almanack of Naval Ravikant',
    author: 'Eric Jorgenson',
    year: '2020',
    note: 'A guide to wealth and happiness: creating permissionless leverage, cultivating specific knowledge, developing clear judgment, and modern stoic peace.',
    h: 214,
    w: 39,
    c: '#18181b',
    fg: '#d2fd78',
    status: 'Finished',
  },
  {
    id: 'b-09',
    title: 'Steal Like an Artist',
    author: 'Austin Kleon',
    year: '2012',
    note: '10 things nobody told you about being creative. Embracing constructive influence, remixing lineage, collecting good ideas, and finding your authentic voice.',
    h: 198,
    w: 36,
    c: '#171717',
    fg: '#facc15',
    status: 'Finished',
  },
  {
    id: 'b-10',
    title: 'The Subtle Art of Not Giving a F*ck',
    author: 'Mark Manson',
    year: '2016',
    note: 'A counterintuitive approach to living a good life by accepting negative experiences, embracing honest flaws, and choosing what struggles matter.',
    h: 208,
    w: 41,
    c: '#ea580c',
    fg: '#ffffff',
    status: 'Finished',
  },
  {
    id: 'b-11',
    title: 'The Metamorphosis',
    author: 'Franz Kafka',
    year: '1915',
    note: 'Haunting existential classic exploring Gregor Samsa\'s isolation, familial burden, identity breakdown, and the tragic absurdity of social utility.',
    h: 196,
    w: 36,
    c: '#27272a',
    fg: '#a1a1aa',
    status: 'Finished',
  },
  {
    id: 'b-12',
    title: 'Nexus: A Brief History of Information Networks',
    author: 'Yuval Noah Harari',
    year: '2024',
    note: 'How information networks have both connected and imperiled human societies from ancient scriptures to autonomous generative AI algorithms.',
    h: 238,
    w: 45,
    c: '#042f2e',
    fg: '#2dd4bf',
    status: 'On it',
  },
  {
    id: 'b-13',
    title: 'Thus Spoke Zarathustra',
    author: 'Friedrich Nietzsche',
    year: '1883',
    note: 'Philosophical masterpiece presenting the Übermensch, the will to power, self-overcoming, and the monumental affirmation of eternal recurrence.',
    h: 228,
    w: 42,
    c: '#450a0a',
    fg: '#fecaca',
    status: 'Finished',
  },
  {
    id: 'b-14',
    title: 'The Beginning of Infinity',
    author: 'David Deutsch',
    year: '2011',
    note: 'Explanations that transform the world. A profound exploration of quantum mechanics, epistemology, and unbounded rational progress through human knowledge.',
    h: 234,
    w: 44,
    c: '#082f49',
    fg: '#7dd3fc',
    status: 'Finished',
  },
  {
    id: 'b-15',
    title: 'Cosmos',
    author: 'Carl Sagan',
    year: '1980',
    note: 'Poetic synthesis of astrophysics, human curiosity, scientific reverence, and our fragile pale blue dot floating in the cosmic ocean.',
    h: 240,
    w: 46,
    c: '#0f172a',
    fg: '#f8fafc',
    status: 'Finished',
  },
  {
    id: 'b-16',
    title: "Man's Search for Meaning",
    author: 'Viktor E. Frankl',
    year: '1946',
    note: 'Logotherapy and the profound revelation that human life never ceases to have meaning even in suffering, discovered through responsibility and love.',
    h: 202,
    w: 37,
    c: '#3f3f46',
    fg: '#f4f4f5',
    status: 'Finished',
  },
  {
    id: 'b-17',
    title: 'Dead Poets Society',
    author: 'N.H. Kleinbaum',
    year: '1989',
    note: 'Carpe Diem — seize the day. Celebrating independent thinking, poetic conviction, authentic passion, and defying social conformity.',
    h: 204,
    w: 38,
    c: '#1e1b4b',
    fg: '#c7d2fe',
    status: 'Finished',
  },
  {
    id: 'b-18',
    title: 'The Fault in Our Stars',
    author: 'John Green',
    year: '2012',
    note: 'A deeply poignant reflection on adolescent love, mortality, grief, resilience, and finding an infinite number of moments within numbered days.',
    h: 210,
    w: 39,
    c: '#0284c7',
    fg: '#ffffff',
    status: 'Finished',
  },
  {
    id: 'b-19',
    title: 'Men Are from Mars, Women Are from Venus',
    author: 'John Gray',
    year: '1992',
    note: 'Classic relationship handbook on understanding emotional wavelengths, psychological differences in communication, and mutual empathy.',
    h: 216,
    w: 40,
    c: '#be185d',
    fg: '#fce7f3',
    status: 'Finished',
  },
  {
    id: 'b-20',
    title: 'Five Feet Apart',
    author: 'Rachael Lippincott',
    year: '2018',
    note: 'Heartbreaking and resilient tale of two cystic fibrosis patients navigating physical boundaries, intimate devotion, and the longing for human touch.',
    h: 212,
    w: 38,
    c: '#334155',
    fg: '#e2e8f0',
    status: 'Finished',
  },
  {
    id: 'b-21',
    title: 'The Myth of Sisyphus',
    author: 'Albert Camus',
    year: '1942',
    note: 'Philosophical essay on the absurd, defiance, and finding authentic joy and freedom in rolling your boulder up the mountain every single day.',
    h: 200,
    w: 37,
    c: '#d97706',
    fg: '#1c1917',
    status: 'Finished',
  },
  {
    id: 'b-22',
    title: 'Musafir Cafe',
    author: 'Divya Prakash Dubey',
    year: '2016',
    note: 'A modern Hindi novel capturing unsaid feelings, wanderlust, fleeting urban companionship, and the courage to choose love on your own terms.',
    h: 206,
    w: 38,
    c: '#b45309',
    fg: '#fef3c7',
    status: 'Finished',
  },
  {
    id: 'b-23',
    title: 'How to Fail at Almost Everything and Still Win Big',
    author: 'Scott Adams',
    year: '2013',
    note: 'Kind of the story of my life. Why systems beat goals, talent stacking compounds your odds, and managing personal energy drives breakthrough success.',
    h: 222,
    w: 42,
    c: '#1e293b',
    fg: '#38bdf8',
    status: 'Finished',
  },
  {
    id: 'b-24',
    title: 'The 4-Hour Workweek',
    author: 'Timothy Ferriss',
    year: '2007',
    note: 'Escape 9-5, live anywhere, and join the New Rich through lifestyle design, DEAL elimination framework, and outsourced automation.',
    h: 224,
    w: 43,
    c: '#f59e0b',
    fg: '#18181b',
    status: 'Finished',
  },
  {
    id: 'b-25',
    title: 'Meditation for Busy People',
    author: 'Osho',
    year: '2001',
    note: 'Practical stress-release techniques and mindfulness methods designed to cultivate inner quiet, watchfulness, and center in daily bustle.',
    h: 205,
    w: 39,
    c: '#7c2d12',
    fg: '#ffedd5',
    status: 'Finished',
  },
  {
    id: 'b-26',
    title: 'Think and Grow Rich',
    author: 'Napoleon Hill',
    year: '1937',
    note: 'Timeless philosophy of personal achievement: definite major purpose, subconscious autosuggestion, persistence, and mastermind alliance.',
    h: 215,
    w: 41,
    c: '#14532d',
    fg: '#bbf7d0',
    status: 'Finished',
  },
  {
    id: 'b-27',
    title: 'Our Final Invention: Artificial Intelligence',
    author: 'James Barrat',
    year: '2013',
    note: 'Artificial intelligence and the end of the human era. An urgent exploration of machine superintelligence, recursive self-learning, and existential safety.',
    h: 226,
    w: 42,
    c: '#18181b',
    fg: '#ef4444',
    status: 'Finished',
  },
  {
    id: 'b-28',
    title: 'Chanakya Neeti: Strategies for Success',
    author: 'Radhakrishnan Pillai',
    year: '2019',
    note: 'Ancient Arthashastra aphorisms and strategic wisdom adapted for modern leadership, statecraft, negotiation, and personal mastery.',
    h: 212,
    w: 40,
    c: '#9a3412',
    fg: '#fed7aa',
    status: 'Finished',
  },
  {
    id: 'b-29',
    title: 'MAKE: The Indie Maker Handbook',
    author: 'Pieter Levels',
    year: '2018',
    note: 'The solopreneur bible on bootstrapping internet businesses: idea generation, rapid shipping, automation, community marketing, and monetization.',
    h: 208,
    w: 39,
    c: '#0f172a',
    fg: '#d2fd78',
    status: 'Finished',
  },
  {
    id: 'b-30',
    title: 'The Lessons of History',
    author: 'Will & Ariel Durant',
    year: '1968',
    note: 'A masterpiece distilling 5,000 years of civilization into profound lessons on biology, morals, religion, economics, government, and war.',
    h: 218,
    w: 40,
    c: '#374151',
    fg: '#f3f4f6',
    status: 'Finished',
  },
];

// ----------------------------------------------------------------------------
// PART 2: ESSAYS & REPORTS (Real Essays, Reports, Articles & Lectures)
// ----------------------------------------------------------------------------
export const INITIAL_ESSAYS: EssayItem[] = [
  {
    id: 'e-pg',
    year: '2024',
    title: 'Paul Graham: Essays & Startup Archive',
    type: 'Report',
    source: 'paulgraham.com / Y Combinator',
    url: 'https://www.paulgraham.com/articles.html',
    cap: 'Foundational wisdom on startup ideation, doing things that don\'t scale, and maker schedules',
    status: 'On it',
  },
  {
    id: 'e-1',
    year: '2026',
    title: 'The Architecture of Smoothness: 120 FPS Interaction Engineering',
    type: 'Essay',
    source: 'van-sh.dev/writings',
    url: 'https://github.com/Vanshlohia05/Vansh',
    cap: 'Frame budgets, composite layers, and physics-based springs',
    status: 'Finished',
  },
  {
    id: 'e-2',
    year: '2024',
    title: 'Stanford HAI: Artificial Intelligence Index Report',
    type: 'Report',
    source: 'Stanford University (HAI)',
    url: 'https://aiindex.stanford.edu/report/',
    cap: 'Annual comprehensive benchmark of global AI capabilities & technical trends',
    status: 'Finished',
  },
  {
    id: 'e-3',
    year: '1994',
    title: 'Carl Sagan: Reflections on a Pale Blue Dot & Cosmic Perspective',
    type: 'Video',
    source: 'YouTube / Sagan Archive',
    url: 'https://www.youtube.com/watch?v=GO5FwsblpT8',
    cap: 'Reflections on human humility, preservation of Earth, and the cosmos',
    status: 'Finished',
  },
  {
    id: 'e-4',
    year: '2024',
    title: 'Non-Linear Thinking: How Complex Systems Evade Direct Logic',
    type: 'Article',
    source: 'Farnam Street (FS.blog)',
    url: 'https://fs.blog/mental-models/',
    cap: 'Second-order effects, feedback delays, and structural leverage points',
    status: 'Finished',
  },
  {
    id: 'e-5',
    year: '2024',
    title: 'Typography as Structural Architecture in Digital Spaces',
    type: 'Essay',
    source: 'Editorial Design Notes',
    url: 'https://github.com/Vanshlohia05/Vansh',
    cap: 'Swiss typography, negative space dynamics, and baseline grid alignment',
    status: 'Finished',
  },
  {
    id: 'e-6',
    year: '1964',
    title: 'Richard Feynman: The Character of Physical Law (Messenger Lectures)',
    type: 'Video',
    source: 'YouTube / Cornell Lectures',
    url: 'https://www.youtube.com/watch?v=j3mhkYbznBk',
    cap: 'Symmetry, conservation laws, and mathematical elegance in nature',
    status: 'Finished',
  },
  {
    id: 'e-7',
    year: '2025',
    title: 'The Bitter Lesson of AI: Search and Learning Scale Computation',
    type: 'Article',
    source: 'Rich Sutton / Incomplete Ideas',
    url: 'http://www.incompleteideas.net/IncIdeas/BitterLesson.html',
    cap: 'Why general methods leveraging computation beat human-crafted heuristics',
    status: 'Finished',
  },
  {
    id: 'e-8',
    year: '2024',
    title: 'State of Open Source AI & Local First Software Architecture',
    type: 'Report',
    source: 'Local-First Labs',
    url: 'https://localfirstweb.dev/',
    cap: 'CRDT synchronizations, offline data ownership, and edge latency',
    status: 'Finished',
  },
  {
    id: 'e-9',
    year: '2023',
    title: 'Huberman Lab: Tools to Improve Your Focus & Concentration',
    type: 'Video',
    source: 'Huberman Lab Archive',
    url: 'https://www.youtube.com/watch?v=8e3RC1L5V_Y',
    cap: 'Neural mechanisms of cognitive attention, dopamine baselines, and deliberate rest',
    status: 'Finished',
  },
  {
    id: 'e-10',
    year: '2023',
    title: 'Paul Graham: How to Do Great Work',
    type: 'Essay',
    source: 'paulgraham.com',
    url: 'https://www.paulgraham.com/greatwork.html',
    cap: 'Finding what to work on, cultivating taste, overcoming inertia, and staying obsessively curious',
    status: 'Finished',
  },
  {
    id: 'e-11',
    year: '2013',
    title: 'Do Things That Don\'t Scale',
    type: 'Report',
    source: 'Y Combinator',
    url: 'https://www.paulgraham.com/ds.html',
    cap: 'Why manual user recruitment, exceptional service, and direct outreach ignite initial startup momentum',
    status: 'Finished',
  },
  {
    id: 'e-12',
    year: '2024',
    title: 'State of AI Report 2024',
    type: 'Report',
    source: 'Nathan Benaich & Air Street Capital',
    url: 'https://www.stateof.ai/',
    cap: 'Industry research on foundation models, AI compute sovereignty, and commercial landscape',
    status: 'On it',
  },
  {
    id: 'e-13',
    year: '2005',
    title: 'Steve Jobs: Stanford Commencement Address',
    type: 'Video',
    source: 'Stanford University / YouTube',
    url: 'https://www.youtube.com/watch?v=UF8uR6Z6KLc',
    cap: 'Connecting the dots, love and loss, and staying hungry, staying foolish',
    status: 'Finished',
  },
  {
    id: 'e-14',
    year: '2022',
    title: 'Charlie Munger: Elementary Worldly Wisdom & Mental Models',
    type: 'Article',
    source: 'Farnam Street (FS.blog)',
    url: 'https://fs.blog/mental-models/',
    cap: 'Latticework of mental models across economics, psychology, physics, and decision systems',
    status: 'Finished',
  },
  {
    id: 'e-15',
    year: '2009',
    title: 'Paul Graham: Maker\'s Schedule, Manager\'s Schedule',
    type: 'Essay',
    source: 'paulgraham.com',
    url: 'https://www.paulgraham.com/makersschedule.html',
    cap: 'The profound friction between incremental meeting blocks and deep creative focus',
    status: 'Finished',
  },
  {
    id: 'e-16',
    year: '2023',
    title: 'OpenAI: Planning for AGI and Beyond',
    type: 'Report',
    source: 'OpenAI Research',
    url: 'https://openai.com/index/planning-for-agi-and-beyond/',
    cap: 'Governance, deployment safety, and gradual civilizational alignment principles',
    status: 'Finished',
  },
  {
    id: 'e-17',
    year: '2011',
    title: 'Why Software Is Eating The World',
    type: 'Article',
    source: 'Marc Andreessen / WSJ',
    url: 'https://a16z.com/why-software-is-eating-the-world/',
    cap: 'The structural transformation of global economic sectors through internet software',
    status: 'Finished',
  },
  {
    id: 'e-18',
    year: '2024',
    title: 'Anthropic: Core Views on AI Safety & Frontier Scaling',
    type: 'Report',
    source: 'Anthropic Research',
    url: 'https://www.anthropic.com/research',
    cap: 'Constitutional AI, mechanistic interpretability, and frontier model risk assessment',
    status: 'On it',
  },
  {
    id: 'e-19',
    year: '2019',
    title: 'Paul Graham: The Bus Ticket Theory of Genius',
    type: 'Essay',
    source: 'paulgraham.com',
    url: 'https://www.paulgraham.com/genius.html',
    cap: 'Why obsessive, seemingly useless interests often produce the greatest original discoveries',
    status: 'Finished',
  },
  {
    id: 'e-20',
    year: '2012',
    title: 'Bret Victor: Inventing on Principle',
    type: 'Video',
    source: 'CUSEC / Vimeo',
    url: 'https://vimeo.com/36579366',
    cap: 'Creators need immediate connection to what they create; living by a guiding ethical insight',
    status: 'Finished',
  },
];

// Helper to create pure SVG graphic specimens
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
    
    <text x="36" y="52" fill="#71717a" font-family="monospace" font-size="14" letter-spacing="1">ARCHIVE // ${item.year} // ${item.source}</text>
    
    <rect x="36" y="85" width="90" height="26" rx="4" fill="${typeBadgeColor}" />
    <text x="81" y="102" fill="${typeTextColor}" font-family="monospace" font-weight="bold" font-size="12" text-anchor="middle" letter-spacing="0.5">${item.type.toUpperCase()}</text>
    
    <text x="36" y="170" fill="#ffffff" font-family="sans-serif" font-weight="bold" font-size="22" width="520">
      <tspan x="36" dy="0">${item.title.length > 36 ? item.title.slice(0, 36) + '...' : item.title}</tspan>
    </text>
    
    <text x="36" y="220" fill="#a1a1aa" font-family="sans-serif" font-size="14">
      <tspan x="36" dy="0">${item.cap || item.source}</tspan>
    </text>
    
    <line x1="36" y1="330" x2="564" y2="330" stroke="#27272a" stroke-width="1" />
    <text x="36" y="360" fill="#52525b" font-family="monospace" font-size="12">VANSH READING ARCHIVE • SWISS MINIMALISM</text>
    <text x="564" y="360" fill="#d2fd78" font-family="monospace" font-size="12" text-anchor="end">OPEN LINK ↗</text>
  </svg>
  `.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function getEssayPreviewImage(item: EssayItem): string | null {
  if (item.img && !item.img.includes('images.unsplash.com')) {
    return item.img;
  }
  if (!item.url) return generateSvgPreview(item);

  const ytMatch = item.url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/))([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch && ytMatch[1]) {
    return `https://i.ytimg.com/vi/${ytMatch[1]}/hqdefault.jpg`;
  }

  return generateSvgPreview(item);
}

// ----------------------------------------------------------------------------
// LOCAL STORAGE & TELEGRAM SYNC STORAGE KEYS (v4 Clean Reset with 30 Books)
// ----------------------------------------------------------------------------
const BOOKS_STORAGE_KEY = 'vansh_portfolio_bookshelf_v4';
const ESSAYS_STORAGE_KEY = 'vansh_portfolio_essays_v4';

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
