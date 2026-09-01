/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: "#050811",
          card: "#0b1220",
          cardBorder: "#1e293b",
          cardHover: "#0f172a",
          darkBlue: "#070c18",
          sidebar: "#060a14",
          cyan: "#00f0ff",
          cyanGlow: "#00d2ff",
          purple: "#a855f7",
          purpleGlow: "#c084fc",
          red: "#ff3366",
          amber: "#f59e0b",
          emerald: "#10b981",
          teal: "#14b8a6",
          blue: "#3b82f6",
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'neon-cyan': '0 0 15px rgba(0, 240, 255, 0.35), inset 0 0 10px rgba(0, 240, 255, 0.1)',
        'neon-purple': '0 0 15px rgba(168, 85, 247, 0.35)',
        'neon-red': '0 0 15px rgba(255, 51, 102, 0.35)',
        'neon-emerald': '0 0 15px rgba(16, 185, 129, 0.35)',
        'neon-amber': '0 0 15px rgba(245, 158, 11, 0.35)',
        'glow-sm': '0 0 8px rgba(0, 240, 255, 0.25)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-spin': 'spin 4s linear infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'ticker': 'ticker 35s linear infinite',
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        }
      }
    },
  },
  plugins: [],
}
