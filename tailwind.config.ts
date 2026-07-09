import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/**/*.{vue,js,ts}',
    './app.vue',
  ],
  theme: {
    extend: {
      colors: {
        pine: {
          50: '#f0faf5',
          100: '#dcf2e7',
          200: '#bbdfd0',
          300: '#8cc7b0',
          400: '#5aaa8b',
          500: '#3a8f70',
          600: '#2d6a4f',
          700: '#235641',
          800: '#1c4435',
          900: '#16372c',
        },
        maple: {
          50: '#fef5f2',
          100: '#fde8e2',
          200: '#fbd0c6',
          300: '#f7ad9e',
          400: '#ef7d6b',
          500: '#e55240',
          600: '#bc4749',
          700: '#9c3337',
          800: '#822d30',
          900: '#6e2a2c',
        },
        royal: {
          50: '#eef2fc',
          100: '#dbe4f8',
          200: '#b7c9f1',
          300: '#8ea9e6',
          400: '#5f7dd4',
          500: '#3d5abf',
          600: '#2c47a3',
          700: '#1e3a8a',
          800: '#182e6d',
          900: '#141f52',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
