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
}

export const DEFAULT_CV_ITEMS: CvItem[] = [
  {
    id: 'cv-init-1',
    section: 'initiatives',
    title: 'SahiRasta Platform',
    subtitle: 'Co-Founder & Lead Engineer',
    dateRange: 'April, 2026',
    location: 'India',
    badge: 'ACQUIRED / SOLD',
    link: 'https://sahirasta.com',
    description: 'Educational guidance & career roadmapping platform tailored for Indian students.',
    bulletPoints: [
      'Co-founded and engineered the entire web platform & curated roadmaps.',
      'Leveraged GenAI workflows for rapid prototyping and actionable pathway matching.',
      'Built, scaled user traction, and successfully sold the venture.',
    ],
    displayOrder: 1,
    isVisible: true,
  },
  {
    id: 'cv-init-2',
    section: 'initiatives',
    title: 'DSPowerCement',
    subtitle: 'Brand & Web Architect',
    dateRange: '2026',
    location: 'Assam, India',
    badge: 'CLIENT WORK',
    link: '',
    description: 'Industrial supply-chain web architecture & digital presence (dspowercement.com).',
    bulletPoints: [
      'Industrial supply-chain web architecture & digital presence.',
      'Designed brand identity, product catalog layout, and responsive portal.',
      'Structured distribution workflows for premier regional industrial cement operations.',
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
    description: 'High-engagement alumni community networking & mentorship platform (Xalumni.web.app).',
    bulletPoints: [
      'High-engagement alumni community networking & mentorship platform.',
      'Real-time graduate directories, event matchmaking, and career guidance.',
      'Engineered with modern responsive UI and tactile interaction feedback.',
    ],
    displayOrder: 3,
    isVisible: true,
  },
  {
    id: 'cv-init-4',
    section: 'initiatives',
    title: 'Awwrange Studio',
    subtitle: 'Founder & Creative Technologist',
    dateRange: '2026',
    location: 'Online Lab',
    badge: 'ACTIVE LAB',
    link: 'https://awwrange.com',
    description: 'Creative engineering lab, vibe-coded web experiments, and visual design collective (awwrange).',
    bulletPoints: [
      'Creative engineering lab, vibe-coded web experiments, and visual design.',
      'Explorations in tactile web physical software, shaders, and computational aesthetics.',
      'Directing digital aesthetic identities for boutique internet products.',
    ],
    displayOrder: 4,
    isVisible: true,
  },
  {
    id: 'cv-exp-1',
    section: 'experience',
    title: 'Agarwalla & Associates (CMA Firm)',
    subtitle: 'Accounts & Tax Intern',
    dateRange: 'Jul 2026 - Sep 2026 (3 mos)',
    location: 'Sarupathar, Assam, India · On-site · Accounting & Taxation',
    badge: 'INTERNSHIP',
    link: '',
    description: 'Worked in a professional accounting and tax practice, gaining hands-on exposure to accounting, taxation, government registrations, and compliance-related work.',
    bulletPoints: [
      'Completed Udyam registrations, enabling client businesses to access MSME scheme benefits.',
      'Processed GeM registrations, facilitating client access to the government procurement marketplace.',
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
    subtitle: 'Bachelor of Business Administration (BBA)',
    dateRange: '2024 - 2027 (Expected)',
    location: 'Jaipur, Rajasthan',
    badge: 'Penultimate 2nd Year',
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
    subtitle: 'High School',
    dateRange: '2022 - 2024',
    location: 'Assam, India',
    badge: 'Completed',
    link: '',
    description: 'Languages: English & Hindi',
    bulletPoints: [
      'Graduated with academic distinction; active participant in youth leadership and debate.',
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
