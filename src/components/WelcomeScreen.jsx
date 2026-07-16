import { useState, useCallback } from 'react'
import { Search, Users, Swords, BarChart3, Compass } from 'lucide-react'
import { useTheme } from '../utils/theme'

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

  const handleSubmit = useCallback((e) => {
    e.preventDefault()
    const trimmed = uid.trim()
    if (!trimmed) return
    const uidNum = parseInt(trimmed)
    if (isNaN(uidNum) || trimmed.length < 9 || trimmed.length > 10) return
    onSearch(trimmed)
  }, [uid, onSearch])

  return (
    <div className="page-enter max-w-xl mx-auto pt-8 lg:pt-16 px-5">
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
          原神观测台
        </h2>
        <p className="text-xs font-display tracking-[0.15em] mb-4" style={{ color: c.textFaint }}>
          GENSHIN IMPACT OBSERVER
        </p>
        <div className="w-10 h-px mx-auto mb-5" style={{ background: c.border }} />
        <p className="text-sm leading-relaxed max-w-sm mx-auto" style={{ color: c.textSecondary }}>
          输入原神 UID，即可观测角色展柜、深境螺旋战绩与面板评分。
          <br />
          数据来源于 Enka.Network 公开 API。
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex items-stretch rounded-lg overflow-hidden card" style={{ boxShadow: c.cardShadowHover }}>
          <input
            type="text" inputMode="numeric" pattern="[0-9]*" maxLength={10}
            value={uid}
            onChange={(e) => setUid(e.target.value.replace(/\D/g, ''))}
            placeholder="输入原神 UID"
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
                <span style={{ color: color }}>{f.icon}</span>
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
