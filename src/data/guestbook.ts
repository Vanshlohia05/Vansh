export interface GuestbookEntry {
  id: string;
  name: string;
  handle?: string;
  message: string;
  location: string;
  date: string;
  timestamp: number;
  avatar: string; // Emoji or initials
  likes: number;
  isOwner?: boolean;
}

export const INITIAL_GUESTBOOK_ENTRIES: GuestbookEntry[] = [
  {
    id: 'g-01',
    name: 'Soren Lind',
    handle: '@soren_design',
    message: 'The quiet typography and tactile click feedback here is such a breath of fresh air. Love the attention to negative space!',
    location: 'Copenhagen, Denmark',
    date: 'Oct 02, 2026',
    timestamp: Date.now() - 86400000 * 1,
    avatar: '✦',
    likes: 14
  },
  {
    id: 'g-02',
    name: 'Elena Rostova',
    handle: '@elena_dev',
    message: 'Came for the portfolio, stayed for the writings on 60 FPS rendering. Bookmarked!',
    location: 'Berlin, Germany',
    date: 'Sep 29, 2026',
    timestamp: Date.now() - 86400000 * 4,
    avatar: '⚡',
    likes: 23
  },
  {
    id: 'g-03',
    name: 'Kenji Takahashi',
    handle: '@kenji_t',
    message: 'The Tokyo midnight photo series brought back so many memories of walking through Shinjuku at 2 AM. Beautiful work Vansh.',
    location: 'Tokyo, Japan',
    date: 'Sep 24, 2026',
    timestamp: Date.now() - 86400000 * 9,
    avatar: '🏮',
    likes: 19
  },
  {
    id: 'g-04',
    name: 'Marcus Vance',
    handle: '@marcusvance',
    message: 'The urfd vibe is captured so tastefully. Minimalist without feeling hollow.',
    location: 'Melbourne, Australia',
    date: 'Sep 18, 2026',
    timestamp: Date.now() - 86400000 * 15,
    avatar: '☕',
    likes: 31
  },
  {
    id: 'g-05',
    name: 'Aria Chen',
    handle: '@ariachen',
    message: 'Greetings from San Francisco! HyperCanvas is super impressive. Excited to see what else you build this year.',
    location: 'San Francisco, USA',
    date: 'Sep 10, 2026',
    timestamp: Date.now() - 86400000 * 23,
    avatar: '✨',
    likes: 9
  },
  {
    id: 'g-06',
    name: 'Liam O\'Connor',
    handle: '@liam_code',
    message: 'Signed! That selection color (#d2fd78) is iconic. Keep crafting.',
    location: 'Dublin, Ireland',
    date: 'Aug 29, 2026',
    timestamp: Date.now() - 86400000 * 35,
    avatar: '🍀',
    likes: 12
  }
];

const STORAGE_KEY = 'vansh_guestbook_entries_v1';

export const loadGuestbookEntries = (): GuestbookEntry[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load guestbook from storage', e);
  }
  return INITIAL_GUESTBOOK_ENTRIES;
};

export const saveGuestbookEntries = (entries: GuestbookEntry[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (e) {
    console.error('Failed to save guestbook to storage', e);
  }
};
