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
        secondary: '#1471ff',
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
      }
    },
  },
  plugins: [],
}