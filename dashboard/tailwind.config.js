/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        abyss: "#F8FAFC",
        panel: "#FFFFFF",
        raised: "#F1F5F9",
        "raised-hover": "#E2E8F0",
        stroke: "#E2E8F0",
        "stroke-strong": "#CBD5E1",
        cream: {
          DEFAULT: "#F8FAFC",
          cornsilk: "#F1F5F9",
          light: "#FFFFFF",
        },
        land: {
          DEFAULT: "#F1F5F9",
          tan: "#E2E8F0",
        },
        water: {
          DEFAULT: "#BAE6FD",
          deep: "#7DD3FC",
        },
        roads: {
          DEFAULT: "#94A3B8",
          warmgray: "#CBD5E1",
        },
        sonar: {
          DEFAULT: "#0891B2",
          dim: "#0E7490",
          light: "#E0F7FA",
        },
        signal: {
          DEFAULT: "#D97706",
          dim: "#B45309",
          light: "#FEF3C7",
        },
        danger: {
          DEFAULT: "#DC2626",
          dim: "#B91C1C",
          light: "#FEE2E2",
        },
        ink: {
          DEFAULT: "#1E293B",
          dark: "#0F172A",
          muted: "#475569",
          faint: "#94A3B8",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "system-ui", "sans-serif"],
        body: ["'Inter'", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "ui-monospace", "monospace"],
      },
      boxShadow: {
        panel: "0 1px 3px rgba(90, 74, 66, 0.08), 0 8px 24px rgba(90, 74, 66, 0.12)",
        card: "0 1px 2px rgba(90, 74, 66, 0.06)",
      },
      keyframes: {
        pulse_travel: {
          "0%": { transform: "translateY(0)", opacity: "0" },
          "10%": { opacity: "1" },
          "90%": { opacity: "1" },
          "100%": { transform: "translateY(var(--travel, 100px))", opacity: "0" },
        },
        sweep: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        pulse_travel: "pulse_travel 2.4s linear infinite",
        sweep: "sweep 4s linear infinite",
      },
    },
  },
  plugins: [],
};
