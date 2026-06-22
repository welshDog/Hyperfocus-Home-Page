import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'hf-bg': '#F5F5F5',
        'hf-text': '#1F1F1F',
        'hf-blue': '#0066CC',
        'hf-orange': '#CC6600',
        'hf-green': '#006633',
        'hf-purple': '#663366',
        'hf-comment': '#888888',
        'hf-error': '#DD4400',
      },
      fontFamily: {
        dyslexic: ['OpenDyslexic', 'Lexend', 'sans-serif'],
        body: ['Lexend', 'sans-serif'],
      },
      lineHeight: {
        'nd': '1.8',
      },
      spacing: {
        '18': '4.5rem',
      },
    },
  },
  plugins: [],
}
export default config
