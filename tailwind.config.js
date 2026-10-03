/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        urfd: {
          bg: '#ffffff',
          surface: '#f9f9f9',
          border: '#e5e5e5',
          dark: '#111111',
          lime: '#d2fd78',
          muted: '#888888',
          sand: '#686058',
        }
      },
      fontFamily: {
        sans: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        serif: ['"Instrument Serif"', '"Georgia"', 'serif'],
      },
      fontSize: {
        'micro': '11px',
        'sub': '13px',
      },
      letterSpacing: {
        tightest: '-0.03em',
        tighter: '-0.02em',
      }
    },
  },
  plugins: [],
}
