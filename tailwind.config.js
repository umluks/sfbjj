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
          50: '#FAFAFA',
          100: '#F4F4F5',
          200: '#E4E4E7',
          300: '#D4D4D8',
          400: '#A1A1AA',
          500: '#F4F4F5', // Premium Silver-White
          600: '#E4E4E7', // Neutral Gray-Silver
          700: '#71717A',
          800: '#52525B',
          900: '#3F3F46',
          950: '#18181B',
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
          750: '#202022',
          800: '#18181A', // Card / Sidebar Backgrounds
          850: '#131315',
          900: '#0F0F11', // Deep Workspace Background
          950: '#080809',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'gold-glow': '0 0 15px rgba(244, 244, 245, 0.1)',
        'gold-glow-lg': '0 0 25px rgba(244, 244, 245, 0.15)',
      }
    },
  },
  plugins: [],
}
