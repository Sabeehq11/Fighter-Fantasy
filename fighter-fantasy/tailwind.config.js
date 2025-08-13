/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': 'var(--bg-primary)',
        'bg-secondary': 'var(--bg-secondary)',
        'bg-tertiary': 'var(--bg-tertiary)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-tertiary': 'var(--text-muted)',
        'text-muted': 'var(--text-muted)',
        'accent': 'var(--accent-red)',
        'accent-hover': '#b91c1c',
        'accent-red': 'var(--accent-red)',
        'accent-gold': 'var(--accent-gold)',
        'accent-green': 'var(--accent-green)',
        'accent-blue': 'var(--accent-blue)',
        'border': 'var(--border)',
        'border-light': 'var(--border-light)',
      },
    },
  },
  plugins: [],
} 