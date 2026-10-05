import React, { useState, useEffect, useRef, useCallback } from 'react';
import { playClickSound } from '../utils/sound';
import { Mail, MapPin, ArrowDown, ExternalLink, BookOpen, Rocket, Award, GraduationCap, Briefcase, HeartHandshake, Droplets } from 'lucide-react';
import { PortfolioProjectsSection } from './PortfolioProjectsSection';
import { CvItem, loadCvItems, fetchCvItems, subscribeToCvChanges } from '../data/cvData';
import { loadSetting, fetchSetting, subscribeToSetting } from '../data/siteSettings';

interface HomeViewProps {
  onNavigateToWritings?: () => void;
  onNavigateToStory?: () => void;
  onNavigateToStuff?: () => void;
  onNavigateToGuestbook?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigateToWritings,
  onNavigateToStory,
  onNavigateToStuff,
  onNavigateToGuestbook,
}) => {
  const isNavigatingRef = useRef(false);
  const touchStartY = useRef<number | null>(null);
  const mountTimeRef = useRef<number>(Date.now());
  const [cvItems, setCvItems] = useState<CvItem[]>(() => loadCvItems());
  const [showPortfolioSection, setShowPortfolioSection] = useState<boolean>(() =>
    loadSetting<boolean>('show_portfolio_section', false)
  );

  // Load live CV items and site settings from Supabase and subscribe to realtime edits
  useEffect(() => {
    fetchCvItems().then((items) => {
      if (items && items.length > 0) {
        setCvItems(items);
      }
    });

    fetchSetting<boolean>('show_portfolio_section', false).then((val) => {
      setShowPortfolioSection(val);
    });

    const unsubSetting = subscribeToSetting<boolean>('show_portfolio_section', (val) => {
      setShowPortfolioSection(val);
    });

    const unsubscribe = subscribeToCvChanges(
      (newItm) => {
        setCvItems((prev) => {
          if (prev.some((c) => c.id === newItm.id)) {
            return prev.map((c) => (c.id === newItm.id ? newItm : c));
          }
          return [...prev, newItm];
        });
      },
      (updItm) => {
        setCvItems((prev) => prev.map((c) => (c.id === updItm.id ? updItm : c)));
      },
      (delId) => {
        setCvItems((prev) => prev.filter((c) => c.id !== delId));
      }
    );

    return () => {
      unsubSetting();
      unsubscribe();
    };
  }, []);

  const triggerScrollToWritings = useCallback(() => {
    if (isNavigatingRef.current) return;
    if (Date.now() - mountTimeRef.current < 700) return; // Prevent momentum bleed-through
    isNavigatingRef.current = true;
    playClickSound('high');
    onNavigateToWritings?.();
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 1200);
  }, [onNavigateToWritings]);

  // Scroll Down only — No scroll up navigation
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (Date.now() - mountTimeRef.current < 700) return;
      const scrollPos = window.innerHeight + window.scrollY;
      const isBottom = scrollPos >= document.documentElement.scrollHeight - 20;

      // Only navigate forward when at the true bottom of the page
      if (e.deltaY > 45 && isBottom) {
        triggerScrollToWritings();
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (Date.now() - mountTimeRef.current < 700) return;
      if (touchStartY.current !== null) {
        const delta = touchStartY.current - e.changedTouches[0].clientY;
        const scrollPos = window.innerHeight + window.scrollY;
        const isBottom = scrollPos >= document.documentElement.scrollHeight - 20;

        if (delta > 60 && isBottom) {
          triggerScrollToWritings();
        }
        touchStartY.current = null;
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [triggerScrollToWritings]);

  return (
    <div className="relative w-full min-h-screen pt-20 pb-16 px-4 max-w-4xl mx-auto select-text font-sans page-transition">
      
      {/* ── Page Header / Intro Banner ─────────────────────── */}
      <section className="border-b border-neutral-200/80 pb-8 pt-4">
        <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded bg-black text-white text-[11px] font-mono mb-3 tracking-wide">
              <span>PAGE 2</span>
              <span>•</span>
              <span>CURRICULUM VITAE & PORTFOLIO</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-black">
              VANSH LOHIA
            </h1>
            <p className="text-sm font-mono text-neutral-500 mt-1">
              Bachelor of Business Administration • Creative Engineer • Project Lead
            </p>
          </div>

          {/* Quick Contact Info */}
          <div className="flex flex-col gap-1.5 text-xs font-mono text-neutral-600 bg-neutral-50 p-3.5 rounded border border-neutral-200/60">
            <a
              href="mailto:lohiavansh24.work@gmail.com"
              className="flex items-center gap-2 hover:text-blue-800 transition-colors text-blue-600 font-medium"
            >
              <Mail size={12} className="text-blue-500" />
              <span>lohiavansh24.work@gmail.com</span>
            </a>
            <a
              href="https://www.linkedin.com/in/vanshlohia/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 hover:text-black transition-colors text-blue-600 font-medium"
            >
              <ExternalLink size={12} className="text-blue-500" />
              <span>linkedin.com/in/vanshlohia/ ↗</span>
            </a>
            <div className="flex items-center gap-2 text-neutral-500">
              <MapPin size={12} className="text-neutral-400" />
              <span>Sarupathar, Assam, India - 785601</span>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <p className="text-sm text-neutral-700 leading-relaxed mt-6 max-w-3xl">
          A highly motivated Bachelor of Business Administration (BBA) student with over three years of experience in
          community program coordination and event organization, gained through various volunteer leadership roles.
          Experienced in full-lifecycle project coordination, accounting & taxation compliance, rapid generative AI workflows, AI assisted coding, and digital design.
        </p>
      </section>

      {/* ── 1. Areas of Expertise ──────────────────────────── */}
      <section className="py-8 border-b border-neutral-200/80">
        <h2 className="text-xs font-mono font-semibold uppercase tracking-widest text-neutral-400 mb-4 flex items-center gap-2">
          <Award size={14} className="text-black" />
          <span>Area of Expertise</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { title: 'GeM & Udyam Portals', desc: 'Government Registrations & MSME' },
            { title: 'Tally Prime & Tax', desc: 'Bookkeeping, Ledgers & ITR-1' },
            { title: 'Fullstack & AI Assisted Coding', desc: 'Next.js, React, Tailwind & Vite' },
            { title: 'Cloud & BaaS Architecture', desc: 'Firebase, Supabase & WebRTC' },
            { title: 'Project Coordination', desc: 'End-to-End Lifecycle Execution' },
            { title: 'Volunteer Leadership', desc: 'Community Program Coordination' },
          ].map((skill, idx) => (
            <div
              key={idx}
              className="p-3 bg-white border border-neutral-200 hover:border-black transition-all rounded group"
            >
              <div className="font-medium text-black text-sm group-hover:text-blue-600 transition-colors">
                {skill.title}
              </div>
              <div className="text-micro font-mono text-neutral-400 mt-0.5">
                {skill.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 2. Key Initiatives & Independent Ventures ──────── */}
      {cvItems.filter(c => c.section === 'initiatives' && c.isVisible).length > 0 && (
        <section className="py-8 border-b border-neutral-200/80">
          <h2 className="text-xs font-mono font-semibold uppercase tracking-widest text-neutral-400 mb-5 flex items-center gap-2">
            <Rocket size={14} className="text-black" />
            <span>Key Initiatives & Independent Ventures</span>
          </h2>

          <div className="space-y-6">
            {cvItems
              .filter(c => c.section === 'initiatives' && c.isVisible)
              .map((item, idx) => (
                <div
                  key={item.id}
                  className={`border-l-2 ${idx === 0 ? 'border-black' : 'border-neutral-300'} pl-4`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-1">
                    <h3 className="text-sm font-bold text-black flex items-center gap-2 flex-wrap">
                      <span>{item.title}</span>
                      {item.subtitle && (
                        <>
                          <span className="text-neutral-400 font-normal">•</span>
                          <span className="font-normal text-neutral-700">{item.subtitle}</span>
                        </>
                      )}
                      {item.badge && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-100 text-neutral-800 border border-neutral-200 font-semibold">
                          {item.badge}
                        </span>
                      )}
                    </h3>
                    {item.dateRange && (
                      <span className="text-xs font-mono text-neutral-400 shrink-0">
                        {item.dateRange}
                      </span>
                    )}
                  </div>

                  {item.location && (
                    <div className="text-micro font-mono text-neutral-500 mb-1.5">
                      {item.location}
                    </div>
                  )}

                  {item.description && (
                    <p className="text-xs text-neutral-600 mb-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}

                  {item.bulletPoints && item.bulletPoints.length > 0 && (
                    <div className="space-y-1.5">
                      <ul className="space-y-1 text-xs text-neutral-700 list-disc list-inside">
                        {item.bulletPoints
                          .filter((pt) => !pt.startsWith('Tech Stack:'))
                          .map((pt, pIdx) => (
                            <li key={pIdx}>{pt}</li>
                          ))}
                      </ul>
                      {item.bulletPoints.find((pt) => pt.startsWith('Tech Stack:')) && (
                        <div className="text-[11px] font-mono text-neutral-600 mt-1 pl-1">
                          <span className="font-semibold text-neutral-800">Tech Stack:</span>{' '}
                          {item.bulletPoints
                            .find((pt) => pt.startsWith('Tech Stack:'))
                            ?.replace('Tech Stack:', '')
                            .trim()}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Link ONLY shown if enabled in admin */}
                  {item.showLink && item.link && (
                    <div className="mt-2 text-xs">
                      <a
                        href={item.link.startsWith('http') ? item.link : `https://${item.link}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline inline-flex items-center gap-1 font-mono text-[11px]"
                      >
                        <span>{item.link}</span>
                        <ExternalLink size={10} />
                      </a>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </section>
      )}

      {/* ── 2.5 Dynamic Portfolio Projects Showcase with Video Embeds & Image Gallery ── */}
      {showPortfolioSection && (
        <PortfolioProjectsSection />
      )}

      {/* ── 3. Published Books & Literary Work ─────────────── */}
      <section className="py-8 border-b border-neutral-200/80">
        <h2 className="text-xs font-mono font-semibold uppercase tracking-widest text-neutral-400 mb-5 flex items-center gap-2">
          <BookOpen size={14} className="text-black" />
          <span>Author & Published Work</span>
        </h2>

        <div className="p-5 bg-white border border-neutral-200 rounded flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <a
                href="https://www.amazon.in/Wishpers-soul-Journey-Vansh-Lohia-ebook/dp/B0CRBFN13S"
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-1.5 text-base font-bold text-black hover:text-blue-600 transition-colors border-b-2 border-blue-600 pb-0.5"
                title="Open Wishpers of the soul on Amazon Kindle"
              >
                <span>Wishpers of the soul: A Journey (Poetry eBook)</span>
                <ExternalLink size={13} className="text-blue-600 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </div>
            <p className="text-xs text-neutral-600 mb-2">
              Independently authored poetry collection published on <strong>Amazon Kindle</strong>.
            </p>
            <p className="text-xs text-neutral-700 leading-relaxed">
              A complete poetry ebook written by me, capturing personal reflections, emotional depth, and poetic perspectives.
            </p>
          </div>
          <div className="text-xs font-mono text-neutral-400 whitespace-nowrap sm:text-right">
            <span>Jan, 2024</span>
          </div>
        </div>
      </section>

      {/* ── 4. Work Experience ─────────────── */}
      {cvItems.filter(c => c.section === 'experience' && c.isVisible).length > 0 && (
        <section className="py-8 border-b border-neutral-200/80">
          <h2 className="text-xs font-mono font-semibold uppercase tracking-widest text-neutral-400 mb-5 flex items-center gap-2">
            <Briefcase size={14} className="text-black" />
            <span>Work Experience</span>
          </h2>

          <div className="space-y-6">
            {cvItems
              .filter(c => c.section === 'experience' && c.isVisible)
              .map((exp) => (
                <div key={exp.id} className="border-l-2 border-black pl-4">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-1">
                    <h3 className="text-sm font-bold text-black">
                      {exp.title} {exp.subtitle && <>• <span className="font-normal text-neutral-700">{exp.subtitle}</span></>}
                    </h3>
                    {exp.dateRange && <span className="text-xs font-mono text-neutral-400">{exp.dateRange}</span>}
                  </div>
                  {exp.location && <div className="text-micro font-mono text-neutral-500 mb-2">{exp.location}</div>}
                  {exp.description && (
                    <p className="text-xs text-neutral-600 mb-2">
                      {exp.description}
                    </p>
                  )}
                  {exp.bulletPoints && exp.bulletPoints.length > 0 && (
                    <ul className="space-y-1.5 text-xs text-neutral-700 list-disc list-inside">
                      {exp.bulletPoints.map((pt, pIdx) => (
                        <li key={pIdx}>{pt}</li>
                      ))}
                    </ul>
                  )}
                  {exp.link && (
                    <div className="mt-2 text-xs">
                      <a
                        href={exp.link.startsWith('http') ? exp.link : `https://${exp.link}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline inline-flex items-center gap-1 font-mono text-[11px]"
                      >
                        <span>{exp.link}</span>
                        <ExternalLink size={10} />
                      </a>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </section>
      )}

      {/* ── 5. Social Work & Community Leadership ───────────── */}
      {cvItems.filter(c => c.section === 'leadership' && c.isVisible).length > 0 && (
        <section className="py-8 border-b border-neutral-200/80">
          <h2 className="text-xs font-mono font-semibold uppercase tracking-widest text-neutral-400 mb-5 flex items-center gap-2">
            <HeartHandshake size={14} className="text-black" />
            <span>Social Work & Community Leadership</span>
          </h2>

          <div className="space-y-6">
            {cvItems
              .filter(c => c.section === 'leadership' && c.isVisible)
              .map((lead, idx) => (
                <div key={lead.id} className={`border-l-2 ${idx === 0 ? 'border-black' : 'border-neutral-300'} pl-4`}>
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-1">
                    <h3 className="text-sm font-bold text-black">
                      {lead.title} {lead.subtitle && <>• <span className="font-normal text-neutral-600">{lead.subtitle}</span></>}
                    </h3>
                    {lead.dateRange && <span className="text-xs font-mono text-neutral-400">{lead.dateRange}</span>}
                  </div>
                  {lead.location && <div className="text-micro font-mono text-neutral-500 mb-2">{lead.location}</div>}
                  {lead.description && (
                    <p className="text-xs text-neutral-600 mb-2">
                      {lead.description}
                    </p>
                  )}
                  {lead.bulletPoints && lead.bulletPoints.length > 0 && (
                    <ul className="space-y-1.5 text-xs text-neutral-700 list-disc list-inside">
                      {lead.bulletPoints.map((pt, pIdx) => (
                        <li key={pIdx}>{pt}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
          </div>
        </section>
      )}

      {/* ── 6. Community & Philanthropic Milestones ─────────── */}
      {cvItems
        .filter(c => c.section === 'milestones' && c.isVisible)
        .map((m) => (
          <section key={m.id} className="py-6 border-b border-neutral-200/80 bg-neutral-50/50 p-4 rounded-lg my-2">
            <div className="flex items-start gap-3.5">
              <div className="p-2 rounded-full bg-rose-50 text-rose-600 border border-rose-200 shrink-0 mt-0.5">
                <Droplets size={16} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-black">
                    {m.title}
                  </h3>
                  {m.badge && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-medium">
                      {m.badge}
                    </span>
                  )}
                </div>
                {m.description && (
                  <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                    {m.description}
                  </p>
                )}
              </div>
            </div>
          </section>
        ))}

      {/* ── 7. Education ────────────────────────────────────── */}
      {cvItems.filter(c => c.section === 'education' && c.isVisible).length > 0 && (
        <section className="py-8 border-b border-neutral-200/80">
          <h2 className="text-xs font-mono font-semibold uppercase tracking-widest text-neutral-400 mb-5 flex items-center gap-2">
            <GraduationCap size={14} className="text-black" />
            <span>Education</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {cvItems
              .filter(c => c.section === 'education' && c.isVisible)
              .map((edu) => (
                <div key={edu.id} className="p-4 border border-neutral-200 rounded bg-white">
                  <div className="font-bold text-black text-sm">{edu.title}</div>
                  {edu.subtitle && (
                    <div className="text-xs text-neutral-600 mt-0.5">
                      {edu.subtitle}
                    </div>
                  )}
                  {edu.dateRange && (
                    <div className="text-micro font-mono text-neutral-400 mt-1">
                      {edu.dateRange}
                    </div>
                  )}
                  {edu.badge && (
                    <div className="mt-3 inline-block px-2 py-0.5 rounded bg-neutral-100 text-black text-xs font-mono font-semibold">
                      {edu.badge}
                    </div>
                  )}
                  {edu.description && (
                    <div className="mt-3 text-xs text-neutral-500 font-mono">
                      {edu.description}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </section>
      )}

      {/* ── Bottom Page Continuation Bar ────────────────────── */}
      <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
        <div className="flex items-center gap-3">
          {onNavigateToStory && (
            <button
              onClick={() => {
                playClickSound('tick');
                onNavigateToStory();
              }}
              className="hover:text-black ul-link transition-colors cursor-pointer text-neutral-500"
            >
              (Story Lab)
            </button>
          )}

          {onNavigateToStuff && (
            <button
              onClick={() => {
                playClickSound('high');
                onNavigateToStuff();
              }}
              className="hover:text-black ul-link transition-colors cursor-pointer text-neutral-500"
            >
              (Stuff & Projects)
            </button>
          )}

          {onNavigateToGuestbook && (
            <button
              onClick={() => {
                playClickSound('high');
                onNavigateToGuestbook();
              }}
              className="hover:text-black ul-link transition-colors cursor-pointer text-neutral-500"
            >
              (Guestbook)
            </button>
          )}
        </div>

        {/* Scroll Next Page Cue */}
        <button
          onClick={triggerScrollToWritings}
          className="flex items-center gap-1.5 text-xs text-black font-semibold hover:text-blue-600 transition-colors cursor-pointer animate-pulse"
        >
          <span>Scroll down for Page 3: Writings</span>
          <ArrowDown size={13} className="animate-bounce" />
        </button>
      </div>

    </div>
  );
};
