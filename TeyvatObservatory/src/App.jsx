import { useState, useCallback, useRef, Component } from 'react'
import { ThemeProvider, useTheme } from './utils/theme'
import StarBackground from './components/StarBackground'
import Header from './components/Header'
import PlayerOverview from './components/PlayerOverview'
import CharacterShowcase from './components/CharacterShowcase'
import SpiralAbyss from './components/SpiralAbyss'
import ImaginariumTheater from './components/ImaginariumTheater'
import StatsPanel from './components/StatsPanel'
import LoadingSpinner from './components/LoadingSpinner'
import WelcomeScreen from './components/WelcomeScreen'
import { fetchPlayerData, parsePlayerInfo, parseShowcaseCharacters } from './api/enka'
import { AlertCircle } from 'lucide-react'

function ErrorDisplay({ message, onRetry }) {
  const { colors: c } = useTheme()
  return (
    <div className="page-enter max-w-lg mx-auto pt-20">
      <div className="card p-10 text-center" style={{ borderColor: c.errorBorder }}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
             style={{ background: c.errorBg }}>
          <AlertCircle className="w-7 h-7" style={{ color: c.errorText }} />
        </div>
        <h3 className="text-base font-semibold mb-2" style={{ color: c.errorText }}>查询失败</h3>
        <p className="text-sm mb-5" style={{ color: c.textMuted }}>{message}</p>
        {onRetry && (
          <button onClick={onRetry} className="btn-ghost text-sm px-6 py-2.5">重新查询</button>
        )}
      </div>
    </div>
  )
}

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null } }
  static getDerivedStateFromError(error) { return { hasError: true, error } }
  componentDidCatch(error, info) { console.error('App crashed:', error, info) }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
          <div className="card p-12 text-center max-w-md" style={{ borderColor: 'var(--error-border)' }}>
            <span className="text-5xl block mb-4">⚠</span>
            <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--error-text)' }}>应用出错了</h2>
            <p className="text-sm mb-4" style={{ color: 'var(--dust)' }}>{this.state.error?.message || '未知错误'}</p>
            <button onClick={() => window.location.reload()} className="btn-primary text-sm px-6 py-2.5">刷新页面</button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

function AppContent() {
  const { colors: c } = useTheme()
  const [playerInfo, setPlayerInfo] = useState(null)
  const [characters, setCharacters] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchedUid, setSearchedUid] = useState(null)
  const mainRef = useRef(null)

  const handleSearch = useCallback(async (uid, forceRefresh = false) => {
    setLoading(true); setError(null); setSearchedUid(uid)
    try {
      const data = await fetchPlayerData(uid, forceRefresh)
      if (!data) { setError('未能获取到数据'); setPlayerInfo(null); setCharacters([]); return }
      const info = parsePlayerInfo(data)
      const chars = parseShowcaseCharacters(data)
      setPlayerInfo(info); setCharacters(chars)
      setTimeout(() => {
        mainRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    } catch (err) {
      console.error('查询失败:', err)
      setError(err.message || '查询失败'); setPlayerInfo(null); setCharacters([])
    } finally { setLoading(false) }
  }, [])

  const hasData = !!playerInfo

  return (
    <div className="min-h-screen flex flex-col" style={{ background: c.bg }}>
      <StarBackground />
      <Header
        onSearch={handleSearch}
        isLoading={loading}
        playerInfo={playerInfo}
        hasData={hasData}
      />

      <div ref={mainRef} className="flex-1">
        {loading ? (
          <div className="pt-16">
            <LoadingSpinner message={`正在查询 UID ${searchedUid} ...`} />
          </div>
        ) : error ? (
          <ErrorDisplay message={error} onRetry={searchedUid ? () => handleSearch(searchedUid) : null} />
        ) : !hasData ? (
          <WelcomeScreen onSearch={handleSearch} />
        ) : (
          <div className="page-enter">
            <div className="max-w-6xl mx-auto px-5 py-8 lg:px-8 lg:py-10 space-y-8">
              <PlayerOverview playerInfo={playerInfo} characters={characters} />
              <CharacterShowcase characters={characters} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SpiralAbyss playerInfo={playerInfo} characters={characters} />
                <ImaginariumTheater playerInfo={playerInfo} />
              </div>
              <StatsPanel characters={characters} />
            </div>

            {searchedUid && (
              <div className="text-center pb-8">
                <button
                  onClick={() => handleSearch(searchedUid, true)}
                  className="text-xs transition-colors hover:text-gold"
                  style={{ color: c.textFaint }}
                >
                  强制刷新数据
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="border-t py-5 text-center" style={{ borderColor: c.footerBorder }}>
        <p className="text-xs" style={{ color: c.footerText }}>
          原神观测台 · 数据来源{' '}
          <a href="https://enka.network" target="_blank" rel="noopener noreferrer"
             className="hover:text-gold transition-colors" style={{ color: c.footerLink }}>
            Enka.Network
          </a>
          {' '}· 仅供学习交流
        </p>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </ErrorBoundary>
  )
}
