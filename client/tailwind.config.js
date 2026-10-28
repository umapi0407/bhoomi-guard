/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        forest: {
          deep: '#10281F',
          DEFAULT: '#1F4D3C',
          moss: '#2E7D5B',
          light: '#3C8A69',
        },
        mist: {
          DEFAULT: '#EAF2EE',
          dark: '#D8E5DF',
        },
        slateText: '#34433C',
        risk: {
          green: '#2E7D5B',
          yellow: '#F2B84B',
          orange: '#E8833A',
          red: '#C8442F',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
