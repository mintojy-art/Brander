/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['Poppins', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
        stencil: ['"Black Ops One"', 'cursive'],
      },
      colors: {
        oric: {
          black:  '#000000',
          dark:   '#1D1D1F',
          mid:    '#424245',
          muted:  '#86868B',
          border: '#D2D2D7',
          gray:   '#F5F5F7',
          white:  '#FFFFFF',
        },
      },
    },
  },
  plugins: [],
}
