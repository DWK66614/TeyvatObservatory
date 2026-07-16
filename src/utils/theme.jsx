import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const LIGHT = {
  bg: '#f8f5f0',
  surface: '#ffffff',
  surfaceHover: '#faf8f5',
  surfaceSecondary: '#f0ebe2',
  surfaceElevated: '#ffffff',

  text: '#2c2416',
  textSecondary: '#5c5343',
  textMuted: '#8b8170',
  textFaint: '#bfb8aa',

  border: '#e8e1d5',
  borderLight: '#f0ebe2',
  borderSubtle: 'rgba(139,129,112,0.08)',

  gold: '#c8923f',
  goldLight: '#e0b866',
  goldDim: '#9e7432',
  goldBg: 'rgba(200,146,63,0.06)',
  goldBorder: 'rgba(200,146,63,0.15)',
  goldText: '#1a1814',

  rust: '#b85c3a',
  rustLight: '#d4785a',
  rustBg: 'rgba(184,92,58,0.06)',
  rustBorder: 'rgba(184,92,58,0.12)',

  sage: '#5b8c5a',
  sageLight: '#7aab79',
  sageBg: 'rgba(91,140,90,0.06)',
  sageBorder: 'rgba(91,140,90,0.12)',

  surfaceSubtle: '#f0ebe2',

  purple: '#8b5cf6',
  purpleBg: 'rgba(139,92,246,0.06)',
  purpleBorder: 'rgba(139,92,246,0.12)',

  sideBg: 'rgba(254,252,249,0.94)',
  sideBorder: 'rgba(232,225,213,0.8)',
  sideInputBg: 'rgba(139,129,112,0.06)',
  sideInputBorder: 'rgba(139,129,112,0.12)',
  sideNavActiveBg: 'rgba(200,146,63,0.08)',
  sideNavActiveText: '#c8923f',
  sideNavInactiveText: '#8b8170',
  sideSectionLabel: '#bfb8aa',
  sideFooterText: '#bfb8aa',
  sideFooterBorder: 'rgba(232,225,213,0.6)',

  nebula: '#5b8c5a',
  nebulaBg: 'rgba(91,140,90,0.06)',

  inputBg: 'rgba(139,129,112,0.06)',
  inputBorder: 'rgba(139,129,112,0.15)',
  inputPlaceholder: '#bfb8aa',
  inputFocusBorder: 'rgba(200,146,63,0.3)',

  btnGhostBg: 'rgba(139,129,112,0.06)',
  btnGhostBorder: 'rgba(139,129,112,0.12)',
  btnGhostText: '#8b8170',

  statBarBg: '#f0ebe2',

  cardBg: '#ffffff',
  cardBorder: 'rgba(139,129,112,0.08)',
  cardHoverBg: '#faf8f5',
  cardHoverBorder: 'rgba(200,146,63,0.15)',
  cardShadow: '0 1px 3px rgba(44,36,22,0.04), 0 1px 2px rgba(44,36,22,0.03)',
  cardShadowHover: '0 4px 16px rgba(44,36,22,0.06), 0 1px 3px rgba(44,36,22,0.04)',

  pyro: '#e0554a',
  hydro: '#4b8ff7',
  anemo: '#35b88c',
  electro: '#9b6ef7',
  dendro: '#7db93a',
  cryo: '#5ed8f5',
  geo: '#d4a434',

  cvSSS: '#c8923f',
  cvSS: '#e0b866',
  cvS: '#9b6ef7',
  cvA: '#5b8c5a',
  cvB: '#bfb8aa',

  scrollbarThumb: 'rgba(139,129,112,0.2)',
  scrollbarThumbHover: 'rgba(139,129,112,0.35)',

  errorBg: 'rgba(184,92,58,0.06)',
  errorBorder: 'rgba(184,92,58,0.18)',
  errorText: '#b85c3a',

  footerBorder: 'rgba(232,225,213,0.6)',
  footerText: '#bfb8aa',
  footerLink: '#8b8170',

  overlayBg: 'rgba(0,0,0,0.3)',
  dropdownBg: '#ffffff',
  dropdownBorder: 'rgba(200,146,63,0.12)',
  dropdownShadow: '0 12px 40px rgba(44,36,22,0.12)',
}

const DARK = {
  bg: '#080c1d',
  surface: '#111633',
  surfaceHover: '#181d42',
  surfaceSecondary: 'rgba(112,149,196,0.06)',
  surfaceElevated: '#181d42',

  text: '#e5e0d5',
  textSecondary: '#8b8aa6',
  textMuted: '#5c5b78',
  textFaint: '#3c3b58',

  border: 'rgba(112,149,196,0.08)',
  borderLight: 'rgba(112,149,196,0.06)',
  borderSubtle: 'rgba(112,149,196,0.06)',

  gold: '#edd9a3',
  goldLight: '#f5e6c0',
  goldDim: '#c4a96a',
  goldBg: 'rgba(237,217,163,0.08)',
  goldBorder: 'rgba(237,217,163,0.12)',
  goldText: '#080c1d',

  rust: '#d4785a',
  rustLight: '#e8906a',
  rustBg: 'rgba(212,120,90,0.08)',
  rustBorder: 'rgba(212,120,90,0.12)',

  sage: '#7aab79',
  sageLight: '#95c494',
  sageBg: 'rgba(122,171,121,0.08)',
  sageBorder: 'rgba(122,171,121,0.12)',

  surfaceSubtle: '#0d1230',

  purple: '#b07cf7',
  purpleBg: 'rgba(176,124,247,0.06)',
  purpleBorder: 'rgba(176,124,247,0.12)',

  sideBg: 'rgba(8,12,29,0.96)',
  sideBorder: 'rgba(112,149,196,0.06)',
  sideInputBg: 'rgba(112,149,196,0.05)',
  sideInputBorder: 'rgba(112,149,196,0.1)',
  sideNavActiveBg: 'rgba(237,217,163,0.08)',
  sideNavActiveText: '#edd9a3',
  sideNavInactiveText: '#8b8aa6',
  sideSectionLabel: '#5c5b78',
  sideFooterText: '#5c5b78',
  sideFooterBorder: 'rgba(112,149,196,0.06)',

  nebula: '#7095c4',
  nebulaBg: 'rgba(112,149,196,0.06)',

  inputBg: 'rgba(112,149,196,0.05)',
  inputBorder: 'rgba(112,149,196,0.1)',
  inputPlaceholder: '#5c5b78',
  inputFocusBorder: 'rgba(237,217,163,0.3)',

  btnGhostBg: 'rgba(112,149,196,0.06)',
  btnGhostBorder: 'rgba(112,149,196,0.1)',
  btnGhostText: '#8b8aa6',

  statBarBg: 'rgba(112,149,196,0.08)',

  cardBg: '#111633',
  cardBorder: 'rgba(112,149,196,0.08)',
  cardHoverBg: '#181d42',
  cardHoverBorder: 'rgba(237,217,163,0.15)',
  cardShadow: '0 0 20px rgba(0,0,0,0.1)',
  cardShadowHover: '0 0 30px rgba(237,217,163,0.05)',

  pyro: '#e0554a',
  hydro: '#5b9cf5',
  anemo: '#40c9a0',
  electro: '#b07cf7',
  dendro: '#8cc63f',
  cryo: '#7ee0f8',
  geo: '#e0b040',

  cvSSS: '#edd9a3',
  cvSS: '#f5e6c0',
  cvS: '#b07cf7',
  cvA: '#5b8c5a',
  cvB: '#3c3b58',

  scrollbarThumb: 'rgba(112,149,196,0.15)',
  scrollbarThumbHover: 'rgba(112,149,196,0.25)',

  errorBg: 'rgba(184,92,58,0.06)',
  errorBorder: 'rgba(184,92,58,0.18)',
  errorText: '#d4785a',

  footerBorder: 'rgba(112,149,196,0.06)',
  footerText: '#3c3b58',
  footerLink: '#5c5b78',

  overlayBg: 'rgba(0,0,0,0.6)',
  dropdownBg: '#181d42',
  dropdownBorder: 'rgba(112,149,196,0.12)',
  dropdownShadow: '0 12px 40px rgba(0,0,0,0.5)',
}

const ThemeContext = createContext({ theme: 'dark', colors: DARK, toggleTheme: () => {} })

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('genshin_theme') || 'dark' }
    catch { return 'dark' }
  })

  useEffect(() => {
    document.documentElement.classList.toggle('theme-light', theme === 'light')
    document.documentElement.classList.toggle('theme-dark', theme === 'dark')
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
