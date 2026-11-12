/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          primary: '#050505',
          secondary: '#0B0618',
        },
        sidebar: {
          DEFAULT: '#6125E8',
          hover: '#521ec9',
          active: '#4516ab',
        },
        brand: {
          purple: '#7137F5',
          secondary: '#8B5CF6',
          accent: '#A78BFA',
          light: '#C4B5FD',
          card: '#13082B',
          cardDark: '#0E061F',
        },
        content: {
          primary: '#FFFFFF',
          secondary: '#A7A1B5',
          muted: '#716C82',
        },
        system: {
          success: '#22C55E',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#3B82F6',
        },
        border: {
          subtle: 'rgba(255, 255, 255, 0.08)',
          DEFAULT: 'rgba(255, 255, 255, 0.16)',
          highlight: 'rgba(167, 139, 250, 0.35)',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card-glow': '0 4px 20px -2px rgba(113, 55, 245, 0.15)',
        'purple-glow': '0 0 25px rgba(113, 55, 245, 0.35)',
        'modal-glow': '0 20px 45px rgba(5, 5, 5, 0.9)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(135deg, #050505 0%, #0B0618 50%, #13082B 100%)',
        'purple-gradient': 'linear-gradient(135deg, #7137F5 0%, #8B5CF6 100%)',
        'card-gradient': 'linear-gradient(180deg, rgba(19, 8, 43, 0.8) 0%, rgba(11, 6, 24, 0.95) 100%)',
        'glass-card': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
      },
    },
  },
  plugins: [],
};
