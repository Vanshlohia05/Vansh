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
    status: 'Acquired / Sold',
    description:
      'Conceptualized, architected, and built SahiRasta from scratch. Scaled user onboarding with structured career roadmaps and GenAI-powered personalized advice. Successfully acquired and sold in 2026.',
    techStack: ['React', 'TypeScript', 'Node.js', 'GenAI', 'TailwindCSS', 'Supabase'],
    liveUrl: 'https://sahirasta.com',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
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
    status: 'Client Case Study',
    description:
      'Engineered modern digital brand infrastructure and supply-chain web presence for premier industrial cement distribution across North-East India (dspowercement.com).',
    techStack: ['Web Architecture', 'Design Systems', 'Next.js', 'TailwindCSS'],
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb180c5f5?w=800&auto=format&fit=crop&q=80',
    featured: true,
    displayOrder: 2,
  },
  {
    id: 'p-03',
    title: 'Xalumni',
    tagline: 'Next-gen alumni networking & community matchmaking platform',
    category: 'Community & Web App',
    year: '2025',
    status: 'Live',
    description:
      'High-engagement alumni web platform connecting students, mentors, and graduates with real-time matchmaking, event coordination, and career mentorship directories.',
    techStack: ['React', 'Firebase', 'TypeScript', 'TailwindCSS', 'WebSockets'],
    liveUrl: 'https://xalumni.web.app',
    githubUrl: 'https://github.com/Vanshlohia05',
    imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
    featured: true,
    displayOrder: 3,
  },
  {
    id: 'p-04',
    title: 'Awwrange Studio',
    tagline: 'Creative engineering lab, visual design collective & digital aesthetic experiments',
    category: 'Creative Engineering',
    year: '2026',
    status: 'Active Lab',
    description:
      'Independent design laboratory exploring vibe-coded software, computational typography, WebGL shaders, tactile UI physics, and modern brand identities.',
    techStack: ['WebGL', 'Three.js', 'Vite', 'Creative Coding', 'TailwindCSS'],
    liveUrl: 'https://awwrange.com',
    githubUrl: 'https://github.com/Vanshlohia05',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    featured: true,
    displayOrder: 4,
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
