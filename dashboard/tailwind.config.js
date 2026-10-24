/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        abyss: "#FDF6E3",
        panel: "#FAF3E0",
        raised: "#F5E6C8",
        "raised-hover": "#EFE0BF",
        stroke: "#D8C9B3",
        "stroke-strong": "#C0A080",
        cream: {
          DEFAULT: "#FDF6E3",
          cornsilk: "#FFF8DC",
          light: "#FFFDF5",
        },
        land: {
          DEFAULT: "#F5E6C8",
          tan: "#EBDCB9",
        },
        water: {
          DEFAULT: "#B8D8D8",
          deep: "#97C4C4",
        },
        roads: {
          DEFAULT: "#C0A080",
          warmgray: "#B0B0A0",
        },
        sonar: {
          DEFAULT: "#267E7E",
          dim: "#1B5E5E",
          light: "#E1F2F2",
        },
        signal: {
          DEFAULT: "#B86B1B",
          dim: "#7A4510",
          light: "#FDF2E2",
        },
        danger: {
          DEFAULT: "#C53B3B",
          dim: "#852222",
          light: "#FDEAEA",
        },
        ink: {
          DEFAULT: "#3E3E3E",
          dark: "#2C2421",
          muted: "#5A4A42",
          faint: "#8A766B",
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
