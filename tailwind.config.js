/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'azul-eclipse': '#313169', // Nome personalizado para a cor
        'off-white': '#F8F8F8'
      },
    },
  },
  plugins: [],
}

