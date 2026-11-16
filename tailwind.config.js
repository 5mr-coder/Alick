/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // All shadcn utilities resolve to the site's theme tokens, which are
        // re-mapped for light mode in globals.css. Full colour values (not
        // `hsl(var(--x))`) so rgba tokens are valid.
        border: "var(--border)",
        input: "var(--border)",
        ring: "var(--ring)",
        background: "var(--ash-950)",
        foreground: "var(--heading)",
        primary: {
          DEFAULT: "var(--gold-400)",
          foreground: "var(--on-gold)",
        },
        secondary: {
          DEFAULT: "var(--ash-800)",
          foreground: "var(--heading)",
        },
        destructive: {
          DEFAULT: "var(--danger)",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "var(--ash-800)",
          foreground: "var(--ash-400)",
        },
        accent: {
          DEFAULT: "var(--ash-800)",
          foreground: "var(--heading)",
        },
        popover: {
          DEFAULT: "var(--surface)",
          foreground: "var(--heading)",
        },
        card: {
          DEFAULT: "var(--surface)",
          foreground: "var(--heading)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
