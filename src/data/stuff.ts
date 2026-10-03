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

export const STUFF_ITEMS: StuffItem[] = [
  {
    id: 's01',
    title: 'HyperCanvas WebGL Studio',
    codeName: 'hypercanvas_01.pic',
    category: 'Projects',
    year: '2026',
    description: 'Infinite collaborative vector & shader canvas running 120 FPS in WebGL.',
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=85',
    aspect: 'aspect-[16/10]',
    link: 'https://github.com/vansh/hypercanvas',
    github: 'https://github.com/vansh/hypercanvas',
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
    imageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=85',
    aspect: 'aspect-[4/3]',
    link: 'https://monoform.design',
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
    imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=85',
    aspect: 'aspect-[16/9]',
    link: 'https://aura.sound',
    tags: ['Web Audio API', 'DSP', 'Sound Design'],
    role: 'Creative Developer',
    details: 'Built procedural drone layers, tape-flutter emulation, and generative harmonic intervals inspired by Brian Eno and Hiroshi Yoshimura ambient compositions.'
  },
  {
    id: 's04',
    title: 'Tokyo Midnight Archive',
    codeName: 'tokyo_35mm.pic',
    category: 'Visuals',
    year: '2024',
    description: 'Curated photo essay of nocturnal Tokyo streets, illuminated signboards, and shadows.',
    imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=85',
    aspect: 'aspect-[3/2]',
    tags: ['Photography', 'Leica M6', 'Cinestill 800T', 'Print'],
    role: 'Photographer',
    details: 'Limited edition 64-page risograph photobook printed on Munken Lynx 120gsm paper, bound by hand in Kyoto.'
  },
  {
    id: 's05',
    title: 'ShaderBloom SDF Engine',
    codeName: 'shader_bloom.gif',
    category: 'Experiments',
    year: '2025',
    description: 'Real-time Raymarching visual experiment simulating organic glass refraction.',
    imageUrl: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1200&q=85',
    aspect: 'aspect-[1/1]',
    link: 'https://shaders.vansh.dev',
    tags: ['GLSL', 'Raymarching', 'Three.js'],
    role: 'Shader Artist',
    details: 'Implemented analytic distance bounds for smooth minimum boolean blending, ambient occlusion passes, and chromatic aberration dispersion.'
  },
  {
    id: 's06',
    title: 'Veloce Variable Typeface',
    codeName: 'veloce_type.pic',
    category: 'Projects',
    year: '2025',
    description: 'Neo-grotesque variable font crafted with optical sizing and high-speed terminals in mind.',
    imageUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1200&q=85',
    aspect: 'aspect-[4/5]',
    link: 'https://veloce.type',
    tags: ['Type Design', 'Glyphs 3', 'Variable Fonts'],
    role: 'Type Designer',
    details: 'Features 9 weights spanning Thin to Heavy, with custom ink traps optimized for sub-10px rendering on high-DPI displays.'
  },
  {
    id: 's07',
    title: 'Paperclip Local Document Store',
    codeName: 'paperclip_db.app',
    category: 'Tools',
    year: '2026',
    description: 'Zero-dependency embedded document database for local-first web applications.',
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=85',
    aspect: 'aspect-[16/10]',
    github: 'https://github.com/vansh/paperclip-db',
    tags: ['IndexedDB', 'TypeScript', 'Local-First', 'CRDT'],
    role: 'Author',
    details: 'Under 4KB minified, supports full ACID transactions via IndexedDB, reactive live queries, and automatic offline peer-to-peer reconciliation.'
  },
  {
    id: 's08',
    title: 'Tactile 40% Mechanical Keypad',
    codeName: 'cnc_aluminum_board.pic',
    category: 'Tools',
    year: '2025',
    description: 'Custom CNC machined 6063 aluminum enclosure with hot-swappable hotswap PCB.',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&q=85',
    aspect: 'aspect-[16/10]',
    tags: ['Industrial Design', 'Fusion 360', 'Hardware', 'QMK'],
    role: 'Hardware Designer',
    details: 'Designed from scratch in CAD, bead-blasted silver finish with gasket-mount FR4 leaf plate and custom QMK firmware layouts.'
  },
  {
    id: 's09',
    title: 'Kinetic Poster Studies',
    codeName: 'poster_studies_09.pic',
    category: 'Visuals',
    year: '2026',
    description: 'Series of 24 computational posters exploring mathematical chaos and Swiss structure.',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=85',
    aspect: 'aspect-[3/4]',
    tags: ['Graphic Design', 'Generative Art', 'Postscript'],
    role: 'Graphic Designer',
    details: 'Explores the tension between rigid 12-column typographical grids and organic Brownian motion vector curves.'
  },
  {
    id: 's10',
    title: 'Terminal Velocity CLI',
    codeName: 'terminal_velocity.tool',
    category: 'Tools',
    year: '2025',
    description: 'Lightweight developer utility for benchmarking bundle sizes and tree-shaking efficacy.',
    imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=85',
    aspect: 'aspect-[16/9]',
    github: 'https://github.com/vansh/terminal-velocity',
    tags: ['Node CLI', 'Rust', 'DevTools', 'Performance'],
    role: 'Creator',
    details: 'Sub-10ms analysis engine compiling AST trees and visualizing bytecode footprint in interactive ASCII charts.'
  },
  {
    id: 's11',
    title: 'Ceramic & Wood Objects',
    codeName: 'studio_artifacts.pic',
    category: 'Visuals',
    year: '2024',
    description: 'Hand-thrown stoneware espresso cups and walnut organizer trays for the desk.',
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1200&q=85',
    aspect: 'aspect-[4/3]',
    tags: ['Craft', 'Ceramics', 'Woodworking', 'Studio'],
    role: 'Artisan',
    details: 'Fired to cone 10 with matte feldspathic glaze. A physical counterweight to a lifetime spent writing code.'
  },
  {
    id: 's12',
    title: 'Fluid Layout Playground',
    codeName: 'fluid_layout.exp',
    category: 'Experiments',
    year: '2026',
    description: 'Mathematical viewport scaling system replacing arbitrary media query breakpoints.',
    imageUrl: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?auto=format&fit=crop&w=1200&q=85',
    aspect: 'aspect-[16/10]',
    link: 'https://fluid.vansh.dev',
    tags: ['CSS Math', 'Fluid Type', 'Research'],
    role: 'Researcher',
    details: 'Continuous interpolation using CSS clamp() and dynamic viewport units to eliminate jumpy breakpoint snaps completely.'
  }
];
