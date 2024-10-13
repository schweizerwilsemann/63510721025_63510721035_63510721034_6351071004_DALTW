/** @type {import('tailwindcss').Config} */
const flowbite = require("flowbite-react/tailwind");

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", flowbite.content()],
  theme: {
    extend: {
      colors: {
        "pie-chart-bg": "#f8f9fa",
      },
    },
  },
  variants: {
    extend: {
      overflow: ["hover", "focus"],
    },
  },
  plugins: [require("tailwind-scrollbar"), flowbite.plugin()],
};
