export interface StuffItem {
  id: string;
  title: string;
  codeName: string;
  category: 'Projects' | 'Experiments' | 'Visuals' | 'Tools';
  year: string;
  description: string;
  imageUrl: string;
  aspect?: string;
  link?: string;
  github?: string;
  tags: string[];
  role: string;
  details: string;
}

// Helper to create pure SVG graphic specimens (Zero Stock Photos)
function createSvgSpecimen(
  code: string,
  title: string,
  subtitle: string,
  category: string,
  accentColor: string = '#d2fd78',
  bgType: 'grid' | 'radial' | 'wave' | 'circuits' | 'type' = 'grid'
): string {
  let graphic = '';

  if (bgType === 'grid') {
    graphic = `
      <defs>
        <pattern id="g_${code}" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#262626" stroke-width="0.75" />
        </pattern>
      </defs>
      <rect width="800" height="600" fill="url(#g_${code})" />
      <!-- Coordinate Crosses -->
      <path d="M 100 300 L 700 300 M 400 100 L 400 500" stroke="#333333" stroke-width="1" stroke-dasharray="4,4" />
      <circle cx="400" cy="300" r="140" fill="none" stroke="${accentColor}" stroke-width="2" opacity="0.8" />
      <circle cx="400" cy="300" r="70" fill="none" stroke="#52525b" stroke-width="1" />
      <rect x="360" y="260" width="80" height="80" fill="none" stroke="#ffffff" stroke-width="1.5" />
    `;
  } else if (bgType === 'wave') {
    graphic = `
      <defs>
        <linearGradient id="g_${code}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#18181b" />
          <stop offset="100%" stop-color="#09090b" />
        </linearGradient>
      </defs>
      <path d="M 50 350 Q 200 150 400 300 T 750 250" fill="none" stroke="${accentColor}" stroke-width="3" opacity="0.9" />
      <path d="M 50 380 Q 200 180 400 330 T 750 280" fill="none" stroke="#ffffff" stroke-width="1.5" opacity="0.6" />
      <path d="M 50 410 Q 200 210 400 360 T 750 310" fill="none" stroke="#71717a" stroke-width="1" opacity="0.4" />
      <line x1="100" y1="120" x2="700" y2="120" stroke="#27272a" stroke-width="1" />
      <line x1="100" y1="480" x2="700" y2="480" stroke="#27272a" stroke-width="1" />
    `;
  } else if (bgType === 'type') {
    graphic = `
      <text x="60" y="280" fill="#27272a" font-family="sans-serif" font-weight="900" font-size="200" opacity="0.4">Aa</text>
      <text x="350" y="230" fill="#ffffff" font-family="sans-serif" font-weight="700" font-size="64" letter-spacing="-2">SWISS 78</text>
      <text x="355" y="270" fill="${accentColor}" font-family="monospace" font-size="16" letter-spacing="3">VARIABLE OPTICAL SYSTEM</text>
      <line x1="60" y1="340" x2="740" y2="340" stroke="${accentColor}" stroke-width="1.5" />
      <text x="60" y="375" fill="#a1a1aa" font-family="monospace" font-size="13">Hamburgevons • 1234567890 • [!@#$%^&amp;*]</text>
    `;
  } else if (bgType === 'circuits') {
    graphic = `
      <rect x="120" y="140" width="560" height="320" rx="8" fill="#18181b" stroke="#3f3f46" stroke-width="1.5" />
      <rect x="150" y="170" width="180" height="120" rx="4" fill="#09090b" stroke="${accentColor}" stroke-width="1" />
      <circle cx="240" cy="230" r="28" fill="#18181b" stroke="#ffffff" stroke-width="1" />
      <line x1="330" y1="200" x2="620" y2="200" stroke="#52525b" stroke-width="1.5" stroke-dasharray="6,4" />
      <line x1="330" y1="240" x2="620" y2="240" stroke="#52525b" stroke-width="1.5" stroke-dasharray="6,4" />
      <line x1="330" y1="280" x2="620" y2="280" stroke="${accentColor}" stroke-width="1.5" />
      <rect x="520" y="330" width="120" height="90" fill="#09090b" stroke="#3f3f46" stroke-width="1" />
    `;
  } else {
    // Radial
    graphic = `
      <circle cx="400" cy="300" r="180" fill="none" stroke="#27272a" stroke-width="1" />
      <circle cx="400" cy="300" r="130" fill="none" stroke="#3f3f46" stroke-width="1" stroke-dasharray="5,5" />
      <circle cx="400" cy="300" r="80" fill="none" stroke="${accentColor}" stroke-width="2" />
      <circle cx="400" cy="300" r="20" fill="${accentColor}" />
      <line x1="150" y1="300" x2="650" y2="300" stroke="#333333" stroke-width="1" />
    `;
  }

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
    <rect width="800" height="600" fill="#09090b" />
    ${graphic}
    
    <!-- Top Metadata Header -->
    <rect x="30" y="30" width="740" height="40" fill="#111111" rx="4" stroke="#27272a" stroke-width="1" />
    <text x="50" y="55" fill="#71717a" font-family="monospace" font-size="13" letter-spacing="1">SPECIMEN // ${code}</text>
    <rect x="650" y="38" width="105" height="24" rx="3" fill="#27272a" />
    <text x="702" y="54" fill="${accentColor}" font-family="monospace" font-weight="bold" font-size="11" text-anchor="middle" letter-spacing="0.5">${category.toUpperCase()}</text>
    
    <!-- Bottom Title Info Overlay -->
    <rect x="30" y="470" width="740" height="100" fill="#111111" rx="4" stroke="#27272a" stroke-width="1" />
    <text x="55" y="510" fill="#ffffff" font-family="sans-serif" font-weight="bold" font-size="22">${title}</text>
    <text x="55" y="545" fill="#a1a1aa" font-family="monospace" font-size="13">${subtitle}</text>
    <text x="740" y="535" fill="${accentColor}" font-family="monospace" font-size="14" text-anchor="end">EXPLORE ↗</text>
  </svg>
  `.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const STUFF_ITEMS: StuffItem[] = [
  {
    id: 's01',
    title: 'HyperCanvas WebGL Studio',
    codeName: 'hypercanvas_01.pic',
    category: 'Projects',
    year: '2026',
    description: 'Infinite collaborative vector & shader canvas running 120 FPS in WebGL.',
    imageUrl: createSvgSpecimen('HC_01', 'HyperCanvas WebGL Studio', 'Infinite 120 FPS Vector & Shader Canvas', 'Projects', '#d2fd78', 'grid'),
    aspect: 'aspect-[16/10]',
    link: 'https://github.com/Vanshlohia05/Vansh',
    github: 'https://github.com/Vanshlohia05/Vansh',
    tags: ['WebGL', 'TypeScript', 'GLSL', 'Canvas API'],
    role: 'Creator & Lead Engineer',
    details: 'Architected custom quadtree spatial indexing for 100k+ simultaneous vector nodes, with GPU-accelerated bezier tessellation and sub-millisecond stroke latency.'
  },
  {
    id: 's02',
    title: 'MonoForm Design System',
    codeName: 'monoform_specimen.pic',
    category: 'Projects',
    year: '2026',
    description: 'Ultra-strict Swiss-inspired design system tokens and component primitive library.',
    imageUrl: createSvgSpecimen('MF_02', 'MonoForm Design System', '4px Grid Primitives & Token Engine', 'Projects', '#38bdf8', 'type'),
    aspect: 'aspect-[4/3]',
    link: 'https://github.com/Vanshlohia05/Vansh',
    tags: ['Design System', 'Tokens', 'Figma', 'React'],
    role: 'Design & Code',
    details: 'A zero-dependency design architecture grounded in a 4px modular grid, optical typography balancing, and accessible high-contrast monochromatic color spaces.'
  },
  {
    id: 's03',
    title: 'Aura Sound Synthesizer',
    codeName: 'aura_synth.app',
    category: 'Experiments',
    year: '2025',
    description: 'Generative ambient sound generator utilizing frequency modulation and pink noise.',
    imageUrl: createSvgSpecimen('AS_03', 'Aura Sound Synthesizer', 'Web Audio DSP & Generative Drones', 'Experiments', '#f43f5e', 'wave'),
    aspect: 'aspect-[16/9]',
    link: 'https://github.com/Vanshlohia05/Vansh',
    tags: ['Web Audio API', 'DSP', 'Sound Design'],
    role: 'Creative Developer',
    details: 'Built procedural drone layers, tape-flutter emulation, and generative harmonic intervals inspired by Brian Eno and Hiroshi Yoshimura ambient compositions.'
  },
  {
    id: 's04',
    title: 'ShaderBloom SDF Engine',
    codeName: 'shader_bloom.gif',
    category: 'Experiments',
    year: '2025',
    description: 'Real-time Raymarching visual experiment simulating organic glass refraction.',
    imageUrl: createSvgSpecimen('SB_05', 'ShaderBloom SDF Engine', 'Raymarched Signed Distance Fields', 'Experiments', '#a855f7', 'radial'),
    aspect: 'aspect-[1/1]',
    link: 'https://github.com/Vanshlohia05/Vansh',
    tags: ['GLSL', 'Raymarching', 'Three.js'],
    role: 'Shader Artist',
    details: 'Implemented analytic distance bounds for smooth minimum boolean blending, ambient occlusion passes, and chromatic aberration dispersion.'
  },
  {
    id: 's05',
    title: 'Veloce Variable Typeface',
    codeName: 'veloce_type.pic',
    category: 'Projects',
    year: '2025',
    description: 'Neo-grotesque variable font crafted with optical sizing and high-speed terminals in mind.',
    imageUrl: createSvgSpecimen('VT_06', 'Veloce Variable Typeface', 'Neo-Grotesque Optical Glyph Engine', 'Projects', '#d2fd78', 'type'),
    aspect: 'aspect-[4/5]',
    link: 'https://github.com/Vanshlohia05/Vansh',
    tags: ['Type Design', 'Glyphs 3', 'Variable Fonts'],
    role: 'Type Designer',
    details: 'Features 9 weights spanning Thin to Heavy, with custom ink traps optimized for sub-10px rendering on high-DPI displays.'
  },
  {
    id: 's06',
    title: 'Paperclip Local Document Store',
    codeName: 'paperclip_db.app',
    category: 'Tools',
    year: '2026',
    description: 'Zero-dependency embedded document database for local-first web applications.',
    imageUrl: createSvgSpecimen('PC_07', 'Paperclip Local Document Store', 'ACID Reactive IndexedDB Storage Engine', 'Tools', '#10b981', 'circuits'),
    aspect: 'aspect-[16/10]',
    github: 'https://github.com/Vanshlohia05/Vansh',
    tags: ['IndexedDB', 'TypeScript', 'Local-First', 'CRDT'],
    role: 'Author',
    details: 'Under 4KB minified, supports full ACID transactions via IndexedDB, reactive live queries, and automatic offline peer-to-peer reconciliation.'
  },
  {
    id: 's07',
    title: 'Tactile 40% Mechanical Keypad',
    codeName: 'cnc_aluminum_board.pic',
    category: 'Tools',
    year: '2025',
    description: 'Custom CNC machined 6063 aluminum enclosure with hot-swappable hotswap PCB.',
    imageUrl: createSvgSpecimen('KB_08', 'Tactile 40% Keypad', 'CNC 6063 Aluminum Hardware Specimen', 'Tools', '#fbbf24', 'circuits'),
    aspect: 'aspect-[16/10]',
    tags: ['Industrial Design', 'Fusion 360', 'Hardware', 'QMK'],
    role: 'Hardware Designer',
    details: 'Designed from scratch in CAD, bead-blasted silver finish with gasket-mount FR4 leaf plate and custom QMK firmware layouts.'
  },
  {
    id: 's08',
    title: 'Terminal Velocity CLI',
    codeName: 'terminal_velocity.tool',
    category: 'Tools',
    year: '2025',
    description: 'Lightweight developer utility for benchmarking bundle sizes and tree-shaking efficacy.',
    imageUrl: createSvgSpecimen('TV_10', 'Terminal Velocity CLI', 'AST Tree Shaking & Bytecode Analysis', 'Tools', '#38bdf8', 'grid'),
    aspect: 'aspect-[16/9]',
    github: 'https://github.com/Vanshlohia05/Vansh',
    tags: ['Node CLI', 'Rust', 'DevTools', 'Performance'],
    role: 'Creator',
    details: 'Sub-10ms analysis engine compiling AST trees and visualizing bytecode footprint in interactive ASCII charts.'
  },
  {
    id: 's09',
    title: 'Fluid Layout Playground',
    codeName: 'fluid_layout.exp',
    category: 'Experiments',
    year: '2026',
    description: 'Mathematical viewport scaling system replacing arbitrary media query breakpoints.',
    imageUrl: createSvgSpecimen('FL_12', 'Fluid Layout Playground', 'Continuous Viewport Clamp Math', 'Experiments', '#d2fd78', 'wave'),
    aspect: 'aspect-[16/10]',
    link: 'https://github.com/Vanshlohia05/Vansh',
    tags: ['CSS Math', 'Fluid Type', 'Research'],
    role: 'Researcher',
    details: 'Continuous interpolation using CSS clamp() and dynamic viewport units to eliminate jumpy breakpoint snaps completely.'
  }
];
