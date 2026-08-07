import { useState, useCallback, useRef, useEffect, Component } from 'react'
import { ThemeProvider, useTheme } from './utils/theme'
import Header from './components/Header'
import HeroBanner from './components/HeroBanner'
import CharacterGallery from './components/CharacterGallery'
import AbyssReport from './components/AbyssReport'
import TheaterReport from './components/TheaterReport'
import StatsDashboard from './components/StatsDashboard'
import LoadingSpinner from './components/LoadingSpinner'
import WelcomeScreen from './components/WelcomeScreen'
import HomeScreen from './components/HomeScreen'
import QrLoginModal from './components/QrLoginModal'
import GachaReport from './components/GachaReport'
import { fetchPlayerData, parsePlayerInfo, parseShowcaseCharacters } from './api/enka'
import { isElectron, getSavedCookie, saveCookie, clearCookie, saveRole, loadRole, clearRole, getGameRoles, fetchGacha, onGachaProgress, readDevCookie, saveGachaData, loadGachaData, clearGachaData, saveAccount, getAccountByUid } from './api/mihoyo'
import { AlertCircle, Sparkles, Loader2 } from 'lucide-react'

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
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>{this.state.error?.message || '未知错误'}</p>
            <button onClick={() => window.location.reload()} className="btn-primary text-sm px-6 py-2.5">刷新页面</button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

const POOL_LABELS = {
  '100': '新手祈愿', '200': '常驻祈愿', '301': '角色活动祈愿',
  '302': '武器活动祈愿', '400': '角色活动祈愿·其二', '500': '集录祈愿',
}

function GachaLoading({ progress }) {
  const { colors: c } = useTheme()
  const entries = Object.entries(progress)
  const doneCount = entries.filter(([, p]) => p && p.count === 0 && p.total > 0).length
  return (
    <div className="page-enter max-w-md mx-auto pt-24 px-5">
      <div className="card p-8 text-center">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
             style={{ background: `${c.sage}15`, border: `1px solid ${c.sage}30` }}>
          <Sparkles className="w-7 h-7" style={{ color: c.sage }} />
        </div>
        <h3 className="text-base font-semibold mb-2" style={{ color: c.text }}>正在获取祈愿记录</h3>
        <p className="text-xs mb-6" style={{ color: c.textMuted }}>
          正在从米游社拉取全卡池数据，请稍候...
        </p>
        <div className="space-y-2.5 text-left">
          {['100', '200', '301', '302', '400', '500'].map((type) => {
            const p = progress[type]
            const done = p && p.total > 0 && p.count === 0
            const active = p && !done
            return (
              <div key={type} className="flex items-center gap-3 text-xs" style={{ color: c.textMuted }}>
                <span className="w-24 flex-shrink-0">{POOL_LABELS[type]}</span>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: c.surfaceHover }}>
                  <div className="h-full rounded-full transition-all duration-300"
                       style={{
                         width: done ? '100%' : active ? '60%' : '0%',
                         background: done ? c.sage : active ? c.gold : c.border,
                       }} />
                </div>
                {done ? (
                  <span className="w-10 text-right" style={{ color: c.sage }}>完成</span>
                ) : active ? (
                  <span className="w-10 text-right font-mono">{p.total}</span>
                ) : (
                  <span className="w-10 text-right text-[10px]">等待</span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function AppContent() {
  const { colors: c } = useTheme()
  const [view, setView] = useState('home') // home | uid | gacha
  const [playerInfo, setPlayerInfo] = useState(null)
  const [characters, setCharacters] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchedUid, setSearchedUid] = useState(null)
  const [showQr, setShowQr] = useState(false)
  const [forceQr, setForceQr] = useState(false)
  const [gachaData, setGachaData] = useState(null)
  const [gachaAccount, setGachaAccount] = useState(null)
  const [gachaLoading, setGachaLoading] = useState(false)
  const [gachaProgress, setGachaProgress] = useState({})
  const [gachaError, setGachaError] = useState(null)
  const mainRef = useRef(null)
  const [savedCookie, setSavedCookie] = useState(() => getSavedCookie())
  const [savedRole, setSavedRole] = useState(() => loadRole())

  const handleSearch = useCallback(async (uid, forceRefresh = false) => {
    setView('uid')
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

  const loadGacha = useCallback(async (authkey, account) => {
    setGachaLoading(true); setGachaError(null); setGachaProgress({})
    try {
      const data = await fetchGacha(authkey)
      // 打印获取摘要, 方便排查
      if (data?.summary) {
        const parts = Object.entries(data.summary).map(([k, v]) => `${k}:${v}`)
        console.log(`[App] 祈愿获取完成: ${parts.join(', ')}, 总计:${data.total}`)
      }
      setGachaData(data)
      // 保存到本地加密存储
      if (account) {
        const uid = account.game_uid || savedRole?.game_uid
        if (uid) {
          await saveGachaData(uid, data, account)
          console.log('[App] 祈愿数据已保存到本地')
        }
      }
    } catch (err) {
      console.error('获取祈愿记录失败:', err)
      setGachaError(err.message || '获取祈愿记录失败')
    } finally {
      setGachaLoading(false)
    }
  }, [savedRole])

  const handleLoadGachaHistory = useCallback(async (uid) => {
    setGachaLoading(true)
    setGachaError(null)
    try {
      const result = await loadGachaData(uid)
      if (result) {
        setGachaData(result.data)
        setGachaAccount({ nickname: result.meta.nickname, game_uid: result.meta.uid })
        setView('gacha')
        console.log('[App] 已加载历史祈愿记录')
      } else {
        setGachaError('无法加载历史记录（可能数据已损坏或密钥不匹配）')
      }
    } catch (err) {
      console.error('加载历史记录失败:', err)
      setGachaError('加载历史记录失败: ' + err.message)
    } finally {
      setGachaLoading(false)
    }
  }, [])

  const handleGachaNav = useCallback(() => {
    if (!isElectron()) {
      setGachaError('祈愿记录功能需要在 Electron 应用中运行')
      setView('gacha')
      return
    }
    if (view === 'gacha' && gachaData) return
    setShowQr(true)
  }, [view, gachaData])

  const handleQrSuccess = useCallback(async (cookie, role, authkey) => {
    saveCookie(cookie)
    saveRole(role)
    saveAccount(role.game_uid, cookie, role) // 保存到多账号列表
    setSavedRole(role)
    setGachaAccount(role)
    setShowQr(false)
    setView('gacha')
    await loadGacha(authkey, role)
  }, [loadGacha])

  const handleRelogin = useCallback(() => {
    clearCookie()
    clearRole()
    setSavedCookie(null)
    setSavedRole(null)
    setGachaData(null)
    setGachaAccount(null)
    setGachaError(null)
    setView('home')
  }, [])

  // 主页"其他账号": 打开扫码弹窗(不清除现有登录)
  const handleNewScan = useCallback(() => {
    setForceQr(true)
    setShowQr(true)
  }, [])
  // 选择账号后切换cookie并弹出扫码窗口
  const handleSwitchAndGacha = useCallback((acc) => {
    const account = getAccountByUid(acc.uid)
    if (account && account.cookie) {
      // 切换到该账号的cookie和角色
      saveCookie(account.cookie)
      saveRole(account.role)
      setSavedCookie(account.cookie)
      setSavedRole(account.role)
    }
    // 弹出扫码窗口重新获取
    setForceQr(true)
    setShowQr(true)
  }, [])

  // 主页"重新扫码": 清除当前登录, 打开扫码弹窗
  const handleReScan = useCallback(() => {
    clearCookie()
    clearRole()
    setSavedCookie(null)
    setSavedRole(null)
    setGachaData(null)
    setGachaAccount(null)
    setForceQr(true)
    setShowQr(true)
  }, [])

  const handleGoHome = useCallback(() => {
    setView('home')
  }, [])

  // 注册祈愿拉取进度监听(仅一次)
  useEffect(() => {
    onGachaProgress((p) => setGachaProgress((prev) => ({ ...prev, [p.type]: p })))
  }, [])

  // 启动时: 若本地无登录会话, 自动导入 CLI 测试保存的会话(开发便利)
  useEffect(() => {
    if (!savedCookie && isElectron()) {
      readDevCookie().then(async (c) => {
        if (c) {
          saveCookie(c)
          setSavedCookie(c)
          // 顺便拉取角色信息, 用于主页显示昵称
          try {
            const roles = await getGameRoles(c)
            if (roles.length > 0) {
              saveRole(roles[0])
              setSavedRole(roles[0])
            }
          } catch { /* 角色信息非必需 */ }
        }
      }).catch(() => {})
    }
  }, [savedCookie])

  const hasData = !!playerInfo
  const showUidView = view === 'uid'

  return (
    <div className="min-h-screen flex flex-col" style={{ background: c.bg }}>
      <Header
        onSearch={handleSearch}
        isLoading={loading}
        playerInfo={playerInfo}
        hasData={hasData}
        onHome={view === 'home' ? undefined : handleGoHome}
        onGacha={view === 'home' ? undefined : handleGachaNav}
        currentView={view}
        showSearch={false}
      />

      <div ref={mainRef} className="flex-1">
        {view === 'home' && (
          <HomeScreen
            onUidQuery={() => { setView('uid'); setPlayerInfo(null); setCharacters([]); setError(null) }}
            onGacha={handleGachaNav}
            onReScan={handleReScan}
            onNewScan={handleNewScan}
            loggedNickname={savedRole?.nickname}
            onLoadGachaHistory={handleLoadGachaHistory}
            onSwitchAndGacha={handleSwitchAndGacha}
          />
        )}

        {showUidView && (
          loading ? (
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
                <HeroBanner playerInfo={playerInfo} characters={characters} />
                <CharacterGallery characters={characters} />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <AbyssReport playerInfo={playerInfo} characters={characters} />
                  <TheaterReport playerInfo={playerInfo} />
                </div>
                <StatsDashboard characters={characters} />
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
          )
        )}

        {view === 'gacha' && (
          gachaLoading ? (
            <GachaLoading progress={gachaProgress} />
          ) : gachaError ? (
            <ErrorDisplay
              message={gachaError}
              onRetry={savedCookie ? () => handleGachaNav() : null}
            />
          ) : gachaData ? (
            <GachaReport
              data={gachaData}
              account={gachaAccount}
              onBack={handleGoHome}
              onRelogin={handleRelogin}
            />
          ) : (
            <div className="pt-24 text-center">
              <p className="text-sm" style={{ color: c.textMuted }}>
                请先登录米游社账号
              </p>
            </div>
          )
        )}
      </div>

      <footer className="border-t py-5 text-center" style={{ borderColor: c.footerBorder }}>
        <p className="text-xs" style={{ color: c.footerText }}>
          提瓦特观测台 · 数据来源{' '}
          <a href="https://enka.network" target="_blank" rel="noopener noreferrer"
             className="hover:text-gold transition-colors" style={{ color: c.footerLink }}>
            Enka.Network
          </a>
          {' '}· 祈愿记录来自米游社 · 仅供学习交流
        </p>
      </footer>

      <QrLoginModal
        open={showQr}
        onClose={() => { setShowQr(false); setForceQr(false) }}
        onSuccess={handleQrSuccess}
        initialCookie={forceQr ? null : savedCookie}
      />
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
