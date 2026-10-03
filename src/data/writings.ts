export interface Article {
  id: string;
  slug: string;
  title: string;
  date: string;
  year: string;
  readTime: string;
  category: string;
  excerpt: string;
  content: string[];
}

export const ARTICLES: Article[] = [
  {
    id: '01',
    slug: 'the-tactile-web',
    title: 'The Tactile Web: Reclaiming Soul in Modern Interfaces',
    date: 'February 14, 2026',
    year: '2026',
    readTime: '5 min read',
    category: 'Design Philosophy',
    excerpt: 'Why modern web applications feel like sanitized glass surfaces, and how micro-physics, subtle audio, and editorial restraint bring emotional resonance back to software.',
    content: [
      "Pick up a vintage Braun radio designed by Dieter Rams. Notice the resistance of the tuning dial — neither too loose nor too stiff. Notice the reassuring snap when the power toggle clicks into place. You do not simply interact with it; you feel it in your nervous system.",
      "Now open modern web software. A sea of uniform rounded rectangles, blue buttons with drop shadows, infinite spinners, and interchangeable dashboard layouts. Everything has been focus-grouped, A/B tested, and smoothed down until all friction, idiosyncrasy, and joy have been systematically excised.",
      "The web did not start out this way. In the early personal web, websites were idiosyncratic artifacts. They had texture. They had quirks. They felt like someone's private study or artist workshop rather than an airport terminal.",
      "Tactility in digital interfaces is not about returning to heavy skeuomorphism with faux leather textures. It is about emotional intent. It is about how an interface responds to intent with proportional kinetic weight.",
      "When you tap a button on this site, notice the micro-click generated via the Web Audio API. Notice how links wrap themselves with quiet parenthesis `(like this)`. Notice how image hovers don't just flash a tooltip, but softly dim the periphery so your attention sharpens. These are small courtesies from one human to another."
    ]
  },
  {
    id: '02',
    slug: 'engineering-smoothness-at-60fps',
    title: 'Designing at 60 FPS: The Architecture of Smoothness',
    date: 'November 28, 2025',
    year: '2025',
    readTime: '8 min read',
    category: 'Creative Engineering',
    excerpt: 'A deep dive into browser layout thrashing, composite layers, physics-based springs, and how we achieve buttery 120Hz gestures without bloated frameworks.',
    content: [
      "The difference between an interface that feels like software and one that feels like a physical object is latency and frame consistency. If a user gestures and the pixels lag by even 16 milliseconds, the brain registers it as synthetic resistance.",
      "Modern web frameworks often tempt developers to update state on scroll or cursor moves. But every time you read `offsetTop` or `getBoundingClientRect` followed by a DOM mutation in the same frame, you force the browser into synchronous layout recalibration — commonly known as layout thrashing.",
      "To achieve frictionless rendering, all continuous visual transforms must strictly operate on compositor-only properties: `transform` and `opacity`. When we animate with transforms, the browser GPU handles the interpolation across independent render layers without touching the main JS thread.",
      "Moreover, linear easing curves (`ease-in-out`, `cubic-bezier`) are mathematical approximations of real-world motion, but they lack momentum. Physical springs with mass, damping, and stiffness create gestures that feel grounded because they honor momentum.",
      "Write fewer lines of code. Measure FPS continuously. Treat every millisecond of the user's attention with reverence."
    ]
  },
  {
    id: '03',
    slug: 'why-minimalist-sites-feel-alive',
    title: 'Why Minimalist Websites Feel More Alive Than Cluttered Apps',
    date: 'August 19, 2025',
    year: '2025',
    readTime: '4 min read',
    category: 'Aesthetics',
    excerpt: 'Minimalism is often mistaken for emptiness. In truth, it is the deliberate preservation of negative space so meaningful details have room to breathe.',
    content: [
      "There is a pervasive fear among product teams: the fear of empty space. If there is a blank square inch on a screen, the instinct is to fill it with a call-to-action banner, a floating chat widget, an upsell prompt, or an animated badge.",
      "Yet true presence requires stillness. In traditional Japanese aesthetics, the concept of *Ma* (間) refers to the pure negative space between things. It is not empty void; it is the space that gives shape to sound, form, and thought.",
      "When you strip away gratuitous navigation bars, sticky marketing banners, and noisy decorations, the remaining elements take on extraordinary dignity. A single line of 13px grotesque typography carries more authority than a carousel of bold buzzwords.",
      "Minimalism is not about what is missing. It is about what is left when everything trivial has been politely asked to leave."
    ]
  },
  {
    id: '04',
    slug: 'notes-on-creative-coding',
    title: 'Notes on Creative Coding: Where Typography Meets Algorithms',
    date: 'April 02, 2025',
    year: '2025',
    readTime: '6 min read',
    category: 'Experiments',
    excerpt: 'Treating code as a sculpture medium rather than purely a specification. How generative algorithms can bring editorial layout into the 21st century.',
    content: [
      "For decades, graphic design and software engineering lived in separate silos. Designers drew static artboards in Illustrator or Figma; engineers wrote business logic and converted those artboards into static CSS.",
      "Creative engineering collapses that barrier. Code is not merely a tool for delivery; code is the material itself. Just as a potter understands the moisture and grit of clay, a creative engineer understands the rasterization behavior of fonts, the timing of hardware refresh cycles, and the mathematical beauty of noise functions.",
      "When we treat typography algorithmically — allowing letter spacing, weight, and baseline offsets to respond organically to user interaction or ambient audio — typography ceases to be a static print artifact. It becomes an organism.",
      "Don't just build websites. Build environments that people enjoy existing in."
    ]
  }
];
