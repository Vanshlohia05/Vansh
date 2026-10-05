import { supabase } from '../utils/supabase';

export interface PortfolioProject {
  id: string;
  title: string;
  tagline: string;
  category: string;
  year: string;
  status: string;
  description: string;
  techStack: string[];
  liveUrl?: string;
  githubUrl?: string;
  videoUrl?: string;
  imageUrl?: string;
  images?: string[];
  featured?: boolean;
  displayOrder?: number;
}

export const DEFAULT_PORTFOLIO_PROJECTS: PortfolioProject[] = [
  {
    id: 'p-01',
    title: 'SahiRasta',
    tagline: 'Career guidance & educational roadmapping platform tailored for Indian students',
    category: 'Full-Stack & GenAI',
    year: '2026',
    status: 'Live Platform',
    description:
      'Built SahiRasta from scratch with structured academic roadmaps, stream selection quizzes, and interactive decision trees.',
    techStack: [
      'Next.js 16 (App Router)',
      'React 19',
      'TypeScript',
      'Tailwind CSS v4',
      'Lucide React',
      'JSON Storage',
      'LocalStorage & Context',
      'ESLint & PostCSS',
    ],
    liveUrl: 'https://sahirasta.com',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
    featured: true,
    displayOrder: 1,
  },
  {
    id: 'p-02',
    title: 'DSPowerCement',
    tagline: 'Industrial distribution platform, web architecture & digital identity (dspowercement.com)',
    category: 'Brand & Web Architecture',
    year: '2026',
    status: 'Sold',
    description:
      'Sold client project — built a responsive catalog site with procurement inquiry flows and brand identity for a premier cement manufacturer (dspowercement.com).',
    techStack: [
      'HTML5',
      'Modern JavaScript (ES6+)',
      'Vite 8',
      'Tailwind CSS v3',
      'PostCSS',
      'Autoprefixer',
      'Clean-CSS',
    ],
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb180c5f5?w=800&auto=format&fit=crop&q=80',
    featured: true,
    displayOrder: 2,
  },
  {
    id: 'p-03',
    title: 'Xalumni',
    tagline: 'Multi section platform and admin page for alumni networking & mentorship',
    category: 'Community & Web App',
    year: '2025',
    status: 'Live',
    description:
      'Multi section platform and admin page for alumni directory and office networks. Features encrypted chat, audio calls, 48-hour and 20-day auto-delete, and a zero-cost operational model.',
    techStack: [
      'React',
      'Vite',
      'Tailwind CSS',
      'React Router (SPA)',
      'React Hook Form',
      'Firebase (Auth, Firestore, RTDB, Hosting)',
      'Google Apps Script & Gemini AI',
      'End-to-End Encryption',
      'WebRTC DataChannels',
    ],
    liveUrl: 'https://xalumni.web.app',
    githubUrl: 'https://github.com/Vanshlohia05',
    imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
    featured: true,
    displayOrder: 3,
  },
  {
    id: 'p-04',
    title: 'Awwrange',
    tagline: 'D2C e-commerce storefront for graphic apparel & personalized gifts with 1-click WhatsApp checkout',
    category: 'E-Commerce & Creative Engineering',
    year: '2026',
    status: 'Active Storefront',
    description:
      'Direct-to-consumer e-commerce storefront specializing in customized graphic apparel and personalized gifts, including printed T-shirts, ceramic mugs, canvas tote bags, and gifting sets. Features real-time search across curated categories, detailed product views, persistent shopping cart, and automated 1-click WhatsApp checkout.',
    techStack: [
      'React 18',
      'Redux Toolkit',
      'Bootstrap 5',
      'Slick Carousel',
      'WhatsApp Click-to-Chat API',
      'LocalStorage',
      'Webpack 5',
    ],
    liveUrl: 'https://awwrange.com',
    githubUrl: 'https://github.com/Vanshlohia05',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    featured: true,
    displayOrder: 4,
  },
  {
    id: 'p-05',
    title: 'Personal Portfolio & Digital Garden',
    tagline: 'Tactile creative engineer portfolio, 2.5D bookshelf & real-time guestbook',
    category: 'Full-Stack & Creative Engineering',
    year: '2026',
    status: 'Live',
    description:
      'Personal creative portfolio, interactive digital garden, and 2.5D tactile bookshelf featuring retro Macintosh UI, real-time guestbook with WebSocket synchronization, Indian classical sound synthesizer (Raag Bhoopali), and stealth authenticated admin console.',
    techStack: [
      'React 18',
      'TypeScript',
      'Vite',
      'Tailwind CSS',
      'Supabase (PostgreSQL & Realtime)',
      'Web Audio API',
      'Canvas Confetti',
      'Vercel Serverless',
      'Telegram Bot API',
    ],
    liveUrl: 'https://vanshfolie.vercel.app',
    githubUrl: 'https://github.com/Vanshlohia05/Vansh',
    imageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
    featured: true,
    displayOrder: 5,
  },
];

const STORAGE_KEY = 'vansh_portfolio_projects_v1';

export function mapRowToProject(row: any): PortfolioProject {
  return {
    id: row.id,
    title: row.title,
    tagline: row.tagline || '',
    category: row.category || 'Featured Project',
    year: row.year || '2026',
    status: row.status || 'Live',
    description: row.description || '',
    techStack: Array.isArray(row.tech_stack)
      ? row.tech_stack
      : typeof row.tech_stack === 'string'
      ? row.tech_stack.split(',').map((s: string) => s.trim())
      : [],
    liveUrl: row.live_url || undefined,
    githubUrl: row.github_url || undefined,
    videoUrl: row.video_url || undefined,
    imageUrl: row.image_url || undefined,
    images: Array.isArray(row.images) ? row.images : [],
    featured: row.featured ?? true,
    displayOrder: row.display_order ?? 0,
  };
}

export function loadPortfolioProjects(): PortfolioProject[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load portfolio projects from localStorage:', err);
  }
  return DEFAULT_PORTFOLIO_PROJECTS;
}

export function savePortfolioProjects(projects: PortfolioProject[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (err) {
    console.error('Failed to save portfolio projects to localStorage:', err);
  }
}

export async function fetchPortfolioProjects(): Promise<PortfolioProject[]> {
  try {
    const { data, error } = await supabase
      .from('portfolio_projects')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (!error && data && Array.isArray(data) && data.length > 0) {
      const projects = data.map(mapRowToProject);
      savePortfolioProjects(projects);
      return projects;
    }
  } catch (err) {
    console.warn('Error fetching portfolio projects from Supabase:', err);
  }
  return loadPortfolioProjects();
}

export function subscribeToPortfolioProjects(
  onInsert: (project: PortfolioProject) => void,
  onUpdate: (project: PortfolioProject) => void,
  onDelete: (id: string) => void
) {
  const channel = supabase
    .channel('portfolio-projects-realtime')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'portfolio_projects' },
      (payload) => {
        if (payload.new) onInsert(mapRowToProject(payload.new));
      }
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'portfolio_projects' },
      (payload) => {
        if (payload.new) onUpdate(mapRowToProject(payload.new));
      }
    )
    .on(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'portfolio_projects' },
      (payload) => {
        if (payload.old && payload.old.id) onDelete(payload.old.id);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
