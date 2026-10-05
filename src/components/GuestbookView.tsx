import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GuestbookEntry } from '../data/guestbook';
import { playClickSound } from '../utils/sound';
import confetti from 'canvas-confetti';
import { Heart, Send, Sparkles, MapPin, AtSign, RotateCcw, ArrowUp, RefreshCw } from 'lucide-react';

interface GuestbookViewProps {
  entries: GuestbookEntry[];
  onAddEntry: (entry: Omit<GuestbookEntry, 'id' | 'timestamp' | 'likes'>) => void;
  onLikeEntry: (id: string) => void;
  onRefresh?: () => void;
  formOpen: boolean;
  setFormOpen: (open: boolean) => void;
  onNavigateToStuff?: () => void;
  onNavigateToStory?: () => void;
  onNavigateToHomeCV?: () => void;
  onNavigateToWritings?: () => void;
}

export const GuestbookView: React.FC<GuestbookViewProps> = ({
  entries,
  onAddEntry,
  onLikeEntry,
  onRefresh,
  formOpen,
  setFormOpen,
  onNavigateToStuff,
  onNavigateToStory,
  onNavigateToHomeCV,
  onNavigateToWritings,
}) => {
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [location, setLocation] = useState('');
  const [message, setMessage] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('✦');
  const [filterText, setFilterText] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isNavigatingRef = useRef(false);
  const touchStartY = useRef<number | null>(null);

  const avatarOptions = ['✦', '⚡', '☕', '🚀', '🖤', '🎨', '🏮', '🍀', '✨', '👾'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim() || isSubmitting) return;

    setIsSubmitting(true);
    playClickSound('high');

    // Trigger celebratory Diwali cracker fireworks
    confetti({
      particleCount: 80,
      spread: 80,
      origin: { y: 0.65 },
      colors: ['#ffd700', '#ff3366', '#d2fd78', '#00e5ff', '#ff9900', '#ffffff'],
    });

    setTimeout(() => {
      confetti({
        particleCount: 45,
        angle: 60,
        spread: 60,
        origin: { x: 0.15, y: 0.7 },
        colors: ['#ffd700', '#ff0055', '#d2fd78'],
      });
      confetti({
        particleCount: 45,
        angle: 120,
        spread: 60,
        origin: { x: 0.85, y: 0.7 },
        colors: ['#ffd700', '#00e5ff', '#d2fd78'],
      });
    }, 180);

    onAddEntry({
      name: name.trim().slice(0, 50),
      handle: handle.trim() ? (handle.startsWith('@') ? handle.trim().slice(0, 40) : `@${handle.trim().slice(0, 39)}`) : undefined,
      location: location.trim().slice(0, 60) || 'Internet Explorer',
      message: message.trim().slice(0, 500),
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      }),
      avatar: selectedAvatar,
      isOwner: false,
    });

    // Reset form
    setName('');
    setHandle('');
    setLocation('');
    setMessage('');
    setFormOpen(false);
    setIsSubmitting(false);
  };

  const filteredEntries = entries.filter(
    (item) =>
      item.name.toLowerCase().includes(filterText.toLowerCase()) ||
      item.message.toLowerCase().includes(filterText.toLowerCase()) ||
      item.location.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div
      data-no-strike="true"
      className="guestbook-container w-full max-w-4xl mx-auto px-4 pt-24 pb-24 select-text page-transition"
    >
      
      {/* Header Info */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-100 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded bg-black text-white text-[11px] font-mono mb-2 tracking-wide">
            <span>PAGE 5</span>
            <span>•</span>
            <span>COMMUNITY & GUESTBOOK</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-black mb-1.5 flex items-center gap-2">
            <span>Guestbook</span>
            <span className="text-micro font-mono text-neutral-400">
              ({entries.length})
            </span>
          </h1>
          <p className="text-sub text-neutral-500 max-w-xl">
            Leave a note, share a thought, say hello, or just leave your signature from wherever you are in the world. Synced live across all devices.
          </p>
        </div>

        {/* Toggle Sign Form Button */}
        <div>
          <button
            onClick={() => {
              playClickSound('high');
              setFormOpen(!formOpen);
            }}
            className="bg-black text-white hover:bg-neutral-800 transition-colors px-3.5 py-1.5 rounded text-sub font-medium flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Sparkles size={12} className="text-[#d2fd78]" />
            <span>{formOpen ? 'Close Form' : 'Sign the Guestbook'}</span>
          </button>
        </div>
      </div>

      {/* Signature Form (Expandable) */}
      {formOpen && (
        <form
          onSubmit={handleSubmit}
          className="mb-12 p-6 bg-neutral-50 border border-neutral-200/80 rounded-lg shadow-sm space-y-4 animate-fadeIn"
        >
          <div className="flex items-center justify-between border-b border-neutral-200/60 pb-3">
            <h3 className="text-sub font-medium text-black flex items-center gap-1.5">
              <span>Leave your mark</span>
            </h3>
            <div className="flex items-center gap-1.5 text-micro text-emerald-600 font-mono">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>live synced globally</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-micro text-neutral-500">
                  Name <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] font-mono text-neutral-400">
                  {name.length}/50
                </span>
              </div>
              <input
                type="text"
                required
                maxLength={50}
                placeholder="Type your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-1.5 text-sub bg-white border border-neutral-200 rounded focus:outline-none focus:border-black transition-colors"
              />
            </div>

            <div>
              <label className="block text-micro text-neutral-500 mb-1">
                Handle or Site (optional)
              </label>
              <div className="relative">
                <AtSign size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  maxLength={100}
                  placeholder="@handle or site"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  className="w-full pl-7 pr-3 py-1.5 text-sub bg-white border border-neutral-200 rounded focus:outline-none focus:border-black transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-micro text-neutral-500 mb-1">
                City / Location
              </label>
              <div className="relative">
                <MapPin size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  maxLength={60}
                  placeholder="e.g. New Delhi, India"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-7 pr-3 py-1.5 text-sub bg-white border border-neutral-200 rounded focus:outline-none focus:border-black transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Emoji Badge Selector */}
          <div>
            <label className="block text-micro text-neutral-500 mb-1.5">
              Choose your symbol
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {avatarOptions.map((sym) => (
                <button
                  type="button"
                  key={sym}
                  onClick={() => {
                    playClickSound('tick');
                    setSelectedAvatar(sym);
                  }}
                  className={`w-8 h-8 rounded flex items-center justify-center text-sm transition-all cursor-pointer ${
                    selectedAvatar === sym
                      ? 'bg-black text-[#d2fd78] shadow scale-105'
                      : 'bg-white hover:bg-neutral-200 text-neutral-700 border border-neutral-200'
                  }`}
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>

          {/* Message Area */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-micro text-neutral-500">
                Message <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] font-mono text-neutral-400">
                {message.length}/500
              </span>
            </div>
            <textarea
              required
              rows={3}
              maxLength={500}
              placeholder="Write your greeting, feedback, or thoughts here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 text-sub bg-white border border-neutral-200 rounded focus:outline-none focus:border-black transition-colors"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="px-3 py-1.5 text-micro text-neutral-500 hover:text-black transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-black text-white hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors px-4 py-1.5 rounded text-sub font-medium flex items-center gap-1.5 shadow cursor-pointer"
            >
              <Send size={12} />
              <span>{isSubmitting ? 'Posting...' : 'Post Signature'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Filter / Search Bar with Live Refresh */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <span className="text-micro text-neutral-400 uppercase tracking-wider font-mono">
          Recent Signatures ({filteredEntries.length})
        </span>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              type="button"
              onClick={() => {
                playClickSound('tick');
                setIsRefreshing(true);
                onRefresh();
                setTimeout(() => setIsRefreshing(false), 800);
              }}
              title="Refresh live signatures"
              className="p-1.5 text-neutral-400 hover:text-black transition-colors rounded hover:bg-neutral-100 cursor-pointer flex items-center gap-1 text-micro font-mono"
            >
              <RefreshCw size={11} className={isRefreshing ? 'animate-spin text-black' : ''} />
              <span className="hidden sm:inline text-[10px]">Sync</span>
            </button>
          )}

          <input
            type="text"
            placeholder="Filter messages..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="text-micro bg-neutral-50 border border-neutral-200 px-2.5 py-1 rounded w-36 sm:w-44 focus:outline-none focus:border-black"
          />
        </div>
      </div>

      {/* Guestbook Entries Stream */}
      <div className="space-y-4">
        {filteredEntries.map((entry) => (
          <div
            key={entry.id}
            className="p-4 bg-white border border-neutral-100 rounded-lg hover:border-neutral-200 transition-all hover:shadow-xs group flex gap-3.5 items-start"
          >
            {/* Avatar Badge */}
            <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-sm shrink-0 border border-neutral-200/50">
              {entry.avatar}
            </div>

            {/* Entry Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2 mb-1 flex-wrap">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-medium text-black text-sub">
                    {entry.name}
                  </span>
                  {entry.handle && (
                    <span className="text-micro text-neutral-400 font-mono">
                      {entry.handle}
                    </span>
                  )}
                  {entry.location && (
                    <span className="text-micro text-neutral-400">
                      • {entry.location}
                    </span>
                  )}
                </div>

                <span className="text-micro text-neutral-400 font-mono">
                  {entry.date}
                </span>
              </div>

              <p className="text-sub text-neutral-700 leading-relaxed break-words">
                {entry.message}
              </p>

              {/* Like / Heart Action */}
              <div className="mt-2.5 flex items-center gap-3">
                <button
                  onClick={() => {
                    playClickSound('pop');
                    onLikeEntry(entry.id);
                  }}
                  className="flex items-center gap-1 text-micro text-neutral-400 hover:text-rose-600 transition-colors group/btn cursor-pointer"
                >
                  <Heart
                    size={11}
                    className="group-hover/btn:fill-rose-500 group-hover/btn:text-rose-500 transition-colors"
                  />
                  <span>{entry.likes}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Bottom Page Continuation Bar ────────────────────── */}
      <div className="mt-16 pt-8 border-t border-neutral-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
        <div className="flex items-center gap-3">
          {onNavigateToStuff && (
            <button
              onClick={() => {
                playClickSound('tick');
                onNavigateToStuff();
              }}
              className="hover:text-black ul-link transition-colors cursor-pointer text-neutral-500"
            >
              ← Back to Page 4: Stuff
            </button>
          )}

          {onNavigateToHomeCV && (
            <button
              onClick={() => {
                playClickSound('tick');
                onNavigateToHomeCV();
              }}
              className="hover:text-black ul-link transition-colors cursor-pointer text-neutral-500"
            >
              (Home/CV)
            </button>
          )}
        </div>

        {/* Restart Flow Button */}
        {onNavigateToStory && (
          <button
            onClick={() => {
              playClickSound('high');
              onNavigateToStory();
            }}
            className="flex items-center gap-1.5 text-xs text-black font-semibold hover:text-blue-600 transition-colors cursor-pointer"
          >
            <RotateCcw size={12} />
            <span>Restart from Page 1: Story Lab</span>
          </button>
        )}
      </div>

    </div>
  );
};
