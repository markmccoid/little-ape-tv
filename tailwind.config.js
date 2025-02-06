/** @type {import('tailwindcss').Config} */
const { hairlineWidth } = require('nativewind/theme');

module.exports = {
  content: ['./src/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      borderWidth: {
        hairline: hairlineWidth(),
      },
      colors: {
        primary: 'var(--color-primary)',
        secondary: {
          DEFAULT: 'var(--color-secondary)',
        },
        background: {
          DEFAULT: 'var(--color-background)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
        },
        text: 'var(--color-text)',
        card: 'var(--color-card)',
        border: 'var(--color-border)',
        button: 'var(--color-button)',
        buttontext: 'var(--color-button-text)',
        overlay: 'var(--color-overlay)',
      },
    },
  },
  plugins: [],
};
