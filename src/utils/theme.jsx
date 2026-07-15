import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const LIGHT = {
  bg: '#f8f5f0',
  surface: '#ffffff',
  surfaceHover: '#faf8f5',
  surfaceSubtle: '#f8f5f0',
  surfaceElevated: '#faf8f5',

  text: '#2c2416',
  textSecondary: '#5c5343',
  textMuted: '#8b8170',
  textFaint: '#bfb8aa',

  border: '#e8e1d5',
  borderLight: '#f0ebe2',
  borderAccent: 'rgba(200,146,63,0.12)',

  gold: '#c8923f',
  goldLight: '#e0b866',
  goldDim: '#9e7432',
  goldBg: 'rgba(200,146,63,0.06)',
  goldBorder: 'rgba(200,146,63,0.15)',
  goldText: '#ffffff',

  rust: '#b85c3a',
  rustLight: '#d4785a',
  rustBg: 'rgba(184,92,58,0.06)',
  rustBorder: 'rgba(184,92,58,0.12)',

  sage: '#5b8c5a',
  sageLight: '#7aab79',
  sageBg: 'rgba(91,140,90,0.06)',
  sageBorder: 'rgba(91,140,90,0.12)',

  purple: '#b07cf7',
  purpleBg: 'rgba(176,124,247,0.06)',
  purpleBorder: 'rgba(176,124,247,0.12)',

  headerBg: 'rgba(254,252,249,0.92)',
  headerBorder: '#e8e1d5',

  statBarBg: '#f0ebe2',

  cardShadow: '0 1px 3px rgba(44,36,22,0.04), 0 1px 2px rgba(44,36,22,0.03)',
  cardShadowHover: '0 4px 16px rgba(44,36,22,0.06), 0 1px 3px rgba(44,36,22,0.04)',

  pyro: '#e0554a',
  hydro: '#5b9cf5',
  anemo: '#40c9a0',
  electro: '#b07cf7',
  dendro: '#8cc63f',
  cryo: '#7ee0f8',
  geo: '#e0b040',

  cvSSS: '#c8923f',
  cvSS: '#e0b040',
  cvS: '#b07cf7',
  cvA: '#5b8c5a',
  cvB: '#bfb8aa',

  scrollbarThumb: 'rgba(139,129,112,0.2)',
  scrollbarThumbHover: 'rgba(139,129,112,0.35)',

  errorBg: 'rgba(184,92,58,0.06)',
  errorBorder: 'rgba(184,92,58,0.18)',
  errorText: '#b85c3a',

  footerBorder: '#e8e1d5',
  footerText: '#bfb8aa',
  footerLink: '#8b8170',
}

const DARK = {
  bg: '#1a1814',
  surface: '#252320',
  surfaceHover: '#2d2a25',
  surfaceSubtle: '#221f1c',
  surfaceElevated: '#2d2a25',

  text: '#e8dcc8',
  textSecondary: '#a89e8c',
  textMuted: '#7a7265',
  textFaint: '#5a5449',

  border: '#3a3530',
  borderLight: '#2d2a25',
  borderAccent: 'rgba(212,162,76,0.1)',

  gold: '#d4a24c',
  goldLight: '#e8b866',
  goldDim: '#a07830',
  goldBg: 'rgba(212,162,76,0.08)',
  goldBorder: 'rgba(212,162,76,0.15)',
  goldText: '#1a1814',

  rust: '#d4785a',
  rustLight: '#e8906a',
  rustBg: 'rgba(212,120,90,0.08)',
  rustBorder: 'rgba(212,120,90,0.12)',

  sage: '#7aab79',
  sageLight: '#95c494',
  sageBg: 'rgba(122,171,121,0.08)',
  sageBorder: 'rgba(122,171,121,0.12)',

  purple: '#c090ff',
  purpleBg: 'rgba(192,144,255,0.08)',
  purpleBorder: 'rgba(192,144,255,0.12)',

  headerBg: 'rgba(26,24,20,0.92)',
  headerBorder: '#3a3530',

  statBarBg: '#2d2a25',

  cardShadow: '0 1px 3px rgba(0,0,0,0.15), 0 1px 2px rgba(0,0,0,0.08)',
  cardShadowHover: '0 4px 16px rgba(0,0,0,0.2), 0 1px 3px rgba(0,0,0,0.12)',

  pyro: '#e0554a',
  hydro: '#5b9cf5',
  anemo: '#40c9a0',
  electro: '#b07cf7',
  dendro: '#8cc63f',
  cryo: '#7ee0f8',
  geo: '#e0b040',

  cvSSS: '#d4a24c',
  cvSS: '#e8b866',
  cvS: '#c090ff',
  cvA: '#7aab79',
  cvB: '#5a5449',

  scrollbarThumb: 'rgba(58,53,48,0.4)',
  scrollbarThumbHover: 'rgba(58,53,48,0.6)',

  errorBg: 'rgba(212,120,90,0.08)',
  errorBorder: 'rgba(212,120,90,0.18)',
  errorText: '#d4785a',

  footerBorder: '#3a3530',
  footerText: '#5a5449',
  footerLink: '#7a7265',
}

const ThemeContext = createContext({ theme: 'light', colors: LIGHT, toggleTheme: () => {} })

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('genshin_theme') || 'light' }
    catch { return 'light' }
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('genshin_theme', theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }, [])

  const colors = theme === 'dark' ? DARK : LIGHT

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}

export { LIGHT, DARK }
