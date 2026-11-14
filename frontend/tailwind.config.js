/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        primaryDark: '#1E3A8A',
        purpleAccent: '#7C3AED',
        lightBg: '#E5E7EB',
      },
      fontFamily: {
        heading: ['"Press Start 2P"', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        retro: '4px 4px 0 #000000',
      },
      borderWidth: {
        retro: '3px',
      },
      borderRadius: {
        retro: '6px',
      },
    },
  },
  plugins: [],
};

