/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Obsidian Integrity Palette
        'obsidian': {
          DEFAULT: '#0a0e16',
          canvas: '#0a0e16',
          surface: '#0f131c',
          card: '#181c24',
          subtle: '#1c2028',
          elevated: '#262a33',
          border: 'rgba(255, 255, 255, 0.08)',
        },
        // Legacy fallbacks mapped to premium refined equivalents
        'navy': '#0f131c',
        'sage': '#10b981',
        'gold': '#f59e0b',
        'gray-dark': '#181c24',
        'card-dark': '#181c24',
        // High fidelity accents
        'emerald-accent': '#10b981',
        'emerald-bright': '#4edea3',
        'amber-accent': '#f59e0b',
        'amber-bright': '#ffb95f',
        'coral-accent': '#ef4444',
        'coral-bright': '#ffb4ab',
        'indigo-accent': '#6366f1',
        'indigo-bright': '#c0c1ff',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'xs': '0.125rem',
        'sm': '0.25rem',
        'DEFAULT': '0.375rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'glow-emerald': '0 0 20px -4px rgba(16, 185, 129, 0.35)',
        'glow-amber': '0 0 20px -4px rgba(245, 158, 11, 0.35)',
        'glow-coral': '0 0 20px -4px rgba(239, 68, 68, 0.35)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
    },
  },
  plugins: [],
}

