import React, { useEffect, useRef, useCallback } from 'react';
import { playClickSound } from '../utils/sound';
import { Mail, Phone, MapPin, ArrowDown, ExternalLink, BookOpen, Rocket, Award, GraduationCap, Briefcase, HeartHandshake, Droplets } from 'lucide-react';

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
              className="flex items-center gap-2 hover:text-black transition-colors"
            >
              <Mail size={12} className="text-neutral-400" />
              <span>lohiavansh24.work@gmail.com</span>
            </a>
            <a
              href="tel:+919365324146"
              className="flex items-center gap-2 hover:text-black transition-colors"
            >
              <Phone size={12} className="text-neutral-400" />
              <span>+91 93653 24146</span>
            </a>
            <a
              href="https://www.linkedin.com/in/vanshlohia/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 hover:text-black transition-colors text-blue-600 font-medium"
            >
              <ExternalLink size={12} className="text-blue-500" />
              <span>linkedin.com/in/vanshlohia ↗</span>
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
          Experienced in full-lifecycle project coordination, accounting & taxation compliance, rapid generative AI workflows, vibe coding, and digital design.
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
            { title: 'Accounting & Taxation', desc: 'Tally, ITR-1, Udyam & GeM' },
            { title: 'Graphic Design', desc: 'Canva & Visual Layout' },
            { title: 'Vibe Coding', desc: 'GenAI & Fullstack Prototyping' },
            { title: 'Project Coordination', desc: 'End-to-End Execution' },
            { title: 'Volunteer Management', desc: 'Leadership & Community' },
            { title: 'Meeting Deadlines', desc: 'High-discipline Execution' },
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

      {/* ── 2. Key Initiatives & Independent Projects ──────── */}
      <section className="py-8 border-b border-neutral-200/80">
        <h2 className="text-xs font-mono font-semibold uppercase tracking-widest text-neutral-400 mb-5 flex items-center gap-2">
          <Rocket size={14} className="text-black" />
          <span>Key Initiatives & Independent Projects</span>
        </h2>

        {/* SahiRasta Platform */}
        <div className="p-5 bg-neutral-50/70 border border-neutral-200 rounded">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-2">
            <h3 className="text-base font-bold text-black flex items-center gap-2">
              <span>Project Lead, SahiRasta Platform</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                ACTIVE
              </span>
            </h3>
            <span className="text-xs font-mono text-neutral-400">April, 2026 - Present</span>
          </div>

          <p className="text-xs text-neutral-600 mb-3 italic">
            Dedicated educational guidance and career roadmap platform tailored for Indian students.
          </p>

          <ul className="space-y-2 text-xs text-neutral-700 list-disc list-inside">
            <li>
              Conceptualized and developed <strong>'SahiRasta'</strong>, creating structured roadmaps and actionable career pathways.
            </li>
            <li>
              Leveraged <strong>generative AI workflows</strong> for rapid prototyping, defining core product vision, user journey, and business logic.
            </li>
            <li>
              Managed the end-to-end development lifecycle, taking the project from initial ideation to a functional Minimum Viable Product (MVP).
            </li>
          </ul>
        </div>
      </section>

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

      {/* ── 4. Work Experience (Below Projects) ─────────────── */}
      <section className="py-8 border-b border-neutral-200/80">
        <h2 className="text-xs font-mono font-semibold uppercase tracking-widest text-neutral-400 mb-5 flex items-center gap-2">
          <Briefcase size={14} className="text-black" />
          <span>Work Experience</span>
        </h2>

        <div className="space-y-6">
          {/* Agarwalla & Associates - CMA Firm */}
          <div className="border-l-2 border-black pl-4">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-1">
              <h3 className="text-sm font-bold text-black">
                Agarwalla & Associates (CMA Firm) • <span className="font-normal text-neutral-700">Accounts & Tax Intern</span>
              </h3>
              <span className="text-xs font-mono text-neutral-400">Jul 2026 - Sep 2026 (3 mos)</span>
            </div>
            <div className="text-micro font-mono text-neutral-500 mb-2">Sarupathar, Assam, India · On-site · Accounting & Taxation</div>
            <p className="text-xs text-neutral-600 mb-2">
              Worked in a professional accounting and tax practice, gaining hands-on exposure to accounting, taxation, government registrations, and compliance-related work.
            </p>
            <ul className="space-y-1.5 text-xs text-neutral-700 list-disc list-inside">
              <li>Completed <strong>Udyam registrations</strong>, enabling client businesses to access MSME scheme benefits.</li>
              <li>Processed <strong>GeM registrations</strong>, facilitating client access to the government procurement marketplace.</li>
              <li>Maintained <strong>Tally records</strong> across client accounts, supporting accurate bookkeeping and ledger upkeep.</li>
              <li>Prepared and filed <strong>ITR-1 returns</strong> for individual clients, ensuring compliance with income tax deadlines.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── 5. Social Work & Community Leadership ───────────── */}
      <section className="py-8 border-b border-neutral-200/80">
        <h2 className="text-xs font-mono font-semibold uppercase tracking-widest text-neutral-400 mb-5 flex items-center gap-2">
          <HeartHandshake size={14} className="text-black" />
          <span>Social Work & Community Leadership</span>
        </h2>

        <div className="space-y-6">
          {/* Marwari Yuva Manch */}
          <div className="border-l-2 border-black pl-4">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-1">
              <h3 className="text-sm font-bold text-black">
                Marwari Yuva Manch (4 Years) • <span className="font-normal text-neutral-600">Joint Secretary [Apr, 2026 - Present]</span>
              </h3>
              <span className="text-xs font-mono text-neutral-400">2022 - Present</span>
            </div>
            <div className="text-micro font-mono text-neutral-500 mb-2">Social & Community Services & Development</div>
            <ul className="space-y-1.5 text-xs text-neutral-700 list-disc list-inside">
              <li>Actively involved in community service projects; organized large community events for <strong>150 to 200 attendees</strong>.</li>
              <li>Joined as a dedicated volunteer, participating in community outreach and developing strong teamwork, volunteer coordination, and leadership skills.</li>
            </ul>
          </div>

          {/* Ashadeep NGO */}
          <div className="border-l-2 border-neutral-300 pl-4">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-1">
              <h3 className="text-sm font-bold text-black">
                Ashadeep NGO • <span className="font-normal text-neutral-600">Volunteer & Project Coordinator</span>
              </h3>
              <span className="text-xs font-mono text-neutral-400">Jan 2025 - Present</span>
            </div>
            <div className="text-micro font-mono text-neutral-500 mb-2">Mental Health Services</div>
            <ul className="space-y-1.5 text-xs text-neutral-700 list-disc list-inside">
              <li>Gaining hands-on experience in non-profit operations, project management, and volunteer coordination.</li>
              <li>Supporting community programs, enhancing team management, effective communication, and time management skills.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── 6. Community & Philanthropic Milestones ─────────── */}
      <section className="py-6 border-b border-neutral-200/80 bg-neutral-50/50 p-4 rounded-lg my-2">
        <div className="flex items-start gap-3.5">
          <div className="p-2 rounded-full bg-rose-50 text-rose-600 border border-rose-200 shrink-0 mt-0.5">
            <Droplets size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-black">
                Voluntary Blood Donor (2x Milestone Donor)
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-medium">
                COMMUNITY IMPACT
              </span>
            </div>
            <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
              Committed voluntary blood donor supporting emergency and hospital relief initiatives. Completed two milestone blood donations: the first upon turning <strong>18</strong> and the second on turning <strong>21</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* ── 7. Education ────────────────────────────────────── */}
      <section className="py-8 border-b border-neutral-200/80">
        <h2 className="text-xs font-mono font-semibold uppercase tracking-widest text-neutral-400 mb-5 flex items-center gap-2">
          <GraduationCap size={14} className="text-black" />
          <span>Education</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 border border-neutral-200 rounded bg-white">
            <div className="font-bold text-black text-sm">Manipal University Jaipur</div>
            <div className="text-xs text-neutral-600 mt-0.5">
              Bachelor of Business Administration (BBA)
            </div>
            <div className="text-micro font-mono text-neutral-400 mt-1">
              Penultimate 2nd Year • 2024 - 2027 (Expected)
            </div>
            <div className="mt-3 inline-block px-2 py-0.5 rounded bg-neutral-100 text-black text-xs font-mono font-semibold">
              3rd Sem SGPA: 8.0 • 77.6%
            </div>
          </div>

          <div className="p-4 border border-neutral-200 rounded bg-white">
            <div className="font-bold text-black text-sm">Amrit International School</div>
            <div className="text-xs text-neutral-600 mt-0.5">High School</div>
            <div className="text-micro font-mono text-neutral-400 mt-1">2022 - 2024</div>
            <div className="mt-3 text-xs text-neutral-500 font-mono">
              Languages: English & Hindi
            </div>
          </div>
        </div>
      </section>

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
