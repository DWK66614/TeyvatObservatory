import { useState, useCallback, useEffect, useRef } from 'react'
import { Home, Users, Zap, BarChart3, Search, X, History, Star, Menu, Sun, Moon } from 'lucide-react'
import { useTheme } from '../utils/theme'

const ICON_MAP = { Home, Users, Zap, BarChart3 }

export default function Sidebar({ activeTab, onTabChange, onSearch, isLoading, tabs, playerInfo, hasData }) {
  const { theme, colors: c, toggleTheme } = useTheme()
  const [uid, setUid] = useState('')
  const [recentUids, setRecentUids] = useState(() => {
    try { return JSON.parse(localStorage.getItem('genshin_recent_uids') || '[]') }
    catch { return [] }
  })
  const [showRecent, setShowRecent] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const inputRef = useRef(null)

  const closeMobile = useCallback(() => setMobileOpen(false), [])

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
    closeMobile()
  }, [uid, isLoading, recentUids, onSearch, closeMobile])

  const handleRecentClick = useCallback((u) => {
    setUid(u)
    onSearch(u)
    setShowRecent(false)
    closeMobile()
  }, [onSearch, closeMobile])

  // Close mobile sidebar on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') closeMobile() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [closeMobile])

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* ── Logo ── */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
               style={{ background: c.goldBg, border: `1px solid ${c.goldBorder}` }}>
            <Star className="w-5 h-5" style={{ color: c.gold }} />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold tracking-wider font-display" style={{ color: c.gold, letterSpacing: '0.06em' }}>
              提瓦特观测台
            </h1>
            <p className="text-[10px] mt-0.5 font-display tracking-[0.1em]" style={{ color: c.sideSectionLabel }}>
              TEYVAT OBSERVATORY
            </p>
          </div>
        </div>
      </div>

      {/* ── Search ── */}
      <div className="px-4 pb-4">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-stretch rounded-lg overflow-hidden transition-all duration-200"
               style={{
                 background: c.sideInputBg,
                 border: isLoading
                   ? `1px solid ${c.inputFocusBorder}`
                   : `1px solid ${c.sideInputBorder}`,
               }}>
            <div className="flex items-center pl-3">
              {isLoading ? (
                <svg className="animate-spin w-3.5 h-3.5" style={{ color: c.gold }} viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <Search className="w-3.5 h-3.5" style={{ color: c.sideSectionLabel }} />
              )}
            </div>
            <input
              ref={inputRef}
              type="text" inputMode="numeric" pattern="[0-9]*" maxLength={10}
              value={uid}
              onChange={(e) => setUid(e.target.value.replace(/\D/g, ''))}
              onFocus={() => setShowRecent(true)}
              onBlur={() => setTimeout(() => setShowRecent(false), 250)}
              placeholder="输入 UID"
              disabled={isLoading}
              className="flex-1 bg-transparent text-xs outline-none border-none px-2 py-2.5 font-mono tracking-wider disabled:opacity-30"
              style={{ color: c.text }}
            />
            {uid && !isLoading && (
              <button type="button" onClick={() => setUid('')}
                      className="px-1.5" style={{ color: c.sideSectionLabel }}>
                <X className="w-3 h-3" />
              </button>
            )}
            <button type="submit" disabled={!uid.trim() || isLoading}
                    className="px-3 py-2 text-[11px] font-semibold transition-all duration-200 disabled:opacity-30"
                    style={{ background: uid.trim() && !isLoading ? c.gold : 'transparent', color: uid.trim() && !isLoading ? '#080c1d' : c.sideSectionLabel }}>
              {isLoading ? '···' : '查询'}
            </button>
          </div>

          {/* Recent UIDs */}
          {showRecent && recentUids.length > 0 && !isLoading && (
            <div className="absolute top-full left-0 right-0 mt-1.5 rounded-lg overflow-hidden z-30"
                 style={{ background: c.dropdownBg, border: `1px solid ${c.dropdownBorder}`, boxShadow: c.dropdownShadow }}>
              {recentUids.map(u => (
                <button key={u} type="button"
                        onMouseDown={(e) => { e.preventDefault(); handleRecentClick(u) }}
                        className="flex items-center gap-2 w-full px-3 py-2.5 text-xs transition-colors"
                        style={{ color: c.dust }}>
                  <History className="w-3 h-3" /> {u}
                </button>
              ))}
            </div>
          )}
        </form>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 space-y-0.5">
        <p className="px-3 py-1 text-[10px] font-semibold tracking-[0.1em] uppercase font-display" style={{ color: c.sideSectionLabel }}>
          导 航
        </p>
        {tabs.map(tab => {
          const Icon = ICON_MAP[tab.icon] || Home
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => { onTabChange(tab.id); closeMobile() }}
              disabled={isLoading}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
              style={isActive ? {
                background: c.sideNavActiveBg,
                color: c.sideNavActiveText,
              } : {
                color: c.sideNavInactiveText,
                background: 'transparent',
              }}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{tab.label}</span>
              {isActive && (
                <span className="ml-auto w-1 h-1 rounded-full" style={{ background: c.gold }} />
              )}
            </button>
          )
        })}
      </nav>

      {/* ── Player Info ── */}
      {hasData && playerInfo && (
        <div className="px-4 pb-3">
          <div className="flex items-center gap-3 p-2.5 rounded-lg"
               style={{ background: c.goldBg, border: `1px solid ${c.goldBorder}` }}>
            <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
                 style={{ border: `1px solid ${c.goldBorder}` }}>
              {playerInfo.profilePicture?.iconUrl ? (
                <img src={playerInfo.profilePicture.iconUrl} alt="" className="w-full h-full object-cover"
                     onError={e => { e.target.style.display = 'none' }} />
              ) : (
                <span className="text-xs" style={{ color: c.gold }}>旅</span>
              )}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold truncate" style={{ color: c.text }}>
                {playerInfo.nickname}
              </div>
              <div className="text-[10px] font-mono" style={{ color: c.textFaint }}>
                Lv.{playerInfo.level}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Theme Toggle & Footer ── */}
      <div className="px-4 py-4 border-t" style={{ borderColor: c.sideFooterBorder }}>
        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs transition-all duration-200 mb-3"
          style={{ background: c.btnGhostBg, border: `1px solid ${c.btnGhostBorder}`, color: c.btnGhostText }}
        >
          {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          <span>{theme === 'dark' ? '浅色模式' : '深色模式'}</span>
        </button>
        <a href="https://enka.network" target="_blank" rel="noopener noreferrer"
           className="flex items-center gap-1.5 text-[10px] transition-colors"
           style={{ color: c.sideFooterText }}>
          <span className="w-1 h-1 rounded-full" style={{ background: c.nebula }} />
          Enka.Network
        </a>
        <p className="text-[9px] mt-1.5" style={{ color: c.footerText }}>仅供学习交流</p>
      </div>
    </div>
  )

  return (
    <>
      {/* ── Mobile hamburger ── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-50 w-11 h-11 rounded-xl flex items-center justify-center"
        style={{ background: c.sideBg, backdropFilter: 'blur(12px)', border: `1px solid ${c.sideInputBorder}` }}
        aria-label="打开菜单"
      >
        <Menu className="w-5 h-5" style={{ color: c.gold }} />
      </button>

      {/* ── Mobile overlay (closes sidebar on tap) ── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 transition-opacity duration-300"
          style={{ background: c.overlayBg, backdropFilter: 'blur(4px)' }}
          onClick={closeMobile}
        />
      )}

      {/* ── Sidebar panel ── */}
      <aside
        className="fixed left-0 top-0 bottom-0 z-40 w-64
                   transition-transform duration-300 ease-out
                   lg:translate-x-0
                   max-lg:-translate-x-full"
        style={{
          background: c.sideBg,
          backdropFilter: 'blur(20px)',
          borderRight: `1px solid ${c.sideBorder}`,
          transform: !mobileOpen ? undefined : 'translateX(0)',
        }}
      >
        {/* Close button — visible on mobile */}
        <div className="lg:hidden flex justify-end px-4 pt-4">
          <button
            onClick={closeMobile}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: c.btnGhostBg, color: c.dust }}
            aria-label="关闭菜单"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {sidebarContent}
      </aside>
    </>
  )
}
