/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Telegram usa 'class' (muda manualmente no app)
  theme: {
    extend: {
      colors: {
        x: {
          // === DARK MODE (padrão do X) ===
          dark: {
            bg: '#000000',
            surface: '#18181b',
            surfaceHover: '#16181C',
            surfaceActive: '#202327',
            border: '#2F3336',
            borderHover: '#3A3F45',

            textPrimary: '#E7E9EA',
            textSecondary: '#71767B',
            textTertiary: '#536471',

            blue: '#1D9BF0',
            blueHover: '#1A8CD8',
            blueActive: '#1878B9',
            blueFocus: '#1D9BF0',

            grayHover: '#272C30',   // hover em botões cinza
            grayActive: '#3A3F45',
          },

          // === LIGHT MODE ===
          light: {
            bg: '#FFFFFF',
            surface: '#f3f4f6',
            surfaceHover: '#EFF3F4',
            surfaceActive: '#E6EAEB',
            border: '#CFD9DE',
            borderHover: '#B0B9C2',

            textPrimary: '#0F1419',
            textSecondary: '#536471',
            textTertiary: '#657786',

            blue: '#1D9BF0',
            blueHover: '#1A8CD8',
            blueActive: '#1878B9',
            blueFocus: '#1D9BF0',

            grayHover: '#F0F2F3',
            grayActive: '#E5E9EB',
          }
        }
      },
      fontFamily: {
        primary: ['Roboto', 'sans-serif']
      }
    },
  },
  plugins: [],
}