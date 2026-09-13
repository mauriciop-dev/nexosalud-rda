/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#0284c5",
        "background-light": "#f5f7f8",
        "background-dark": "#0f1c23",
        "success": "#10B981",
        "warning": "#3b82f6",
        "danger": "#ef4444",
      },
    },
  },
  plugins: [],
};
module.exports = config;
