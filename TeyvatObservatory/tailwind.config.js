/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Astral Atlas palette ──
        void: {
          DEFAULT: '#080c1d',   // deepest night sky
          deep: '#050917',      // even deeper, for shadows
        },
        cosmos: {
          DEFAULT: '#111633',   // card surfaces
          light: '#181d42',     // hover state
          border: 'rgba(112,149,196,0.08)', // subtle nebula-tinted borders
        },
        starlight: {
          DEFAULT: '#edd9a3',   // warm starlight accent
          light: '#f5e6c0',     // hover / bright
          dim: '#8a7d5c',       // muted
          bg: 'rgba(237,217,163,0.06)', // subtle bg
        },
        nebula: {
          DEFAULT: '#7095c4',   // cool celestial blue
          light: '#90b0d8',
          dim: '#4a6280',
          bg: 'rgba(112,149,196,0.06)',
        },
        aurora: {
          DEFAULT: '#4fb8a0',   // teal-green accent
          bg: 'rgba(79,184,160,0.06)',
        },
        parchment: {
          DEFAULT: '#e5e0d5',   // warm off-white text
          muted: '#9a9590',     // dimmer text
        },
        dust: {
          DEFAULT: '#8b8aa6',   // secondary text
          dim: '#5c5b78',       // even more muted
        },

        // ── Element colors (desaturated slightly to fit the palette) ──
        pyro:      { DEFAULT: '#e0554a', bg: 'rgba(224,85,74,0.08)' },
        hydro:     { DEFAULT: '#5b9cf5', bg: 'rgba(91,156,245,0.08)' },
        anemo:     { DEFAULT: '#40c9a0', bg: 'rgba(64,201,160,0.08)' },
        electro:   { DEFAULT: '#b07cf7', bg: 'rgba(176,124,247,0.08)' },
        dendro:    { DEFAULT: '#8cc63f', bg: 'rgba(140,198,63,0.08)' },
        cryo:      { DEFAULT: '#7ee0f8', bg: 'rgba(126,224,248,0.08)' },
        geo:       { DEFAULT: '#e0b040', bg: 'rgba(224,176,64,0.08)' },
      },
      fontFamily: {
        display: ['"Cinzel"', '"Noto Serif SC"', 'serif'],
        sans: ['"Noto Sans SC"', '"Microsoft YaHei"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Consolas"', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in-left': 'slideInLeft 0.4s ease-out',
        'constellation': 'constellationPulse 3s ease-in-out infinite',
        'orbit': 'orbit 20s linear infinite',
        'orbit-reverse': 'orbitReverse 25s linear infinite',
        'star-twinkle': 'twinkle 2s ease-in-out infinite',
        'spin-ring': 'spinRing 1.2s linear infinite',
        'spin-ring-reverse': 'spinRingReverse 1.6s linear infinite',
        'spin-ring-slow': 'spinRingSlow 2.2s linear infinite',
        'breathe': 'breathe 1.4s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-12px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        constellationPulse: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '0.6' },
        },
        orbit: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        orbitReverse: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(-360deg)' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.2' },
          '50%': { opacity: '0.8' },
        },
        spinRing: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        spinRingReverse: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(-360deg)' },
        },
        spinRingSlow: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(0.8)', opacity: '0.5' },
          '50%': { transform: 'scale(1.3)', opacity: '1' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
}
