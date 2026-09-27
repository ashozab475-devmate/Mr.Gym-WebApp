/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#F3EFE6",
        ink: "#171613",
        coral: "#E2492F",
        gold: "#F0B429",
        stone: "#8B8579",
        stoneLight: "#D8D2C4",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      },
    },
  },
  plugins: [],
};
