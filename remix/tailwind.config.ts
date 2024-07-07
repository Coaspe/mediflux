import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeOut: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.5s ease-in-out",
        fadeOut: "fadeOut 0.5s ease-in-out",
      },
      fontFamily: {
        noto: ["Noto Serif KR", "serif"],
        playfair: ["Playfair Display"],
        work: ["Work Sans"],
      },
      maxWidth: {
        "custom-width": "min(calc(24 * 22), calc(100vw - 2 * 0))",
      },
      colors: {
        button: "#00143C",
        alarmButtonBg: "#fffae8",
        alarmButtonLine: "#febd32",
      },
    },
  },
  plugins: [],
} satisfies Config;
