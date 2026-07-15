import { Skull, Clock } from 'lucide-react'
import { useTheme } from '../utils/theme'

function formatTime(seconds) {
  if (!seconds || seconds <= 0) return '--'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function TheaterReport({ playerInfo }) {
  const { colors: c } = useTheme()
  const stygian = playerInfo?.stygian
  const hasData = stygian && (stygian.index > 0 || stygian.seconds > 0)

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center"
             style={{ background: c.purpleBg, border: `1px solid ${c.purpleBorder}` }}>
          <Skull className="w-4 h-4" style={{ color: c.purple }} />
        </div>
        <div>
          <h3 className="section-heading">幽境危战</h3>
          <p className="text-[10px] mt-0.5" style={{ color: c.textFaint }}>Imaginarium Theater</p>
        </div>
        {hasData && (
          <span className="ml-auto text-[10px] font-mono px-2 py-0.5 rounded"
                style={{ background: c.surfaceSubtle, color: c.textFaint }}>
            第 {stygian.index} 阶
          </span>
        )}
      </div>

      {hasData ? (
        <div className="p-5 rounded-xl" style={{
          background: c.surfaceElevated,
          border: `1px solid ${c.border}`,
        }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center"
                 style={{ background: c.purpleBg }}>
              <span className="text-lg font-bold font-mono" style={{ color: c.purple }}>{stygian.index}</span>
            </div>
            <div>
              <div className="text-sm font-semibold" style={{ color: c.text }}>
                幽境危战 第 {stygian.index} 阶
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Clock className="w-3 h-3" style={{ color: c.sage }} />
                <span className="text-xs font-mono" style={{ color: c.sage }}>
                  最快 {formatTime(stygian.seconds)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-5 justify-center">
            {Array.from({ length: 6 }).map((_, i) => {
              const tier = i + 1
              const reached = tier <= stygian.index
              const isCurrent = tier === stygian.index
              const tierColors = [c.sage, c.hydro, c.cvSS, c.purple, c.rust, c.gold]
              const color = tierColors[i]
              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-full transition-all" style={{
                    background: reached
                      ? `radial-gradient(circle, ${color}, ${color}60)`
                      : c.border,
                    boxShadow: reached
                      ? `0 0 ${isCurrent ? '8px' : '4px'} ${color}60`
                      : 'none',
                    transform: isCurrent ? 'scale(1.3)' : 'scale(1)',
                  }} />
                  <span className="text-[8px] font-mono" style={{ color: reached ? color : c.textFaint }}>
                    {tier}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
               style={{ background: c.surfaceSubtle, border: `1px solid ${c.border}` }}>
            <Skull className="w-5 h-5" style={{ color: c.textFaint }} />
          </div>
          <p className="text-sm" style={{ color: c.textSecondary }}>暂无幽境危战数据</p>
          <p className="text-xs mt-1" style={{ color: c.textFaint }}>该账号可能未通关幽境危战或未公开数据</p>
        </div>
      )}
    </div>
  )
}
