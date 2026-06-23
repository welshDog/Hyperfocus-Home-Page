import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Hyperfocus teal — primary accent, CTAs, active states
        brand: {
          50: '#e6f3f3',
          100: '#c2e0e1',
          200: '#9bcccd',
          300: '#6fb4b6',
          400: '#3d9398',
          500: '#01696f',
          DEFAULT: '#01696f',
          600: '#015b60',
          700: '#014a4e',
          800: '#01393c',
          900: '#002527',
        },
        // Surfaces
        ink: '#0d0d0d', // dark bg (Mission Control)
        card: '#1a1a1a', // dark card surface
        paper: '#f9f9f7', // light bg (public shop)
      },
      fontFamily: {
        heading: ['var(--font-space-grotesk)', 'sans-serif'],
        body: ['var(--font-inter)', 'sans-serif'],
      },
      // 4px grid spacing system
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)',
        'card-hover': '0 2px 4px rgba(0,0,0,0.08), 0 12px 32px rgba(0,0,0,0.10)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
export default config
