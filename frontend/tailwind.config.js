/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js}'
  ],
  theme: {
    extend: {
      colors: {
        electro: {
          black: '#050505',
          dark: '#101010',
          card: '#151515',
          green: '#00FF55',
          light: '#39FF7A'
        }
      },
      boxShadow: {
        neon: '0 0 15px rgba(0, 255, 85, 0.25)'
      }
    }
  },
  plugins: []
};