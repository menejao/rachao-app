import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx}",
    "../../packages/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          ink: "#10261a",
          grass: "#355b3f",
          sand: "#efe6d2",
          accent: "#d97706"
        }
      }
    }
  },
  plugins: []
};

export default config;
