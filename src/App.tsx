import React, { useState, useEffect, useCallback } from 'react';
import { Header, NavTab } from './components/Header';
import { StoryView } from './components/StoryView';
import { HomeView } from './components/HomeView';
import { WritingsView } from './components/WritingsView';
import { StuffView } from './components/StuffView';
import { GuestbookView } from './components/GuestbookView';
import { AdminView } from './components/AdminView';
import { ProjectModal } from './components/ProjectModal';
import { ArticleModal } from './components/ArticleModal';
import { KingCursor } from './components/KingCursor';
import { StuffItem } from './data/stuff';
import { Artwork } from './data/homeArtworks';
import { Article } from './data/writings';
import {
  GuestbookEntry,
  loadGuestbookEntries,
  saveGuestbookEntries,
  fetchGuestbookEntries,
  insertGuestbookEntry,
  likeGuestbookEntry,
  subscribeToGuestbookChanges,
  syncLocalEntriesToSupabase,
} from './data/guestbook';
import { toggleSound } from './utils/sound';

export const App: React.FC = () => {
  // Navigation state (synced with window hash)
  const [activeTab, setActiveTabState] = useState<NavTab>('story');
  const [homeSlideInfo, setHomeSlideInfo] = useState<{ current: number; total: number; title: string }>({
    current: 1,
    total: 4,
    title: 'Morning Brew',
  });
  const [shelfShuffleCount, setShelfShuffleCount] = useState<number>(0);

  // Guestbook State
  const [guestbookEntries, setGuestbookEntries] = useState<GuestbookEntry[]>([]);
  const [guestbookFormOpen, setGuestbookFormOpen] = useState(false);

  // Modals
  const [selectedProject, setSelectedProject] = useState<StuffItem | Artwork | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // Initialize guestbook from local cache & synchronize live from Supabase
  useEffect(() => {
    // 1. Instant local render
    setGuestbookEntries(loadGuestbookEntries());

    // 2. Fetch live data from Supabase across all devices
    fetchGuestbookEntries().then((live) => {
      if (live && live.length > 0) {
        setGuestbookEntries(live);
      }
    });

    // 3. Sync any unsaved local entries to the cloud
    syncLocalEntriesToSupabase();

    // 4. Real-time updates: whenever someone signs anywhere, all devices update instantly
    const unsubscribe = subscribeToGuestbookChanges(
      (newEntry) => {
        setGuestbookEntries((prev) => {
          if (prev.some((e) => e.id === newEntry.id)) {
            return prev.map((e) => (e.id === newEntry.id ? newEntry : e));
          }
          const updated = [newEntry, ...prev];
          saveGuestbookEntries(updated);
          return updated;
        });
      },
      (updatedEntry) => {
        setGuestbookEntries((prev) => {
          const updated = prev.map((e) => (e.id === updatedEntry.id ? updatedEntry : e));
          saveGuestbookEntries(updated);
          return updated;
        });
      },
      (deletedId) => {
        setGuestbookEntries((prev) => {
          const updated = prev.filter((e) => e.id !== deletedId);
          saveGuestbookEntries(updated);
          return updated;
        });
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // Sync tab with URL hash and pathname
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as NavTab;
      const path = window.location.pathname.replace(/^\//, '').split('/')[0] as NavTab;
      const target = (hash || path) as NavTab;
      if (['story', 'home', 'writings', 'stuff', 'guestbook', 'admin'].includes(target)) {
        setActiveTabState(target);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, []);

  // Whenever user switches to Guestbook or returns to tab, refresh from Supabase
  useEffect(() => {
    if (activeTab === 'guestbook') {
      fetchGuestbookEntries().then((live) => {
        if (live && live.length > 0) {
          setGuestbookEntries(live);
        }
      });
    }

    const handleWindowFocus = () => {
      fetchGuestbookEntries().then((live) => {
        if (live && live.length > 0) {
          setGuestbookEntries(live);
        }
      });
    };

    window.addEventListener('focus', handleWindowFocus);
    return () => window.removeEventListener('focus', handleWindowFocus);
  }, [activeTab]);

  const handleSlideChange = useCallback((current: number, total: number, title: string) => {
    setHomeSlideInfo((prev) => {
      if (prev.current === current && prev.total === total && prev.title === title) {
        return prev;
      }
      return { current, total, title };
    });
  }, []);

  const setActiveTab = (tab: NavTab) => {
    window.location.hash = tab;
    setActiveTabState(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShuffle = () => {
    setShelfShuffleCount((prev) => prev + 1);
  };

  const handleRefreshGuestbook = async () => {
    const live = await fetchGuestbookEntries();
    if (live && live.length > 0) {
      setGuestbookEntries(live);
    }
  };

  // Guestbook Handlers (Persisted globally to Supabase + local cache)
  const handleAddGuestbookEntry = async (
    newEntryData: Omit<GuestbookEntry, 'id' | 'timestamp' | 'likes'>
  ) => {
    const newEntry: GuestbookEntry = {
      ...newEntryData,
      id: `g-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      likes: 1,
    };
    // Optimistic UI update
    setGuestbookEntries((prev) => {
      const updated = [newEntry, ...prev.filter((e) => e.id !== newEntry.id)];
      saveGuestbookEntries(updated);
      return updated;
    });
    // Global cloud broadcast
    await insertGuestbookEntry(newEntry);
    // Double-check fetch to ensure server state is in sync
    const fresh = await fetchGuestbookEntries();
    if (fresh && fresh.length > 0) {
      setGuestbookEntries(fresh);
    }
  };

  const handleLikeGuestbookEntry = async (id: string) => {
    // Optimistic UI update
    setGuestbookEntries((prev) => {
      const updated = prev.map((entry) => {
        if (entry.id === id) {
          return { ...entry, likes: entry.likes + 1 };
        }
        return entry;
      });
      saveGuestbookEntries(updated);
      return updated;
    });
    // Cloud sync
    await likeGuestbookEntry(id);
  };

  // Global hotkeys (1: Story, 2: Home/CV, 3: Writings, 4: Stuff, 5: Guestbook, Shift+A: Admin, s, m)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.shiftKey && e.key.toLowerCase() === 'a') {
        setActiveTab('admin');
      } else if (e.key === '1') {
        setActiveTab('story');
      } else if (e.key === '2') {
        setActiveTab('home');
      } else if (e.key === '3') {
        setActiveTab('writings');
      } else if (e.key === '4') {
        setActiveTab('stuff');
      } else if (e.key === '5') {
        setActiveTab('guestbook');
      } else if (e.key.toLowerCase() === 's' && activeTab === 'stuff') {
        handleShuffle();
      } else if (e.key.toLowerCase() === 'm') {
        toggleSound();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-white text-black selection:bg-[#d2fd78] selection:text-black flex flex-col justify-between font-sans">
      {/* Spear Cursor: active everywhere, click explosion/tap animation disabled on stuff, guestbook, and admin */}
      <KingCursor disableClickAnimation={activeTab === 'stuff' || activeTab === 'guestbook' || activeTab === 'admin'} />

      {/* Top Fixed Masthead Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onShuffle={handleShuffle}
        homeSlideInfo={homeSlideInfo}
        guestbookCount={guestbookEntries.length}
        onOpenSignGuestbook={() => {
          setActiveTab('guestbook');
          setGuestbookFormOpen(true);
        }}
      />

      {/* Main Page Content */}
      <main className="flex-1 w-full">
        {activeTab === 'story' && (
          <StoryView
            onSlideChange={handleSlideChange}
            onNavigateToHomeCV={() => setActiveTab('home')}
            onNavigateToWritings={() => setActiveTab('writings')}
            onNavigateToStuff={() => setActiveTab('stuff')}
          />
        )}

        {activeTab === 'home' && (
          <HomeView
            onNavigateToWritings={() => setActiveTab('writings')}
            onNavigateToStory={() => setActiveTab('story')}
            onNavigateToStuff={() => setActiveTab('stuff')}
            onNavigateToGuestbook={() => setActiveTab('guestbook')}
          />
        )}

        {activeTab === 'writings' && (
          <WritingsView
            onSelectArticle={(article) => setSelectedArticle(article)}
            onNavigateToHomeCV={() => setActiveTab('home')}
            onNavigateToStuff={() => setActiveTab('stuff')}
            onNavigateToStory={() => setActiveTab('story')}
            onNavigateToGuestbook={() => setActiveTab('guestbook')}
          />
        )}

        {activeTab === 'stuff' && (
          <StuffView
            externalShuffleTrigger={shelfShuffleCount}
            onNavigateToWritings={() => setActiveTab('writings')}
            onNavigateToGuestbook={() => setActiveTab('guestbook')}
            onNavigateToStory={() => setActiveTab('story')}
            onNavigateToHomeCV={() => setActiveTab('home')}
          />
        )}

        {activeTab === 'guestbook' && (
          <GuestbookView
            entries={guestbookEntries}
            onAddEntry={handleAddGuestbookEntry}
            onLikeEntry={handleLikeGuestbookEntry}
            onRefresh={handleRefreshGuestbook}
            formOpen={guestbookFormOpen}
            setFormOpen={setGuestbookFormOpen}
            onNavigateToStuff={() => setActiveTab('stuff')}
            onNavigateToStory={() => setActiveTab('story')}
            onNavigateToHomeCV={() => setActiveTab('home')}
            onNavigateToWritings={() => setActiveTab('writings')}
          />
        )}

        {activeTab === 'admin' && (
          <AdminView onExit={() => setActiveTab('story')} />
        )}
      </main>

      {/* Persistent Minimalist Footer */}
      <footer className="w-full border-t border-neutral-100 py-4 px-4 text-micro text-neutral-400 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="text-black font-sans font-medium">vansh.portfolio</span>
            <span>•</span>
            <span>Clone concept of urfd.net</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden md:inline">Hotkeys: [1] Story [2] Home/CV [3] Writings [4] Stuff [5] Guestbook [Shift+A] Admin [M] Mute</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>

      {/* Overlays / Modals */}
      <ProjectModal
        item={selectedProject}
        onClose={() => setSelectedProject(null)}
      />

      <ArticleModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />

    </div>
  );
};

export default App;
