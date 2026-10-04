import { supabase } from '../utils/supabase';

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
    timestamp: 1790937600000,
    avatar: '✦',
    likes: 14,
  },
  {
    id: 'g-02',
    name: 'Elena Rostova',
    handle: '@elena_dev',
    message: 'Came for the portfolio, stayed for the writings on 60 FPS rendering. Bookmarked!',
    location: 'Berlin, Germany',
    date: 'Sep 29, 2026',
    timestamp: 1790678400000,
    avatar: '⚡',
    likes: 23,
  },
  {
    id: 'g-03',
    name: 'Kenji Takahashi',
    handle: '@kenji_t',
    message: 'The Tokyo midnight photo series brought back so many memories of walking through Shinjuku at 2 AM. Beautiful work Vansh.',
    location: 'Tokyo, Japan',
    date: 'Sep 24, 2026',
    timestamp: 1790246400000,
    avatar: '🏮',
    likes: 19,
  },
  {
    id: 'g-04',
    name: 'Marcus Vance',
    handle: '@marcusvance',
    message: 'The urfd vibe is captured so tastefully. Minimalist without feeling hollow.',
    location: 'Melbourne, Australia',
    date: 'Sep 18, 2026',
    timestamp: 1789728000000,
    avatar: '☕',
    likes: 31,
  },
  {
    id: 'g-05',
    name: 'Aria Chen',
    handle: '@ariachen',
    message: 'Greetings from San Francisco! HyperCanvas is super impressive. Excited to see what else you build this year.',
    location: 'San Francisco, USA',
    date: 'Sep 10, 2026',
    timestamp: 1789036800000,
    avatar: '✨',
    likes: 9,
  },
  {
    id: 'g-06',
    name: 'Liam O\'Connor',
    handle: '@liam_code',
    message: 'Signed! That selection color (#d2fd78) is iconic. Keep crafting.',
    location: 'Dublin, Ireland',
    date: 'Aug 29, 2026',
    timestamp: 1788000000000,
    avatar: '🍀',
    likes: 12,
  },
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

export const mapRowToEntry = (row: any): GuestbookEntry => ({
  id: String(row.id),
  name: row.name || 'Anonymous',
  handle: row.handle || undefined,
  message: row.message || '',
  location: row.location || 'Internet',
  date: row.date || 'Recent',
  timestamp: row.timestamp ? Number(row.timestamp) : Date.now(),
  avatar: row.avatar || '✦',
  likes: typeof row.likes === 'number' ? row.likes : 1,
  isOwner: Boolean(row.is_owner),
});

export const mapEntryToRow = (entry: GuestbookEntry) => ({
  id: entry.id,
  name: entry.name,
  handle: entry.handle || null,
  message: entry.message,
  location: entry.location || 'Internet',
  date: entry.date,
  timestamp: entry.timestamp,
  avatar: entry.avatar,
  likes: entry.likes,
  is_owner: Boolean(entry.isOwner),
});

/**
 * Fetches all guestbook entries from Supabase, sorted by timestamp descending.
 * Merges with any unsynced local entries and saves to cache.
 */
export const fetchGuestbookEntries = async (): Promise<GuestbookEntry[]> => {
  try {
    const { data, error } = await supabase
      .from('guestbook')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) {
      console.warn('Failed to fetch live guestbook from Supabase:', error.message);
      return loadGuestbookEntries();
    }

    if (data && Array.isArray(data) && data.length > 0) {
      const liveEntries = data.map(mapRowToEntry);
      // Preserve any local un-synced entries
      const local = loadGuestbookEntries();
      const unsyncedLocal = local.filter((l) => !liveEntries.some((le) => le.id === l.id));
      const combined = [...liveEntries, ...unsyncedLocal];
      saveGuestbookEntries(combined);
      return combined;
    }
  } catch (err) {
    console.warn('Supabase guestbook network error:', err);
  }
  return loadGuestbookEntries();
};

/**
 * Inserts or upserts a new guestbook entry into Supabase so it's instantly available to all devices.
 */
export const insertGuestbookEntry = async (entry: GuestbookEntry): Promise<boolean> => {
  try {
    const { error } = await supabase.from('guestbook').upsert(mapEntryToRow(entry), { onConflict: 'id' });
    if (error) {
      console.error('Failed to insert guestbook entry into Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error inserting guestbook entry:', err);
    return false;
  }
};

/**
 * Atomically increments likes for a guestbook entry in Supabase.
 */
export const likeGuestbookEntry = async (id: string): Promise<boolean> => {
  try {
    const { error: rpcError } = await supabase.rpc('increment_guestbook_likes', { entry_id: id });
    if (!rpcError) return true;

    // Fallback if RPC fails: direct table update
    const { data, error: selectError } = await supabase
      .from('guestbook')
      .select('likes')
      .eq('id', id)
      .single();

    if (!selectError && data) {
      const newLikes = (data.likes || 0) + 1;
      await supabase.from('guestbook').update({ likes: newLikes }).eq('id', id);
      return true;
    }
  } catch (err) {
    console.warn('Failed to sync like to Supabase:', err);
  }
  return false;
};

/**
 * Deletes a guestbook entry (used by admin moderation).
 */
export const deleteGuestbookEntry = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase.from('guestbook').delete().eq('id', id);
    return !error;
  } catch (err) {
    console.warn('Failed to delete guestbook entry:', err);
    return false;
  }
};

/**
 * Subscribes to real-time changes on the guestbook table.
 * Whenever someone signs or likes from any device, updates trigger immediately.
 */
export const subscribeToGuestbookChanges = (
  onInsert: (entry: GuestbookEntry) => void,
  onUpdate: (entry: GuestbookEntry) => void,
  onDelete: (id: string) => void
) => {
  const channel = supabase
    .channel('guestbook_realtime_stream')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'guestbook' },
      (payload) => {
        if (payload.new) {
          onInsert(mapRowToEntry(payload.new));
        }
      }
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'guestbook' },
      (payload) => {
        if (payload.new) {
          onUpdate(mapRowToEntry(payload.new));
        }
      }
    )
    .on(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'guestbook' },
      (payload) => {
        if (payload.old && payload.old.id) {
          onDelete(String(payload.old.id));
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

/**
 * Synchronizes any previously saved local entries to Supabase if they are not yet stored.
 */
export const syncLocalEntriesToSupabase = async (): Promise<void> => {
  try {
    const local = loadGuestbookEntries();
    const customLocal = local.filter(
      (e) => !INITIAL_GUESTBOOK_ENTRIES.some((init) => init.id === e.id)
    );
    if (customLocal.length === 0) return;

    for (const entry of customLocal) {
      await supabase.from('guestbook').upsert(mapEntryToRow(entry), { onConflict: 'id' });
    }
  } catch (e) {
    console.warn('Silent local guestbook sync check:', e);
  }
};
