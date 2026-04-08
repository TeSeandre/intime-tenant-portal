/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          cream:      '#F0EBE1',
          charcoal:   '#2E2E2E',
          terra:      '#B5622A',
          'terra-lt': '#D4834E',
          'terra-dk': '#8C4A1E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
