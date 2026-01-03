/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1A4D2E",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#F5F5F0",
          foreground: "#1A4D2E",
        },
        accent: {
          DEFAULT: "#84CC16",
          foreground: "#000000",
        },
        background: {
          light: "#FFFFFF",
          dark: "#0F1C13",
        },
        surface: {
          light: "#F9FAFB",
          dark: "#15231A",
        },
        muted: {
          DEFAULT: "#E5E7EB",
          foreground: "#6B7280",
        },
        border: "#E5E7EB",
        input: "#E5E7EB",
        ring: "#1A4D2E",
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        lg: "1rem",
        md: "0.75rem",
        sm: "0.5rem",
      },
      boxShadow: {
        card: "0 4px 6px -1px rgba(26, 77, 46, 0.1), 0 2px 4px -1px rgba(26, 77, 46, 0.06)",
        hover: "0 10px 15px -3px rgba(26, 77, 46, 0.1), 0 4px 6px -2px rgba(26, 77, 46, 0.05)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
