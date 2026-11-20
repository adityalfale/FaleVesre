import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F5F8FC",
        navy: {
          950: "#091724",
          900: "#102A43",
          800: "#1A365D",
          700: "#244A77",
          600: "#336699",
        },
        aqua: {
          primary: "#1769AA",
          light: "#2E86DE",
          cyan: "#22B8CF",
          tint: "#EBF5FB",
        },
        status: {
          success: "#16A36A",
          warning: "#E9A23B",
          danger: "#DC5555",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 1px 3px rgba(16, 42, 67, 0.06), 0 1px 2px rgba(16, 42, 67, 0.04)",
        card: "0 4px 6px -1px rgba(16, 42, 67, 0.05), 0 2px 4px -2px rgba(16, 42, 67, 0.05)",
        cardHover: "0 10px 15px -3px rgba(16, 42, 67, 0.08), 0 4px 6px -4px rgba(16, 42, 67, 0.04)",
        dropdown: "0 10px 25px -5px rgba(16, 42, 67, 0.15)",
      },
    },
  },
  plugins: [],
};
export default config;

