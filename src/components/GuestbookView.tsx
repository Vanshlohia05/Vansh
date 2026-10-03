import React, { useState } from 'react';
import { GuestbookEntry } from '../data/guestbook';
import { playClickSound } from '../utils/sound';
import confetti from 'canvas-confetti';
import { Heart, Send, Sparkles, MapPin, AtSign, MessageSquare } from 'lucide-react';

interface GuestbookViewProps {
  entries: GuestbookEntry[];
  onAddEntry: (entry: Omit<GuestbookEntry, 'id' | 'timestamp' | 'likes'>) => void;
  onLikeEntry: (id: string) => void;
  formOpen: boolean;
  setFormOpen: (open: boolean) => void;
}

export const GuestbookView: React.FC<GuestbookViewProps> = ({
  entries,
  onAddEntry,
  onLikeEntry,
  formOpen,
  setFormOpen,
}) => {
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [location, setLocation] = useState('');
  const [message, setMessage] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('✦');
  const [filterText, setFilterText] = useState('');

  const avatarOptions = ['✦', '⚡', '☕', '🚀', '🖤', '🎨', '🏮', '🍀', '✨', '👾'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    playClickSound('high');

    // Trigger celebratory confetti
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#d2fd78', '#000000', '#686058', '#dedede'],
    });

    onAddEntry({
      name: name.trim(),
      handle: handle.trim() ? (handle.startsWith('@') ? handle.trim() : `@${handle.trim()}`) : undefined,
      location: location.trim() || 'Internet Explorer',
      message: message.trim(),
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
  };

  const filteredEntries = entries.filter(
    (item) =>
      item.name.toLowerCase().includes(filterText.toLowerCase()) ||
      item.message.toLowerCase().includes(filterText.toLowerCase()) ||
      item.location.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pt-24 pb-24">
      
      {/* Header Info */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-100 pb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-normal tracking-tight text-black mb-1.5 flex items-center gap-2">
            <span>Guestbook</span>
            <span className="text-micro font-mono text-neutral-400">
              ({entries.length})
            </span>
          </h1>
          <p className="text-sub text-neutral-500 max-w-xl">
            Leave a note, share a thought, say hello, or just leave your signature from wherever you are in the world.
          </p>
        </div>

        {/* Toggle Sign Form Button */}
        <div>
          <button
            onClick={() => {
              playClickSound('high');
              setFormOpen(!formOpen);
            }}
            className="bg-black text-white hover:bg-neutral-800 transition-colors px-3.5 py-1.5 rounded text-sub font-medium flex items-center gap-1.5 shadow-sm"
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
            <span className="text-micro text-neutral-400 font-mono">
              saved locally
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-micro text-neutral-500 mb-1">
                Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sarthak or Anonymous"
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
                  className={`w-8 h-8 rounded flex items-center justify-center text-sm transition-all ${
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
            <label className="block text-micro text-neutral-500 mb-1">
              Message <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
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
              className="px-3 py-1.5 text-micro text-neutral-500 hover:text-black transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-black text-white hover:bg-neutral-800 transition-colors px-4 py-1.5 rounded text-sub font-medium flex items-center gap-1.5 shadow"
            >
              <Send size={12} />
              <span>Post Signature</span>
            </button>
          </div>
        </form>
      )}

      {/* Filter / Search Bar */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <span className="text-micro text-neutral-400 uppercase tracking-wider font-mono">
          Recent Signatures ({filteredEntries.length})
        </span>

        <input
          type="text"
          placeholder="Filter messages..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="text-micro bg-neutral-50 border border-neutral-200 px-2.5 py-1 rounded w-44 focus:outline-none focus:border-black"
        />
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
                  className="flex items-center gap-1 text-micro text-neutral-400 hover:text-rose-600 transition-colors group/btn"
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

    </div>
  );
};
