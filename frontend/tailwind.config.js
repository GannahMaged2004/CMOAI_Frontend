/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {

      keyframes: {
        "shrink-expand": {
          "0%,100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.08)" },
        },
      },

      animation: {
        "shrink-expand": "shrink-expand 2.5s ease-in-out infinite",
      },

      boxShadow: {
        neonPurple: "0 15px 40px rgba(191,0,255,0.45)",
        neonBlue: "0 15px 40px rgba(59,224,255,0.45)",
        neonGreen: "0 15px 40px rgba(0,255,0,0.35)",
        neonPink: "0 15px 40px rgba(254,1,154,0.45)",
        neonYellow: "0 15px 40px rgba(255,255,0,0.45)",
        neonRed: "0 15px 40px rgba(255,0,0,0.45)",
      },

      colors: {
        cosmic: "#0A0A0F",
        spacePurple: "#3B0A57",
        electricPurple: "#B026FF",

        neonPurple: "#bf00ff",
        neonBlue: "#3BE0FF",
        neonPink: "#fe019a",
        neonYellow: "#ffff00",
        neonGreen: "#00ff00",
        neonRed: "#ff0000",
      },

    },
  },

  plugins: [require("tailwindcss-animate")],
};