import { Star, Search, BarChart3, Shield } from 'lucide-react'

const features = [
  {
    icon: <Star className="w-5 h-5" />,
    title: '角色展柜',
    desc: '查看全部展示角色的详细属性、武器与圣遗物搭配',
    color: '#edd9a3',
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: '深渊战绩',
    desc: '深境螺旋探索进度、层数与间数数据一目了然',
    color: '#7095c4',
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    title: '面板评分',
    desc: '基于暴击值的角色练度评估与多维度属性对比',
    color: '#4fb8a0',
  },
]

export default function WelcomeScreen() {
  return (
    <div className="page-enter max-w-xl mx-auto pt-8 lg:pt-16">
      {/* ── Hero ── */}
      <div className="text-center mb-10">
        {/* Celestial emblem */}
        <div className="inline-flex mb-6 relative">
          {/* Decorative rings */}
          <div className="absolute -inset-8 rounded-full animate-orbit opacity-20"
               style={{ border: '1px solid rgba(237,217,163,0.3)' }} />
          <div className="absolute -inset-4 rounded-full animate-orbit-reverse opacity-15"
               style={{ border: '1px solid rgba(112,149,196,0.2)' }} />

          <div className="relative w-20 h-20 rounded-full flex items-center justify-center"
               style={{
                 background: 'radial-gradient(circle, rgba(237,217,163,0.08) 0%, transparent 70%)',
                 border: '1px solid rgba(237,217,163,0.12)',
               }}>
            <Search className="w-8 h-8" style={{ color: '#edd9a3' }} />
          </div>
        </div>

        <h2 className="text-2xl font-bold font-display tracking-[0.06em] mb-3" style={{ color: '#edd9a3' }}>
          Teyvat Observatory
        </h2>
        <p className="text-xs font-display tracking-[0.2em] mb-4" style={{ color: '#5c5b78' }}>
          TEYVAT OBSERVATORY
        </p>
        <div className="w-12 h-px mx-auto mb-5" style={{ background: 'rgba(237,217,163,0.2)' }} />
        <p className="text-sm leading-relaxed max-w-sm mx-auto" style={{ color: '#8b8aa6' }}>
          在左侧输入原神 UID，即可观测角色展柜、深境螺旋战绩与面板评分。
          <br />
          数据来源于 Enka.Network 公开 API。
        </p>
      </div>

      {/* ── Feature grid ── */}
      <div className="grid gap-3 mb-8">
        {features.map((f, i) => (
          <div key={i} className="card p-5 flex items-start gap-4 group"
               style={{ animation: `slideUp 0.5s ease-out ${i * 100}ms both, fadeIn 0.5s ease-out ${i * 100}ms both` }}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                 style={{ background: `${f.color}10`, border: `1px solid ${f.color}20` }}>
              <span style={{ color: f.color }}>{f.icon}</span>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-1" style={{ color: '#e5e0d5' }}>{f.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: '#8b8aa6' }}>{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Sample UID hint ── */}
      <div className="text-center p-5 rounded-xl space-y-3"
           style={{
             background: 'rgba(237,217,163,0.03)',
             border: '1px dashed rgba(237,217,163,0.1)',
           }}>
        <p className="text-xs" style={{ color: '#8b8aa6' }}>
          试试观测{' '}
          <code className="font-mono px-1.5 py-0.5 rounded text-xs"
                style={{ background: 'rgba(237,217,163,0.06)', color: '#edd9a3' }}>
            160041179
          </code>
        </p>
        <div className="w-8 h-px mx-auto" style={{ background: 'rgba(237,217,163,0.08)' }} />
        <p className="text-[11px] leading-relaxed" style={{ color: '#5c5b78' }}>
          数据来源于 Enka.Network 公开 API，首次查询可能需要等待几秒钟。
        </p>
      </div>
    </div>
  )
}
