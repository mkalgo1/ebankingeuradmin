/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        finance: {
          bg: '#F5F7FA',
          card: '#FFFFFF',
          dark: '#111317',
          leather: '#181A1F',
          blue: '#2563EB',
          blueLight: '#3B82F6',
          green: '#10B981',
          greenLight: '#DCFCE7',
          grayText: '#717680',
          border: '#EAECF0'
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'soft-card': '0 8px 30px rgba(0, 0, 0, 0.04)',
        'floating-dock': '0 12px 36px rgba(0, 0, 0, 0.25)',
        'leather-stitch': 'inset 0 1px 1px rgba(255,255,255,0.1), 0 8px 24px rgba(0,0,0,0.35)',
        'blue-glow': '0 0 16px rgba(37, 99, 235, 0.35)'
      }
    },
  },
  plugins: [],
}
