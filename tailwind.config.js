/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#f8f5f0',
          light: '#fefcf9',
          dark: '#efe9e0',
        },
        paper: {
          DEFAULT: '#ffffff',
          tint: '#faf8f5',
          border: '#e8e1d5',
        },
        ink: {
          DEFAULT: '#2c2416',
          muted: '#5c5343',
          dim: '#8b8170',
          faint: '#bfb8aa',
        },
        gold: {
          DEFAULT: '#c8923f',
          light: '#e0b866',
          dim: '#9e7432',
          bg: 'rgba(200,146,63,0.06)',
        },
        rust: {
          DEFAULT: '#b85c3a',
          light: '#d4785a',
          bg: 'rgba(184,92,58,0.06)',
        },
        sage: {
          DEFAULT: '#5b8c5a',
          light: '#7aab79',
          bg: 'rgba(91,140,90,0.06)',
        },

        // Element colors
        pyro:      { DEFAULT: '#e0554a', bg: 'rgba(224,85,74,0.08)' },
        hydro:     { DEFAULT: '#5b9cf5', bg: 'rgba(91,156,245,0.08)' },
        anemo:     { DEFAULT: '#40c9a0', bg: 'rgba(64,201,160,0.08)' },
        electro:   { DEFAULT: '#b07cf7', bg: 'rgba(176,124,247,0.08)' },
        dendro:    { DEFAULT: '#8cc63f', bg: 'rgba(140,198,63,0.08)' },
        cryo:      { DEFAULT: '#7ee0f8', bg: 'rgba(126,224,248,0.08)' },
        geo:       { DEFAULT: '#e0b040', bg: 'rgba(224,176,64,0.08)' },
      },
      fontFamily: {
        display: ['"Noto Serif SC"', 'serif'],
        sans: ['"Noto Sans SC"', '"Microsoft YaHei"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Consolas"', 'monospace'],
      },
      borderRadius: {
        'card': '12px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(44,36,22,0.04), 0 1px 2px rgba(44,36,22,0.03)',
        'card-hover': '0 4px 16px rgba(44,36,22,0.06), 0 1px 3px rgba(44,36,22,0.04)',
        'header': '0 1px 0 rgba(44,36,22,0.06)',
        'gold': '0 2px 12px rgba(200,146,63,0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
}
