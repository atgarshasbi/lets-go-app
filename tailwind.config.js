/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-10px)' },
          '40%': { transform: 'translateX(10px)' },
          '60%': { transform: 'translateX(-10px)' },
          '80%': { transform: 'translateX(10px)' },
        },
        checkPop: {
          '0%': { transform: 'scale(1)' },
          '40%': { transform: 'scale(0.93)' },
          '70%': { transform: 'scale(1.07)' },
          '100%': { transform: 'scale(1)' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '60%': { transform: 'scale(1.25)', opacity: '1' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        shake: 'shake 0.45s ease',
        'check-pop': 'checkPop 0.3s ease',
        'bounce-in': 'bounceIn 0.5s ease-out both',
      },
    },
  },
  plugins: [],
}

