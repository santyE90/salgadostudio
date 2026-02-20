/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        midnight: "#081A3C",
        ocean: "#0D2B5B",
        gold: "#D4AF37",
        cream: "#F9F4E6"
      },
      fontFamily: {
        display: ["Cormorant Garamond", "serif"],
        body: ["Source Sans 3", "sans-serif"]
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(212, 175, 55, 0.35), 0 10px 40px rgba(5, 13, 31, 0.5)"
      },
      backgroundImage: {
        aura: "radial-gradient(circle at 20% 20%, rgba(212,175,55,0.25), transparent 35%), radial-gradient(circle at 80% 10%, rgba(255,255,255,0.12), transparent 40%), linear-gradient(165deg, #071534 0%, #0b2c66 55%, #081a3c 100%)"
      }
    }
  },
  plugins: []
};
