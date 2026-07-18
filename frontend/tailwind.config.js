/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'navy': '#1a1a1a',
        'sage': '#a8b87d',
        'gray-light': '#f5f5f5',
      },
      borderRadius: {
        'xl': '1.5rem',
        'lg': '1rem',
      },
    },
  },
  plugins: [],
}
