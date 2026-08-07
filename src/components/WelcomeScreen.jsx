import { useState, useCallback, useRef, useEffect } from 'react'
import { Search, Users, Swords, BarChart3, Compass, Clock, X } from 'lucide-react'
import { useTheme } from '../utils/theme'

const RECENT_KEY = 'genshin_recent_uids'

const features = [
  {
    icon: <Users className="w-5 h-5" />,
    title: '角色展柜',
    desc: '查看全部展示角色的详细属性、武器与圣遗物搭配',
    colorKey: 'gold',
  },
  {
    icon: <Swords className="w-5 h-5" />,
    title: '深渊战绩',
    desc: '深境螺旋与幽境危战探索进度一目了然',
    colorKey: 'rust',
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    title: '面板评分',
    desc: '基于暴击值的角色练度评估与多维度属性对比',
    colorKey: 'sage',
  },
]

export default function WelcomeScreen({ onSearch }) {
  const { colors: c } = useTheme()
  const [uid, setUid] = useState('')
  const [showRecent, setShowRecent] = useState(false)
  const [recentUids, setRecentUids] = useState(() => {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]') }
    catch { return [] }
  })
  const inputRef = useRef(null)
  const wrapperRef = useRef(null)

  // 点击外部关闭下拉
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowRecent(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const saveRecent = useCallback((trimmed) => {
    const updated = [trimmed, ...recentUids.filter(u => u !== trimmed)].slice(0, 8)
    setRecentUids(updated)
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated))
  }, [recentUids])

  const handleSubmit = useCallback((e) => {
    e.preventDefault()
    const trimmed = uid.trim()
    if (!trimmed) return
    const uidNum = parseInt(trimmed)
    if (isNaN(uidNum) || trimmed.length < 9 || trimmed.length > 10) return
    saveRecent(trimmed)
    onSearch(trimmed)
    setShowRecent(false)
  }, [uid, onSearch, saveRecent])

  const handleRecentClick = useCallback((u) => {
    setUid(u)
    saveRecent(u)
    onSearch(u)
    setShowRecent(false)
  }, [onSearch, saveRecent])

  const handleRemoveRecent = useCallback((e, u) => {
    e.stopPropagation()
    const updated = recentUids.filter(item => item !== u)
    setRecentUids(updated)
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated))
  }, [recentUids])

  return (
    <div className="page-enter max-w-xl mx-auto pt-12 lg:pt-20 px-5">
      <div className="text-center mb-10">
        <div className="inline-flex mb-6 relative">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
               style={{
                 background: `linear-gradient(135deg, ${c.goldBg}, transparent)`,
                 border: `1px solid ${c.goldBorder}`,
               }}>
            <Compass className="w-9 h-9" style={{ color: c.gold }} />
          </div>
        </div>

        <h2 className="text-2xl font-bold font-display tracking-wide mb-2" style={{ color: c.text }}>
          提瓦特观测台
        </h2>
        <p className="text-xs font-display tracking-[0.15em] mb-4" style={{ color: c.textFaint }}>
          TEYVAT OBSERVATORY
        </p>
        <div className="w-10 h-px mx-auto mb-5" style={{ background: c.border }} />
        <p className="text-sm leading-relaxed max-w-sm mx-auto" style={{ color: c.textSecondary }}>
          输入UID，即可观测角色展柜、深境螺旋战绩与面板评分。
          <br />
          数据来源于 Enka.Network 公开 API。
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mb-8" ref={wrapperRef}>
        <div className="relative">
          <div className="flex items-stretch rounded-lg overflow-hidden card" style={{ boxShadow: c.cardShadowHover }}>
            <input
              ref={inputRef}
              type="text" inputMode="numeric" pattern="[0-9]*" maxLength={10}
              value={uid}
              onChange={(e) => setUid(e.target.value.replace(/\D/g, ''))}
              onFocus={() => recentUids.length > 0 && setShowRecent(true)}
              placeholder="输入UID"
              className="flex-1 bg-transparent text-sm outline-none border-none px-4 py-3 font-mono tracking-wider"
              style={{ color: c.text }}
            />
            <button type="submit" disabled={!uid.trim()}
                    className="px-5 py-3 text-sm font-semibold transition-all duration-200 flex items-center gap-2 disabled:opacity-40"
                    style={{ background: c.gold, color: c.goldText }}>
              <Search className="w-4 h-4" />
              查询
            </button>
          </div>

          {/* 历史记录下拉 */}
          {showRecent && recentUids.length > 0 && (
            <div className="absolute left-0 right-0 mt-1 rounded-lg overflow-hidden z-20"
                 style={{
                   background: c.surfaceElevated,
                   border: `1px solid ${c.border}`,
                   boxShadow: `0 8px 24px rgba(0,0,0,0.3)`,
                 }}>
              <div className="flex items-center justify-between px-3 py-2"
                   style={{ borderBottom: `1px solid ${c.border}` }}>
                <span className="text-[10px] font-medium flex items-center gap-1.5"
                      style={{ color: c.textFaint }}>
                  <Clock className="w-3 h-3" />
                  历史记录
                </span>
              </div>
              {recentUids.map((u) => (
                <div key={u}
                     onClick={() => handleRecentClick(u)}
                     className="flex items-center justify-between px-3 py-2.5 cursor-pointer transition-colors"
                     style={{ color: c.textSecondary }}
                     onMouseEnter={e => e.currentTarget.style.background = c.surfaceHover}
                     onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <span className="font-mono text-sm tracking-wider">{u}</span>
                  <button onClick={(e) => handleRemoveRecent(e, u)}
                          className="p-1 rounded transition-colors hover:opacity-70"
                          style={{ color: c.textFaint }}>
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </form>

      <div className="grid gap-3 mb-8">
        {features.map((f, i) => {
          const color = c[f.colorKey]
          return (
            <div key={i} className="card p-5 flex items-start gap-4" style={{
              animation: `slideUp 0.4s ease-out ${i * 80}ms both, fadeIn 0.4s ease-out ${i * 80}ms both`,
            }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                   style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
                <span style={{ color }}>{f.icon}</span>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-1" style={{ color: c.text }}>{f.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: c.textMuted }}>{f.desc}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="text-center p-5 rounded-xl space-y-3"
           style={{
             background: c.surfaceElevated,
             border: `1px dashed ${c.border}`,
           }}>
        <p className="text-xs" style={{ color: c.textMuted }}>
          试试观测{' '}
          <code className="font-mono px-1.5 py-0.5 rounded text-xs"
                style={{ background: c.goldBg, color: c.gold }}>
            160041179
          </code>
        </p>
        <p className="text-[11px] leading-relaxed" style={{ color: c.textFaint }}>
          数据来源于 Enka.Network 公开 API，首次查询可能需要等待几秒钟。
        </p>
      </div>
    </div>
  )
}
