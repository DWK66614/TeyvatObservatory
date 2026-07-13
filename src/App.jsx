import { useState, useCallback, useMemo, Component } from 'react'
import StarBackground from './components/StarBackground'
import Sidebar from './components/Sidebar'
import PlayerOverview from './components/PlayerOverview'
import CharacterShowcase from './components/CharacterShowcase'
import SpiralAbyss from './components/SpiralAbyss'
import ImaginariumTheater from './components/ImaginariumTheater'
import StatsPanel from './components/StatsPanel'
import LoadingSpinner from './components/LoadingSpinner'
import WelcomeScreen from './components/WelcomeScreen'
import { fetchPlayerData, parsePlayerInfo, parseShowcaseCharacters } from './api/enka'
import { AlertCircle } from 'lucide-react'

const TABS = [
  { id: 'overview',   label: '概览', icon: 'Home' },
  { id: 'characters', label: '角色', icon: 'Users' },
  { id: 'abyss',      label: '深渊', icon: 'Zap' },
  { id: 'stats',      label: '面板', icon: 'BarChart3' },
]

function ErrorDisplay({ message, onRetry }) {
  return (
    <div className="page-enter">
      <div className="card p-10 text-center" style={{ borderColor: 'rgba(224,85,74,0.2)' }}>
        <AlertCircle className="w-10 h-10 mx-auto mb-4" style={{ color: '#e0554a' }} />
        <h3 className="text-base font-semibold mb-2" style={{ color: '#e0554a' }}>查询失败</h3>
        <p className="text-sm text-dust" style={{ color: '#8b8aa6' }}>{message}</p>
        {onRetry && (
          <button onClick={onRetry} className="btn-ghost text-sm px-6 py-2.5 mt-5">重新查询</button>
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
        <div className="min-h-screen flex items-center justify-center" style={{ background: '#080c1d' }}>
          <div className="card p-12 text-center max-w-md" style={{ borderColor: 'rgba(224,85,74,0.2)' }}>
            <span className="text-5xl block mb-4">⚠️</span>
            <h2 className="text-base font-semibold mb-2" style={{ color: '#e0554a' }}>应用出错了</h2>
            <p className="text-sm text-dust mb-4">{this.state.error?.message || '未知错误'}</p>
            <button onClick={() => window.location.reload()} className="btn-primary text-sm px-6 py-2.5">刷新页面</button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default function App() {
  const [playerInfo, setPlayerInfo] = useState(null)
  const [characters, setCharacters] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchedUid, setSearchedUid] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  const handleSearch = useCallback(async (uid, forceRefresh = false) => {
    setLoading(true); setError(null); setSearchedUid(uid)
    if (!forceRefresh) setActiveTab('overview')
    try {
      const data = await fetchPlayerData(uid, forceRefresh)
      if (!data) { setError('未能获取到数据'); setPlayerInfo(null); setCharacters([]); return }
      const info = parsePlayerInfo(data)
      const chars = parseShowcaseCharacters(data)
      console.log('[App] Player:', !!info, '| Characters:', chars.length, '| Raw avatars:', data?.avatarInfoList?.length || 0)
      setPlayerInfo(info); setCharacters(chars)
    } catch (err) {
      console.error('查询失败:', err)
      setError(err.message || '查询失败'); setPlayerInfo(null); setCharacters([])
    } finally { setLoading(false) }
  }, [])

  const hasData = !!playerInfo

  const tabContent = useMemo(() => {
    if (loading) return <LoadingSpinner message={`正在观测 UID ${searchedUid} ...`} />
    if (error) return <ErrorDisplay message={error} onRetry={searchedUid ? () => handleSearch(searchedUid) : null} />
    if (!hasData) return <WelcomeScreen />
    switch (activeTab) {
      case 'overview':
        return (
          <div className="page-enter space-y-5">
            <PlayerOverview playerInfo={playerInfo} characters={characters} />
            <ImaginariumTheater playerInfo={playerInfo} />
            <SpiralAbyss playerInfo={playerInfo} characters={characters} />
            <CharacterShowcase characters={characters} />
          </div>
        )
      case 'characters': return <div className="page-enter"><CharacterShowcase characters={characters} /></div>
      case 'abyss': return <div className="page-enter"><SpiralAbyss playerInfo={playerInfo} characters={characters} /></div>
      case 'stats': return <div className="page-enter"><StatsPanel characters={characters} /></div>
      default: return null
    }
  }, [loading, error, hasData, activeTab, playerInfo, characters, searchedUid, handleSearch])

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex" style={{ background: '#080c1d' }}>
        <StarBackground />

        {/* Sidebar — fixed left, 240px on desktop */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onSearch={handleSearch}
          isLoading={loading}
          tabs={TABS}
        />

        {/* Main content area — offset by sidebar width */}
        <div className="flex-1 flex flex-col min-h-screen lg:ml-60 max-lg:pt-16">
          <main className="flex-1 px-5 py-8 lg:px-10 lg:py-10 max-w-5xl w-full mx-auto relative z-10">
            {tabContent}

            {/* Force refresh link */}
            {searchedUid && !loading && hasData && (
              <div className="text-center mt-8">
                <button
                  onClick={() => handleSearch(searchedUid, true)}
                  className="text-xs transition-colors hover:text-starlight"
                  style={{ color: '#5c5b78' }}
                >
                  ⟳ 强制刷新
                </button>
              </div>
            )}
          </main>

          {/* Footer */}
          <footer className="border-t py-4 text-center relative z-10" style={{ borderColor: 'rgba(112,149,196,0.06)' }}>
            <p className="text-[10px]" style={{ color: '#3c3b58' }}>
              Teyvat Observatory · Data Source{' '}
              <a href="https://enka.network" target="_blank" rel="noopener noreferrer"
                 className="hover:text-starlight transition-colors" style={{ color: '#5c5b78' }}>
                Enka.Network
              </a>{' '}
              · 仅供学习交流
            </p>
          </footer>
        </div>
      </div>
    </ErrorBoundary>
  )
}
