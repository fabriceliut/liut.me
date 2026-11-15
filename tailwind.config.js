/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './comment-ca-se-passe/**/*.html', './script.js'],
  safelist: [
    'bg-[#0B0C0E]/95',
    'border-[#2E3138]',
    'border-transparent',
    'py-3',
    'py-6',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
