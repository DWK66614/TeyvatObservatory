import { useMemo } from 'react'
import { Trophy, TrendingUp, Shield } from 'lucide-react'
import { ELEMENTS } from '../utils/constants'
import { getCharacterInfo } from '../api/enka'

function getCVGrade(cv) {
  if (cv >= 240) return { g: 'SSS', c: '#edd9a3' }
  if (cv >= 200) return { g: 'SS', c: '#e0b040' }
  if (cv >= 160) return { g: 'S', c: '#b07cf7' }
  if (cv >= 120) return { g: 'A', c: '#7095c4' }
  return { g: 'B', c: '#5c5b78' }
}

function fmt(n) { return (n != null && !isNaN(n)) ? Math.round(n).toLocaleString() : '--' }

export default function StatsPanel({ characters }) {
  if (!characters?.length) {
    return (
      <div>
        <div className="card p-14 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
               style={{ background: 'rgba(112,149,196,0.04)', border: '1px solid rgba(112,149,196,0.08)' }}>
            <Trophy className="w-7 h-7" style={{ color: '#5c5b78' }} />
          </div>
          <p className="text-sm font-medium" style={{ color: '#8b8aa6' }}>暂无面板数据</p>
        </div>
      </div>
    )
  }

  const avgCV = Math.round(characters.reduce((s, c) => s + (c.critValue || 0), 0) / characters.length)
  const ssCount = characters.filter(c => (c.critValue || 0) >= 200).length

  return (
    <div className="space-y-5">
      {/* ── Summary header ── */}
      <div className="card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="section-heading mb-1">角色面板</h3>
          <p className="text-xs" style={{ color: '#8b8aa6' }}>
            {characters.length} 位角色 · 平均暴击值{' '}
            <span className="font-mono font-semibold" style={{ color: '#edd9a3' }}>{avgCV}</span>
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[10px] font-medium tracking-wide uppercase" style={{ color: '#5c5b78' }}>
              SS 级以上
            </div>
            <div className="text-3xl font-bold font-mono" style={{ color: '#edd9a3' }}>
              {ssCount}
            </div>
          </div>
          <div className="w-px h-10" style={{ background: 'rgba(112,149,196,0.08)' }} />
          <div className="text-right">
            <div className="text-[10px] font-medium tracking-wide uppercase" style={{ color: '#5c5b78' }}>
              总计角色
            </div>
            <div className="text-3xl font-bold font-mono" style={{ color: '#7095c4' }}>
              {characters.length}
            </div>
          </div>
        </div>
      </div>

      {/* ── CV Leaderboard ── */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center"
               style={{ background: 'rgba(237,217,163,0.06)', border: '1px solid rgba(237,217,163,0.1)' }}>
            <Trophy className="w-4 h-4" style={{ color: '#edd9a3' }} />
          </div>
          <div>
            <h4 className="section-heading">暴击值排名</h4>
            <p className="text-[10px] mt-0.5" style={{ color: '#5c5b78' }}>Crit Value Leaderboard</p>
          </div>
        </div>

        <div className="space-y-1">
          {[...characters]
            .sort((a, b) => (b.critValue || 0) - (a.critValue || 0))
            .slice(0, 8)
            .map((c, i) => {
              const ci = getCharacterInfo(c.id, c.detectedElement)
              const el = ci?.element ? ELEMENTS[ci.element] : null
              const cv = c.critValue || 0
              const maxCV = Math.max(...characters.map(ch => ch.critValue || 0), 1)
              const grade = getCVGrade(cv)
              return (
                <div key={c.id} className="flex items-center gap-3 py-2 group rounded-lg px-2 -mx-2 hover:bg-white/[0.02] transition-colors">
                  {/* Rank */}
                  <span className="w-6 text-xs font-mono text-right flex-shrink-0" style={{
                    color: i === 0 ? '#edd9a3' : i < 3 ? '#8b8aa6' : '#5c5b78',
                  }}>
                    {i === 0 ? '✦' : i + 1}
                  </span>

                  {/* Element dot */}
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                       style={{ background: el?.color || '#5c5b78' }} />

                  {/* Name */}
                  <span className="w-20 text-xs truncate flex-shrink-0" style={{ color: '#c0bdb5' }}>
                    {ci?.name || `#${c.id}`}
                  </span>

                  {/* CV bar */}
                  <div className="flex-1 h-3 rounded-full overflow-hidden"
                       style={{ background: 'rgba(112,149,196,0.06)' }}>
                    <div className="h-full rounded-full transition-all duration-700"
                         style={{
                           width: `${Math.min(cv / maxCV * 100, 100)}%`,
                           background: `linear-gradient(90deg, ${grade.c}20, ${grade.c})`,
                         }} />
                  </div>

                  {/* CV value */}
                  <span className="text-xs font-mono font-bold flex-shrink-0" style={{
                    color: grade.c, minWidth: 40, textAlign: 'right',
                  }}>
                    {cv.toFixed(0)}
                  </span>

                  {/* Grade badge */}
                  <span className="text-[10px] font-bold font-display px-2 py-0.5 rounded flex-shrink-0 w-9 text-center tracking-wider"
                        style={{ background: grade.c + '12', color: grade.c }}>
                    {grade.g}
                  </span>
                </div>
              )
            })}
        </div>
      </div>

      {/* ── Stats Comparison Table ── */}
      <div className="card p-6 overflow-hidden">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center"
               style={{ background: 'rgba(64,201,160,0.06)', border: '1px solid rgba(64,201,160,0.1)' }}>
            <TrendingUp className="w-4 h-4" style={{ color: '#40c9a0' }} />
          </div>
          <div>
            <h4 className="section-heading">属性对比</h4>
            <p className="text-[10px] mt-0.5" style={{ color: '#5c5b78' }}>Attribute Comparison</p>
          </div>
        </div>

        <div className="overflow-x-auto -mx-6">
          <table className="w-full text-xs min-w-[620px]">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(112,149,196,0.06)' }}>
                <th className="text-left py-2.5 pl-6 pr-3 sticky left-0 z-10 font-medium"
                    style={{ background: '#111633', color: '#5c5b78' }}>
                  角色
                </th>
                {['等级', '生命值', '攻击力', '防御力', '精通', '暴击率', '暴伤', '充能'].map(h => (
                  <th key={h} className="text-right py-2.5 px-2 font-medium" style={{ color: '#5c5b78' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...characters].sort((a, b) => (b.level || 0) - (a.level || 0)).map(c => {
                const ci = getCharacterInfo(c.id, c.detectedElement)
                const el = ci?.element ? ELEMENTS[ci.element] : null
                const s = c.stats || {}
                return (
                  <tr key={c.id} className="hover:bg-white/[0.015] transition-colors"
                      style={{ borderBottom: '1px solid rgba(112,149,196,0.03)' }}>
                    <td className="py-3 pl-6 pr-3 sticky left-0 z-10" style={{ background: '#111633' }}>
                      <div className="flex items-center gap-2.5">
                        <div className="w-1.5 h-5 rounded-full flex-shrink-0" style={{ background: el?.color || '#5c5b78' }} />
                        <span className="truncate font-medium" style={{ color: '#c0bdb5' }}>
                          {ci?.name || `#${c.id}`}
                        </span>
                      </div>
                    </td>
                    <td className="text-right py-3 px-2 font-mono" style={{ color: '#8b8aa6' }}>{c.level}</td>
                    <td className="text-right py-3 px-2 font-mono" style={{ color: '#c0bdb5' }}>{fmt(s.hp)}</td>
                    <td className="text-right py-3 px-2 font-mono" style={{ color: '#c0bdb5' }}>{fmt(s.atk)}</td>
                    <td className="text-right py-3 px-2 font-mono" style={{ color: '#c0bdb5' }}>{fmt(s.def)}</td>
                    <td className="text-right py-3 px-2 font-mono" style={{ color: '#c0bdb5' }}>{fmt(s.em)}</td>
                    <td className="text-right py-3 px-2 font-mono font-semibold"
                        style={{ color: s.critRate != null ? '#edd9a3' : '#5c5b78' }}>
                      {s.critRate != null ? s.critRate.toFixed(1) + '%' : '--'}
                    </td>
                    <td className="text-right py-3 px-2 font-mono font-semibold"
                        style={{ color: s.critDmg != null ? '#edd9a3' : '#5c5b78' }}>
                      {s.critDmg != null ? s.critDmg.toFixed(1) + '%' : '--'}
                    </td>
                    <td className="text-right py-3 px-2 font-mono" style={{ color: '#c0bdb5' }}>
                      {s.er != null ? s.er.toFixed(1) + '%' : '--'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Artifact Summary ── */}
      {(() => {
        const total = characters.reduce((s, c) => s + (c.artifacts?.length || 0), 0)
        const five = characters.reduce((s, c) => s + (c.artifacts?.filter(a => a.rarity >= 5).length || 0), 0)
        return (
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                   style={{ background: 'rgba(176,124,247,0.06)', border: '1px solid rgba(176,124,247,0.1)' }}>
                <Shield className="w-4 h-4" style={{ color: '#b07cf7' }} />
              </div>
              <div>
                <h4 className="section-heading">圣遗物概览</h4>
                <p className="text-[10px] mt-0.5" style={{ color: '#5c5b78' }}>Artifact Overview</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 rounded-xl text-center relative overflow-hidden"
                   style={{ background: 'rgba(237,217,163,0.03)', border: '1px solid rgba(237,217,163,0.06)' }}>
                <div className="text-3xl font-bold font-mono" style={{ color: '#edd9a3' }}>
                  {total}
                </div>
                <div className="text-xs mt-1.5 font-medium" style={{ color: '#8b8aa6' }}>
                  圣遗物总数
                </div>
              </div>
              <div className="p-5 rounded-xl text-center relative overflow-hidden"
                   style={{ background: 'rgba(176,124,247,0.03)', border: '1px solid rgba(176,124,247,0.06)' }}>
                <div className="text-3xl font-bold font-mono" style={{ color: '#b07cf7' }}>
                  {five}
                </div>
                <div className="text-xs mt-1.5 font-medium" style={{ color: '#8b8aa6' }}>
                  五星品质 · {total > 0 ? Math.round(five / total * 100) : 0}%
                </div>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
