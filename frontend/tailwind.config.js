/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb', // blue-600
          dark: '#3b82f6', // blue-500
        },
        'text-primary': {
          DEFAULT: '#0f172a', // dark blue/black for light mode
          dark: '#f1f5f9', // white for dark mode
        },
        secondary: {
          DEFAULT: '#60a5fa', // blue-400
        },
        border: {
          DEFAULT: '#e0e7ef',
          dark: '#334155',
        },
        navbar: {
          DEFAULT: '#ffffffcc', // glass white
          dark: '#1e293bcc', // glass dark
        },
        footer: {
          DEFAULT: '#e0e7ef',
          dark: '#1e293b',
        },
        'text-muted': {
          DEFAULT: '#64748b', // gray-500
          dark: '#cbd5e1', // lighter gray for better contrast in dark
        },
      },
    },
  },
  plugins: [],
};
