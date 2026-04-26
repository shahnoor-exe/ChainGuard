/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'chainguard-navy':   '#0F4C81',
        'chainguard-emerald':'#00C896',
        'chainguard-danger': '#EF4444',
        'chainguard-warning':'#F59E0B',
        'bg-primary':  '#0D1117',
        'bg-surface':  '#161B22',
        'bg-elevated': '#21262D',
        'text-primary':'#E6EDF3',
        'text-muted':  '#8B949E',
        'border-subtle':'#30363D',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
        pulse_risk: {
          '0%, 100%': { transform: 'scale(1)', opacity: 1 },
          '50%':      { transform: 'scale(1.35)', opacity: 0.7 },
        },
        blink: {
          '0%, 100%': { opacity: 1 },
          '50%':      { opacity: 0 },
        },
        fadeIn: {
          from: { opacity: 0, transform: 'translateY(8px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        },
        slideInRight: {
          from: { transform: 'translateX(100%)' },
          to:   { transform: 'translateX(0)' },
        },
      },
      animation: {
        shimmer:       'shimmer 1.8s linear infinite',
        pulse_risk:    'pulse_risk 1.5s ease-in-out infinite',
        blink:         'blink 1.2s step-start infinite',
        fadeIn:        'fadeIn 0.3s ease-out',
        slideInRight:  'slideInRight 0.3s ease-out',
      },
    },
  },
  plugins: [],
}
