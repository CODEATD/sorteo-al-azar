/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        /* Mont es la tipografía oficial; Outfit es el respaldo web más cercano */
        display: ['Mont', '"Outfit"', 'sans-serif'],
        body:    ['Mont', '"Outfit"', 'sans-serif'],
      },
      colors: {
        rosa: {
          fucsia:  '#FF087E', // primario vibrante
          magenta: '#E20057', // color del logo
          coral:   '#FF4A8B',
          blush:   '#FF97C1',
          petal:   '#FFE3EE',
          cream:   '#FFF6F9',
          wine:    '#5C0A2E',
          night:   '#1C0512', // fondo de escenario
          ink:     '#3A0D22', // texto sobre claro
        },
      },
      keyframes: {
        'pop-in': {
          '0%':   { transform: 'scale(0.6)',   opacity: '0' },
          '70%':  { transform: 'scale(1.08)' },
          '100%': { transform: 'scale(1)',     opacity: '1' },
        },
        'slide-up': {
          '0%':   { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        'spin-slow': { to: { transform: 'rotate(360deg)' } },
        'sweep-l': {
          '0%,100%': { transform: 'rotate(18deg)' },
          '50%':     { transform: 'rotate(4deg)'  },
        },
        'sweep-r': {
          '0%,100%': { transform: 'rotate(-18deg)' },
          '50%':     { transform: 'rotate(-4deg)'  },
        },
      },
      animation: {
        'pop-in':   'pop-in 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'slide-up': 'slide-up 0.5s ease forwards',
        'spin-slow': 'spin-slow 12s linear infinite',
        'sweep-l':  'sweep-l 7s ease-in-out infinite',
        'sweep-r':  'sweep-r 8s ease-in-out infinite',
      },
      borderRadius: {
        '2xl': '20px',
        '3xl': '28px',
        '4xl': '36px',
      },
    },
  },
  plugins: [],
}
