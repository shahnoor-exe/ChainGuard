/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'cg-void':       '#080B10',
        'cg-base':       '#0D1117',
        'cg-surface':    '#161B22',
        'cg-elevated':   '#21262D',
        'cg-interactive':'#2A3040',
        'cg-accent':     '#00D4AA',
        'cg-cyan':       '#00B4D8',
        'cg-safe':       '#00E676',
        'cg-warn':       '#FFB300',
        'cg-danger':     '#FF5252',
        'cg-critical':   '#FF1744',
        'cg-text':       '#E6EDF3',
        'cg-muted':      '#8B949E',
        'cg-faint':      '#484F58',
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        'pulse-ring': {
          '0%':   { transform: 'scale(1)', opacity: '0.8' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        },
        'scan-line': {
          '0%':   { transform: 'translateY(100%)', opacity: '0.6' },
          '100%': { transform: 'translateY(-100%)', opacity: '0' },
        },
        'flow-dash': {
          from: { strokeDashoffset: '100' },
          to:   { strokeDashoffset: '0' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 8px rgba(0,212,170,0.15)' },
          '50%':      { boxShadow: '0 0 20px rgba(0,212,170,0.15), 0 0 40px rgba(0,212,170,0.08)' },
        },
        'typewriter-cursor': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0' },
        },
        'truck-move': {
          '0%':   { transform: 'translateX(-180px)' },
          '60%':  { transform: 'translateX(160px)' },
          '61%':  { transform: 'translateX(-180px)', opacity: '0' },
          '62%':  { opacity: '1' },
          '100%': { transform: 'translateX(-180px)' },
        },
        'smoke-rise': {
          '0%':   { transform: 'translateY(0)', opacity: '0.5' },
          '100%': { transform: 'translateY(-12px)', opacity: '0' },
        },
      },
      animation: {
        shimmer:       'shimmer 1.8s linear infinite',
        'pulse-ring':  'pulse-ring 2s ease-out infinite',
        'scan-line':   'scan-line 2s ease-in-out infinite',
        'flow-dash':   'flow-dash 2s linear infinite',
        'glow-pulse':  'glow-pulse 2s ease-in-out infinite',
        blink:         'blink 1.2s step-start infinite',
        'truck-move':  'truck-move 3s ease-in-out infinite',
        'smoke-rise':  'smoke-rise 1.5s ease-out infinite',
      },
    },
  },
  plugins: [],
}
