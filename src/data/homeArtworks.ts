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

export const HOME_ARTWORKS: Artwork[] = [
  {
    id: '01',
    title: 'Kinetic Monolith',
    subtitle: 'Computational Typography & Form',
    year: '2026',
    category: 'Motion Study',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=85',
    aspect: 'aspect-[4/5]',
    caption: 'Exploration of volumetric light, high-density typographic grids, and digital tension.'
  },
  {
    id: '02',
    title: 'Quiet Architecture',
    subtitle: 'Brutalist Concrete & Shadow',
    year: '2025',
    category: 'Spatial Design',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
    aspect: 'aspect-[3/4]',
    caption: 'Studies of monolithic concrete structures in Kamakura. Captured on Kodak Tri-X 400.'
  },
  {
    id: '03',
    title: 'Fluid Typography',
    subtitle: 'Variable Glyphs & Dynamic Kerning',
    year: '2026',
    category: 'Type Experiment',
    imageUrl: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?auto=format&fit=crop&w=1600&q=85',
    aspect: 'aspect-[4/5]',
    caption: 'Generative letterforms morphing according to cursor velocity and spatial proximity.'
  },
  {
    id: '04',
    title: 'Subtle Radiance',
    subtitle: 'Raymarched Signed Distance Fields',
    year: '2025',
    category: 'Creative Shader',
    imageUrl: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1600&q=85',
    aspect: 'aspect-[1/1]',
    caption: 'Real-time GLSL fragment shader rendering soft iridescent refractive glass spheres.'
  },
  {
    id: '05',
    title: 'Tokyo Rain, 01:24 AM',
    subtitle: 'Neon Reflections in Shinjuku',
    year: '2024',
    category: '35mm Film',
    imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1600&q=85',
    aspect: 'aspect-[16/10]',
    caption: 'Midnight walks in rain-soaked alleys. Cinestill 800T pushed two stops.'
  },
  {
    id: '06',
    title: 'Swiss Grid Specimen 09',
    subtitle: 'Strict Asymmetry & Functional Purity',
    year: '2026',
    category: 'Graphic Systems',
    imageUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1600&q=85',
    aspect: 'aspect-[4/5]',
    caption: 'Poster system celebrating the Zurich School of Design with contemporary code-driven layout.'
  },
  {
    id: '07',
    title: 'Tactile Silicon',
    subtitle: 'Custom Machined Input Device',
    year: '2025',
    category: 'Hardware',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1600&q=85',
    aspect: 'aspect-[16/11]',
    caption: 'Anodized 6063 aluminum, brass weight, custom PCB, and lubricated linear mechanical switches.'
  }
];
