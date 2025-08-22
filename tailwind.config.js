/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        plex: ['"IBM Plex Mono"', 'monospace'],
        audiowide: ['"Audiowide"', 'sans-serif'],
      },
      boxShadow:{
        title:"0px 4px 4px rgb(0,0,0,0.25)",
        algocard:"0px 10px 10px rgb(0,0,0,0.25)"
      }

    },
  },
  plugins: [],
};
