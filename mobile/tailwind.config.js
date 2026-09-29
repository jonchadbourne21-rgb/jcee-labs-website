/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: { extend: { colors: { aegis: { navy: '#10233D', cyan: '#18C3CC', paper: '#F7F5EF', orange: '#E86F32' } } } },
  plugins: [],
};
