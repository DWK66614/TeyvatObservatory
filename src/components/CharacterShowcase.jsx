import { useState, useMemo } from 'react'
import { Users, ArrowUpDown, Flame, Sparkles } from 'lucide-react'
import CharacterCard from './CharacterCard'

const SORT_OPTIONS = [
  { key: 'level', label: '等级', icon: ArrowUpDown },
  { key: 'cv', label: '暴击值', icon: Flame },
  { key: 'element', label: '元素', icon: Sparkles },
]

export default function CharacterShowcase({ characters }) {
  const [sortBy, setSortBy] = useState('level')
  const [expandedId, setExpandedId] = useState(null)

  const sorted = useMemo(() => {
    if (!characters?.length) return []
    const arr = [...characters]
    switch (sortBy) {
      case 'cv': return arr.sort((a, b) => (b.critValue || 0) - (a.critValue || 0))
      case 'element': return arr.sort((a, b) => (a.detectedElement || '').localeCompare(b.detectedElement || '') || (b.level || 0) - (a.level || 0))
      default: return arr.sort((a, b) => (b.level || 0) - (a.level || 0))
    }
  }, [characters, sortBy])

  if (!characters?.length) {
    return (
      <div>
        <div className="card p-12 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
               style={{ background: 'rgba(112,149,196,0.04)', border: '1px solid rgba(112,149,196,0.08)' }}>
            <Users className="w-7 h-7" style={{ color: '#5c5b78' }} />
          </div>
          <p className="font-semibold text-sm" style={{ color: '#8b8aa6' }}>暂无角色数据</p>
          <p className="text-xs mt-1" style={{ color: '#5c5b78' }}>该玩家可能未公开角色展柜</p>
        </div>
      </div>
    )
  }

  const avgCV = sorted.reduce((s, c) => s + (c.critValue || 0), 0) / sorted.length

  return (
    <div>
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5">
        <div>
          <h3 className="section-heading mb-1">角色展柜</h3>
          <p className="text-xs" style={{ color: '#8b8aa6' }}>
            {sorted.length} 位角色 · 平均暴击值{' '}
            <span className="font-mono font-semibold" style={{ color: '#edd9a3' }}>{avgCV.toFixed(0)}</span>
          </p>
        </div>
        {/* Sort pills */}
        <div className="flex items-center gap-1 p-0.5 rounded-lg"
             style={{ background: 'rgba(112,149,196,0.04)', border: '1px solid rgba(112,149,196,0.06)' }}>
          {SORT_OPTIONS.map(opt => {
            const isActive = sortBy === opt.key
            return (
              <button key={opt.key} onClick={() => setSortBy(opt.key)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-all duration-200 font-medium"
                      style={isActive
                        ? { background: 'rgba(237,217,163,0.08)', color: '#edd9a3' }
                        : { color: '#8b8aa6' }}>
                <opt.icon className="w-3 h-3" /> {opt.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {sorted.map((c, i) => (
          <CharacterCard key={c.id || i} character={c} index={i} isExpanded={expandedId === c.id} onToggle={() => setExpandedId(prev => prev === c.id ? null : c.id)} />
        ))}
      </div>
    </div>
  )
}
