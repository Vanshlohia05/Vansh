import { supabase } from '../utils/supabase';

export type CvSectionType =
  | 'initiatives'
  | 'experience'
  | 'leadership'
  | 'education'
  | 'expertise'
  | 'milestones';

export interface CvItem {
  id: string;
  section: CvSectionType;
  title: string;
  subtitle?: string;
  dateRange?: string;
  location?: string;
  badge?: string;
  link?: string;
  description?: string;
  bulletPoints?: string[];
  displayOrder: number;
  isVisible: boolean;
  showLink?: boolean;
}

export const DEFAULT_CV_ITEMS: CvItem[] = [
  {
    id: 'cv-init-1',
    section: 'initiatives',
    title: 'SahiRasta Platform',
    subtitle: 'Co-Founder & Developer',
    dateRange: 'April, 2026',
    location: 'India',
    badge: 'LIVE PLATFORM',
    link: 'https://sahirasta.com',
    description: 'Educational guidance & career roadmapping platform tailored for Indian students.',
    bulletPoints: [
      'Built the full web platform with Next.js 16 App Router and React 19.',
      'Created curated academic pathways, career navigation quizzes, and decision roadmap trees.',
      'Implemented client-side bookmarking and state persistence via LocalStorage and React Context.',
      'Tech Stack: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Lucide React, Static JSON File System, LocalStorage & Context, ESLint & PostCSS.',
    ],
    displayOrder: 1,
    isVisible: true,
  },
  {
    id: 'cv-init-2',
    section: 'initiatives',
    title: 'DSPowerCement',
    subtitle: 'Web Developer & Brand Designer',
    dateRange: '2026',
    location: 'Assam, India',
    badge: 'SOLD',
    link: '',
    description: 'Sold client project — industrial supply-chain web presence & digital identity (dspowercement.com).',
    bulletPoints: [
      'Built a responsive catalog site with procurement inquiry flows.',
      'Designed brand identity, product catalog layout, and clean visual hierarchy.',
      'Optimized page performance and load speed with clean modular styling.',
      'Tech Stack: HTML5, Modern JavaScript (ES6+), Vite 8, Tailwind CSS v3, PostCSS, Autoprefixer, Clean-CSS.',
    ],
    displayOrder: 2,
    isVisible: true,
  },
  {
    id: 'cv-init-3',
    section: 'initiatives',
    title: 'Xalumni Platform',
    subtitle: 'Full-Stack Developer',
    dateRange: '2025 - Present',
    location: 'Remote',
    badge: 'LIVE',
    link: 'https://xalumni.web.app',
    description: 'Alumni and workplace networking platform (xalumni.web.app).',
    bulletPoints: [
      'Multi section platform and admin page for alumni directory, office networks, jobs, and mentorship.',
      'Built end-to-end encrypted chat, audio calls, 48-hour and 20-day auto-delete for messages, and a zero-cost operational model.',
      'Frontend: React, Vite, Tailwind CSS, React Router (SPA), React Hook Form.',
      'Backend & Database: Firebase (Auth, Firestore NoSQL, Realtime DB for signaling, Hosting).',
      'Automation & AI: Google Apps Script + Google Forms with Gemini API (auto job summaries).',
      'Security & P2P: End-to-end encrypted messaging, local secure key storage, and view-once media transfers.',
    ],
    displayOrder: 3,
    isVisible: true,
  },
  {
    id: 'cv-init-4',
    section: 'initiatives',
    title: 'Awwrange',
    subtitle: 'Founder & Full-Stack Developer',
    dateRange: '2026',
    location: 'Online Storefront',
    badge: 'E-COMMERCE',
    link: 'https://awwrange.com',
    description: 'Direct-to-consumer e-commerce storefront specializing in customized graphic apparel and personalized gifts (awwrange).',
    bulletPoints: [
      'D2C storefront specializing in customized graphic apparel, printed T-shirts, ceramic mugs, canvas tote bags, and gifting sets.',
      'Real-time search across curated categories, detailed product views, and persistent shopping cart.',
      'Automated 1-click WhatsApp checkout auto-formatting itemized order summaries, quantities, and totals directly to the business.',
      'Fast, responsive Single Page Application (SPA) with smooth interactions and live notifications.',
      'Tech Stack: React 18, Redux Toolkit, Bootstrap 5, Slick Carousel, WhatsApp Click-to-Chat API, LocalStorage, Webpack 5.',
    ],
    displayOrder: 4,
    isVisible: true,
  },
  {
    id: 'cv-init-5',
    section: 'initiatives',
    title: 'Personal Portfolio & Digital Garden',
    subtitle: 'Designer & Creative Developer',
    dateRange: '2026 - Present',
    location: 'vanshfolie.vercel.app',
    badge: 'LIVE',
    link: 'https://vanshfolie.vercel.app',
    description: 'Personal creative portfolio, interactive digital garden, and 2.5D tactile bookshelf with retro Macintosh UI, real-time guestbook, and Indian classical sound synthesizer.',
    bulletPoints: [
      'Interactive digital garden featuring a 2.5D physical bookshelf with Raag Bhoopali Indian classical flute synthesizer and autoscroll.',
      'Globally synchronized real-time Guestbook with live cloud updates, optimistic UI, likes, and confetti physics.',
      'Stealth authenticated admin portal with secure credential verification and cloud database management.',
      'Remote content publishing integration via serverless Telegram Bot Webhook API.',
      'Tech Stack: React 18, TypeScript, Vite, Tailwind CSS, Supabase (PostgreSQL & Realtime), Web Audio API, Canvas Confetti, Vercel Serverless, Telegram Bot API.',
    ],
    displayOrder: 5,
    isVisible: true,
  },
  {
    id: 'cv-exp-1',
    section: 'experience',
    title: 'Agarwalla & Associates - CMA Firm',
    subtitle: 'Accounts & Tax Intern',
    dateRange: 'July 2026 - September 2026 (3 months)',
    location: 'Sarupathar, Assam, India · On-site',
    badge: 'INTERNSHIP',
    link: '',
    description: 'Worked in a professional accounting and tax practice, gaining hands-on exposure to accounting, taxation, government registrations, and compliance-related work.',
    bulletPoints: [
      'Completed Udyam registrations, enabling client businesses to access MSME scheme benefits.',
      'Processed GeM registrations, facilitating client access to government procurement marketplace.',
      'Maintained Tally records across client accounts, supporting accurate bookkeeping and ledger upkeep.',
      'Prepared and filed ITR-1 returns for individual clients, ensuring compliance with income tax deadlines.',
    ],
    displayOrder: 1,
    isVisible: true,
  },
  {
    id: 'cv-lead-1',
    section: 'leadership',
    title: 'Marwari Yuva Manch (4 Years)',
    subtitle: 'Joint Secretary [Apr, 2026 - Present]',
    dateRange: '2022 - Present',
    location: 'Social & Community Services & Development',
    badge: 'LEADERSHIP',
    link: '',
    description: 'Active volunteer and executive member organizing large-scale social outreach and youth initiatives.',
    bulletPoints: [
      'Actively involved in community service projects; organized large community events for 150 to 200 attendees.',
      'Joined as a dedicated volunteer, participating in community outreach and developing strong teamwork, volunteer coordination, and leadership skills.',
    ],
    displayOrder: 1,
    isVisible: true,
  },
  {
    id: 'cv-lead-2',
    section: 'leadership',
    title: 'Ashadeep NGO',
    subtitle: 'Volunteer & Project Coordinator',
    dateRange: 'Jan 2025 - Present',
    location: 'Mental Health Services',
    badge: 'VOLUNTEER',
    link: '',
    description: 'Supporting non-profit operations, community engagement, and mental health rehabilitation initiatives.',
    bulletPoints: [
      'Gaining hands-on experience in non-profit operations, project management, and volunteer coordination.',
      'Supporting community programs, enhancing team management, effective communication, and time management skills.',
    ],
    displayOrder: 2,
    isVisible: true,
  },
  {
    id: 'cv-mile-1',
    section: 'milestones',
    title: 'Voluntary Blood Donor (2x Milestone Donor)',
    subtitle: 'Community Health Impact',
    dateRange: 'Milestone Donor',
    location: 'Assam, India',
    badge: 'COMMUNITY IMPACT',
    link: '',
    description: 'Committed voluntary blood donor supporting emergency and hospital relief initiatives. Completed two milestone blood donations: the first upon turning 18 and the second on turning 21.',
    bulletPoints: [],
    displayOrder: 1,
    isVisible: true,
  },
  {
    id: 'cv-edu-1',
    section: 'education',
    title: 'Manipal University Jaipur',
    subtitle: 'Bachelor of Business Administration - BBA, Business Administration and Management, General',
    dateRange: 'June 2024 - August 2027 (Expected)',
    location: 'Jaipur, Rajasthan',
    badge: '3rd/Final Year',
    link: '',
    description: '3rd Sem SGPA: 8.0 • 77.6%',
    bulletPoints: [
      'Focus: Business Analytics, Financial Management, Taxation & Corporate Strategy.',
    ],
    displayOrder: 1,
    isVisible: true,
  },
  {
    id: 'cv-edu-2',
    section: 'education',
    title: 'Amrit International School',
    subtitle: '12th, Science',
    dateRange: 'June 2023 - May 2024',
    location: 'Assam, India',
    badge: 'High School',
    link: '',
    description: 'Languages: English & Hindi',
    bulletPoints: [
      'Completed senior secondary education in Science stream.',
    ],
    displayOrder: 2,
    isVisible: true,
  },
];

const STORAGE_KEY = 'vansh_cv_items_v1';

export function mapRowToCvItem(row: any): CvItem {
  return {
    id: String(row.id),
    section: (row.section || 'experience') as CvSectionType,
    title: row.title || 'Untitled Item',
    subtitle: row.subtitle || undefined,
    dateRange: row.date_range || undefined,
    location: row.location || undefined,
    badge: row.badge || undefined,
    link: row.link || undefined,
    description: row.description || undefined,
    bulletPoints: Array.isArray(row.bullet_points)
      ? row.bullet_points
      : typeof row.bullet_points === 'string'
      ? JSON.parse(row.bullet_points)
      : [],
    displayOrder: typeof row.display_order === 'number' ? row.display_order : 0,
    isVisible: row.is_visible !== false,
    showLink: Boolean(row.show_link),
  };
}

export function mapCvItemToRow(item: CvItem) {
  return {
    id: item.id,
    section: item.section,
    title: item.title,
    subtitle: item.subtitle || null,
    date_range: item.dateRange || null,
    location: item.location || null,
    badge: item.badge || null,
    link: item.link || null,
    description: item.description || null,
    bullet_points: item.bulletPoints || [],
    display_order: item.displayOrder,
    is_visible: item.isVisible,
    show_link: Boolean(item.showLink),
  };
}

export function loadCvItems(): CvItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load CV items from localStorage:', err);
  }
  return DEFAULT_CV_ITEMS;
}

export function saveCvItems(items: CvItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save CV items to localStorage:', err);
  }
}

export async function fetchCvItems(): Promise<CvItem[]> {
  try {
    const { data, error } = await supabase
      .from('cv_items')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (!error && data && Array.isArray(data) && data.length > 0) {
      const items = data.map(mapRowToCvItem);
      saveCvItems(items);
      return items;
    }
  } catch (err) {
    console.warn('Error fetching CV items from Supabase:', err);
  }
  return loadCvItems();
}

export async function upsertCvItem(item: CvItem): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('cv_items')
      .upsert(mapCvItemToRow(item), { onConflict: 'id' });
    if (error) {
      console.error('Failed to upsert CV item to Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Network error saving CV item:', err);
    return false;
  }
}

export async function deleteCvItem(id: string): Promise<boolean> {
  try {
    const current = loadCvItems().filter((c) => c.id !== id);
    saveCvItems(current);

    const { error } = await supabase.from('cv_items').delete().eq('id', id);
    if (error) {
      console.error('Failed to delete CV item from Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Network error deleting CV item:', err);
    return false;
  }
}

export function subscribeToCvChanges(
  onInsert: (item: CvItem) => void,
  onUpdate: (item: CvItem) => void,
  onDelete: (id: string) => void
) {
  const channel = supabase
    .channel('cv-items-realtime-channel')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'cv_items' },
      (payload) => {
        if (payload.new) onInsert(mapRowToCvItem(payload.new));
      }
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'cv_items' },
      (payload) => {
        if (payload.new) onUpdate(mapRowToCvItem(payload.new));
      }
    )
    .on(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'cv_items' },
      (payload) => {
        const deletedId = payload.old?.id;
        if (deletedId) onDelete(String(deletedId));
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
