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
      },
      fontFamily: {
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
