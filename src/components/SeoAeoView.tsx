import React, { useState } from 'react';
import { ArrowLeft, Copy, Check, FileText, Globe, Bot, Terminal, ExternalLink } from 'lucide-react';
import { playClickSound } from '../utils/sound';

interface SeoAeoViewProps {
  onBackToHome: () => void;
}

export const SeoAeoView: React.FC<SeoAeoViewProps> = ({ onBackToHome }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyContext = () => {
    playClickSound('tick');
    const textToCopy = `VANSH LOHIA — COMPREHENSIVE CV & AI ENGINE CONTEXT
Website: https://vanshfolie.vercel.app/
LLMs Context: https://vanshfolie.vercel.app/llms.txt
Location: Sarupathar, Golaghat, Assam & Jaipur, Rajasthan, India
Education: 3rd / Final Year BBA at Manipal University Jaipur (2023 - 2026)
Role: Creative Engineer, Digital Designer, Full-Stack Developer, Freelancer
Author: "Wishpers of the soul" (Poetry & Philosophy)

SKILLS & SPECIALIZATIONS:
- AI Assisted Coding, React 19, Next.js 16, Vite 8, TypeScript, Tailwind CSS
- Supabase (PostgreSQL, Realtime, Auth), Firebase (Firestore, RTDB, Auth), Google Apps Script, Google Gemini AI
- WebCrypto API (ECDH, AES-GCM Zero-Knowledge E2EE), WebRTC DataChannels, Web Audio API

PROJECTS:
1. SahiRasta: Career guidance & discovery platform (Next.js 16, React 19, TypeScript, Tailwind CSS v4, LocalStorage).
2. DSPowerCement: Industrial brand & digital corporate platform (HTML5, Modern JS ES6+, Vite 8, Tailwind CSS v3).
3. Xalumni: Multi-section platform and admin page (React, Vite, Firebase, Gemini AI, WebCrypto E2EE, WebRTC).
4. Awwrange: D2C custom apparel storefront with 1-click WhatsApp order automation (React 18, Redux Toolkit).
5. Personal Portfolio: Interactive sound-synthesizer portfolio with live Supabase guestbook & admin suite.

CONTACT:
Email: lohiavansh24.work@gmail.com
LinkedIn: https://www.linkedin.com/in/vanshlohia/
GitHub: https://github.com/Vanshlohia05
Open for worldwide freelance, brand engineering, and technical contracts.`;

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <article className="min-h-screen bg-white text-neutral-900 font-sans selection:bg-[#d2fd78] selection:text-black pb-24">
      {/* Top Banner / Breadcrumb */}
      <div className="border-b border-neutral-200 bg-neutral-50/70 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <button
            onClick={() => {
              playClickSound('tick');
              onBackToHome();
            }}
            className="inline-flex items-center gap-2 text-xs font-mono text-neutral-600 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Main Portfolio</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyContext}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono bg-black text-white rounded-md hover:bg-neutral-800 transition-colors shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#d2fd78]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Context!' : 'Copy Context for LLMs'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 space-y-12">
        {/* Header & Machine Status */}
        <header className="space-y-4 border-b border-neutral-100 pb-8">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-mono border border-emerald-200">
            <Bot className="w-3.5 h-3.5" />
            <span>AI Engine Optimization (AEO) & Search Engine Optimization (SEO) Master Index</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-black font-space">
            Vansh Lohia — Complete Profile, CV & Machine-Readable Architecture
          </h1>

          <p className="text-base text-neutral-600 leading-relaxed max-w-3xl">
            This structured endpoint provides an exhaustive reference for search engine web crawlers, AI retrieval models (Claude, ChatGPT, Perplexity, Gemini), and visitors seeking full, unstyled CV data, website user flows, and technical project stacks.
          </p>

          {/* Quick Raw Links */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <a
              href="/llms.txt"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-neutral-200 text-xs font-mono text-neutral-700 hover:border-black hover:text-black transition-colors bg-white"
            >
              <FileText className="w-3 h-3 text-neutral-500" />
              <span>/llms.txt</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-50" />
            </a>
            <a
              href="/llms-full.txt"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-neutral-200 text-xs font-mono text-neutral-700 hover:border-black hover:text-black transition-colors bg-white"
            >
              <FileText className="w-3 h-3 text-neutral-500" />
              <span>/llms-full.txt</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-50" />
            </a>
            <a
              href="/robots.txt"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-neutral-200 text-xs font-mono text-neutral-700 hover:border-black hover:text-black transition-colors bg-white"
            >
              <Terminal className="w-3 h-3 text-neutral-500" />
              <span>/robots.txt</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-50" />
            </a>
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-neutral-200 text-xs font-mono text-neutral-700 hover:border-black hover:text-black transition-colors bg-white"
            >
              <Globe className="w-3 h-3 text-neutral-500" />
              <span>/sitemap.xml</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-50" />
            </a>
          </div>
        </header>

        {/* Section 1: Core Identity & Bio */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight text-black font-space flex items-center gap-2">
            <span>1. Identity, Origin & Background</span>
          </h2>
          <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-5 space-y-3 text-sm text-neutral-700 leading-relaxed font-sans">
            <p>
              <strong>Name:</strong> Vansh Lohia
            </p>
            <p>
              <strong>Hometown / Place of Origin:</strong> Sarupathar, Golaghat District, Assam, India (PIN: 785601).
            </p>
            <p>
              <strong>Academic & Working Base:</strong> Jaipur, Rajasthan, India.
            </p>
            <p>
              <strong>Current Academic Status:</strong> 3rd / Final Year pursuing a Bachelor of Business Administration (BBA) at <em>Manipal University Jaipur</em> (Class of 2023 – 2026).
            </p>
            <p>
              <strong>Core Professional Identity:</strong> Creative Engineer, Digital Designer, Frontend Specialist, Full-Stack Developer, Published Author, and Tech Freelancer.
            </p>
            <p>
              <strong>Published Literature:</strong> Author of <em>&ldquo;Wishpers of the soul&rdquo;</em>, a curated anthology of original poetry and existential reflections exploring youth, solitude, and human emotion.
            </p>
            <p>
              <strong>Availability:</strong> Actively accepting remote freelance contracts, design engineering consulting, brand web architecture, and startup MVP development globally.
            </p>
          </div>
        </section>

        {/* Section 2: Full Curriculum Vitae */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold tracking-tight text-black font-space">
            <span>2. Complete Curriculum Vitae (CV)</span>
          </h2>

          {/* Education */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-black uppercase tracking-wider text-xs font-mono">
              Education
            </h3>
            <div className="border border-neutral-200 rounded-lg p-5 bg-white space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-base font-bold text-black">Manipal University Jaipur</h4>
                <span className="px-2.5 py-0.5 rounded-full bg-[#d2fd78] text-black text-xs font-mono font-medium">
                  3rd/Final Year
                </span>
              </div>
              <p className="text-sm font-medium text-neutral-800">
                Bachelor of Business Administration (BBA)
              </p>
              <p className="text-xs text-neutral-500 font-mono">
                July 2023 &mdash; Present (Graduating 2026) &bull; Jaipur, Rajasthan
              </p>
              <p className="text-sm text-neutral-600 pt-1">
                Studies focused on digital marketing, business strategy, economics, organizational behavior, consumer psychology, and modern venture dynamics.
              </p>
            </div>
          </div>

          {/* Technical Skills */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-black uppercase tracking-wider text-xs font-mono">
              Technical Skill Matrix
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-neutral-200 rounded-lg p-4 bg-white space-y-1">
                <span className="text-xs font-mono text-neutral-400 uppercase">Frontend & UI</span>
                <p className="text-sm font-medium text-black">
                  React 19, Next.js 16 (App Router), TypeScript, JavaScript (ES6+), Vite 8, Tailwind CSS v3 &amp; v4, PostCSS, Lucide Icons, Responsive Mobile-First Design.
                </p>
              </div>

              <div className="border border-neutral-200 rounded-lg p-4 bg-white space-y-1">
                <span className="text-xs font-mono text-neutral-400 uppercase">Backend & Databases</span>
                <p className="text-sm font-medium text-black">
                  Supabase (PostgreSQL, Realtime subscriptions, Row-Level Security, Edge Functions), Firebase (Firestore, Authentication, Realtime Database), Google Apps Script (GAS), Node.js.
                </p>
              </div>

              <div className="border border-neutral-200 rounded-lg p-4 bg-white space-y-1">
                <span className="text-xs font-mono text-neutral-400 uppercase">AI & Engineering Paradigms</span>
                <p className="text-sm font-medium text-black">
                  AI-Assisted Coding, Prompt Architecture, Google Gemini API, Web Audio API synthesizers, Micro-interactions, Single Page Applications (SPA).
                </p>
              </div>

              <div className="border border-neutral-200 rounded-lg p-4 bg-white space-y-1">
                <span className="text-xs font-mono text-neutral-400 uppercase">Security & Networking</span>
                <p className="text-sm font-medium text-black">
                  WebCrypto API (zero-knowledge ECDH, AES-GCM encryption), IndexedDB client vaults, WebRTC DataChannels (peer-to-peer ephemeral streaming).
                </p>
              </div>
            </div>
          </div>

          {/* Verified Projects */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-black uppercase tracking-wider text-xs font-mono">
              Verified Projects & Deployments
            </h3>

            {/* SahiRasta */}
            <div className="border border-neutral-200 rounded-lg p-5 bg-white space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-base font-bold text-black">1. SahiRasta</h4>
                <span className="text-xs font-mono text-neutral-500">Founder &amp; Full-Stack Architect</span>
              </div>
              <p className="text-sm text-neutral-600">
                An interactive career guidance and exploration portal helping high school and college students navigate entrance exams, college tiers, and stream decisions with clarity.
              </p>
              <div className="text-xs font-mono text-neutral-500 bg-neutral-50 p-2.5 rounded border border-neutral-100">
                <strong>Tech Stack:</strong> Next.js 16 (App Router) &bull; React 19 &bull; TypeScript &bull; Tailwind CSS v4 &bull; Lucide React &bull; Static JSON Catalog &bull; Browser LocalStorage &amp; React Context &bull; ESLint &amp; PostCSS
              </div>
            </div>

            {/* DSPowerCement */}
            <div className="border border-neutral-200 rounded-lg p-5 bg-white space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-base font-bold text-black">2. DSPowerCement</h4>
                <span className="text-xs font-mono text-neutral-500">Creative Engineer &amp; Lead Frontend</span>
              </div>
              <p className="text-sm text-neutral-600">
                High-converting digital showcase and corporate presence for a premier regional infrastructure and industrial manufacturing company.
              </p>
              <div className="text-xs font-mono text-neutral-500 bg-neutral-50 p-2.5 rounded border border-neutral-100">
                <strong>Tech Stack:</strong> HTML5 &bull; Modern JavaScript (ES6+) &bull; Vite 8 &bull; Tailwind CSS v3 &bull; PostCSS &bull; Autoprefixer &bull; Clean-CSS
              </div>
            </div>

            {/* Xalumni */}
            <div className="border border-neutral-200 rounded-lg p-5 bg-white space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-base font-bold text-black">3. Xalumni</h4>
                <span className="text-xs font-mono text-neutral-500">Multi-section platform and admin page</span>
              </div>
              <p className="text-sm text-neutral-600">
                A multi-section alumni platform connecting graduates with job boards, verified profiles, AI job summarization, zero-knowledge encrypted messaging, and peer-to-peer media exchange.
              </p>
              <div className="text-xs font-mono text-neutral-500 bg-neutral-50 p-2.5 rounded border border-neutral-100 space-y-1">
                <div><strong>Frontend:</strong> React &bull; Vite &bull; Tailwind CSS &bull; React Router &bull; React Hook Form</div>
                <div><strong>Backend:</strong> Firebase Auth &bull; Firestore &bull; Realtime Database (RTDB) &bull; Firebase Hosting</div>
                <div><strong>Automation &amp; AI:</strong> Google Apps Script (GAS) &bull; Google Gemini API &bull; Google Forms</div>
                <div><strong>Security &amp; P2P:</strong> WebCrypto API (ECDH, AES-GCM E2EE) &bull; IndexedDB &bull; WebRTC DataChannels</div>
              </div>
            </div>

            {/* Awwrange */}
            <div className="border border-neutral-200 rounded-lg p-5 bg-white space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-base font-bold text-black">4. Awwrange</h4>
                <span className="text-xs font-mono text-neutral-500">Frontend Developer &amp; Commerce Architect</span>
              </div>
              <p className="text-sm text-neutral-600">
                Direct-to-consumer e-commerce storefront for customized graphic apparel, mugs, totes, and curated gifting sets featuring live catalog search and automated 1-click WhatsApp order generation.
              </p>
              <div className="text-xs font-mono text-neutral-500 bg-neutral-50 p-2.5 rounded border border-neutral-100">
                <strong>Tech Stack:</strong> React 18 &bull; Redux Toolkit &bull; React-Bootstrap &bull; React Router DOM &bull; Slick Carousel &bull; WhatsApp Click-to-Chat API &bull; Web Storage API
              </div>
            </div>

            {/* Personal Portfolio */}
            <div className="border border-neutral-200 rounded-lg p-5 bg-white space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-base font-bold text-black">5. Personal Portfolio</h4>
                <span className="text-xs font-mono text-neutral-500">Sole Creator &amp; Engineer</span>
              </div>
              <p className="text-sm text-neutral-600">
                Minimalist, sound-synthesized digital universe inspired by urfd.net featuring horizontal story slides, sound effects, 30-book interactive library with autoscroll melodies, real-time Supabase guestbook, and full admin suite.
              </p>
              <div className="text-xs font-mono text-neutral-500 bg-neutral-50 p-2.5 rounded border border-neutral-100">
                <strong>Tech Stack:</strong> React 19 &bull; Vite &bull; TypeScript &bull; Tailwind CSS &bull; Supabase (Postgres, Realtime, Auth) &bull; Web Audio API Synthesizers &bull; Telegram Bot Webhook
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Website Architecture & User Flow */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight text-black font-space">
            <span>3. Website Architecture &amp; User Flow Guide</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            <div className="p-4 border border-neutral-200 rounded-lg bg-white space-y-1">
              <span className="font-mono text-xs text-neutral-400">Page 1 &bull; /#story</span>
              <h4 className="font-bold text-black">Story Narrative</h4>
              <p className="text-xs text-neutral-600">
                Horizontal slide journey through Sarupathar childhood, creative shifts, engineering mindset, and philosophy.
              </p>
            </div>

            <div className="p-4 border border-neutral-200 rounded-lg bg-white space-y-1">
              <span className="font-mono text-xs text-neutral-400">Page 2 &bull; /#home</span>
              <h4 className="font-bold text-black">Home / CV</h4>
              <p className="text-xs text-neutral-600">
                Interactive curriculum vitae with role badges, education timeline, projects, skills, and direct contact buttons.
              </p>
            </div>

            <div className="p-4 border border-neutral-200 rounded-lg bg-white space-y-1">
              <span className="font-mono text-xs text-neutral-400">Page 3 &bull; /#writings</span>
              <h4 className="font-bold text-black">Writings &amp; Notes</h4>
              <p className="text-xs text-neutral-600">
                Deep essays, philosophical reflections, poetry from &ldquo;Wishpers of the soul&rdquo;, and technology notes.
              </p>
            </div>

            <div className="p-4 border border-neutral-200 rounded-lg bg-white space-y-1">
              <span className="font-mono text-xs text-neutral-400">Page 4 &bull; /#stuff</span>
              <h4 className="font-bold text-black">Stuff &amp; Bookshelf</h4>
              <p className="text-xs text-neutral-600">
                Interactive virtual bookshelf of 30 curated books with sound-synthesizer autoscroll, and paginated startup essays (Paul Graham).
              </p>
            </div>

            <div className="p-4 border border-neutral-200 rounded-lg bg-white space-y-1">
              <span className="font-mono text-xs text-neutral-400">Page 5 &bull; /#guestbook</span>
              <h4 className="font-bold text-black">Live Guestbook</h4>
              <p className="text-xs text-neutral-600">
                Real-time visitor guestbook synchronized globally via Supabase with likes, comments, and private Telegram alerts.
              </p>
            </div>

            <div className="p-4 border border-neutral-200 rounded-lg bg-white space-y-1">
              <span className="font-mono text-xs text-neutral-400">Admin &bull; /#admin</span>
              <h4 className="font-bold text-black">Control Panel</h4>
              <p className="text-xs text-neutral-600">
                Protected admin dashboard for real-time updates to CV items, projects, reading lists, and guestbook moderation.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Curated 30 Books Index */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight text-black font-space">
            <span>4. Curated Reading List (30 Essential Books)</span>
          </h2>
          <div className="border border-neutral-200 rounded-lg p-5 bg-white">
            <ol className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 text-xs text-neutral-700 list-decimal list-inside font-mono">
              <li>Rich Dad Poor Dad</li>
              <li>A Brief History of Time</li>
              <li>The Psychology of Money</li>
              <li>Wishpers of the soul (by Vansh)</li>
              <li>Atomic Habits</li>
              <li>Zero to One</li>
              <li>Sapiens: A Brief History of Humankind</li>
              <li>The Almanack of Naval Ravikant</li>
              <li>Steal Like an Artist</li>
              <li>The Subtle Art of Not Giving a F*ck</li>
              <li>The Metamorphosis</li>
              <li>Nexus (Yuval Noah Harari)</li>
              <li>Thus Spoke Zarathustra</li>
              <li>The Beginning of Infinity</li>
              <li>Cosmos (Carl Sagan)</li>
              <li>Man&apos;s Search for Meaning</li>
              <li>Dead Poets Society</li>
              <li>The Fault in Our Stars</li>
              <li>Men Are from Mars, Women Are from Venus</li>
              <li>Five Feet Apart</li>
              <li>The Myth of Sisyphus</li>
              <li>Musafir Cafe (Divya Prakash Dubey)</li>
              <li>How to Fail at Almost Everything</li>
              <li>The 4-Hour Workweek</li>
              <li>Meditation for Busy People (Osho)</li>
              <li>Think and Grow Rich</li>
              <li>Our Final Invention</li>
              <li>Chanakya Neeti</li>
              <li>Make (Pieter Levels)</li>
              <li>The Lessons of History</li>
            </ol>
          </div>
        </section>

        {/* Section 5: Semantic SEO & AEO Keyword Matrix */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight text-black font-space">
            <span>5. Semantic Keyword Matrix (For Search Engines &amp; LLM Training)</span>
          </h2>
          <div className="border border-neutral-200 rounded-lg p-5 bg-neutral-50/50 space-y-4">
            <div>
              <span className="text-xs font-mono font-medium text-neutral-500 uppercase tracking-wider block mb-2">
                Primary Identity &amp; Location Keywords
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Vansh Lohia',
                  'Vansh Lohia Sarupathar',
                  'Vansh Lohia Golaghat',
                  'Vansh Lohia Assam',
                  'Vansh Lohia Jaipur',
                  'Vansh Lohia Manipal University',
                  'Vansh Lohia MUJ',
                  'Vansh Lohia portfolio',
                  'Vansh Lohia CV',
                  'Vansh Lohia resume',
                  'Vansh Lohia contact',
                ].map((kw) => (
                  <span key={kw} className="px-2 py-1 bg-white border border-neutral-200 rounded text-xs font-mono text-neutral-800">
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-mono font-medium text-neutral-500 uppercase tracking-wider block mb-2">
                Freelance &amp; Professional Services
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Freelance web developer Assam',
                  'Freelance frontend developer India',
                  'Creative engineer for hire',
                  'Hire React developer',
                  'Hire Next.js engineer',
                  'AI assisted coding expert',
                  'Brand web designer India',
                  'Digital designer portfolio',
                  'Full stack contractor',
                  'Freelance portfolio engineer',
                ].map((kw) => (
                  <span key={kw} className="px-2 py-1 bg-white border border-neutral-200 rounded text-xs font-mono text-neutral-800">
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-mono font-medium text-neutral-500 uppercase tracking-wider block mb-2">
                Technical Systems &amp; Stacks
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'AI Assisted Coding',
                  'React 19 Vite 8',
                  'Next.js 16 App Router',
                  'Tailwind CSS v4',
                  'Supabase PostgreSQL Realtime',
                  'Firebase Firestore BaaS',
                  'WebCrypto E2EE ECDH AES-GCM',
                  'WebRTC DataChannels P2P',
                  'Web Audio API Sound Synthesizer',
                  'Google Gemini API automation',
                ].map((kw) => (
                  <span key={kw} className="px-2 py-1 bg-white border border-neutral-200 rounded text-xs font-mono text-neutral-800">
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-mono font-medium text-neutral-500 uppercase tracking-wider block mb-2">
                Verified Projects &amp; Products
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'SahiRasta career discovery',
                  'DSPowerCement industrial website',
                  'Xalumni encrypted alumni network',
                  'Awwrange WhatsApp e-commerce',
                  'Wishpers of the soul poetry book',
                  'vanshfolie.vercel.app',
                ].map((kw) => (
                  <span key={kw} className="px-2 py-1 bg-white border border-neutral-200 rounded text-xs font-mono text-neutral-800">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Footer Contact Callout */}
        <section className="border-t border-neutral-200 pt-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-base font-bold text-black">Connect with Vansh Lohia</h4>
            <p className="text-xs text-neutral-500 font-mono">
              lohiavansh24.work@gmail.com &bull; Jaipur, India &bull; Sarupathar, Assam
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="mailto:lohiavansh24.work@gmail.com"
              className="px-4 py-2 bg-black text-white text-xs font-mono rounded hover:bg-neutral-800 transition-colors"
            >
              Email Directly
            </a>
            <a
              href="https://www.linkedin.com/in/vanshlohia/"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 border border-neutral-300 text-neutral-800 text-xs font-mono rounded hover:border-black transition-colors"
            >
              LinkedIn
            </a>
          </div>
        </section>
      </div>
    </article>
  );
};

export default SeoAeoView;
