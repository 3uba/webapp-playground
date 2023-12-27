/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {},
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        '.animate-fadeOut': {
          '@keyframes fadeOut': {
            '0%': { opacity: '1' },
            '100%': { opacity: '0' },
          },
          animation: 'fadeOut 500ms ease-in-out 3000ms',
        },
      };

      addUtilities(newUtilities, ['responsive', 'hover']);
    },
  ],
};
