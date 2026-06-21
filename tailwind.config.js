/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        appBg: "var(--color-bg)",
        appSurface: "var(--color-surface)",
        appBorder: "var(--color-border)",
        primary: {
          DEFAULT: "var(--color-primary)",
          hover: "var(--color-primary-hover)",
        },
        success: "var(--color-success)",
        error: "var(--color-error)",
        appText: {
          DEFAULT: "var(--color-text)",
          muted: "var(--color-text-muted)",
        },
        accent: "var(--color-accent)",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Space Grotesk', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
