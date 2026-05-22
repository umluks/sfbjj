/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FDFBF7',
          100: '#FBF4E4',
          200: '#F4E5BD',
          300: '#ECD08F',
          400: '#E2B85D',
          500: '#D4AF37', // Brand Premium Gold
          600: '#B8922A',
          700: '#947220',
          800: '#705419',
          900: '#4D3911',
          950: '#2A1E08',
        },
        obsidian: {
          50: '#F6F6F6',
          100: '#E7E7E8',
          200: '#C1C1C4',
          300: '#9C9CA0',
          400: '#75757A',
          500: '#535357',
          600: '#3D3D40',
          700: '#2A2A2C',
          800: '#18181A', // Card / Sidebar Backgrounds
          900: '#0F0F11', // Deep Workspace Background
          950: '#080809',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'gold-glow': '0 0 15px rgba(212, 175, 55, 0.15)',
        'gold-glow-lg': '0 0 25px rgba(212, 175, 55, 0.25)',
      }
    },
  },
  plugins: [],
}
