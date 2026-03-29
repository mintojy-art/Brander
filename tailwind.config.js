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
      keyframes: {
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        slideIn: 'slideIn 0.2s ease-out',
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
