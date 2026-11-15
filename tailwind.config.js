/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './404.html', './comment-ca-se-passe/**/*.html', './script.js'],
  safelist: [
    'bg-night/95',
    'border-edge',
    'border-transparent',
    'py-3',
    'py-6',
  ],
  theme: {
    extend: {
      colors: {
        night: '#0B0C0E',
        surface: '#141518',
        'surface-hover': '#1A1B1E',
        edge: '#2E3138',
        'edge-strong': '#3E4149',
        ink: '#EEEEF0',
        muted: '#8A8F98',
        subtle: '#9CA3AF',
        accent: '#7568FF',
        'accent-strong': '#6457E5',
        'accent-light': '#9F97FF',
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
