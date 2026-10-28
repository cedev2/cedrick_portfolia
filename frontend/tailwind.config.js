/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        /* Teal - the primary brand colour taken from the reference design. */
        primary: {
          50: '#F2F8F4',
          100: '#E3F2EE',
          200: '#C3E6E2',
          300: '#93CCC5',
          400: '#6FBDB4',
          500: '#4AAEA6',
          600: '#3B8F89',
          700: '#2F716D',
          800: '#275A57',
          900: '#214B49',
        },
        /* Warm sand - the secondary surface colour. */
        sand: {
          50: '#FBF7F5',
          100: '#F5EDE9',
          200: '#EBD9D1',
          300: '#DEC0B5',
          400: '#C9A492',
          500: '#B08A75',
        },
        /* Deep ink - text and dark surfaces. */
        ink: {
          DEFAULT: '#241F1A',
          900: '#1A1613',
          800: '#241F1A',
          700: '#3A332C',
          600: '#4A4239',
          500: '#5C5349',
          400: '#8A8076',
          300: '#B3ABA1',
          200: '#D8D2CA',
          100: '#E7E2DC',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 10px 40px -12px rgba(36, 31, 26, 0.18)',
        'card-hover': '0 18px 50px -12px rgba(74, 174, 166, 0.35)',
        soft: '0 4px 20px -6px rgba(36, 31, 26, 0.12)',
      },
      backgroundImage: {
        'teal-gradient': 'linear-gradient(135deg, #4AAEA6 0%, #6FBDB4 50%, #93CCC5 100%)',
        'sand-gradient': 'linear-gradient(135deg, #DEC0B5 0%, #EBD9D1 100%)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(1)', opacity: '0.6' },
          '100%': { transform: 'scale(1.8)', opacity: '0' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'typing-dot': {
          '0%, 60%, 100%': { transform: 'translateY(0)', opacity: '0.4' },
          '30%': { transform: 'translateY(-6px)', opacity: '1' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 2s ease-out infinite',
        'fade-up': 'fade-up .5s ease both',
        'typing-dot': 'typing-dot 1.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
