/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Public Sans', 'sans-serif'],
        mono: ['Iosevka', 'monospace'],
      },
      colors: {
        charcoal: {
          DEFAULT: 'var(--charcoal)',
          secondary: 'var(--charcoal-secondary)',
        },
        teal: {
          DEFAULT: 'var(--teal)',
          420: 'var(--teal-420)',
          700: 'var(--teal-700)',
        },
      },
      backgroundImage: {
        'card-radial':
          'radial-gradient(33% 50% at 15% 44%, var(--rust), transparent),radial-gradient(33% 40% at 105% 42%, var(--teal), transparent),radial-gradient(33% 80% at 85% 124%, var(--teal), transparent)',
        'button-gradient':
          'linear-gradient(90deg, var(--teal-700) 0%, var(--sand-700) 25%, var(--rust-600) 50%, var(--rust-600) 50%, var(--sand-700) 75%, var(--teal-700) 100%)',
        'text-linear': 'linear-gradient(90deg, var(--teal-700), var(--sand-700), var(--rust-600))',
        'button-gradient-secondary':
          'linear-gradient(90deg, var(--teal-420) 0%, var(--sand-420) 50%, var(--rust-420) 100%)',
        logo: "url('./static/penumbra-logo.svg')",
      },
    },
  },
  plugins: [],
}

