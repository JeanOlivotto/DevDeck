import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          dark: '#181c2f',
          light: '#e0e6ff',
          accent: '#00eaff',
          purple: '#a259ff',
          pink: '#ff2d92',
        },
        secondary: {
          container: '#23284a',
          input: '#1e223b',
          border: '#3a416f',
          hover: '#4a517e',
        },
      },
      backgroundColor: {
        'primary-dark': '#181c2f',
        'secondary-dark': '#23284a',
        'input-dark': '#1e223b',
      },
      borderColor: {
        'primary-border': '#3a416f',
        'purple-accent': '#a259ff',
        'cyan-accent': '#00eaff',
      },
    },
  },
  plugins: [],
}
export default config
