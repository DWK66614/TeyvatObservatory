import { useState, useCallback, useEffect, useRef } from 'react'
import { Home, Users, Zap, BarChart3, Search, X, History, Star } from 'lucide-react'

const ICON_MAP = { Home, Users, Zap, BarChart3 }

export default function Sidebar({ activeTab, onTabChange, onSearch, isLoading, tabs }) {
  const [uid, setUid] = useState('')
  const [recentUids, setRecentUids] = useState(() => {
    try { return JSON.parse(localStorage.getItem('genshin_recent_uids') || '[]') }
    catch { return [] }
  })
  const [showRecent, setShowRecent] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const inputRef = useRef(null)

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
    setMobileOpen(false)
  }, [uid, isLoading, recentUids, onSearch])

  const handleRecentClick = useCallback((u) => {
    setUid(u)
    onSearch(u)
    setShowRecent(false)
    setMobileOpen(false)
  }, [onSearch])

  // Close mobile sidebar on escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setMobileOpen(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* ── Logo ── */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
               style={{ background: 'rgba(237,217,163,0.08)', border: '1px solid rgba(237,217,163,0.12)' }}>
            <Star className="w-5 h-5 text-starlight" style={{ color: '#edd9a3' }} />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold tracking-wider font-display" style={{ color: '#edd9a3', letterSpacing: '0.06em' }}>
              Teyvat Observatory
            </h1>
            <p className="text-[10px] mt-0.5 font-display tracking-[0.1em]" style={{ color: '#5c5b78' }}>
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
                 background: 'rgba(112,149,196,0.05)',
                 border: isLoading
                   ? '1px solid rgba(237,217,163,0.3)'
                   : '1px solid rgba(112,149,196,0.1)',
               }}>
            <div className="flex items-center pl-3">
              {isLoading ? (
                <svg className="animate-spin w-3.5 h-3.5" style={{ color: '#edd9a3' }} viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <Search className="w-3.5 h-3.5" style={{ color: '#5c5b78' }} />
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
              style={{ color: '#e5e0d5' }}
            />
            {uid && !isLoading && (
              <button type="button" onClick={() => setUid('')}
                      className="px-1.5 hover:text-parchment" style={{ color: '#5c5b78' }}>
                <X className="w-3 h-3" />
              </button>
            )}
            <button type="submit" disabled={!uid.trim() || isLoading}
                    className="px-3 py-2 text-[11px] font-semibold transition-all duration-200 disabled:opacity-30"
                    style={{ background: uid.trim() && !isLoading ? '#edd9a3' : 'transparent', color: uid.trim() && !isLoading ? '#080c1d' : '#5c5b78' }}>
              {isLoading ? '···' : '查询'}
            </button>
          </div>

          {/* Recent UIDs */}
          {showRecent && recentUids.length > 0 && !isLoading && (
            <div className="absolute top-full left-0 right-0 mt-1.5 rounded-lg overflow-hidden z-30"
                 style={{ background: '#181d42', border: '1px solid rgba(112,149,196,0.12)', boxShadow: '0 12px 40px rgba(0,0,0,0.5)' }}>
              {recentUids.map(u => (
                <button key={u} type="button"
                        onMouseDown={() => handleRecentClick(u)}
                        className="flex items-center gap-2 w-full px-3 py-2.5 text-xs transition-colors hover:bg-white/[0.04]"
                        style={{ color: '#8b8aa6' }}>
                  <History className="w-3 h-3" /> {u}
                </button>
              ))}
            </div>
          )}
        </form>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 space-y-0.5">
        <p className="px-3 py-1 text-[10px] font-semibold tracking-[0.1em] uppercase font-display" style={{ color: '#5c5b78' }}>
          导 航
        </p>
        {tabs.map(tab => {
          const Icon = ICON_MAP[tab.icon] || Home
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => { onTabChange(tab.id); setMobileOpen(false) }}
              disabled={isLoading}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
              style={isActive ? {
                background: 'rgba(237,217,163,0.08)',
                color: '#edd9a3',
                borderLeft: '2px solid #edd9a3',
              } : {
                color: '#8b8aa6',
                background: 'transparent',
                borderLeft: '2px solid transparent',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.color = '#e5e0d5'
                  e.currentTarget.style.background = 'rgba(112,149,196,0.04)'
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.color = '#8b8aa6'
                  e.currentTarget.style.background = 'transparent'
                }
              }}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{tab.label}</span>
              {isActive && (
                <span className="ml-auto w-1 h-1 rounded-full" style={{ background: '#edd9a3' }} />
              )}
            </button>
          )
        })}
      </nav>

      {/* ── Footer ── */}
      <div className="px-4 py-4 border-t" style={{ borderColor: 'rgba(112,149,196,0.06)' }}>
        <a href="https://enka.network" target="_blank" rel="noopener noreferrer"
           className="flex items-center gap-1.5 text-[10px] transition-colors hover:text-starlight"
           style={{ color: '#5c5b78' }}>
          <span className="w-1 h-1 rounded-full" style={{ background: '#7095c4' }} />
          Enka.Network
        </a>
        <p className="text-[9px] mt-1.5" style={{ color: '#3c3b58' }}>仅供学习交流</p>
      </div>
    </div>
  )

  return (
    <>
      {/* ── Mobile hamburger ── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 w-10 h-10 rounded-lg flex items-center justify-center glass-side"
        style={{ border: '1px solid rgba(112,149,196,0.1)' }}
        aria-label="菜单"
      >
        <div className="flex flex-col gap-1">
          <div className="w-4 h-0.5 rounded" style={{ background: '#edd9a3' }} />
          <div className="w-4 h-0.5 rounded" style={{ background: '#edd9a3' }} />
          <div className="w-3 h-0.5 rounded" style={{ background: '#edd9a3' }} />
        </div>
      </button>

      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40" onClick={() => setMobileOpen(false)}
             style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }} />
      )}

      {/* ── Desktop sidebar ── */}
      <aside
        className="fixed left-0 top-0 bottom-0 z-30 w-60 flex-shrink-0
                   lg:translate-x-0
                   max-lg:transition-transform max-lg:duration-300 max-lg:ease-out
                   glass-side"
        style={{
          borderRight: '1px solid rgba(112,149,196,0.06)',
          transform: mobileOpen ? 'translateX(0)' : undefined,
        }}
      >
        <div className="hidden max-lg:flex justify-end px-4 pt-4">
          <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-white/[0.04]"
                  style={{ color: '#5c5b78' }}>
            <X className="w-4 h-4" />
          </button>
        </div>
        {sidebarContent}
      </aside>
    </>
  )
}
