/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#F6F5F1', card: '#FFFFFF', 'card-alt': '#FAFAF8',
          border: '#E9E8E4', 'border-focus': '#A8DFD0',
          mint: '#6ECBB5', 'mint-dark': '#3AAE8C', 'mint-deep': '#2A8E70',
          'mint-ghost': 'rgba(110,203,181,0.08)', 'mint-glow': 'rgba(110,203,181,0.22)',
          dark: '#111110', text: '#1C1C1A', 'text-mid': '#555550',
          'text-dim': '#9A9A90', 'text-ghost': '#C4C4BB',
          red: '#E45B5B', blue: '#6366F1', orange: '#F59E0B', pink: '#EC4899',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-up': 'fadeUp .5s cubic-bezier(.16,1,.3,1) both',
        'scale-in': 'scaleIn .4s cubic-bezier(.16,1,.3,1) both',
      },
      keyframes: {
        fadeUp: { from: { opacity: 0, transform: 'translateY(14px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        scaleIn: { from: { opacity: 0, transform: 'scale(.95)' }, to: { opacity: 1, transform: 'scale(1)' } },
      },
    },
  },
  plugins: [],
};
