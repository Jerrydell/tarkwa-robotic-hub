import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Base surfaces — layered dark, not flat black
        background: "#0A0B0F",
        surface: "#14161B",
        "surface-elevated": "#1C1F26",
        border: "#262A33",

        // Text
        foreground: "#E6E8EB",
        muted: "#8B93A1",

        // Primary tech accent — electric cyan/blue, used for CTAs, active states, glow
        primary: {
          DEFAULT: "#3ECFFF",
          dark: "#0EA5C4",
          muted: "#1B4A57",
        },

        // Secondary school-identity accent — army green, used sparingly
        identity: {
          DEFAULT: "#5A6E3A",
          dark: "#333D1F",
          light: "#7C9457",
        },

        // Semantic status, desaturated to sit in the dark palette
        success: "#34D399",
        warning: "#FBBF24",
        danger: "#F87171",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
      boxShadow: {
        glow: "0 0 24px 0 rgba(62, 207, 255, 0.25)",
        "glow-strong": "0 0 40px 0 rgba(62, 207, 255, 0.4)",
        "glow-identity": "0 0 24px 0 rgba(124, 148, 87, 0.25)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(62, 207, 255, 0.4)" },
          "50%": { boxShadow: "0 0 0 8px rgba(62, 207, 255, 0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out forwards",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
