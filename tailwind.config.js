/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        'fade-in-down': {
          '0%': {
            opacity: '0',
            transform: 'translateY(-10px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        'fade-in-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(10px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        'pulse-glow': {
          '0%, 100%': {
            'box-shadow': '0 0 0 0 rgba(108, 99, 255, 0.4)'
          },
          '70%': {
            'box-shadow': '0 0 0 10px rgba(108, 99, 255, 0)'
          },
          '100%': {
            'box-shadow': '0 0 0 0 rgba(108, 99, 255, 0)'
          },
        }
      },
      animation: {
        'fade-in-down': 'fade-in-down 0.6s ease-out',
        'fade-in-up': 'fade-in-up 0.6s ease-out',
        'pulse-glow': 'pulse-glow 2s infinite',
      },
    },
  },
  plugins: [],
};
