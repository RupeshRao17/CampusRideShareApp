/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.tsx', './src/**/*.tsx'],
  theme: {
    extend: {
      colors: {
        primary: '#1E88E5',
        secondary: '#26A69A',
        background: '#F7FAFC'
      }
    }
  },
  plugins: []
};