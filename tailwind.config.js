/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#FF8C00', // Orange from the design
        'dark': '#000000',    // Black background
      },
    },
  },
  plugins: [],
}

