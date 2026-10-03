import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, ArrowUpRight, Compass, X } from 'lucide-react';
import { playClickSound, toggleSound, isSoundEnabled } from '../utils/sound';

export type NavTab = 'home' | 'writings' | 'stuff' | 'guestbook';

interface HeaderProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  // Contextual controls
  galleryMode?: 'gallery' | 'index';
  setGalleryMode?: (mode: 'gallery' | 'index') => void;
  onShuffle?: () => void;
  homeSlideInfo?: { current: number; total: number; title: string };
  guestbookCount?: number;
  onOpenSignGuestbook?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  galleryMode,
  setGalleryMode,
  onShuffle,
  homeSlideInfo,
  guestbookCount,
  onOpenSignGuestbook
}) => {
  const [aboutOpen, setAboutOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Live time in IST / Local
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleTabClick = (tab: NavTab) => {
    playClickSound('tick');
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const handleSoundToggle = () => {
    const newState = toggleSound();
    setSoundOn(newState);
  };

  return (
    <header className="fixed top-0 left-0 w-full z-40 bg-white/95 backdrop-blur-md border-b border-neutral-100 transition-all duration-300">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-x-6 gap-y-2 px-4 py-3 items-baseline text-sub font-normal">
        
        {/* Col 1 & 2: Logo with urfd-style hover effect */}
        <div className="col-span-1 md:col-span-1 lg:col-span-2 flex items-center">
          <button
            onClick={() => handleTabClick('home')}
            className="group relative inline-block text-left focus:outline-none"
          >
            <span className="block font-medium tracking-tight text-black transition-opacity duration-300 group-hover:opacity-0">
              vansh
            </span>
            <span className="absolute inset-0 font-medium tracking-tight text-neutral-900 opacity-0 transition-opacity duration-300 group-hover:opacity-100 whitespace-nowrap">
              Ur Friend <span className="text-neutral-400 text-micro">↗</span>
            </span>
          </button>
        </div>

        {/* Col 3 & 4: Navigation Menu */}
        <div className="hidden md:flex md:col-span-2 lg:col-span-2 items-center gap-1.5 flex-wrap">
          <span className="text-neutral-400 mr-1">Stories</span>
          
          <button
            onClick={() => handleTabClick('home')}
            className={`op-link ${activeTab === 'home' ? 'active' : ''}`}
          >
            Home
          </button>
          
          <button
            onClick={() => handleTabClick('writings')}
            className={`op-link ${activeTab === 'writings' ? 'active' : ''}`}
          >
            Writings
          </button>

          <button
            onClick={() => handleTabClick('stuff')}
            className={`op-link ${activeTab === 'stuff' ? 'active' : ''}`}
          >
            Stuff
          </button>

          <button
            onClick={() => handleTabClick('guestbook')}
            className={`op-link ${activeTab === 'guestbook' ? 'active' : ''}`}
          >
            Guestbook
          </button>
        </div>

        {/* Col 5 & 6: Dynamic Contextual Action based on current page */}
        <div className="hidden lg:flex lg:col-span-2 items-center text-neutral-500">
          {activeTab === 'home' && homeSlideInfo && (
            <div className="flex items-center gap-2 text-micro">
              <span className="font-mono text-black">
                [{String(homeSlideInfo.current).padStart(2, '0')} / {String(homeSlideInfo.total).padStart(2, '0')}]
              </span>
              <span className="truncate max-w-[140px] text-neutral-600">
                {homeSlideInfo.title}
              </span>
            </div>
          )}

          {activeTab === 'stuff' && (
            <div className="flex items-center gap-4 text-micro">
              {onShuffle && (
                <button
                  onClick={() => {
                    playClickSound('pop');
                    onShuffle();
                  }}
                  className="hover:text-black font-medium transition-colors flex items-center gap-1"
                >
                  <span>Shuffle</span>
                  <span className="text-[10px] text-neutral-400">↺</span>
                </button>
              )}
              {setGalleryMode && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      playClickSound('tick');
                      setGalleryMode('gallery');
                    }}
                    className={`op-link ${galleryMode === 'gallery' ? 'active' : ''}`}
                  >
                    Gallery
                  </button>
                  <span className="text-neutral-300">/</span>
                  <button
                    onClick={() => {
                      playClickSound('tick');
                      setGalleryMode('index');
                    }}
                    className={`op-link ${galleryMode === 'index' ? 'active' : ''}`}
                  >
                    Index
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'writings' && (
            <span className="text-micro text-neutral-400">
              Essays, notes & engineering thoughts
            </span>
          )}

          {activeTab === 'guestbook' && (
            <div className="flex items-center gap-3 text-micro">
              <span className="text-neutral-500 font-mono">
                {guestbookCount || 0} signatures
              </span>
              {onOpenSignGuestbook && (
                <button
                  onClick={() => {
                    playClickSound('high');
                    onOpenSignGuestbook();
                  }}
                  className="bg-black text-white px-2 py-0.5 rounded text-[10px] hover:bg-neutral-800 transition-colors"
                >
                  + Sign
                </button>
              )}
            </div>
          )}
        </div>

        {/* Col 7 & 8: About Toggle & Audio button */}
        <div className="col-span-1 md:col-span-1 lg:col-span-2 flex items-center justify-end gap-3">
          {/* Subtle Sound Toggle */}
          <button
            onClick={handleSoundToggle}
            title={soundOn ? 'Tactile Audio On' : 'Tactile Audio Muted'}
            className="text-neutral-400 hover:text-black transition-colors p-1"
          >
            {soundOn ? <Volume2 size={13} /> : <VolumeX size={13} />}
          </button>

          {/* About Drawer Toggle */}
          <button
            onClick={() => {
              playClickSound('paper');
              setAboutOpen(!aboutOpen);
            }}
            className="flex items-center gap-1 hover:text-black text-neutral-700 transition-colors"
          >
            <span>About</span>
            <span className="font-mono text-micro text-neutral-400">
              {aboutOpen ? '[-]' : '[+]'}
            </span>
          </button>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-neutral-600 hover:text-black p-1"
          >
            {mobileMenuOpen ? <X size={16} /> : <Compass size={16} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-100 px-4 py-3 bg-white/95 flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-micro text-neutral-400 uppercase tracking-wider mb-1">
            <span>Navigation</span>
            <span className="font-mono">{currentTime} IST</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleTabClick('home')}
              className={`text-left py-1.5 px-2 rounded text-sub ${
                activeTab === 'home' ? 'bg-neutral-100 font-medium' : 'text-neutral-600'
              }`}
            >
              (Home)
            </button>
            <button
              onClick={() => handleTabClick('writings')}
              className={`text-left py-1.5 px-2 rounded text-sub ${
                activeTab === 'writings' ? 'bg-neutral-100 font-medium' : 'text-neutral-600'
              }`}
            >
              (Writings)
            </button>
            <button
              onClick={() => handleTabClick('stuff')}
              className={`text-left py-1.5 px-2 rounded text-sub ${
                activeTab === 'stuff' ? 'bg-neutral-100 font-medium' : 'text-neutral-600'
              }`}
            >
              (Stuff)
            </button>
            <button
              onClick={() => handleTabClick('guestbook')}
              className={`text-left py-1.5 px-2 rounded text-sub ${
                activeTab === 'guestbook' ? 'bg-neutral-100 font-medium' : 'text-neutral-600'
              }`}
            >
              (Guestbook)
            </button>
          </div>
        </div>
      )}

      {/* Expanded About Accordion (Signature urfd .about .internal) */}
      {aboutOpen && (
        <div className="border-t border-neutral-100 bg-neutral-50/80 px-4 py-5 transition-all duration-300">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-sub">
            
            {/* Bio */}
            <div className="md:col-span-2 space-y-2">
              <p className="text-black font-medium">
                Vansh — Your friend; creative engineer & visual designer.
              </p>
              <p className="text-neutral-600 leading-relaxed">
                Building soulful experiences across digital platforms. Obsessed with high-framerate interactions, computational typography, WebGL shaders, and tactile physical software. Designing systems with clarity and quiet restraint.
              </p>
              <div className="flex items-center gap-3 pt-2 text-micro text-neutral-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 -ml-3"></span>
                  Available for select collaborations
                </span>
                <span>•</span>
                <span className="font-mono">{currentTime} IST</span>
              </div>
            </div>

            {/* Socials & Contact */}
            <div className="space-y-2 text-neutral-600 md:border-l md:border-neutral-200 md:pl-6">
              <p className="text-micro uppercase tracking-wider text-neutral-400 font-medium">
                Elsewhere
              </p>
              <ul className="space-y-1.5">
                <li>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noreferrer"
                    className="ul-link text-black inline-flex items-center gap-1 hover:text-neutral-600"
                  >
                    <span>GitHub</span>
                    <ArrowUpRight size={11} className="text-neutral-400" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://x.com"
                    target="_blank"
                    rel="noreferrer"
                    className="ul-link text-black inline-flex items-center gap-1 hover:text-neutral-600"
                  >
                    <span>X (Twitter)</span>
                    <ArrowUpRight size={11} className="text-neutral-400" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noreferrer"
                    className="ul-link text-black inline-flex items-center gap-1 hover:text-neutral-600"
                  >
                    <span>LinkedIn</span>
                    <ArrowUpRight size={11} className="text-neutral-400" />
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:vansh@example.com"
                    className="ul-link text-black inline-flex items-center gap-1 hover:text-neutral-600"
                  >
                    <span>vansh@example.com</span>
                    <ArrowUpRight size={11} className="text-neutral-400" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
