/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./landings/**/*.html", "./src/**/*.js"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Colores definidos como variables en src/style.css (cambian con el toggle)
        base: "rgb(var(--c-base) / <alpha-value>)",
        surface: "rgb(var(--c-surface) / <alpha-value>)",
        elevated: "rgb(var(--c-elevated) / <alpha-value>)",
        ink: "rgb(var(--c-ink) / <alpha-value>)",
        muted: "rgb(var(--c-muted) / <alpha-value>)",
        line: "rgb(var(--c-line) / <alpha-value>)",
        gold: "rgb(var(--c-gold) / <alpha-value>)"
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["'Plus Jakarta Sans'", "Inter", "sans-serif"]
      },
      maxWidth: { site: "1200px" }
    }
  },
  plugins: []
};
