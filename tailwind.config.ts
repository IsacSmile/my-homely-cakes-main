import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['var(--font-heading)', 'Georgia', 'serif'],
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        price: ['var(--font-price)', 'Montserrat', 'sans-serif'],
        montserrat: ['var(--font-price)', 'Montserrat', 'sans-serif'],
      },
      colors: {
        bakery: {
          bg: '#FAF7F2',
          softBg: '#F5EFE6',
          chocolate: '#2C1A14',
          chocolateLight: '#3D261E',
          gold: '#D97706',
          goldLight: '#F59E0B',
          rose: '#E11D48',
          100: '#FAF4EB',
          200: '#EAD1B6',
          300: '#DBB088',
          400: '#C88D58',
          500: '#B26C33',
          600: '#8E552D',
          700: '#6B3E20',
          800: '#4D2B16',
          900: '#2C1A14',
        },
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(44, 26, 20, 0.06)',
        'soft-lg': '0 10px 30px -4px rgba(44, 26, 20, 0.12)',
      },
    },
  },
  plugins: [],
};
export default config;
