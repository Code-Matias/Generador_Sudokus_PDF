/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html", "./**/*.html", "./js/**/*.js"],
  theme: {
    extend: {
      // Paleta de FALLTEM (opcional pero útil)
      colors: {
        falltem: {
          white: "#ffffff",
          limeBg: "#f8fbf4",
          sandBg: "#fcf5e7",
          skyBg:  "#e8f8fb",
          paleGreen:  "#cce6b4",
          paleYellow: "#f3daac",
          paleBlue:   "#b0e5f0",
          green:  "#99cd68",
          yellow: "#e8b75b",
          blue:   "#5fcbe0",
          greenDark:  "#37531c",
          yellowDark: "#50380b",
          blueDark:   "#125360",
          ink:        "#1b1b1b"
        }
      },
      // Fuente por defecto: Lato (local)
      fontFamily: {
        sans: ["Lato", "ui-sans-serif", "system-ui", "Arial"]
      },
      borderRadius: {
        falltem: "1rem"
      }
    }
  },
  plugins: []
}
