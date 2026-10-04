import React, { useState, useEffect, useCallback } from 'react';
import { Header, NavTab } from './components/Header';
import { StoryView } from './components/StoryView';
import { HomeView } from './components/HomeView';
import { WritingsView } from './components/WritingsView';
import { StuffView } from './components/StuffView';
import { GuestbookView } from './components/GuestbookView';
import { ProjectModal } from './components/ProjectModal';
import { ArticleModal } from './components/ArticleModal';
import { KingCursor } from './components/KingCursor';
import { STUFF_ITEMS, StuffItem } from './data/stuff';
import { Artwork } from './data/homeArtworks';
import { Article } from './data/writings';
import {
  GuestbookEntry,
  loadGuestbookEntries,
  saveGuestbookEntries,
} from './data/guestbook';
import { playClickSound, toggleSound } from './utils/sound';

export const App: React.FC = () => {
  // Navigation state (synced with window hash)
  const [activeTab, setActiveTabState] = useState<NavTab>('story');
  const [galleryMode, setGalleryMode] = useState<'gallery' | 'index'>('gallery');
  const [shuffledItems, setShuffledItems] = useState<StuffItem[]>(STUFF_ITEMS);
  const [homeSlideInfo, setHomeSlideInfo] = useState<{ current: number; total: number; title: string }>({
    current: 1,
    total: 4,
    title: 'Morning Brew',
  });

  // Guestbook State
  const [guestbookEntries, setGuestbookEntries] = useState<GuestbookEntry[]>([]);
  const [guestbookFormOpen, setGuestbookFormOpen] = useState(false);

  // Modals
  const [selectedProject, setSelectedProject] = useState<StuffItem | Artwork | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // Initialize guestbook from localStorage
  useEffect(() => {
    setGuestbookEntries(loadGuestbookEntries());
  }, []);

  // Sync tab with URL hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as NavTab;
      if (['story', 'home', 'writings', 'stuff', 'guestbook'].includes(hash)) {
        setActiveTabState(hash);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

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

  // Shuffle Stuff Items (Fisher-Yates)
  const handleShuffle = () => {
    const items = [...shuffledItems];
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    setShuffledItems(items);
  };

  // Guestbook Handlers
  const handleAddGuestbookEntry = (
    newEntryData: Omit<GuestbookEntry, 'id' | 'timestamp' | 'likes'>
  ) => {
    const newEntry: GuestbookEntry = {
      ...newEntryData,
      id: `g-${Date.now()}`,
      timestamp: Date.now(),
      likes: 1,
    };
    const updated = [newEntry, ...guestbookEntries];
    setGuestbookEntries(updated);
    saveGuestbookEntries(updated);
  };

  const handleLikeGuestbookEntry = (id: string) => {
    const updated = guestbookEntries.map((entry) => {
      if (entry.id === id) {
        return { ...entry, likes: entry.likes + 1 };
      }
      return entry;
    });
    setGuestbookEntries(updated);
    saveGuestbookEntries(updated);
  };

  // Global hotkeys (1: Story, 2: Home/CV, 3: Writings, 4: Stuff, 5: Guestbook, s, m)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.key === '1') {
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
    <div className="min-h-screen bg-white text-black selection:bg-[#d2fd78] selection:text-black flex flex-col justify-between">
      {/* Indian King Cursor with Spear Strike and Blue Word Light */}
      <KingCursor />

      {/* Top Fixed Masthead Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        galleryMode={galleryMode}
        setGalleryMode={setGalleryMode}
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
            galleryMode={galleryMode}
            setGalleryMode={setGalleryMode}
            shuffledItems={shuffledItems}
            onShuffle={handleShuffle}
            onSelectItem={(item) => setSelectedProject(item)}
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
            formOpen={guestbookFormOpen}
            setFormOpen={setGuestbookFormOpen}
            onNavigateToStuff={() => setActiveTab('stuff')}
            onNavigateToStory={() => setActiveTab('story')}
            onNavigateToHomeCV={() => setActiveTab('home')}
            onNavigateToWritings={() => setActiveTab('writings')}
          />
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
            <span className="hidden md:inline">Hotkeys: [1] Story [2] Home/CV [3] Writings [4] Stuff [5] Guestbook [M] Mute</span>
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
