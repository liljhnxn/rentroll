import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: {
          950: "#0b0d10",
          900: "#101318",
          850: "#151920",
          800: "#1b212b",
          700: "#27303d",
          600: "#384454",
        },
        brand: {
          purple: "#9d72ff",
          purpleDark: "#6b3bd6",
          purpleMuted: "rgba(157, 114, 255, 0.15)",
          green: "#22c55e",
          greenDark: "#15803d",
          greenMuted: "rgba(34, 197, 94, 0.15)",
        },
      },
    },
  },
  plugins: [],
};

export default config;

