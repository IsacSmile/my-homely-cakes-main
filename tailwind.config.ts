import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bakery: {
          50: '#FDFBF7',
          100: '#FAF4EB',
          200: '#F5E8D8',
          300: '#EAD1B6',
          400: '#DBB088',
          500: '#C88D58',
          600: '#B4713E',
          700: '#8E552D',
          800: '#5F3921',
          900: '#2A1810',
          accent: '#D97706',
          rose: '#D9534F',
          softBg: '#FAF7F2',
          cream: '#FFFDF9',
          card: '#FFFFFF',
          chocolate: '#2C1A14',
          chocolateLight: '#3D2820',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(42, 24, 16, 0.06), 0 2px 6px -1px rgba(42, 24, 16, 0.04)',
        'soft-lg': '0 10px 30px -4px rgba(42, 24, 16, 0.1), 0 4px 12px -2px rgba(42, 24, 16, 0.05)',
        'glow': '0 0 25px rgba(217, 119, 6, 0.25)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
};
export default config;
