export interface Artwork {
  id: string;
  title: string;
  subtitle: string;
  year: string;
  category: string;
  imageUrl: string;
  aspect: string;
  caption: string;
}

function createArtworkSvg(id: string, title: string, subtitle: string, category: string, accent: string = '#d2fd78'): string {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
    <rect width="800" height="600" fill="#0c0a09" />
    <defs>
      <pattern id="grid_${id}" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#292524" stroke-width="0.75" />
      </pattern>
    </defs>
    <rect width="800" height="600" fill="url(#grid_${id})" opacity="0.6" />
    <circle cx="400" cy="300" r="160" fill="none" stroke="${accent}" stroke-width="2" />
    <circle cx="400" cy="300" r="80" fill="none" stroke="#57534e" stroke-width="1" stroke-dasharray="4,4" />
    <line x1="100" y1="300" x2="700" y2="300" stroke="#44403c" stroke-width="1" />
    <line x1="400" y1="100" x2="400" y2="500" stroke="#44403c" stroke-width="1" />
    <text x="40" y="60" fill="#a8a29e" font-family="monospace" font-size="14">ARTWORK // #${id} // ${category.toUpperCase()}</text>
    <text x="40" y="520" fill="#ffffff" font-family="sans-serif" font-weight="bold" font-size="28">${title}</text>
    <text x="40" y="555" fill="#d6d3d1" font-family="monospace" font-size="14">${subtitle}</text>
  </svg>
  `.trim();
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const HOME_ARTWORKS: Artwork[] = [
  {
    id: '01',
    title: 'Kinetic Monolith',
    subtitle: 'Computational Typography & Form',
    year: '2026',
    category: 'Motion Study',
    imageUrl: createArtworkSvg('01', 'Kinetic Monolith', 'Computational Typography & Form', 'Motion Study', '#d2fd78'),
    aspect: 'aspect-[4/5]',
    caption: 'Exploration of volumetric light, high-density typographic grids, and digital tension.'
  },
  {
    id: '02',
    title: 'Quiet Architecture',
    subtitle: 'Brutalist Concrete & Shadow',
    year: '2025',
    category: 'Spatial Design',
    imageUrl: createArtworkSvg('02', 'Quiet Architecture', 'Brutalist Concrete & Shadow', 'Spatial Design', '#38bdf8'),
    aspect: 'aspect-[3/4]',
    caption: 'Studies of monolithic concrete structures and geometric shadows.'
  },
  {
    id: '03',
    title: 'Fluid Typography',
    subtitle: 'Variable Glyphs & Dynamic Kerning',
    year: '2026',
    category: 'Type Experiment',
    imageUrl: createArtworkSvg('03', 'Fluid Typography', 'Variable Glyphs & Dynamic Kerning', 'Type Experiment', '#f43f5e'),
    aspect: 'aspect-[4/5]',
    caption: 'Generative letterforms morphing according to cursor velocity and spatial proximity.'
  },
  {
    id: '04',
    title: 'Subtle Radiance',
    subtitle: 'Raymarched Signed Distance Fields',
    year: '2025',
    category: 'Creative Shader',
    imageUrl: createArtworkSvg('04', 'Subtle Radiance', 'Raymarched Signed Distance Fields', 'Creative Shader', '#a855f7'),
    aspect: 'aspect-[1/1]',
    caption: 'Real-time GLSL fragment shader rendering soft iridescent refractive glass spheres.'
  }
];
