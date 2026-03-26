/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './script.js'],
  safelist: [
    'bg-[#0B0C0E]/80',
    'backdrop-blur-md',
    'border-[#2E3138]',
    'py-3',
    'py-6',
    'border-transparent',
    'flex',
    'hidden',
    'overflow-hidden-body',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
