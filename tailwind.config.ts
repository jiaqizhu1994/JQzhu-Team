import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/data/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        academic: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          500: "#2563EB",
          700: "#0B3D91",
          950: "#020617",
        },
        quantum: {
          cyan: "#38BDF8",
          green: "#22C55E",
        },
      },
      boxShadow: {
        soft: "0 18px 50px rgba(15, 23, 42, 0.08)",
        card: "0 12px 35px rgba(2, 6, 23, 0.08)",
      },
      borderRadius: {
        card: "20px",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
