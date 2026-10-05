import React, { useState, useEffect } from 'react';
import {
  PortfolioProject,
  loadPortfolioProjects,
  fetchPortfolioProjects,
  subscribeToPortfolioProjects,
} from '../data/portfolioProjects';
import { playClickSound } from '../utils/sound';
import {
  ExternalLink,
  Play,
  ChevronDown,
  ChevronUp,
  Layers,
  Sparkles,
  Video,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react';

const GithubIcon: React.FC<{ size?: number; className?: string }> = ({ size = 14, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

interface PortfolioProjectsSectionProps {
  onSelectProject?: (project: PortfolioProject) => void;
}

export const PortfolioProjectsSection: React.FC<PortfolioProjectsSectionProps> = () => {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>('p-01');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    // 1. Load initial cache
    setProjects(loadPortfolioProjects());

    // 2. Fetch live data from Supabase
    fetchPortfolioProjects().then((live) => {
      if (live && live.length > 0) {
        setProjects(live);
      }
    });

    // 3. Realtime Supabase subscription
    const unsubscribe = subscribeToPortfolioProjects(
      (newProj) => {
        setProjects((prev) => {
          if (prev.some((p) => p.id === newProj.id)) {
            return prev.map((p) => (p.id === newProj.id ? newProj : p));
          }
          return [newProj, ...prev];
        });
      },
      (updatedProj) => {
        setProjects((prev) =>
          prev.map((p) => (p.id === updatedProj.id ? updatedProj : p))
        );
      },
      (deletedId) => {
        setProjects((prev) => prev.filter((p) => p.id !== deletedId));
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  const toggleExpand = (id: string) => {
    playClickSound('paper');
    setExpandedProjectId((prev) => (prev === id ? null : id));
  };

  const categories = ['All', 'Full-Stack & GenAI', 'Brand & Web Architecture', 'Community & Web App', 'Creative Engineering'];

  const filteredProjects = projects.filter((p) => {
    if (selectedCategory === 'All') return true;
    return p.category.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  // Helper to safely format video embed URL (e.g. YouTube watch -> embed)
  const getEmbedVideoUrl = (url?: string) => {
    if (!url) return null;
    if (url.includes('youtube.com/watch?v=')) {
      const vid = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${vid}`;
    }
    if (url.includes('youtu.be/')) {
      const vid = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${vid}`;
    }
    if (url.includes('loom.com/share/')) {
      const vid = url.split('share/')[1]?.split('?')[0];
      return `https://www.loom.com/embed/${vid}`;
    }
    return url;
  };

  return (
    <section className="py-10 border-b border-neutral-200/80">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xs font-mono font-semibold uppercase tracking-widest text-neutral-400 mb-1.5 flex items-center gap-2">
            <Layers size={14} className="text-black" />
            <span>Featured Portfolio Projects & Case Studies</span>
          </h2>
          <p className="text-xs text-neutral-500">
            Selected applications, platforms, brand systems, and GenAI products built and shipped.
          </p>
        </div>

        {/* Dynamic Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-micro font-mono">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                playClickSound('tick');
                setSelectedCategory(cat);
              }}
              className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-black text-white font-medium shadow-sm'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Projects List with Expandable Video/Image Dropdowns */}
      <div className="space-y-4">
        {filteredProjects.map((p) => {
          const isExpanded = expandedProjectId === p.id;
          const embedVideo = getEmbedVideoUrl(p.videoUrl);

          return (
            <div
              key={p.id}
              className={`border transition-all duration-200 rounded-lg overflow-hidden bg-white ${
                isExpanded ? 'border-neutral-400 shadow-sm ring-1 ring-black/5' : 'border-neutral-200 hover:border-neutral-300'
              }`}
            >
              {/* Card Header (Clickable Dropdown Toggle) */}
              <div
                onClick={() => toggleExpand(p.id)}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none bg-neutral-50/40 hover:bg-neutral-50 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3">
                  {p.imageUrl && (
                    <img
                      src={p.imageUrl}
                      alt={p.title}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded object-cover border border-neutral-200 shrink-0"
                    />
                  )}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-base font-bold text-black flex items-center gap-1.5">
                        <span>{p.title}</span>
                      </h3>
                      
                      {/* Status Badge */}
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                          p.status.toLowerCase().includes('sold') || p.status.toLowerCase().includes('acquired')
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : p.status.toLowerCase().includes('live')
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}
                      >
                        {p.status.toUpperCase()}
                      </span>

                      <span className="text-micro font-mono text-neutral-400">
                        {p.category} • {p.year}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-600 line-clamp-1">
                      {p.tagline}
                    </p>
                  </div>
                </div>

                {/* Right Action Icons & Toggle */}
                <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                  {p.videoUrl && (
                    <span className="flex items-center gap-1 text-[11px] font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      <Video size={12} />
                      <span className="hidden sm:inline">Video Demo</span>
                    </span>
                  )}

                  {p.liveUrl && (
                    <a
                      href={p.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-neutral-600 hover:text-black p-1 transition-colors"
                      title="Open Live Site"
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}

                  {p.githubUrl && (
                    <a
                      href={p.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-neutral-600 hover:text-black p-1 transition-colors"
                      title="View GitHub Repository"
                    >
                      <GithubIcon size={14} />
                    </a>
                  )}

                  <div className="w-6 h-6 rounded flex items-center justify-center text-neutral-400 bg-white border border-neutral-200">
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </div>
                </div>
              </div>

              {/* Expandable Drawer Content (Embedded Video, Gallery, Tech Stack, Case Study) */}
              {isExpanded && (
                <div className="p-5 border-t border-neutral-200 space-y-5 animate-fadeIn">
                  {/* Detailed Description */}
                  <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed max-w-3xl">
                    {p.description}
                  </p>

                  {/* Embedded Video Showcase */}
                  {embedVideo && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-micro font-mono text-neutral-500 uppercase tracking-wider">
                        <Play size={12} className="text-indigo-600" />
                        <span>Interactive Video Walkthrough</span>
                      </div>
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-neutral-300 bg-black shadow-inner">
                        <iframe
                          src={embedVideo}
                          title={`${p.title} Video Walkthrough`}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  )}

                  {/* Image Gallery / Previews */}
                  {p.images && p.images.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-micro font-mono text-neutral-500 uppercase tracking-wider">
                        <ImageIcon size={12} className="text-neutral-600" />
                        <span>Interface Previews & Architecture</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {p.images.map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt={`${p.title} preview ${idx + 1}`}
                            className="w-full h-44 object-cover rounded border border-neutral-200 hover:scale-[1.01] transition-transform"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tech Stack Tags & Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-neutral-100">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-micro font-mono text-neutral-400 mr-1">Stack:</span>
                      {p.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 border border-neutral-200"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono">
                      {p.liveUrl && (
                        <a
                          href={p.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-black font-semibold hover:underline"
                        >
                          <span>Visit Live Project</span>
                          <ExternalLink size={12} />
                        </a>
                      )}
                      {p.githubUrl && (
                        <a
                          href={p.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-neutral-600 hover:text-black"
                        >
                          <Github size={12} />
                          <span>Source</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
