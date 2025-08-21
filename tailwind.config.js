/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        plex: ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
