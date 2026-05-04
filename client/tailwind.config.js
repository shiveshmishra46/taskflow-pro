/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#17212b',
        brand: '#2563eb',
        mint: '#10b981',
        coral: '#f97316'
      },
      boxShadow: {
        soft: '0 12px 40px rgba(23, 33, 43, 0.08)'
      }
    }
  },
  plugins: []
};
