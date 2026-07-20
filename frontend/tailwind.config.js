/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        saffron: {
          50: '#fffcf7',
          100: '#fef3e3',
          200: '#fce3c1',
          300: '#fac790',
          400: '#f7a458',
          500: '#f37e22', // Pure Saffron
          600: '#db6212',
          700: '#b64a0e',
          800: '#923b10',
          900: '#753010',
        },
        gold: {
          50: '#fdfbf0',
          100: '#faf3d1',
          200: '#f3e39e',
          300: '#eaca63',
          400: '#e1b138',
          500: '#d4af37', // Metallic Gold
          600: '#b89025',
          700: '#96701c',
          800: '#765418',
          900: '#614416',
        },
        cream: {
          50: '#fdfcf9',
          100: '#faf6ee',
          200: '#f3ead8',
          300: '#e7d8bd',
          400: '#d6c19a',
          500: '#c5a97a',
          600: '#b5925f',
          700: '#99764b',
          800: '#7d5c3b',
          900: '#674a32',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
        serif: ['Cinzel', 'Playfair Display', 'serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(243, 126, 34, 0.04)',
        'glass-hover': '0 12px 40px 0 rgba(243, 126, 34, 0.08)',
        'gold-glow': '0 0 15px rgba(212, 175, 55, 0.25)',
      }
    },
  },
  plugins: [],
}
