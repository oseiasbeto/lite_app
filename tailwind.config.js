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
        // Usando variáveis CSS
        primary: '#f52936',
        secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
        tertiary: 'rgb(var(--color-tertiary) / <alpha-value>)',
        blue: '#4894fd',
        success: '#328f5a',
        warning: '#e95111',
        danger: '#f52936',
        info: 'rgb(var(--color-info) / <alpha-value>)',
      },
      fontFamily: {
        primary: ['Roboto', 'sans-serif'],
        secondary: ['InterVariable, "Segoe UI Emoji"', 'sans-serif']
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'spin-slow': 'spin 2s linear infinite',
      },
      keyframes: {
        dotPulse: {
          '0%, 80%, 100%': {
            transform: 'scale(0.3)',
            opacity: '0',
          },
          '40%': {
            transform: 'scale(1)',
            opacity: '0.5',
          },
        },
      },
      animation: {
        dotPulse: 'dotPulse 1.4s infinite ease-in-out',
      },
    },
  },
  plugins: [],
}