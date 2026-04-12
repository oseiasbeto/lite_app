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
        primary: '#b92b27',
        secondary: '#1471ff',
        tertiary: 'rgb(var(--color-tertiary) / <alpha-value>)',
        blue: '#4894fd',
        success: '#328f5a',
        warning: '#e95111',
        greyDark: '#b1b3b6',
        grey: '#939598',
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