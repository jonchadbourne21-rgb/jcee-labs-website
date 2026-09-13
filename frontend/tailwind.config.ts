import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#10233d",
        paper: "#f7f5ef",
        cyan: "#00a8b5",
        safety: "#f26b38"
      }
    }
  },
  plugins: []
};

export default config;
