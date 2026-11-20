/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: { colors: { emerald: { 200: '#c8dbf4', 300: '#9bc7ff', 400: '#e6f0ff', 500: '#4a9bff', 600: '#d50a0a', 700: '#497eb8', 900: '#003369', 950: '#001d3c' } } } },
  plugins: [],
}
