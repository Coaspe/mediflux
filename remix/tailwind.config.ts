import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        noto: ["Noto Serif KR", "serif"],
        playfair: ["Playfair Display"],
        work: ["Work Sans"]
      },
      maxWidth: {
        "custom-width": "min(calc(24 * 22), calc(100vw - 2 * 0))",
      },
      colors: {
        button: "#00143C",
        alarmButtonBg: "#fffae8",
        alarmButtonLine: "#febd32"
      },
    },
  },
  plugins: [],
} satisfies Config;
