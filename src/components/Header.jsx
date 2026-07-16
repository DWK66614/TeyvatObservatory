import { useState, useCallback, useEffect, useRef } from 'react'
import { Search, X, History, Compass, Sun, Moon } from 'lucide-react'
import { useTheme } from '../utils/theme'

export default function Header({ onSearch, isLoading, playerInfo, hasData }) {
  const { colors: c, theme, toggleTheme } = useTheme()
  const [uid, setUid] = useState('')
  const [recentUids, setRecentUids] = useState(() => {
    try { return JSON.parse(localStorage.getItem('genshin_recent_uids') || '[]') }
    catch { return [] }
  })
  const [showRecent, setShowRecent] = useState(false)

  const handleSubmit = useCallback((e) => {
    e.preventDefault()
    const trimmed = uid.trim()
    if (!trimmed || isLoading) return
    const uidNum = parseInt(trimmed)
    if (isNaN(uidNum) || trimmed.length < 9 || trimmed.length > 10) return
    const updated = [trimmed, ...recentUids.filter(u => u !== trimmed)].slice(0, 5)
    setRecentUids(updated)
    localStorage.setItem('genshin_recent_uids', JSON.stringify(updated))
    onSearch(trimmed)
    setShowRecent(false)
  }, [uid, isLoading, recentUids, onSearch])

  const handleRecentClick = useCallback((u) => {
    setUid(u)
    onSearch(u)
    setShowRecent(false)
  }, [onSearch])

  return (
    <header className="sticky top-0 z-30 transition-colors duration-300" style={{
      background: c.sideBg,
      backdropFilter: 'blur(12px)',
      borderBottom: `1px solid ${c.sideBorder}`,
    }}>
      <div className="max-w-6xl mx-auto px-4 lg:px-8">
        <div className="flex items-center gap-3 py-3">
          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                 style={{ background: c.gold, color: c.goldText }}>
              <Compass className="w-4 h-4" />
            </div>
            <div className="hidden sm:block">
              <span className="text-sm font-bold font-display tracking-wide" style={{ color: c.text }}>
                原神观测台
              </span>
              <span className="text-[10px] block leading-none font-display" style={{ color: c.textFaint }}>
                GENSHIN OBSERVER
              </span>
            </div>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md">
            <form onSubmit={handleSubmit} className="relative">
              <div className="flex items-stretch rounded-lg overflow-hidden transition-all duration-200"
                   style={{
                     background: c.sideInputBg,
                     border: `1px solid ${c.sideInputBorder}`,
                   }}>
                <div className="flex items-center pl-2.5">
                  <Search className="w-3.5 h-3.5" style={{ color: c.textFaint }} />
                </div>
                <input
                  type="text" inputMode="numeric" pattern="[0-9]*" maxLength={10}
                  value={uid}
                  onChange={(e) => setUid(e.target.value.replace(/\D/g, ''))}
                  onFocus={() => setShowRecent(true)}
                  onBlur={() => setTimeout(() => setShowRecent(false), 250)}
                  placeholder="输入原神 UID"
                  disabled={isLoading}
                  className="flex-1 bg-transparent text-xs outline-none border-none px-2 py-2 font-mono tracking-wider disabled:opacity-30"
                  style={{ color: c.text }}
                />
                {uid && !isLoading && (
                  <button type="button" onClick={() => setUid('')}
                          className="px-1.5" style={{ color: c.textFaint }}>
                    <X className="w-3 h-3" />
                  </button>
                )}
                <button type="submit" disabled={!uid.trim() || isLoading}
                        className="px-3 py-2 text-xs font-semibold transition-all duration-200 whitespace-nowrap disabled:opacity-40"
                        style={{ background: c.gold, color: c.goldText }}>
                  {isLoading ? '查询中' : '查询'}
                </button>
              </div>

              {showRecent && recentUids.length > 0 && !isLoading && (
                <div className="absolute top-full left-0 right-0 mt-1 rounded-lg overflow-hidden z-40"
                     style={{
                       background: c.dropdownBg,
                       border: `1px solid ${c.dropdownBorder}`,
                       boxShadow: c.dropdownShadow,
                     }}>
                  {recentUids.map(u => (
                    <button key={u} type="button"
                            onMouseDown={() => handleRecentClick(u)}
                            className="flex items-center gap-2 w-full px-3 py-2 text-xs transition-colors"
                            style={{ color: c.textSecondary }}>
                      <History className="w-3 h-3" style={{ color: c.textFaint }} />
                      {u}
                    </button>
                  ))}
                </div>
              )}
            </form>
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
            style={{ background: c.sideInputBg, border: `1px solid ${c.sideInputBorder}`, color: c.textMuted }}
            title={theme === 'dark' ? '浅色模式' : '深色模式'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Player info when loaded */}
          <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
            {hasData && playerInfo && (
              <>
                <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
                     style={{ background: c.goldBg, border: `1px solid ${c.goldBorder}` }}>
                  {playerInfo.profilePicture?.iconUrl ? (
                    <img src={playerInfo.profilePicture.iconUrl} alt="" className="w-full h-full object-cover"
                         onError={e => { e.target.style.display = 'none' }} />
                  ) : (
                    <span className="text-xs" style={{ color: c.gold }}>旅</span>
                  )}
                </div>
                <div className="min-w-0 hidden md:block">
                  <div className="text-xs font-semibold truncate" style={{ color: c.text }}>
                    {playerInfo.nickname}
                  </div>
                  <div className="text-[10px] font-mono" style={{ color: c.textFaint }}>
                    Lv.{playerInfo.level}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
