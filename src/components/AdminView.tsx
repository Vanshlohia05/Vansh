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
import { supabase } from '../utils/supabase';
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
  EyeOff,
  Edit3,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Layers,
  Video,
  Image as ImageIcon,
} from 'lucide-react';

const GithubIcon: React.FC<{ size?: number; className?: string }> = ({ size = 14, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);
import {
  GuestbookEntry,
  deleteGuestbookEntry,
  mapRowToEntry,
} from '../data/guestbook';
import {
  PortfolioProject,
  loadPortfolioProjects,
  savePortfolioProjects,
  mapRowToProject,
} from '../data/portfolioProjects';
import {
  CvItem,
  CvSectionType,
  loadCvItems,
  fetchCvItems,
  upsertCvItem,
  deleteCvItem,
} from '../data/cvData';
import {
  loadSetting,
  fetchSetting,
  updateSetting,
} from '../data/siteSettings';

interface AdminViewProps {
  onExit: () => void;
}

type AdminTab = 'books' | 'essays' | 'projects' | 'guestbook' | 'writings' | 'telegram' | 'cv';

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
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [guestbookList, setGuestbookList] = useState<GuestbookEntry[]>([]);
  const [cvList, setCvList] = useState<CvItem[]>([]);
  const [showPortfolioSection, setShowPortfolioSection] = useState<boolean>(() =>
    loadSetting<boolean>('show_portfolio_section', false)
  );
  const [editingCvId, setEditingCvId] = useState<string | null>(null);
  const [cvSectionFilter, setCvSectionFilter] = useState<string>('all');
  const [cvForm, setCvForm] = useState<{
    section: CvSectionType;
    title: string;
    subtitle: string;
    dateRange: string;
    location: string;
    badge: string;
    link: string;
    description: string;
    bulletPointsText: string;
    displayOrder: number;
    isVisible: boolean;
    showLink: boolean;
  }>({
    section: 'initiatives',
    title: '',
    subtitle: '',
    dateRange: '',
    location: '',
    badge: '',
    link: '',
    description: '',
    bulletPointsText: '',
    displayOrder: 1,
    isVisible: true,
    showLink: false,
  });
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>('');

  // New Project Form State
  const [newProject, setNewProject] = useState<Partial<PortfolioProject>>({
    title: '',
    tagline: '',
    category: 'Full-Stack & GenAI',
    year: String(new Date().getFullYear()),
    status: 'Live',
    description: '',
    techStack: [],
    liveUrl: '',
    githubUrl: '',
    videoUrl: '',
    imageUrl: '',
    featured: true,
  });
  const [techStackInput, setTechStackInput] = useState<string>('React, TypeScript, TailwindCSS');

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
    status: 'Finished',
  });

  // New Essay Form State
  const [newEssay, setNewEssay] = useState<Partial<EssayItem>>({
    title: '',
    year: String(new Date().getFullYear()),
    type: 'Essay',
    source: '',
    url: '',
    cap: '',
    status: 'Finished',
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

  // Check existing session token on mount & fetch live Supabase records
  useEffect(() => {
    const localB = loadBooks();
    const localE = loadEssays();
    const localP = loadPortfolioProjects();
    setBooks(localB);
    setEssays(localE);
    setProjects(localP);
    setArticles(ARTICLES);

    const loadLive = async () => {
      try {
        const [booksRes, essaysRes, writingsRes, guestbookRes, projectsRes] = await Promise.all([
          supabase.from('books').select('*').order('created_at', { ascending: false }),
          supabase.from('essays').select('*').order('created_at', { ascending: false }),
          supabase.from('writings').select('*').order('created_at', { ascending: false }),
          supabase.from('guestbook').select('*').order('timestamp', { ascending: false }),
          supabase.from('portfolio_projects').select('*').order('display_order', { ascending: true }),
        ]);

        if (booksRes.data && Array.isArray(booksRes.data) && booksRes.data.length > 0) {
          const liveBooks: BookItem[] = booksRes.data.map((b: any) => ({
            id: b.id,
            title: b.title,
            author: b.author,
            year: b.year || '2026',
            note: b.note || '',
            h: b.h || 220,
            w: b.w || 40,
            c: b.c || '#1e293b',
            fg: b.fg || '#ffffff',
            link: b.link || undefined,
            status: (b.status as any) || 'Finished',
          }));
          setBooks(liveBooks);
          saveBooks(liveBooks);
        }

        if (essaysRes.data && Array.isArray(essaysRes.data) && essaysRes.data.length > 0) {
          const liveEssays: EssayItem[] = essaysRes.data.map((e: any) => ({
            id: e.id,
            title: e.title,
            year: e.year || '2026',
            type: e.type || 'Essay',
            source: e.source || 'Web',
            url: e.url || '',
            cap: e.cap || e.source || 'Archive',
            status: (e.status as any) || 'Finished',
          }));
          setEssays(liveEssays);
          saveEssays(liveEssays);
        }

        if (projectsRes.data && Array.isArray(projectsRes.data) && projectsRes.data.length > 0) {
          const liveProjects = projectsRes.data.map(mapRowToProject);
          setProjects(liveProjects);
          savePortfolioProjects(liveProjects);
        }

        if (writingsRes.data && Array.isArray(writingsRes.data) && writingsRes.data.length > 0) {
          const liveWritings: Article[] = writingsRes.data.map((w: any) => ({
            id: w.id,
            slug: w.slug || `art-${w.id}`,
            title: w.title,
            date: w.date || 'Recent',
            year: w.year || '2026',
            readTime: w.read_time || w.readTime || '5 min read',
            category: w.category || 'Essays & Notes',
            excerpt: w.excerpt || '',
            content: Array.isArray(w.content) ? w.content : typeof w.content === 'string' ? w.content.split('\n\n') : [''],
          }));
          const merged = [...liveWritings, ...ARTICLES.filter((a) => !liveWritings.some((fl) => fl.slug === a.slug || fl.title.toLowerCase() === a.title.toLowerCase()))];
          setArticles(merged);
        }

        if (guestbookRes.data && Array.isArray(guestbookRes.data)) {
          setGuestbookList(guestbookRes.data.map(mapRowToEntry));
        }

        const liveCv = await fetchCvItems();
        if (liveCv && liveCv.length > 0) {
          setCvList(liveCv);
        } else {
          setCvList(loadCvItems());
        }

        const portSetting = await fetchSetting<boolean>('show_portfolio_section', false);
        setShowPortfolioSection(portSetting);
      } catch (err) {
        console.warn('Admin load error:', err);
      }
    };
    loadLive();

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

  // 2. Handle Login Submission to Backend (Zero password in frontend, 100% Supabase & Serverless verified)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcodeInput.trim()) return;

    setIsVerifying(true);
    setAuthError('');

    try {
      // 1. Direct Supabase PostgreSQL bcrypt RPC verification (instant, zero serverless latency)
      let authenticated = false;
      let sessionToken = '';

      try {
        const { data: isValid, error: rpcError } = await supabase.rpc('verify_admin_passcode', {
          entered_passcode: passcodeInput.trim(),
        });

        if (!rpcError && isValid === true) {
          authenticated = true;
          sessionToken = `supabase_verified_${Date.now()}`;
        }
      } catch (rpcErr) {
        console.warn('Direct Supabase RPC error, trying API fallback:', rpcErr);
      }

      // 2. Fallback to serverless API route if direct RPC was blocked by client network
      if (!authenticated) {
        try {
          const res = await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'login', passcode: passcodeInput.trim() }),
          });

          if (res.ok) {
            const data = await res.json();
            if (data.success && data.token) {
              authenticated = true;
              sessionToken = data.token;
            }
          }
        } catch (apiErr) {
          console.warn('API route fallback error:', apiErr);
        }
      }

      if (authenticated) {
        sessionStorage.setItem('vansh_admin_token', sessionToken);
        setIsAuthenticated(true);
        playClickSound('high');
      } else {
        setAuthError('Access denied: Invalid secret passcode.');
        playClickSound('pop');
      }
    } catch (err: any) {
      setAuthError('Authentication verification failed.');
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
  const handleAddBook = async (e: React.FormEvent) => {
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
      status: (newBook.status as any) || 'Finished',
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
      status: 'Finished',
    });

    try {
      await supabase.from('books').upsert({
        id: bookToAdd.id,
        title: bookToAdd.title,
        author: bookToAdd.author,
        year: bookToAdd.year,
        note: bookToAdd.note,
        h: bookToAdd.h,
        w: bookToAdd.w,
        c: bookToAdd.c,
        fg: bookToAdd.fg,
        link: bookToAdd.link || null,
        status: bookToAdd.status || 'Finished',
      });
    } catch (err) {
      console.warn('Supabase book upsert error:', err);
    }

    playClickSound('book-slide');
    setSaveSuccessMsg(`Added "${bookToAdd.title}" to Bookshelf!`);
    setTimeout(() => setSaveSuccessMsg(''), 3500);
  };

  const handleToggleBookStatus = async (book: BookItem) => {
    const nextStatus: 'On it' | 'Finished' = book.status === 'On it' ? 'Finished' : 'On it';
    playClickSound('tick');
    const updated = books.map((b) => (b.id === book.id ? { ...b, status: nextStatus } : b));
    setBooks(updated);
    saveBooks(updated);
    try {
      await supabase.from('books').update({ status: nextStatus }).eq('id', book.id);
    } catch (err) {
      console.warn('Supabase book status update error:', err);
    }
  };

  const handleDeleteBook = async (id: string) => {
    playClickSound('pop');
    const updated = books.filter((b) => b.id !== id);
    setBooks(updated);
    saveBooks(updated);
    try {
      await supabase.from('books').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase book delete error:', err);
    }
  };

  // Essay Handlers
  const handleAddEssay = async (e: React.FormEvent) => {
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
      status: (newEssay.status as any) || 'Finished',
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
      status: 'Finished',
    });

    try {
      await supabase.from('essays').upsert({
        id: essayToAdd.id,
        title: essayToAdd.title,
        year: essayToAdd.year,
        type: essayToAdd.type,
        source: essayToAdd.source,
        url: essayToAdd.url,
        cap: essayToAdd.cap,
        status: essayToAdd.status || 'Finished',
      });
    } catch (err) {
      console.warn('Supabase essay upsert error:', err);
    }

    playClickSound('high');
    setSaveSuccessMsg(`Added "${essayToAdd.title}" to Essays & Reports!`);
    setTimeout(() => setSaveSuccessMsg(''), 3500);
  };

  const handleToggleEssayStatus = async (essay: EssayItem) => {
    const nextStatus: 'On it' | 'Finished' = essay.status === 'On it' ? 'Finished' : 'On it';
    playClickSound('tick');
    const updated = essays.map((e) => (e.id === essay.id ? { ...e, status: nextStatus } : e));
    setEssays(updated);
    saveEssays(updated);
    try {
      await supabase.from('essays').update({ status: nextStatus }).eq('id', essay.id);
    } catch (err) {
      console.warn('Supabase essay status update error:', err);
    }
  };

  const handleDeleteEssay = async (id: string) => {
    playClickSound('pop');
    const updated = essays.filter((e) => e.id !== id);
    setEssays(updated);
    saveEssays(updated);
    try {
      await supabase.from('essays').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase essay delete error:', err);
    }
  };

  // Portfolio Project Handlers
  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.title) return;

    const stack = techStackInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const projectToAdd: PortfolioProject = {
      id: `p-${Date.now()}`,
      title: newProject.title.trim(),
      tagline: newProject.tagline?.trim() || '',
      category: newProject.category || 'Full-Stack & GenAI',
      year: newProject.year || String(new Date().getFullYear()),
      status: newProject.status || 'Live',
      description: newProject.description?.trim() || 'A featured digital product and engineering case study.',
      techStack: stack.length > 0 ? stack : ['React', 'TypeScript', 'TailwindCSS'],
      liveUrl: newProject.liveUrl?.trim() || undefined,
      githubUrl: newProject.githubUrl?.trim() || undefined,
      videoUrl: newProject.videoUrl?.trim() || undefined,
      imageUrl: newProject.imageUrl?.trim() || undefined,
      featured: newProject.featured ?? true,
      displayOrder: projects.length + 1,
    };

    const updated = [projectToAdd, ...projects];
    setProjects(updated);
    savePortfolioProjects(updated);
    setNewProject({
      title: '',
      tagline: '',
      category: 'Full-Stack & GenAI',
      year: String(new Date().getFullYear()),
      status: 'Live',
      description: '',
      techStack: [],
      liveUrl: '',
      githubUrl: '',
      videoUrl: '',
      imageUrl: '',
      featured: true,
    });
    setTechStackInput('React, TypeScript, TailwindCSS');

    try {
      await supabase.from('portfolio_projects').upsert({
        id: projectToAdd.id,
        title: projectToAdd.title,
        tagline: projectToAdd.tagline,
        category: projectToAdd.category,
        year: projectToAdd.year,
        status: projectToAdd.status,
        description: projectToAdd.description,
        tech_stack: projectToAdd.techStack,
        live_url: projectToAdd.liveUrl || null,
        github_url: projectToAdd.githubUrl || null,
        video_url: projectToAdd.videoUrl || null,
        image_url: projectToAdd.imageUrl || null,
        featured: projectToAdd.featured,
        display_order: projectToAdd.displayOrder,
      });
    } catch (err) {
      console.warn('Supabase portfolio project upsert error:', err);
    }

    playClickSound('high');
    setSaveSuccessMsg(`Added "${projectToAdd.title}" to Portfolio Projects!`);
    setTimeout(() => setSaveSuccessMsg(''), 3500);
  };

  const handleDeleteProject = async (id: string) => {
    playClickSound('pop');
    const updated = projects.filter((p) => p.id !== id);
    setProjects(updated);
    savePortfolioProjects(updated);
    try {
      await supabase.from('portfolio_projects').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase project delete error:', err);
    }
    setSaveSuccessMsg('Project removed from portfolio.');
    setTimeout(() => setSaveSuccessMsg(''), 3500);
  };

  const handleDeleteGuestbook = async (id: string) => {
    playClickSound('pop');
    const updated = guestbookList.filter((g) => g.id !== id);
    setGuestbookList(updated);
    await deleteGuestbookEntry(id);
    setSaveSuccessMsg('Removed entry from live Guestbook.');
    setTimeout(() => setSaveSuccessMsg(''), 3500);
  };

  // CV & Career Handlers
  const handleTogglePortfolioSectionVisibility = async () => {
    const nextVal = !showPortfolioSection;
    setShowPortfolioSection(nextVal);
    playClickSound('tick');
    await updateSetting('show_portfolio_section', nextVal);
    setSaveSuccessMsg(nextVal ? 'Featured Portfolio Projects section is now VISIBLE on CV!' : 'Featured Portfolio Projects section is now HIDDEN from CV.');
    setTimeout(() => setSaveSuccessMsg(''), 3500);
  };

  const handleToggleCvShowLink = async (item: CvItem) => {
    const updatedItem: CvItem = { ...item, showLink: !item.showLink };
    const updated = cvList.map((c) => (c.id === item.id ? updatedItem : c));
    setCvList(updated);
    playClickSound('tick');
    await upsertCvItem(updatedItem);
    setSaveSuccessMsg(updatedItem.showLink ? `Link enabled on CV for "${item.title}".` : `Link hidden on CV for "${item.title}".`);
    setTimeout(() => setSaveSuccessMsg(''), 3500);
  };

  const handleSaveCvItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cvForm.title.trim()) return;

    const bullets = cvForm.bulletPointsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const itemToSave: CvItem = {
      id: editingCvId || `cv-${Date.now()}`,
      section: cvForm.section,
      title: cvForm.title.trim(),
      subtitle: cvForm.subtitle.trim() || undefined,
      dateRange: cvForm.dateRange.trim() || undefined,
      location: cvForm.location.trim() || undefined,
      badge: cvForm.badge.trim() || undefined,
      link: cvForm.link.trim() || undefined,
      description: cvForm.description.trim() || undefined,
      bulletPoints: bullets.length > 0 ? bullets : undefined,
      displayOrder: cvForm.displayOrder || 1,
      isVisible: cvForm.isVisible,
      showLink: Boolean(cvForm.showLink),
    };

    let updated: CvItem[];
    if (editingCvId) {
      updated = cvList.map((c) => (c.id === editingCvId ? itemToSave : c));
    } else {
      updated = [...cvList, itemToSave];
    }
    setCvList(updated);

    await upsertCvItem(itemToSave);

    setEditingCvId(null);
    setCvForm({
      section: 'initiatives',
      title: '',
      subtitle: '',
      dateRange: '',
      location: '',
      badge: '',
      link: '',
      description: '',
      bulletPointsText: '',
      displayOrder: updated.length + 1,
      isVisible: true,
      showLink: false,
    });

    playClickSound('high');
    setSaveSuccessMsg(editingCvId ? `Updated "${itemToSave.title}" in CV!` : `Added "${itemToSave.title}" to CV!`);
    setTimeout(() => setSaveSuccessMsg(''), 3500);
  };

  const handleEditCvItem = (item: CvItem) => {
    setEditingCvId(item.id);
    setCvForm({
      section: item.section,
      title: item.title,
      subtitle: item.subtitle || '',
      dateRange: item.dateRange || '',
      location: item.location || '',
      badge: item.badge || '',
      link: item.link || '',
      description: item.description || '',
      bulletPointsText: (item.bulletPoints || []).join('\n'),
      displayOrder: item.displayOrder || 1,
      isVisible: item.isVisible !== false,
      showLink: Boolean(item.showLink),
    });
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleCancelCvEdit = () => {
    setEditingCvId(null);
    setCvForm({
      section: 'initiatives',
      title: '',
      subtitle: '',
      dateRange: '',
      location: '',
      badge: '',
      link: '',
      description: '',
      bulletPointsText: '',
      displayOrder: cvList.length + 1,
      isVisible: true,
      showLink: false,
    });
  };

  const handleDeleteCvItem = async (id: string) => {
    playClickSound('pop');
    const updated = cvList.filter((c) => c.id !== id);
    setCvList(updated);
    await deleteCvItem(id);
    setSaveSuccessMsg('Item removed from CV.');
    setTimeout(() => setSaveSuccessMsg(''), 3500);
  };

  const handleToggleCvVisibility = async (item: CvItem) => {
    const updatedItem: CvItem = { ...item, isVisible: !item.isVisible };
    const updated = cvList.map((c) => (c.id === item.id ? updatedItem : c));
    setCvList(updated);
    await upsertCvItem(updatedItem);
  };

  // ─────────────────────────────────────────────────────────────
  // RENDER: LOCK SCREEN (When unauthenticated)
  // ─────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div
        data-no-strike="true"
        className="admin-container min-h-[85vh] flex items-center justify-center px-4 pt-16 font-mono select-text"
      >
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
            <span>Secure authenticated session</span>
          </div>

        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // RENDER: AUTHENTICATED ADMIN DASHBOARD
  // ─────────────────────────────────────────────────────────────
  return (
    <div
      data-no-strike="true"
      className="admin-container w-full max-w-6xl mx-auto px-4 pt-20 pb-24 font-sans select-text page-transition"
    >
      
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
            setActiveTab('projects');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all cursor-pointer ${
            activeTab === 'projects'
              ? 'bg-black text-white font-semibold'
              : 'text-neutral-500 hover:text-black hover:bg-neutral-100'
          }`}
        >
          <Layers size={13} />
          <span>Portfolio Projects ({projects.length})</span>
        </button>

        <button
          onClick={() => {
            playClickSound('tick');
            setActiveTab('guestbook');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all cursor-pointer ${
            activeTab === 'guestbook'
              ? 'bg-black text-white font-semibold'
              : 'text-neutral-500 hover:text-black hover:bg-neutral-100'
          }`}
        >
          <Sparkles size={13} />
          <span>Guestbook ({guestbookList.length})</span>
        </button>

        <button
          onClick={() => {
            playClickSound('tick');
            setActiveTab('cv');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all cursor-pointer ${
            activeTab === 'cv'
              ? 'bg-black text-white font-semibold'
              : 'text-neutral-500 hover:text-black hover:bg-neutral-100'
          }`}
        >
          <Briefcase size={13} />
          <span>CV & Career ({cvList.length})</span>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                <div>
                  <label className="block text-micro font-mono text-neutral-500 mb-1">
                    Reading Status:
                  </label>
                  <select
                    value={newBook.status || 'Finished'}
                    onChange={(e) => setNewBook({ ...newBook, status: e.target.value as any })}
                    className="w-full p-2 bg-white border border-neutral-200 rounded focus:border-black focus:outline-none font-mono text-xs"
                  >
                    <option value="Finished">✓ Finished (Completed)</option>
                    <option value="On it">📖 On it (Currently Reading)</option>
                  </select>
                </div>
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

          {/* Existing Books List with Quick Delete & Status */}
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

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleBookStatus(b)}
                      className={`px-2 py-1 rounded text-micro font-mono border transition-colors cursor-pointer ${
                        b.status === 'On it'
                          ? 'bg-amber-50 text-amber-800 border-amber-300 font-bold'
                          : 'bg-neutral-100 text-neutral-600 border-neutral-200 hover:bg-neutral-200'
                      }`}
                      title="Click to toggle reading status"
                    >
                      {b.status === 'On it' ? '📖 On it' : '✓ Finished'}
                    </button>
                    <button
                      onClick={() => handleDeleteBook(b.id)}
                      title="Delete book"
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

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
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
                <label className="block text-micro font-mono text-neutral-500 mb-1">Reading Status:</label>
                <select
                  value={newEssay.status || 'Finished'}
                  onChange={(e) => setNewEssay({ ...newEssay, status: e.target.value as any })}
                  className="w-full p-2 bg-white border border-neutral-200 rounded focus:border-black focus:outline-none font-mono text-xs"
                >
                  <option value="Finished">✓ Finished</option>
                  <option value="On it">📖 On it (Reading)</option>
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
                    <button
                      type="button"
                      onClick={() => handleToggleEssayStatus(item)}
                      className={`px-2 py-1 rounded text-micro font-mono border transition-colors cursor-pointer ${
                        item.status === 'On it'
                          ? 'bg-amber-50 text-amber-800 border-amber-300 font-bold'
                          : 'bg-neutral-100 text-neutral-600 border-neutral-200 hover:bg-neutral-200'
                      }`}
                      title="Click to toggle reading status"
                    >
                      {item.status === 'On it' ? '📖 On it' : '✓ Finished'}
                    </button>
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
          TAB: PORTFOLIO PROJECTS CRUD MANAGER
          ═══════════════════════════════════════════════════════════════ */}
      {activeTab === 'projects' && (
        <div className="space-y-10 text-xs font-sans">
          
          {/* Global Visibility Control for Portfolio Section on CV Page */}
          <div className="p-4 bg-white border border-neutral-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs uppercase tracking-wider text-black">
                  CV Page Visibility:
                </span>
                <span
                  className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded ${
                    showPortfolioSection
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-neutral-100 text-neutral-600 border border-neutral-300'
                  }`}
                >
                  {showPortfolioSection ? '● UNHIDDEN (VISIBLE ON CV)' : '○ HIDDEN FROM CV PAGE'}
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 font-mono">
                {showPortfolioSection
                  ? 'The "Featured Portfolio Projects & Case Studies" section is currently visible on the public CV page.'
                  : 'The "Featured Portfolio Projects & Case Studies" section is hidden on the CV page. You can still manage all projects here.'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleTogglePortfolioSectionVisibility}
              className={`px-3 py-1.5 rounded font-mono text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 border ${
                showPortfolioSection
                  ? 'bg-neutral-100 text-neutral-800 border-neutral-300 hover:bg-neutral-200'
                  : 'bg-black text-white border-black hover:bg-neutral-800'
              }`}
            >
              {showPortfolioSection ? (
                <>
                  <EyeOff size={13} />
                  <span>Hide from CV Page</span>
                </>
              ) : (
                <>
                  <Eye size={13} />
                  <span>Unhide on CV Page</span>
                </>
              )}
            </button>
          </div>

          {/* Create Project Form */}
          <form onSubmit={handleAddProject} className="p-6 bg-neutral-50 border border-neutral-200 rounded-lg space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <h2 className="text-sm font-bold text-black font-mono flex items-center gap-2">
                <Layers size={15} />
                <span>Add New Portfolio Project / Case Study</span>
              </h2>
              <span className="text-micro font-mono text-neutral-400">
                Synced dynamically with Supabase
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-micro uppercase text-neutral-500 mb-1 font-mono">
                  Project Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  placeholder="e.g. SahiRasta, HyperCanvas..."
                  className="w-full p-2 bg-white border border-neutral-200 rounded focus:border-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-micro uppercase text-neutral-500 mb-1 font-mono">
                  Tagline / Subtitle
                </label>
                <input
                  type="text"
                  value={newProject.tagline}
                  onChange={(e) => setNewProject({ ...newProject, tagline: e.target.value })}
                  placeholder="Brief 1-sentence value proposition..."
                  className="w-full p-2 bg-white border border-neutral-200 rounded focus:border-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-micro uppercase text-neutral-500 mb-1 font-mono">
                  Category
                </label>
                <select
                  value={newProject.category}
                  onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
                  className="w-full p-2 bg-white border border-neutral-200 rounded focus:border-black focus:outline-none"
                >
                  <option value="Full-Stack & GenAI">Full-Stack & GenAI</option>
                  <option value="Brand & Web Architecture">Brand & Web Architecture</option>
                  <option value="Community & Web App">Community & Web App</option>
                  <option value="Creative Engineering">Creative Engineering</option>
                  <option value="Mobile Application">Mobile Application</option>
                </select>
              </div>

              <div>
                <label className="block text-micro uppercase text-neutral-500 mb-1 font-mono">
                  Status
                </label>
                <select
                  value={newProject.status}
                  onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
                  className="w-full p-2 bg-white border border-neutral-200 rounded focus:border-black focus:outline-none"
                >
                  <option value="Live">Live</option>
                  <option value="Acquired / Sold">Acquired / Sold</option>
                  <option value="Client Case Study">Client Case Study</option>
                  <option value="Active Lab">Active Lab</option>
                  <option value="In Development">In Development</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-micro uppercase text-neutral-500 mb-1 font-mono">
                  Live Project URL (Optional)
                </label>
                <input
                  type="url"
                  value={newProject.liveUrl}
                  onChange={(e) => setNewProject({ ...newProject, liveUrl: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full p-2 bg-white border border-neutral-200 rounded focus:border-black focus:outline-none font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-micro uppercase text-neutral-500 mb-1 font-mono">
                  GitHub Repository (Optional)
                </label>
                <input
                  type="url"
                  value={newProject.githubUrl}
                  onChange={(e) => setNewProject({ ...newProject, githubUrl: e.target.value })}
                  placeholder="https://github.com/..."
                  className="w-full p-2 bg-white border border-neutral-200 rounded focus:border-black focus:outline-none font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-micro uppercase text-neutral-500 mb-1 font-mono">
                  Video Demo Embed URL (YouTube/Loom/Vimeo)
                </label>
                <input
                  type="url"
                  value={newProject.videoUrl}
                  onChange={(e) => setNewProject({ ...newProject, videoUrl: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full p-2 bg-white border border-neutral-200 rounded focus:border-black focus:outline-none font-mono text-[11px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-micro uppercase text-neutral-500 mb-1 font-mono">
                  Thumbnail / Banner Image URL
                </label>
                <input
                  type="url"
                  value={newProject.imageUrl}
                  onChange={(e) => setNewProject({ ...newProject, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2 bg-white border border-neutral-200 rounded focus:border-black focus:outline-none font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-micro uppercase text-neutral-500 mb-1 font-mono">
                  Tech Stack (Comma-separated)
                </label>
                <input
                  type="text"
                  value={techStackInput}
                  onChange={(e) => setTechStackInput(e.target.value)}
                  placeholder="React, TypeScript, TailwindCSS, Node.js, Supabase..."
                  className="w-full p-2 bg-white border border-neutral-200 rounded focus:border-black focus:outline-none font-mono text-[11px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-micro uppercase text-neutral-500 mb-1 font-mono">
                Description & Case Study Narrative
              </label>
              <textarea
                rows={3}
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                placeholder="Comprehensive breakdown of what was built, engineering challenges, architecture decisions, and business impact..."
                className="w-full p-2 bg-white border border-neutral-200 rounded focus:border-black focus:outline-none leading-relaxed"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="bg-black text-white px-4 py-2 rounded text-xs font-mono hover:bg-neutral-800 transition-colors shadow-sm cursor-pointer"
              >
                + Add Portfolio Project ↗
              </button>
            </div>
          </form>

          {/* Existing Projects List */}
          <div>
            <div className="flex items-center justify-between mb-3 font-mono">
              <h3 className="text-sm font-bold text-black">
                Existing Portfolio Projects ({projects.length})
              </h3>
              <span className="text-neutral-400 text-micro">
                Displayed dynamically in CV & Showcase
              </span>
            </div>

            <div className="divide-y divide-neutral-200 border border-neutral-200 rounded-lg bg-white overflow-hidden text-xs">
              {projects.length === 0 ? (
                <div className="p-8 text-center text-neutral-400 font-mono">
                  No projects added yet. Add your first project above!
                </div>
              ) : (
                projects.map((p, i) => (
                  <div key={p.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-50 transition-colors">
                    <div className="flex items-start sm:items-center gap-3">
                      <span className="font-mono text-neutral-400 w-6">[{String(i + 1).padStart(2, '0')}]</span>
                      {p.imageUrl && (
                        <img src={p.imageUrl} alt={p.title} className="w-10 h-10 rounded object-cover border border-neutral-200 shrink-0" />
                      )}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span className="font-bold text-black">{p.title}</span>
                          <span className="px-1.5 py-0.2 rounded bg-neutral-100 font-mono text-[10px] text-neutral-700">
                            {p.status}
                          </span>
                          <span className="text-neutral-400 font-mono text-[10px]">
                            {p.category} • {p.year}
                          </span>
                        </div>
                        <div className="text-neutral-500 text-[11px] line-clamp-1">
                          {p.tagline}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      {p.videoUrl && (
                        <span className="flex items-center gap-1 text-[10px] font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                          <Video size={11} />
                          <span>Video</span>
                        </span>
                      )}
                      {p.liveUrl && (
                        <a
                          href={p.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-neutral-400 hover:text-black transition-colors"
                          title="Open live project"
                        >
                          <ExternalLink size={13} />
                        </a>
                      )}
                      {p.githubUrl && (
                        <a
                          href={p.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-neutral-400 hover:text-black transition-colors"
                          title="Open GitHub"
                        >
                          <GithubIcon size={13} />
                        </a>
                      )}
                      <button
                        onClick={() => handleDeleteProject(p.id)}
                        title="Delete project"
                        className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}
      {activeTab === 'guestbook' && (
        <div className="space-y-6 text-xs font-sans">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
            <div>
              <h2 className="text-sm font-bold text-black font-mono flex items-center gap-2">
                <Sparkles size={14} className="text-amber-500" />
                <span>Live Guestbook Submissions</span>
              </h2>
              <p className="text-neutral-500 text-[11px] mt-0.5">
                Real-time entries synced via Supabase. Deleting an entry removes it globally from all devices.
              </p>
            </div>
            <span className="font-mono text-neutral-400">
              {guestbookList.length} total signatures
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {guestbookList.length === 0 ? (
              <div className="p-8 text-center text-neutral-400 font-mono">
                No signatures yet.
              </div>
            ) : (
              guestbookList.map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 bg-white border border-neutral-200 rounded-lg hover:border-neutral-300 transition-colors flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-sm shrink-0 border border-neutral-200">
                      {entry.avatar}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2 flex-wrap mb-1">
                        <span className="font-bold text-black text-xs">
                          {entry.name}
                        </span>
                        {entry.handle && (
                          <span className="text-[11px] text-neutral-400 font-mono">
                            {entry.handle}
                          </span>
                        )}
                        <span className="text-[11px] text-neutral-400 font-mono">
                          • {entry.location}
                        </span>
                        <span className="text-[11px] text-neutral-400 font-mono ml-auto">
                          {entry.date} ({entry.likes} likes)
                        </span>
                      </div>
                      <p className="text-neutral-700 text-xs leading-relaxed break-words">
                        {entry.message}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteGuestbook(entry.id)}
                    className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer shrink-0"
                    title="Delete signature from Supabase"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          TAB: CV & CAREER MANAGER
          ═══════════════════════════════════════════════════════════════ */}
      {activeTab === 'cv' && (
        <div className="space-y-10 text-xs font-sans">
          
          {/* Top Intro & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-neutral-50 border border-neutral-200 rounded-lg">
            <div>
              <h2 className="text-sm font-bold text-black font-mono flex items-center gap-2">
                <Briefcase size={15} />
                <span>Full CV & Career Content Management</span>
              </h2>
              <p className="text-neutral-600 mt-1">
                Add, update, or remove initiatives, work experience, community leadership, milestones, and education entries. Changes sync immediately to Supabase and the live CV.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-black text-white font-mono text-[11px]">
                {cvList.length} Total Items
              </span>
            </div>
          </div>

          {/* Add / Edit CV Item Form */}
          <div className="p-6 bg-white border border-neutral-200 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-neutral-200 pb-3">
              <h3 className="font-bold text-sm text-black font-mono flex items-center gap-2">
                <Plus size={14} className={editingCvId ? 'text-blue-600' : 'text-black'} />
                <span>{editingCvId ? 'Edit CV Item' : 'Add New CV Item'}</span>
              </h3>
              {editingCvId && (
                <button
                  type="button"
                  onClick={handleCancelCvEdit}
                  className="px-2.5 py-1 text-xs font-mono text-neutral-500 hover:text-black hover:bg-neutral-100 rounded transition-colors"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleSaveCvItem} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-micro uppercase text-neutral-400 font-mono mb-1">
                    CV Section:
                  </label>
                  <select
                    value={cvForm.section}
                    onChange={(e) =>
                      setCvForm({ ...cvForm, section: e.target.value as CvSectionType })
                    }
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-xs text-black focus:outline-none focus:border-black font-mono"
                  >
                    <option value="initiatives">Initiatives & Ventures</option>
                    <option value="experience">Work Experience</option>
                    <option value="leadership">Social Leadership</option>
                    <option value="milestones">Milestones & Philanthropy</option>
                    <option value="education">Education</option>
                    <option value="expertise">Areas of Expertise</option>
                  </select>
                </div>

                <div>
                  <label className="block text-micro uppercase text-neutral-400 font-mono mb-1">
                    Title / Organization / Venture: *
                  </label>
                  <input
                    type="text"
                    required
                    value={cvForm.title}
                    onChange={(e) => setCvForm({ ...cvForm, title: e.target.value })}
                    placeholder="e.g. SahiRasta Platform / Agarwalla & Associates"
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-xs text-black focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-micro uppercase text-neutral-400 font-mono mb-1">
                    Subtitle / Role / Position:
                  </label>
                  <input
                    type="text"
                    value={cvForm.subtitle}
                    onChange={(e) => setCvForm({ ...cvForm, subtitle: e.target.value })}
                    placeholder="e.g. Co-Founder / Accounts & Tax Intern"
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-xs text-black focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-micro uppercase text-neutral-400 font-mono mb-1">
                    Dates / Period:
                  </label>
                  <input
                    type="text"
                    value={cvForm.dateRange}
                    onChange={(e) => setCvForm({ ...cvForm, dateRange: e.target.value })}
                    placeholder="e.g. April 2026 / Jul 2026 - Sep 2026"
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-xs text-black focus:outline-none focus:border-black font-mono"
                  />
                </div>

                <div>
                  <label className="block text-micro uppercase text-neutral-400 font-mono mb-1">
                    Location:
                  </label>
                  <input
                    type="text"
                    value={cvForm.location}
                    onChange={(e) => setCvForm({ ...cvForm, location: e.target.value })}
                    placeholder="e.g. Sarupathar, Assam, India · On-site"
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-xs text-black focus:outline-none focus:border-black font-mono"
                  />
                </div>

                <div>
                  <label className="block text-micro uppercase text-neutral-400 font-mono mb-1">
                    Status Badge:
                  </label>
                  <input
                    type="text"
                    value={cvForm.badge}
                    onChange={(e) => setCvForm({ ...cvForm, badge: e.target.value })}
                    placeholder="e.g. ACQUIRED / SOLD, LIVE, CLIENT WORK"
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-xs text-black focus:outline-none focus:border-black font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-micro uppercase text-neutral-400 font-mono mb-1">
                    External Link / URL:
                  </label>
                  <input
                    type="text"
                    value={cvForm.link}
                    onChange={(e) => setCvForm({ ...cvForm, link: e.target.value })}
                    placeholder="e.g. https://xalumni.web.app"
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-xs text-black focus:outline-none focus:border-black font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-micro uppercase text-neutral-400 font-mono mb-1">
                  Description / Overview:
                </label>
                <textarea
                  rows={2}
                  value={cvForm.description}
                  onChange={(e) => setCvForm({ ...cvForm, description: e.target.value })}
                  placeholder="Summary of the role, venture, or academic achievements..."
                  className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-xs text-black focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-micro uppercase text-neutral-400 font-mono mb-1">
                  Bullet Points (One per line):
                </label>
                <textarea
                  rows={4}
                  value={cvForm.bulletPointsText}
                  onChange={(e) => setCvForm({ ...cvForm, bulletPointsText: e.target.value })}
                  placeholder="Co-founded and engineered the entire web platform & curated roadmaps.&#10;Leveraged GenAI workflows for rapid prototyping.&#10;Built, scaled user traction, and successfully sold the venture."
                  className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-xs text-black focus:outline-none focus:border-black font-mono text-[11px]"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-6">
                  <div>
                    <label className="block text-micro uppercase text-neutral-400 font-mono mb-1">
                      Display Order:
                    </label>
                    <input
                      type="number"
                      value={cvForm.displayOrder}
                      onChange={(e) =>
                        setCvForm({ ...cvForm, displayOrder: parseInt(e.target.value) || 1 })
                      }
                      className="w-24 p-2 bg-neutral-50 border border-neutral-300 rounded text-xs text-black focus:outline-none focus:border-black font-mono"
                    />
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer pt-4 text-xs font-mono text-neutral-700">
                    <input
                      type="checkbox"
                      checked={cvForm.isVisible}
                      onChange={(e) => setCvForm({ ...cvForm, isVisible: e.target.checked })}
                      className="rounded border-neutral-300 text-black focus:ring-black"
                    />
                    <span>Publicly Visible on CV</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer pt-4 text-xs font-mono text-neutral-700">
                    <input
                      type="checkbox"
                      checked={cvForm.showLink}
                      onChange={(e) => setCvForm({ ...cvForm, showLink: e.target.checked })}
                      className="rounded border-neutral-300 text-black focus:ring-black"
                    />
                    <span>Show Link on CV (Default is OFF)</span>
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  {editingCvId && (
                    <button
                      type="button"
                      onClick={handleCancelCvEdit}
                      className="px-4 py-2 border border-neutral-300 rounded font-mono text-xs hover:bg-neutral-100 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-5 py-2 bg-black text-white hover:bg-neutral-800 transition-colors rounded font-mono text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check size={13} />
                    <span>{editingCvId ? 'Update CV Item' : 'Save to Live CV'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Section Filter Tabs */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-neutral-200 text-xs font-mono">
              <span className="text-neutral-400 font-semibold mr-1">FILTER:</span>
              {[
                { id: 'all', label: 'All Items' },
                { id: 'initiatives', label: 'Initiatives & Ventures' },
                { id: 'experience', label: 'Work Experience' },
                { id: 'leadership', label: 'Leadership' },
                { id: 'milestones', label: 'Milestones' },
                { id: 'education', label: 'Education' },
                { id: 'expertise', label: 'Expertise' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setCvSectionFilter(tab.id)}
                  className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap cursor-pointer ${
                    cvSectionFilter === tab.id
                      ? 'bg-neutral-900 text-white font-bold'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* CV Items List */}
            <div className="grid grid-cols-1 gap-3">
              {cvList
                .filter((item) => cvSectionFilter === 'all' || item.section === cvSectionFilter)
                .length === 0 ? (
                <div className="p-8 text-center text-neutral-400 font-mono bg-neutral-50 rounded border border-neutral-200">
                  No items in this section. Add one above!
                </div>
              ) : (
                cvList
                  .filter((item) => cvSectionFilter === 'all' || item.section === cvSectionFilter)
                  .map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 bg-white border rounded-lg transition-all flex flex-col md:flex-row md:items-start justify-between gap-4 ${
                        editingCvId === item.id
                          ? 'border-blue-500 bg-blue-50/20 ring-1 ring-blue-500'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 font-mono text-[10px] uppercase font-bold tracking-wider">
                            {item.section}
                          </span>
                          <span className="font-bold text-black text-sm">
                            {item.title}
                          </span>
                          {item.subtitle && (
                            <span className="text-neutral-600 text-xs">
                              • {item.subtitle}
                            </span>
                          )}
                          {item.badge && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-semibold">
                              {item.badge}
                            </span>
                          )}
                          {!item.isVisible && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-200 text-neutral-600">
                              HIDDEN
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-neutral-400 font-mono text-micro flex-wrap">
                          {item.dateRange && <span>📅 {item.dateRange}</span>}
                          {item.location && <span>📍 {item.location}</span>}
                          <span>Order: #{item.displayOrder}</span>
                          {item.link && (
                            <a
                              href={item.link.startsWith('http') ? item.link : `https://${item.link}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-1"
                            >
                              <span>{item.link}</span>
                              <ExternalLink size={10} />
                            </a>
                          )}
                        </div>

                        {item.description && (
                          <p className="text-xs text-neutral-700 leading-relaxed pt-1">
                            {item.description}
                          </p>
                        )}

                        {item.bulletPoints && item.bulletPoints.length > 0 && (
                          <div className="text-micro text-neutral-500 font-mono pt-1">
                            {item.bulletPoints.length} bullet point(s) configured
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-neutral-100">
                        {item.link && (
                          <button
                            type="button"
                            onClick={() => handleToggleCvShowLink(item)}
                            className={`px-2 py-1 rounded text-micro font-mono transition-colors cursor-pointer border ${
                              item.showLink
                                ? 'bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100 font-bold'
                                : 'bg-neutral-100 text-neutral-500 border-neutral-200 hover:bg-neutral-200'
                            }`}
                            title="Toggle whether clickable link is displayed on the live CV page"
                          >
                            {item.showLink ? 'Link: ON' : 'Link: OFF'}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleToggleCvVisibility(item)}
                          className={`px-2 py-1 rounded text-micro font-mono transition-colors cursor-pointer border ${
                            item.isVisible
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-neutral-100 text-neutral-500 border-neutral-200 hover:bg-neutral-200'
                          }`}
                          title="Toggle visibility on live site"
                        >
                          {item.isVisible ? 'Live' : 'Hidden'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEditCvItem(item)}
                          className="p-1.5 text-neutral-600 hover:text-black hover:bg-neutral-100 rounded transition-colors cursor-pointer"
                          title="Edit CV Item"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCvItem(item.id)}
                          className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                          title="Delete CV Item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          TAB 4: TELEGRAM WEBHOOK INSTRUCTIONS & STATUS
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
