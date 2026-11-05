/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: '#0C1216',
        teal: { DEFAULT: '#4EC2C6', dark: '#0F7C81' },
        amber: { DEFAULT: '#A96F1A' }
      }
    }
  },
  plugins: []
}
