/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1rem', sm: '1.5rem', lg: '2rem' },
      screens: { '2xl': '1280px' },
    },
    extend: {
      colors: {
        // Semantic tokens driven by CSS variables (see index.css)
        bg: 'rgb(var(--c-bg) / <alpha-value>)',
        surface: 'rgb(var(--c-surface) / <alpha-value>)',
        'surface-2': 'rgb(var(--c-surface-2) / <alpha-value>)',
        ink: 'rgb(var(--c-ink) / <alpha-value>)',
        muted: 'rgb(var(--c-muted) / <alpha-value>)',
        line: 'rgb(var(--c-line) / <alpha-value>)',
        // Brand palette: pharmacy green
        brand: {
          50: '#ecfdf3',
          100: '#d1fae1',
          200: '#a7f3c8',
          300: '#6ee7a6',
          400: '#34d17f',
          500: '#16a35a',
          600: '#0f8a4b',
          700: '#0e6e3e',
          800: '#0b5733',
          900: '#07472b',
        },
        accent: {
          50: '#fff4ea',
          100: '#ffe4cc',
          200: '#ffc89b',
          300: '#fba86a',
          400: '#f29249',
          500: '#e98039',
          600: '#d1682a',
          700: '#a84f1e',
          800: '#7f3a17',
          900: '#5a2810',
        },
        gold: { 400: '#ffd24b', 500: '#fba100' },
        // Deep green-black used for overlays and the dark theme
        navy: {
          700: '#10231b',
          800: '#0b1a14',
          900: '#07140f',
          950: '#040c09',
        },
        success: '#22c55e',
        warning: '#f59e0b',
        danger: '#ef4444',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        ui: ['Poppins', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        pill: '999px',
        xl2: '1.25rem',
        xl3: '1.75rem',
      },
      boxShadow: {
        soft: '0 5px 20px rgba(0,0,0,0.08)',
        card: '0 10px 30px rgba(0,0,0,0.10)',
        float: '0 20px 40px rgba(0,0,0,0.15)',
        glow: '0 10px 30px rgba(22,163,90,0.35)',
        'glow-accent': '0 10px 30px rgba(233,128,57,0.35)',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #0f8a4b 0%, #34d17f 100%)',
        'gradient-gold': 'linear-gradient(135deg, #ffd24b, #fba100)',
        'gradient-soft':
          'linear-gradient(135deg, rgba(22,163,90,0.14) 0%, rgba(52,209,127,0.10) 100%)',
        'gradient-hero': 'linear-gradient(135deg, #07472b 0%, #0e6e3e 60%, #0f8a4b 100%)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'fade-up': {
          '0%': { opacity: 0, transform: 'translateY(16px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'fade-in': { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'fade-up': 'fade-up 0.6s ease-out both',
        'fade-in': 'fade-in 0.4s ease-out both',
        shimmer: 'shimmer 1.6s linear infinite',
        marquee: 'marquee 30s linear infinite',
      },
    },
  },
  plugins: [],
};
