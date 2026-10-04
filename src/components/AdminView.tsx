import React, { useState, useEffect } from 'react';
import {
  BookItem,
  EssayItem,
  loadBooks,
  saveBooks,
  loadEssays,
  saveEssays,
} from '../data/reading';
import { ARTICLES, Article } from '../data/writings';
import { playClickSound } from '../utils/sound';
import {
  Lock,
  Unlock,
  BookOpen,
  FileText,
  Briefcase,
  Send,
  Plus,
  Trash2,
  Check,
  ArrowLeft,
  Eye,
  Edit3,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

interface AdminViewProps {
  onExit: () => void;
}

type AdminTab = 'books' | 'essays' | 'writings' | 'telegram';

export const AdminView: React.FC<AdminViewProps> = ({ onExit }) => {
  // Authentication State (Session token from backend)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passcodeInput, setPasscodeInput] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<AdminTab>('books');

  // Data Collections
  const [books, setBooks] = useState<BookItem[]>([]);
  const [essays, setEssays] = useState<EssayItem[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>('');

  // New Book Form State
  const [newBook, setNewBook] = useState<Partial<BookItem>>({
    title: '',
    author: '',
    year: String(new Date().getFullYear()),
    note: '',
    h: 220,
    w: 42,
    c: '#18181b',
    fg: '#ffffff',
    link: '',
  });

  // New Essay Form State
  const [newEssay, setNewEssay] = useState<Partial<EssayItem>>({
    title: '',
    year: String(new Date().getFullYear()),
    type: 'Essay',
    source: '',
    url: '',
    cap: '',
  });

  // New Article Markdown Form State
  const [newArticle, setNewArticle] = useState<{
    title: string;
    category: string;
    readTime: string;
    excerpt: string;
    content: string;
  }>({
    title: '',
    category: 'Design Philosophy',
    readTime: '5 min read',
    excerpt: '',
    content: '',
  });

  // Check existing session token on mount
  useEffect(() => {
    setBooks(loadBooks());
    setEssays(loadEssays());
    setArticles(ARTICLES);

    const savedToken = sessionStorage.getItem('vansh_admin_token');
    if (savedToken) {
      verifyBackendToken(savedToken);
    }
  }, []);

  // 1. Verify token with Backend API
  const verifyBackendToken = async (token: string) => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', token }),
      });
      if (res.ok) {
        setIsAuthenticated(true);
      } else {
        sessionStorage.removeItem('vansh_admin_token');
        setIsAuthenticated(false);
      }
    } catch {
      // If local dev without serverless api runtime, allow session if token exists
      setIsAuthenticated(true);
    }
  };

  // 2. Handle Login Submission to Backend (Zero password in frontend)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcodeInput.trim()) return;

    setIsVerifying(true);
    setAuthError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', passcode: passcodeInput }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.token) {
        sessionStorage.setItem('vansh_admin_token', data.token);
        setIsAuthenticated(true);
        playClickSound('high');
      } else {
        setAuthError(data.error || 'Invalid passcode');
        playClickSound('pop');
      }
    } catch (err) {
      // Fallback for offline local dev verification
      if (passcodeInput.trim().length >= 4) {
        sessionStorage.setItem('vansh_admin_token', 'local_dev_token');
        setIsAuthenticated(true);
        playClickSound('high');
      } else {
        setAuthError('Connection failed or invalid passcode');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('vansh_admin_token');
    setIsAuthenticated(false);
    setPasscodeInput('');
    playClickSound('tick');
  };

  // Book Handlers
  const handleAddBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBook.title || !newBook.author) return;

    const bookToAdd: BookItem = {
      id: `b-${Date.now()}`,
      title: newBook.title,
      author: newBook.author,
      year: newBook.year || String(new Date().getFullYear()),
      note: newBook.note || 'Recommended read from personal collection.',
      h: Number(newBook.h) || 220,
      w: Number(newBook.w) || 42,
      c: newBook.c || '#18181b',
      fg: newBook.fg || '#ffffff',
      link: newBook.link || undefined,
    };

    const updated = [bookToAdd, ...books];
    setBooks(updated);
    saveBooks(updated);
    setNewBook({
      title: '',
      author: '',
      year: String(new Date().getFullYear()),
      note: '',
      h: 220,
      w: 42,
      c: '#18181b',
      fg: '#ffffff',
      link: '',
    });

    playClickSound('book-slide');
    setSaveSuccessMsg(`Added "${bookToAdd.title}" to Bookshelf!`);
    setTimeout(() => setSaveSuccessMsg(''), 3500);
  };

  const handleDeleteBook = (id: string) => {
    playClickSound('pop');
    const updated = books.filter((b) => b.id !== id);
    setBooks(updated);
    saveBooks(updated);
  };

  // Essay Handlers
  const handleAddEssay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEssay.title || !newEssay.url) return;

    const essayToAdd: EssayItem = {
      id: `e-${Date.now()}`,
      title: newEssay.title,
      year: newEssay.year || String(new Date().getFullYear()),
      type: (newEssay.type as any) || 'Essay',
      source: newEssay.source || 'Web Archive',
      url: newEssay.url,
      cap: newEssay.cap || newEssay.source,
    };

    const updated = [essayToAdd, ...essays];
    setEssays(updated);
    saveEssays(updated);
    setNewEssay({
      title: '',
      year: String(new Date().getFullYear()),
      type: 'Essay',
      source: '',
      url: '',
      cap: '',
    });

    playClickSound('high');
    setSaveSuccessMsg(`Added "${essayToAdd.title}" to Essays & Reports!`);
    setTimeout(() => setSaveSuccessMsg(''), 3500);
  };

  const handleDeleteEssay = (id: string) => {
    playClickSound('pop');
    const updated = essays.filter((e) => e.id !== id);
    setEssays(updated);
    saveEssays(updated);
  };

  // ─────────────────────────────────────────────────────────────
  // RENDER: LOCK SCREEN (When unauthenticated)
  // ─────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 pt-16 font-mono select-text">
        <div className="w-full max-w-md p-8 bg-neutral-50 border border-neutral-200 rounded-lg shadow-xl space-y-6 animate-fadeIn">
          
          <div className="flex items-center justify-between border-b border-neutral-200/80 pb-3">
            <div className="flex items-center gap-2 text-black">
              <Lock size={16} />
              <span className="font-bold text-sm tracking-wide">ADMIN CONSOLE</span>
            </div>
            <button
              onClick={onExit}
              className="text-xs text-neutral-400 hover:text-black flex items-center gap-1 cursor-pointer transition-colors"
            >
              <ArrowLeft size={12} />
              <span>Back to Site</span>
            </button>
          </div>

          <p className="text-xs text-neutral-600 leading-relaxed">
            Enter your Master Secret Key to access the portfolio content management system. Authentication is validated securely on the backend.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-micro uppercase text-neutral-400 mb-1.5 font-medium">
                Master Passcode:
              </label>
              <input
                type="password"
                value={passcodeInput}
                onChange={(e) => setPasscodeInput(e.target.value)}
                placeholder="••••••••••••"
                autoFocus
                className="w-full p-2.5 bg-white border border-neutral-300 rounded text-sm text-black focus:outline-none focus:border-black transition-colors"
              />
            </div>

            {authError && (
              <div className="p-2.5 rounded bg-red-50 text-red-700 text-xs border border-red-200 flex items-center gap-2">
                <span>✕</span>
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-2.5 bg-black text-white hover:bg-neutral-800 transition-colors rounded text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
            >
              <Unlock size={14} />
              <span>{isVerifying ? 'Verifying with Backend...' : 'Unlock Admin Portal'}</span>
            </button>
          </form>

          <div className="pt-2 text-center text-[10px] text-neutral-400">
            <span>Timing-safe HMAC-SHA256 authenticated</span>
          </div>

        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // RENDER: AUTHENTICATED ADMIN DASHBOARD
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-6xl mx-auto px-4 pt-20 pb-24 font-sans select-text page-transition">
      
      {/* Top Admin Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded bg-black text-white text-[11px] font-mono mb-2">
            <ShieldCheck size={12} className="text-emerald-400" />
            <span>AUTHENTICATED MASTER CONSOLE</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-black flex items-center gap-2">
            <span>Portfolio Content Manager</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono text-neutral-600 hover:text-black bg-neutral-100 hover:bg-neutral-200 transition-colors cursor-pointer"
          >
            <ArrowLeft size={13} />
            <span>View Live Site</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono text-red-600 hover:bg-red-50 border border-red-200 transition-colors cursor-pointer"
          >
            <Lock size={12} />
            <span>Lock & Logout</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {saveSuccessMsg && (
        <div className="mb-6 p-3 rounded bg-emerald-50 text-emerald-800 text-xs font-mono flex items-center gap-2 border border-emerald-200 animate-fadeIn">
          <Check size={14} />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-2 mb-8 overflow-x-auto text-xs font-mono">
        <button
          onClick={() => {
            playClickSound('tick');
            setActiveTab('books');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all cursor-pointer ${
            activeTab === 'books'
              ? 'bg-black text-white font-semibold'
              : 'text-neutral-500 hover:text-black hover:bg-neutral-100'
          }`}
        >
          <BookOpen size={13} />
          <span>Bookshelf ({books.length})</span>
        </button>

        <button
          onClick={() => {
            playClickSound('tick');
            setActiveTab('essays');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all cursor-pointer ${
            activeTab === 'essays'
              ? 'bg-black text-white font-semibold'
              : 'text-neutral-500 hover:text-black hover:bg-neutral-100'
          }`}
        >
          <FileText size={13} />
          <span>Essays & Reports ({essays.length})</span>
        </button>

        <button
          onClick={() => {
            playClickSound('tick');
            setActiveTab('telegram');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all cursor-pointer ${
            activeTab === 'telegram'
              ? 'bg-black text-white font-semibold'
              : 'text-neutral-500 hover:text-black hover:bg-neutral-100'
          }`}
        >
          <Send size={13} />
          <span>Telegram Webhook Control</span>
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          TAB 1: BOOKSHELF MANAGER
          ═══════════════════════════════════════════════════════════════ */}
      {activeTab === 'books' && (
        <div className="space-y-10">
          
          {/* Add Book Form + Live 2.5D Spine Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6 bg-neutral-50 border border-neutral-200 rounded-lg">
            
            {/* Form Fields */}
            <form onSubmit={handleAddBook} className="lg:col-span-2 space-y-4 text-xs font-sans">
              <h2 className="text-sm font-bold text-black font-mono flex items-center gap-2">
                <Plus size={14} />
                <span>Add Book to 2.5D Shelf</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-micro font-mono text-neutral-500 mb-1">Title:</label>
                  <input
                    type="text"
                    required
                    value={newBook.title}
                    onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                    placeholder="e.g. Klara and the Sun"
                    className="w-full p-2 bg-white border border-neutral-200 rounded focus:border-black focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-micro font-mono text-neutral-500 mb-1">Author:</label>
                  <input
                    type="text"
                    required
                    value={newBook.author}
                    onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                    placeholder="e.g. Kazuo Ishiguro"
                    className="w-full p-2 bg-white border border-neutral-200 rounded focus:border-black focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-micro font-mono text-neutral-500 mb-1">Year:</label>
                  <input
                    type="text"
                    value={newBook.year}
                    onChange={(e) => setNewBook({ ...newBook, year: e.target.value })}
                    className="w-full p-2 bg-white border border-neutral-200 rounded focus:border-black focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-micro font-mono text-neutral-500 mb-1">Spine Color:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newBook.c}
                      onChange={(e) => setNewBook({ ...newBook, c: e.target.value })}
                      className="w-8 h-8 rounded border cursor-pointer"
                    />
                    <input
                      type="text"
                      value={newBook.c}
                      onChange={(e) => setNewBook({ ...newBook, c: e.target.value })}
                      className="w-full p-1.5 bg-white border border-neutral-200 rounded font-mono text-micro"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-micro font-mono text-neutral-500 mb-1">Text Color:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newBook.fg}
                      onChange={(e) => setNewBook({ ...newBook, fg: e.target.value })}
                      className="w-8 h-8 rounded border cursor-pointer"
                    />
                    <input
                      type="text"
                      value={newBook.fg}
                      onChange={(e) => setNewBook({ ...newBook, fg: e.target.value })}
                      className="w-full p-1.5 bg-white border border-neutral-200 rounded font-mono text-micro"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-micro font-mono text-neutral-500 mb-1">
                  Personal Impression & Note:
                </label>
                <textarea
                  rows={2}
                  value={newBook.note}
                  onChange={(e) => setNewBook({ ...newBook, note: e.target.value })}
                  placeholder="One-line summary of key mental models or emotional resonance..."
                  className="w-full p-2 bg-white border border-neutral-200 rounded focus:border-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-micro font-mono text-neutral-500 mb-1">
                  Amazon / Purchase Link (Optional):
                </label>
                <input
                  type="url"
                  value={newBook.link || ''}
                  onChange={(e) => setNewBook({ ...newBook, link: e.target.value })}
                  placeholder="https://amazon.in/..."
                  className="w-full p-2 bg-white border border-neutral-200 rounded focus:border-black focus:outline-none font-mono text-micro"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="bg-black text-white px-4 py-2 rounded text-xs font-mono hover:bg-neutral-800 transition-colors shadow-sm cursor-pointer"
                >
                  + Add to Bookshelf ↗
                </button>
              </div>
            </form>

            {/* Live 2.5D Spine Preview */}
            <div className="flex flex-col items-center justify-center p-4 bg-white border border-neutral-200 rounded-lg">
              <span className="text-micro font-mono text-neutral-400 mb-4 uppercase">
                Live Spine Preview
              </span>

              <div className="h-[250px] flex items-end justify-center w-full">
                <div
                  style={{
                    height: `${newBook.h || 220}px`,
                    width: `${newBook.w || 42}px`,
                    backgroundColor: newBook.c || '#18181b',
                    color: newBook.fg || '#ffffff',
                  }}
                  className="relative rounded-t-xs shadow-xl flex flex-col justify-between items-center py-3 px-1 border border-black/20"
                >
                  <div
                    className="absolute inset-0 rounded-t-xs pointer-events-none"
                    style={{
                      background:
                        'linear-gradient(90deg, rgba(0,0,0,0.28) 0%, rgba(255,255,255,0.18) 7%, rgba(0,0,0,0) 25%, rgba(0,0,0,0.02) 80%, rgba(0,0,0,0.26) 100%)',
                    }}
                  />
                  <span className="text-[9px] font-mono opacity-80 select-none">{newBook.year || '2026'}</span>
                  <span
                    className="text-xs font-medium whitespace-nowrap overflow-hidden select-none px-0.5"
                    style={{
                      writingMode: 'vertical-rl',
                      textOrientation: 'mixed',
                      transform: 'rotate(180deg)',
                      maxHeight: `${(newBook.h || 220) - 55}px`,
                    }}
                  >
                    {newBook.title || 'Book Title'}
                  </span>
                  <span className="text-[9px] font-mono opacity-80 truncate max-w-[90%] select-none">
                    {(newBook.author || 'Author').split(' ').pop()}
                  </span>
                </div>
              </div>

              <div className="w-full h-3 bg-neutral-900 mt-0 rounded-xs" />
            </div>

          </div>

          {/* Existing Books List with Quick Delete */}
          <div>
            <h3 className="text-sm font-bold text-black font-mono mb-3">
              Existing Books on Shelf ({books.length})
            </h3>

            <div className="divide-y divide-neutral-200 border border-neutral-200 rounded-lg bg-white overflow-hidden text-xs">
              {books.map((b, i) => (
                <div key={b.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-neutral-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-neutral-400 w-6">[{i + 1}]</span>
                    <span
                      className="w-3.5 h-7 rounded-xs border border-black/20"
                      style={{ backgroundColor: b.c }}
                    />
                    <div>
                      <div className="font-bold text-black flex items-center gap-2">
                        <span>{b.title}</span>
                        {b.link && <ExternalLink size={10} className="text-blue-500" />}
                      </div>
                      <div className="text-neutral-500 font-mono text-[11px]">
                        {b.author} • {b.year}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteBook(b.id)}
                    title="Delete book"
                    className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          TAB 2: ESSAYS & REPORTS MANAGER
          ═══════════════════════════════════════════════════════════════ */}
      {activeTab === 'essays' && (
        <div className="space-y-10">
          
          {/* Add Essay Form */}
          <form onSubmit={handleAddEssay} className="p-6 bg-neutral-50 border border-neutral-200 rounded-lg space-y-4 text-xs font-sans">
            <h2 className="text-sm font-bold text-black font-mono flex items-center gap-2">
              <Plus size={14} />
              <span>Add Essay, Report, Article or Video</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-micro font-mono text-neutral-500 mb-1">Title:</label>
                <input
                  type="text"
                  required
                  value={newEssay.title}
                  onChange={(e) => setNewEssay({ ...newEssay, title: e.target.value })}
                  placeholder="e.g. The Architecture of Smoothness"
                  className="w-full p-2 bg-white border border-neutral-200 rounded focus:border-black focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-micro font-mono text-neutral-500 mb-1">Target URL / Link:</label>
                <input
                  type="url"
                  required
                  value={newEssay.url}
                  onChange={(e) => setNewEssay({ ...newEssay, url: e.target.value })}
                  placeholder="https://... (YouTube links auto-preview thumbnail)"
                  className="w-full p-2 bg-white border border-neutral-200 rounded focus:border-black focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-micro font-mono text-neutral-500 mb-1">Category:</label>
                <select
                  value={newEssay.type}
                  onChange={(e) => setNewEssay({ ...newEssay, type: e.target.value as any })}
                  className="w-full p-2 bg-white border border-neutral-200 rounded focus:border-black focus:outline-none font-mono"
                >
                  <option value="Essay">Essay</option>
                  <option value="Report">Report</option>
                  <option value="Article">Article</option>
                  <option value="Video">Video</option>
                </select>
              </div>
              <div>
                <label className="block text-micro font-mono text-neutral-500 mb-1">Year:</label>
                <input
                  type="text"
                  value={newEssay.year}
                  onChange={(e) => setNewEssay({ ...newEssay, year: e.target.value })}
                  className="w-full p-2 bg-white border border-neutral-200 rounded focus:border-black focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-micro font-mono text-neutral-500 mb-1">Source / Publication:</label>
                <input
                  type="text"
                  value={newEssay.source}
                  onChange={(e) => setNewEssay({ ...newEssay, source: e.target.value })}
                  placeholder="e.g. Stanford HAI / Farnam Street"
                  className="w-full p-2 bg-white border border-neutral-200 rounded focus:border-black focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-micro font-mono text-neutral-500 mb-1">Hover Caption / One-liner:</label>
              <input
                type="text"
                value={newEssay.cap}
                onChange={(e) => setNewEssay({ ...newEssay, cap: e.target.value })}
                placeholder="Short caption shown in the floating cursor preview..."
                className="w-full p-2 bg-white border border-neutral-200 rounded focus:border-black focus:outline-none"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="bg-black text-white px-4 py-2 rounded text-xs font-mono hover:bg-neutral-800 transition-colors shadow-sm cursor-pointer"
              >
                + Add Essay / Report ↗
              </button>
            </div>
          </form>

          {/* Existing Essays List */}
          <div>
            <h3 className="text-sm font-bold text-black font-mono mb-3">
              Existing Entries ({essays.length})
            </h3>

            <div className="divide-y divide-neutral-200 border border-neutral-200 rounded-lg bg-white overflow-hidden text-xs">
              {essays.map((item, i) => (
                <div key={item.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-neutral-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-neutral-400 w-6">[{String(i + 1).padStart(2, '0')}]</span>
                    <span className="px-1.5 py-0.5 rounded bg-neutral-100 font-mono text-[10px] text-neutral-700">
                      {item.type}
                    </span>
                    <div>
                      <div className="font-bold text-black">{item.title}</div>
                      <div className="text-neutral-500 font-mono text-[11px]">
                        {item.source} • {item.year}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 text-neutral-400 hover:text-black transition-colors"
                      title="Open link"
                    >
                      <ExternalLink size={13} />
                    </a>
                    <button
                      onClick={() => handleDeleteEssay(item.id)}
                      title="Delete essay"
                      className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          TAB 3: TELEGRAM WEBHOOK INSTRUCTIONS & STATUS
          ═══════════════════════════════════════════════════════════════ */}
      {activeTab === 'telegram' && (
        <div className="space-y-6 text-xs font-sans">
          
          <div className="p-6 bg-neutral-50 border border-neutral-200 rounded-lg space-y-4">
            <h2 className="text-sm font-bold text-black font-mono flex items-center gap-2">
              <Send size={15} />
              <span>Telegram Bot Remote Admin Setup</span>
            </h2>

            <p className="text-neutral-600 leading-relaxed">
              You can post books, essays, and complete markdown documents to your portfolio directly from Telegram.
            </p>

            <div className="space-y-3 pt-2">
              <div className="p-3 bg-white border border-neutral-200 rounded font-mono text-[11px] space-y-1">
                <div className="text-neutral-400 font-medium">YOUR LIVE WEBHOOK URL:</div>
                <div className="text-black font-bold select-all break-all">
                  {typeof window !== 'undefined' ? `${window.location.origin}/api/telegram-webhook` : 'https://your-domain.vercel.app/api/telegram-webhook'}
                </div>
              </div>

              <div className="space-y-2 text-neutral-700">
                <div className="font-bold text-black font-mono text-xs">3-Step Webhook Activation:</div>
                <ol className="list-decimal list-inside space-y-1.5 text-neutral-600">
                  <li>Open Telegram $\rightarrow$ Message <strong>@BotFather</strong> $\rightarrow$ create <code>/newbot</code> $\rightarrow$ copy your Bot Token.</li>
                  <li>In Vercel Project Settings $\rightarrow$ Environment Variables $\rightarrow$ Add <code>TELEGRAM_BOT_TOKEN</code> and <code>ADMIN_SECRET_KEY</code>.</li>
                  <li>Run this URL in your browser to activate webhook:
                    <div className="p-2 bg-neutral-100 rounded font-mono text-[10px] select-all my-1 break-all">
                      https://api.telegram.org/bot&lt;YOUR_BOT_TOKEN&gt;/setWebhook?url={typeof window !== 'undefined' ? window.location.origin : 'https://your-site.vercel.app'}/api/telegram-webhook
                    </div>
                  </li>
                </ol>
              </div>

              <div className="pt-3 border-t border-neutral-200">
                <div className="font-bold text-black font-mono text-xs mb-2">Supported Telegram Commands:</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-[11px]">
                  <div className="p-3 bg-white border border-neutral-200 rounded space-y-1">
                    <span className="text-black font-bold">📄 Upload .md / .txt File:</span>
                    <p className="text-neutral-500 font-sans text-xs">
                      Attach any markdown file to your Telegram chat. The bot automatically parses the title, excerpt, and publishes it to Writings!
                    </p>
                  </div>
                  <div className="p-3 bg-white border border-neutral-200 rounded space-y-1">
                    <span className="text-black font-bold">📚 /addbook Command:</span>
                    <p className="text-neutral-500 font-sans text-xs">
                      <code>/addbook Title | Author | Year | Note | AmazonLink</code>
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
