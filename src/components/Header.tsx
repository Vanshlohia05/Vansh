import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, ArrowUpRight, X, Shuffle, Shield } from 'lucide-react';
import { playClickSound, toggleSound, isSoundEnabled } from '../utils/sound';

export type NavTab = 'story' | 'home' | 'writings' | 'stuff' | 'guestbook' | 'admin';

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
    <header className="fixed top-0 left-0 w-full z-40 bg-white/95 backdrop-blur-md border-b border-neutral-100 transition-all duration-300 font-sans">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-x-6 gap-y-2 px-4 py-3 items-baseline text-sub font-normal">
        
        {/* Col 1 & 2: Logo */}
        <div className="col-span-1 md:col-span-1 lg:col-span-2 flex items-center">
          <button
            onClick={() => handleTabClick('story')}
            className="group relative inline-block text-left focus:outline-none cursor-pointer"
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
        <div className="hidden md:flex md:col-span-2 lg:col-span-3 items-center gap-1.5 flex-wrap">
          <span className="text-neutral-400 mr-1">Pages</span>
          
          <button
            onClick={() => handleTabClick('story')}
            className={`op-link ${activeTab === 'story' ? 'active' : ''}`}
          >
            Story
          </button>

          <button
            onClick={() => handleTabClick('home')}
            className={`op-link ${activeTab === 'home' ? 'active' : ''}`}
          >
            Home/CV
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

          {activeTab === 'admin' && (
            <button
              onClick={() => handleTabClick('admin')}
              className="op-link active font-mono text-[11px]"
            >
              [Admin]
            </button>
          )}
        </div>

        {/* Col 5: Dynamic Contextual Action based on current page */}
        <div className="hidden lg:flex lg:col-span-1 items-center text-neutral-500">
          {activeTab === 'story' && (
            <div className="flex items-center gap-1.5 text-micro">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-neutral-600 truncate">Story Lab</span>
            </div>
          )}

          {activeTab === 'home' && (
            <div className="flex items-center gap-1.5 text-micro">
              <span className="font-mono text-black font-medium">[02/05]</span>
              <span className="truncate max-w-[110px] text-neutral-600">CV & Portfolio</span>
            </div>
          )}

          {activeTab === 'stuff' && (
            <div className="flex items-center gap-2 text-micro">
              {onShuffle && (
                <button
                  onClick={() => {
                    playClickSound('pop');
                    onShuffle();
                  }}
                  className="hover:text-black font-medium transition-colors flex items-center gap-1 bg-neutral-100 hover:bg-neutral-200 px-2 py-0.5 rounded text-neutral-700 cursor-pointer font-mono"
                  title="Shuffle Library"
                >
                  <Shuffle size={10} />
                  <span>Shuffle</span>
                </button>
              )}
            </div>
          )}

          {activeTab === 'writings' && (
            <span className="text-micro text-neutral-400 truncate">
              Essays & Notes
            </span>
          )}

          {activeTab === 'guestbook' && (
            <div className="flex items-center gap-2 text-micro">
              <span className="text-neutral-500 font-mono text-[11px]">
                {guestbookCount || 0} sigs
              </span>
              {onOpenSignGuestbook && (
                <button
                  onClick={() => {
                    playClickSound('high');
                    onOpenSignGuestbook();
                  }}
                  className="bg-black text-white px-1.5 py-0.5 rounded text-[10px] hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  + Sign
                </button>
              )}
            </div>
          )}

          {activeTab === 'admin' && (
            <div className="flex items-center gap-1.5 text-micro text-neutral-600 font-mono">
              <Shield size={11} className="text-black" />
              <span>Admin Mode</span>
            </div>
          )}
        </div>

        {/* Col 7 & 8: About Toggle & Audio button */}
        <div className="col-span-1 md:col-span-1 lg:col-span-2 flex items-center justify-end gap-3">
          {/* Subtle Sound Toggle */}
          <button
            onClick={handleSoundToggle}
            title={soundOn ? 'Tactile Audio On' : 'Tactile Audio Muted'}
            className="text-neutral-400 hover:text-black transition-colors p-1 cursor-pointer"
          >
            {soundOn ? <Volume2 size={13} /> : <VolumeX size={13} />}
          </button>

          {/* About Drawer Toggle */}
          <button
            onClick={() => {
              playClickSound('paper');
              setAboutOpen(!aboutOpen);
            }}
            className="flex items-center gap-1 hover:text-black text-neutral-700 transition-colors cursor-pointer"
          >
            <span>About</span>
            <span className="font-mono text-micro text-neutral-400">
              {aboutOpen ? '[-]' : '[+]'}
            </span>
          </button>

          {/* Dynamic 3-Line Animated Burger Button for Mobile */}
          <button
            onClick={() => {
              playClickSound('tick');
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            aria-label="Toggle Navigation Menu"
            className="md:hidden flex flex-col justify-center items-center w-8 h-8 p-1.5 gap-1 text-neutral-800 hover:text-black focus:outline-none cursor-pointer"
          >
            <span
              className={`h-0.5 w-5 bg-current rounded-full transition-all duration-300 origin-center ${
                mobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''
              }`}
            />
            <span
              className={`h-0.5 w-5 bg-current rounded-full transition-all duration-300 ${
                mobileMenuOpen ? 'opacity-0 scale-x-0' : 'opacity-100 scale-x-100'
              }`}
            />
            <span
              className={`h-0.5 w-5 bg-current rounded-full transition-all duration-300 origin-center ${
                mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-100 px-4 py-3 bg-white/95 backdrop-blur-md flex flex-col gap-2.5 animate-fadeIn">
          <div className="flex items-center justify-between text-micro text-neutral-400 uppercase tracking-wider mb-1">
            <span>Navigation</span>
            <span className="font-mono">{currentTime} IST</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              onClick={() => handleTabClick('story')}
              className={`text-left py-1.5 px-2.5 rounded text-sub cursor-pointer transition-colors ${
                activeTab === 'story' ? 'bg-black text-white font-medium shadow-sm' : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700'
              }`}
            >
              1. Story
            </button>
            <button
              onClick={() => handleTabClick('home')}
              className={`text-left py-1.5 px-2.5 rounded text-sub cursor-pointer transition-colors ${
                activeTab === 'home' ? 'bg-black text-white font-medium shadow-sm' : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700'
              }`}
            >
              2. Home/CV
            </button>
            <button
              onClick={() => handleTabClick('writings')}
              className={`text-left py-1.5 px-2.5 rounded text-sub cursor-pointer transition-colors ${
                activeTab === 'writings' ? 'bg-black text-white font-medium shadow-sm' : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700'
              }`}
            >
              3. Writings
            </button>
            <button
              onClick={() => handleTabClick('stuff')}
              className={`text-left py-1.5 px-2.5 rounded text-sub cursor-pointer transition-colors ${
                activeTab === 'stuff' ? 'bg-black text-white font-medium shadow-sm' : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700'
              }`}
            >
              4. Stuff
            </button>
            <button
              onClick={() => handleTabClick('guestbook')}
              className={`text-left py-1.5 px-2.5 rounded text-sub cursor-pointer transition-colors ${
                activeTab === 'guestbook' ? 'bg-black text-white font-medium shadow-sm' : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700'
              }`}
            >
              5. Guestbook
            </button>
          </div>
        </div>
      )}

      {/* Expanded About Accordion */}
      {aboutOpen && (
        <div className="border-t border-neutral-100 bg-neutral-50/80 px-4 py-5 transition-all duration-300">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-sub">
            
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

            <div className="space-y-2 text-neutral-600 md:border-l md:border-neutral-200 md:pl-6">
              <p className="text-micro uppercase tracking-wider text-neutral-400 font-medium">
                Elsewhere
              </p>
              <ul className="space-y-1.5">
                <li>
                  <a
                    href="https://github.com/Vanshlohia05/Vansh"
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
                    href="https://www.linkedin.com/in/vanshlohia/"
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
                    href="mailto:lohiavansh24.work@gmail.com"
                    className="ul-link text-black inline-flex items-center gap-1 hover:text-neutral-600"
                  >
                    <span>lohiavansh24.work@gmail.com</span>
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
