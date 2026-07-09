/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
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
        starPop: {
          '0%': { transform: 'scale(1) rotate(0deg)' },
          '30%': { transform: 'scale(1.7) rotate(-18deg)' },
          '60%': { transform: 'scale(1.3) rotate(14deg)' },
          '100%': { transform: 'scale(1) rotate(0deg)' },
        },
        floatUp: {
          '0%': { transform: 'translate(-50%, 0) scale(0.5)', opacity: '0' },
          '25%': { transform: 'translate(-50%, -14px) scale(1.15)', opacity: '1' },
          '75%': { transform: 'translate(-50%, -46px) scale(1)', opacity: '1' },
          '100%': { transform: 'translate(-50%, -70px) scale(1)', opacity: '0' },
        },
      },
      animation: {
        shake: 'shake 0.45s ease',
        'check-pop': 'checkPop 0.3s ease',
        'bounce-in': 'bounceIn 0.5s ease-out both',
        'star-pop': 'starPop 0.5s ease',
        'float-up': 'floatUp 1.2s ease-out forwards',
      },
    },
  },
  plugins: [],
}

