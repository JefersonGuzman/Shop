/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Monochrome Apple-like theme
        background: '#f5f5f7',
        surface: '#ffffff',
        brand: '#111111',
        primary: '#007AFF', // Color azul de iOS para botones principales
        text: '#0a0a0a',
        mutedText: '#6b7280',
        border: '#e5e7eb',
      },
      boxShadow: {
        card: '0 8px 30px rgba(0,0,0,0.06)'
      },
      borderRadius: {
        xl: '0.75rem',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};