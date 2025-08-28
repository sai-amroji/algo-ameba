/** @type {import('tailwindcss').Config} */
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Base colors
        dark: {
          a0: '#000000',
        },
        light: {
          a0: '#ffffff',
        },

        // Primary colors with alpha variants
        primary: {
          a0: '#07ed31', // Dark mode base
          a10: '#4ff050',
          a20: '#70f369',
          a30: '#8af580',
          a40: '#a1f796',
          a50: '#b6f9ab',
          // Light mode variants (you can also use these as separate colors)
          light: {
            a0: '#00ff15',
            a10: '#3cf133',
            a20: '#53e344',
            a30: '#61d451',
            a40: '#6bc65b',
            a50: '#73b864',
          }
        },

        // Surface colors
        surface: {
          a0: '#121212', // Dark mode
          a10: '#282828',
          a20: '#3f3f3f',
          a30: '#575757',
          a40: '#717171',
          a50: '#8b8b8b',
          // Light mode variants
          light: {
            a0: '#ffffff',
            a10: '#f0f0f0',
            a20: '#e1e1e1',
            a30: '#d3d3d3',
            a40: '#c5c5c5',
            a50: '#b6b6b6',
          }
        },

        // Tonal surface colors
        'surface-tonal': {
          a0: '#1a2518', // Dark mode
          a10: '#2f3a2d',
          a20: '#464f44',
          a30: '#5e665c',
          a40: '#767e75',
          a50: '#90968f',
          // Light mode variants
          light: {
            a0: '#f1ffec',
            a10: '#e4f0df',
            a20: '#d7e1d3',
            a30: '#cad3c7',
            a40: '#bdc5bb',
            a50: '#b1b6af',
          }
        },

        // Shadcn/UI compatible colors
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}