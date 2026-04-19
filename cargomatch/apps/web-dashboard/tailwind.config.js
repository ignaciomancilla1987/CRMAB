/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        conforme: "#16a34a",
        observaciones: "#ca8a04",
        rechazada: "#dc2626",
      },
    },
  },
  plugins: [],
}
