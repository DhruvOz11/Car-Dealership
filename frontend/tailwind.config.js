/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        asphalt: {
          950: "#0d0e11",
          900: "#14161a",
          800: "#1b1e24",
          700: "#262a32",
          600: "#343a44",
        },
        chrome: {
          100: "#f5f3ee",
          300: "#d8d5cc",
          500: "#9a9690",
        },
        ignition: {
          DEFAULT: "#ff5a1f",
          600: "#e6480f",
          100: "#ffe4d6",
        },
      },
      fontFamily: {
        display: ["'Barlow Condensed'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      backgroundImage: {
        "grille": "repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 8px)",
      },
    },
  },
  plugins: [],
};
