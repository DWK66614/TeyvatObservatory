import { useMemo } from 'react'
import { Trophy, TrendingUp, Shield } from 'lucide-react'
import { ELEMENTS } from '../utils/constants'
import { getCharacterInfo } from '../api/enka'
import { useTheme } from '../utils/theme'

function getCVGrade(cv, c) {
  if (cv >= 240) return { g: 'SSS', color: c.cvSSS }
  if (cv >= 200) return { g: 'SS', color: c.cvSS }
  if (cv >= 160) return { g: 'S', color: c.cvS }
  if (cv >= 120) return { g: 'A', color: c.cvA }
  return { g: 'B', color: c.cvB }
}

function fmt(n) { return (n != null && !isNaN(n)) ? Math.round(n).toLocaleString() : '--' }

export default function StatsPanel({ characters }) {
  const { colors: c } = useTheme()

  if (!characters?.length) {
    return (
      <div>
        <div className="card p-14 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
               style={{ background: c.goldBg, border: `1px solid ${c.goldBorder}` }}>
            <Trophy className="w-7 h-7" style={{ color: c.textFaint }} />
          </div>
          <p className="text-sm font-medium" style={{ color: c.textSecondary }}>暂无面板数据</p>
        </div>
      </div>
    )
  }

  const avgCV = Math.round(characters.reduce((s, c) => s + (c.critValue || 0), 0) / characters.length)
  const ssCount = characters.filter(c => (c.critValue || 0) >= 200).length

  return (
    <div className="space-y-5">
      <div className="card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="section-heading mb-1">角色面板</h3>
          <p className="text-xs" style={{ color: c.textSecondary }}>
            {characters.length} 位角色 · 平均暴击值{' '}
            <span className="font-mono font-semibold" style={{ color: c.gold }}>{avgCV}</span>
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[10px] font-medium tracking-wide uppercase" style={{ color: c.textFaint }}>
              SS 级以上
            </div>
            <div className="text-3xl font-bold font-mono" style={{ color: c.gold }}>
              {ssCount}
            </div>
          </div>
          <div className="w-px h-10" style={{ background: c.border }} />
          <div className="text-right">
            <div className="text-[10px] font-medium tracking-wide uppercase" style={{ color: c.textFaint }}>
              总计角色
            </div>
            <div className="text-3xl font-bold font-mono" style={{ color: c.nebula }}>
              {characters.length}
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center"
               style={{ background: c.goldBg, border: `1px solid ${c.goldBorder}` }}>
            <Trophy className="w-4 h-4" style={{ color: c.gold }} />
          </div>
          <div>
            <h4 className="section-heading">暴击值排名</h4>
            <p className="text-[10px] mt-0.5" style={{ color: c.textFaint }}>Crit Value Leaderboard</p>
          </div>
        </div>

        <div className="space-y-1">
          {[...characters]
            .sort((a, b) => (b.critValue || 0) - (a.critValue || 0))
            .slice(0, 8)
            .map((ch, i) => {
              const ci = getCharacterInfo(ch.id, ch.detectedElement)
              const el = ci?.element ? ELEMENTS[ci.element] : null
              const cv = ch.critValue || 0
              const maxCV = Math.max(...characters.map(x => x.critValue || 0), 1)
              const grade = getCVGrade(cv, c)
              return (
                <div key={c.id} className="flex items-center gap-3 py-2 group rounded-lg px-2 -mx-2 transition-colors">
                  <span className="w-6 text-xs font-mono text-right flex-shrink-0" style={{
                    color: i === 0 ? c.gold : i < 3 ? c.textSecondary : c.textFaint,
                  }}>
                    {i === 0 ? '✦' : i + 1}
                  </span>

                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                       style={{ background: el?.color || c.textFaint }} />

                  <span className="w-20 text-xs truncate flex-shrink-0" style={{ color: c.text }}>
                    {ci?.name || `#${c.id}`}
                  </span>

                  <div className="flex-1 h-3 rounded-full overflow-hidden"
                       style={{ background: c.statBarBg }}>
                    <div className="h-full rounded-full transition-all duration-700"
                         style={{
                           width: `${Math.min(cv / maxCV * 100, 100)}%`,
                           background: `linear-gradient(90deg, ${grade.color}20, ${grade.color})`,
                         }} />
                  </div>

                  <span className="text-xs font-mono font-bold flex-shrink-0" style={{
                    color: grade.color, minWidth: 40, textAlign: 'right',
                  }}>
                    {cv.toFixed(0)}
                  </span>

                  <span className="text-[10px] font-bold font-display px-2 py-0.5 rounded flex-shrink-0 w-9 text-center tracking-wider"
                        style={{ background: grade.color + '12', color: grade.color }}>
                    {grade.g}
                  </span>
                </div>
              )
            })}
        </div>
      </div>

      <div className="card p-6 overflow-hidden">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center"
               style={{ background: c.sageBg, border: `1px solid ${c.sageBorder}` }}>
            <TrendingUp className="w-4 h-4" style={{ color: c.sage }} />
          </div>
          <div>
            <h4 className="section-heading">属性对比</h4>
            <p className="text-[10px] mt-0.5" style={{ color: c.textFaint }}>Attribute Comparison</p>
          </div>
        </div>

        <div className="overflow-x-auto -mx-6">
          <table className="w-full text-xs min-w-[620px]">
            <thead>
              <tr style={{ borderBottom: `1px solid ${c.border}` }}>
                <th className="text-left py-2.5 pl-6 pr-3 sticky left-0 z-10 font-medium"
                    style={{ background: c.cardBg, color: c.textFaint }}>
                  角色
                </th>
                {['等级', '生命值', '攻击力', '防御力', '精通', '暴击率', '暴伤', '充能'].map(h => (
                  <th key={h} className="text-right py-2.5 px-2 font-medium" style={{ color: c.textFaint }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...characters].sort((a, b) => (b.level || 0) - (a.level || 0)).map(ch => {
                const ci = getCharacterInfo(ch.id, ch.detectedElement)
                const el = ci?.element ? ELEMENTS[ci.element] : null
                const s = ch.stats || {}
                return (
                  <tr key={ch.id} className="transition-colors"
                      style={{ borderBottom: `1px solid ${c.borderLight}` }}>
                    <td className="py-3 pl-6 pr-3 sticky left-0 z-10" style={{ background: c.cardBg }}>
                      <div className="flex items-center gap-2.5">
                        <div className="w-1.5 h-5 rounded-full flex-shrink-0" style={{ background: el?.color || c.textFaint }} />
                        <span className="truncate font-medium" style={{ color: c.text }}>
                          {ci?.name || `#${ch.id}`}
                        </span>
                      </div>
                    </td>
                    <td className="text-right py-3 px-2 font-mono" style={{ color: c.textSecondary }}>{ch.level}</td>
                    <td className="text-right py-3 px-2 font-mono" style={{ color: c.text }}>{fmt(s.hp)}</td>
                    <td className="text-right py-3 px-2 font-mono" style={{ color: c.text }}>{fmt(s.atk)}</td>
                    <td className="text-right py-3 px-2 font-mono" style={{ color: c.text }}>{fmt(s.def)}</td>
                    <td className="text-right py-3 px-2 font-mono" style={{ color: c.text }}>{fmt(s.em)}</td>
                    <td className="text-right py-3 px-2 font-mono font-semibold"
                        style={{ color: s.critRate != null ? c.gold : c.textFaint }}>
                      {s.critRate != null ? s.critRate.toFixed(1) + '%' : '--'}
                    </td>
                    <td className="text-right py-3 px-2 font-mono font-semibold"
                        style={{ color: s.critDmg != null ? c.gold : c.textFaint }}>
                      {s.critDmg != null ? s.critDmg.toFixed(1) + '%' : '--'}
                    </td>
                    <td className="text-right py-3 px-2 font-mono" style={{ color: c.text }}>
                      {s.er != null ? s.er.toFixed(1) + '%' : '--'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {(() => {
        const total = characters.reduce((s, c) => s + (c.artifacts?.length || 0), 0)
        const five = characters.reduce((s, c) => s + (c.artifacts?.filter(a => a.rarity >= 5).length || 0), 0)
        return (
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                   style={{ background: c.purpleBg, border: `1px solid ${c.purpleBorder}` }}>
                <Shield className="w-4 h-4" style={{ color: c.purple }} />
              </div>
              <div>
                <h4 className="section-heading">圣遗物概览</h4>
                <p className="text-[10px] mt-0.5" style={{ color: c.textFaint }}>Artifact Overview</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 rounded-xl text-center relative overflow-hidden"
                   style={{ background: c.goldBg, border: `1px solid ${c.goldBorder}` }}>
                <div className="text-3xl font-bold font-mono" style={{ color: c.gold }}>
                  {total}
                </div>
                <div className="text-xs mt-1.5 font-medium" style={{ color: c.textSecondary }}>
                  圣遗物总数
                </div>
              </div>
              <div className="p-5 rounded-xl text-center relative overflow-hidden"
                   style={{ background: c.purpleBg, border: `1px solid ${c.purpleBorder}` }}>
                <div className="text-3xl font-bold font-mono" style={{ color: c.purple }}>
                  {five}
                </div>
                <div className="text-xs mt-1.5 font-medium" style={{ color: c.textSecondary }}>
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
