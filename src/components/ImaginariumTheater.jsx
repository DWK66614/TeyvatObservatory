import { Skull, Clock } from 'lucide-react'

// Format seconds to mm:ss
function formatTime(seconds) {
  if (!seconds || seconds <= 0) return '--'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

// Known stygian theater IDs and their names
const THEATER_NAMES = {
  5269001: '幻境·深途',
}

export default function ImaginariumTheater({ playerInfo }) {
  const stygian = playerInfo?.stygian
  const hasData = stygian && (stygian.index > 0 || stygian.seconds > 0)

  return (
    <div>
      <div className="card p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center"
               style={{ background: 'rgba(176,124,247,0.08)', border: '1px solid rgba(176,124,247,0.12)' }}>
            <Skull className="w-4 h-4" style={{ color: '#b07cf7' }} />
          </div>
          <div>
            <h3 className="section-heading">幽境危战</h3>
            <p className="text-[10px] mt-0.5" style={{ color: '#5c5b78' }}>Imaginarium Theater · Stygian</p>
          </div>
        </div>

        {hasData ? (
          <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-4 rounded-xl"
                   style={{ background: 'rgba(112,149,196,0.03)', border: '1px solid rgba(112,149,196,0.05)' }}>
                <div className="text-[10px] font-medium mb-1.5" style={{ color: '#8b8aa6' }}>最高难度</div>
                <div className="text-2xl font-bold font-mono" style={{ color: '#b07cf7' }}>第 {stygian.index} 阶</div>
              </div>
              <div className="text-center p-4 rounded-xl"
                   style={{ background: 'rgba(112,149,196,0.03)', border: '1px solid rgba(112,149,196,0.05)' }}>
                <div className="text-[10px] font-medium mb-1.5" style={{ color: '#8b8aa6' }}>最快通关</div>
                <div className="flex items-center justify-center gap-1.5">
                  <Clock className="w-4 h-4" style={{ color: '#40c9a0' }} />
                  <span className="text-2xl font-bold font-mono" style={{ color: '#40c9a0' }}>{formatTime(stygian.seconds)}</span>
                </div>
              </div>
            </div>

            {/* Difficulty tiers */}
            <div className="border-t pt-5" style={{ borderColor: 'rgba(112,149,196,0.06)' }}>
              <div className="p-5 rounded-xl" style={{
                background: 'rgba(176,124,247,0.03)',
                border: '1px solid rgba(176,124,247,0.08)',
              }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center"
                       style={{ background: 'rgba(176,124,247,0.1)' }}>
                    <Skull className="w-4 h-4" style={{ color: '#b07cf7' }} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: '#e5e0d5' }}>
                      幽境危战 第 {stygian.index} 阶
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: '#8b8aa6' }}>
                      最快 {formatTime(stygian.seconds)}
                    </div>
                  </div>
                  <span className="ml-auto text-[10px] font-mono px-2 py-0.5 rounded"
                        style={{ background: 'rgba(112,149,196,0.06)', color: '#5c5b78' }}>
                    Enka.Network
                  </span>
                </div>

                {/* Difficulty tier progress dots */}
                <div className="flex items-center gap-2 mt-5 justify-center">
                  {Array.from({ length: 6 }).map((_, i) => {
                    const tier = i + 1
                    const reached = tier <= stygian.index
                    const isCurrent = tier === stygian.index
                    const tierColors = ['#7095c4', '#40c9a0', '#e0b040', '#b07cf7', '#e0554a', '#edd9a3']
                    const color = tierColors[i]
                    return (
                      <div key={i} className="flex flex-col items-center gap-1">
                        <div className="w-2.5 h-2.5 rounded-full transition-all" style={{
                          background: reached
                            ? `radial-gradient(circle, ${color}, ${color}60)`
                            : 'rgba(112,149,196,0.08)',
                          boxShadow: reached
                            ? `0 0 ${isCurrent ? '10px' : '5px'} ${color}80`
                            : 'none',
                          transform: isCurrent ? 'scale(1.4)' : 'scale(1)',
                        }} />
                        <span className="text-[8px] font-mono" style={{ color: reached ? color : '#3c3b58' }}>
                          {tier}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                 style={{ background: 'rgba(112,149,196,0.04)', border: '1px solid rgba(112,149,196,0.06)' }}>
              <Skull className="w-5 h-5" style={{ color: '#5c5b78' }} />
            </div>
            <p className="text-sm" style={{ color: '#8b8aa6' }}>暂无幽境危战数据</p>
            <p className="text-xs mt-1" style={{ color: '#5c5b78' }}>该账号可能未通关幽境危战或未公开数据</p>
          </div>
        )}
      </div>
    </div>
  )
}
