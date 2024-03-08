/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    colors: {
      transparent: 'transparent',
      'background': '#F5F5F5',
      'white': '#FFFFFF',
      'sidebar-active': '#BCD8F1',
      'primary': '#0095FF',
      'gray': '#808080',
    },
    extend: {
      fontFamily: {
        meiryo: ["Meiryo", "sans-serif"],
        meiryo: ["Noto Sans", "sans-serif"],
      },
    },
  },
}

