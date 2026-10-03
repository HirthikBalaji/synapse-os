/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        synapse: {
          cyan: "#00f3ff",
          blue: "#0066ff",
          purple: "#7928ca",
          violet: "#9d4edd",
          magenta: "#ff007f",
          emerald: "#00ff88",
          amber: "#ffaa00",
          danger: "#ff3366",
          dark: "#05070d",
          card: "rgba(10, 15, 29, 0.72)",
          cardHover: "rgba(18, 26, 48, 0.85)",
          border: "rgba(0, 243, 255, 0.15)",
          borderGlow: "rgba(0, 243, 255, 0.4)",
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'Consolas', 'monospace'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 243, 255, 0.2), inset 0 0 5px rgba(0, 243, 255, 0.1)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 243, 255, 0.6), inset 0 0 10px rgba(0, 243, 255, 0.3)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' }
        }
      },
      boxShadow: {
        'cyber': '0 0 20px -3px rgba(0, 243, 255, 0.25)',
        'cyber-lg': '0 0 35px -5px rgba(0, 243, 255, 0.35)',
        'cyber-magenta': '0 0 25px -3px rgba(255, 0, 127, 0.3)',
        'cyber-emerald': '0 0 25px -3px rgba(0, 255, 136, 0.3)',
      }
    },
  },
  plugins: [],
}
