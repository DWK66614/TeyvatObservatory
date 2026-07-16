import { Swords, Zap, Users, Trophy, Star } from 'lucide-react'

export default function SpiralAbyss({ playerInfo, characters }) {
  const floorIndex = playerInfo?.towerFloorIndex || 0
  const levelIndex = playerInfo?.towerLevelIndex || 0
  const starIndex = playerInfo?.abyssStars || playerInfo?.towerStarIndex || 0

  const stats = [
    { label: '最深抵达', value: floorIndex > 0 ? `第 ${floorIndex} 层` : '--', sub: levelIndex > 0 ? `第 ${levelIndex} 间` : '', icon: <Zap className="w-4 h-4" />, color: '#e0554a' },
    { label: '获得渊星', value: starIndex > 0 ? `${starIndex} ★` : '--', sub: '/ 36', icon: <Star className="w-4 h-4" />, color: '#edd9a3' },
    { label: '展柜角色', value: characters?.length || 0, sub: '位', icon: <Users className="w-4 h-4" />, color: '#7095c4' },
    { label: '成就完成', value: playerInfo?.finishAchievementNum || 0, sub: '个', icon: <Trophy className="w-4 h-4" />, color: '#b07cf7' },
  ]

  return (
    <div>
      <div className="card p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center"
               style={{ background: 'rgba(224,85,74,0.08)', border: '1px solid rgba(224,85,74,0.12)' }}>
            <Swords className="w-4 h-4" style={{ color: '#e0554a' }} />
          </div>
          <div>
            <h3 className="section-heading">深境螺旋</h3>
            <p className="text-[10px] mt-0.5" style={{ color: '#5c5b78' }}>Spiral Abyss</p>
          </div>
        </div>

        {/* Stat grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          {stats.map((s, i) => (
            <div key={i} className="text-center p-4 rounded-xl relative overflow-hidden"
                 style={{ background: 'rgba(112,149,196,0.03)', border: '1px solid rgba(112,149,196,0.05)' }}>
              <div className="inline-flex items-center gap-2 mb-2">
                <span style={{ color: s.color }}>{s.icon}</span>
                <span className="text-xs font-medium" style={{ color: '#8b8aa6' }}>{s.label}</span>
              </div>
              <div className="text-xl font-bold font-mono tracking-tight" style={{ color: s.color }}>
                {s.value}
              </div>
              {s.sub && (
                <div className="text-[10px] mt-0.5" style={{ color: '#5c5b78' }}>{s.sub}</div>
              )}
            </div>
          ))}
        </div>

        {/* Floor progress */}
        <div className="border-t pt-5" style={{ borderColor: 'rgba(112,149,196,0.06)' }}>
          {floorIndex > 0 ? (
            <div className="p-5 rounded-xl" style={{
              background: 'rgba(224,85,74,0.03)',
              border: '1px solid rgba(224,85,74,0.08)',
            }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center"
                     style={{ background: 'rgba(224,85,74,0.1)' }}>
                  <Zap className="w-4 h-4" style={{ color: '#e0554a' }} />
                </div>
                <div>
                  <div className="text-sm font-semibold" style={{ color: '#e5e0d5' }}>
                    深境螺旋 第 {floorIndex} 层
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: '#8b8aa6' }}>
                    {levelIndex > 0 ? `第 ${levelIndex} 间` : ''}{starIndex > 0 ? ` · ${starIndex}/36 ★` : ''}
                  </div>
                </div>
                <span className="ml-auto text-[10px] font-mono px-2 py-0.5 rounded"
                      style={{ background: 'rgba(112,149,196,0.06)', color: '#5c5b78' }}>
                  Enka.Network
                </span>
              </div>

              {/* Floor progress dots — styled as a celestial progress bar */}
              <div className="flex items-center gap-2 mt-5 justify-center">
                {Array.from({ length: 12 }).map((_, i) => {
                  const reached = (i + 1) <= floorIndex
                  const isCurrent = (i + 1) === floorIndex
                  return (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div className="w-2.5 h-2.5 rounded-full transition-all" style={{
                        background: reached
                          ? `radial-gradient(circle, #e0554a, #e0554a60)`
                          : 'rgba(112,149,196,0.08)',
                        boxShadow: reached
                          ? `0 0 ${isCurrent ? '10px' : '5px'} rgba(224,85,74,0.5)`
                          : 'none',
                        transform: isCurrent ? 'scale(1.4)' : 'scale(1)',
                      }} />
                      <span className="text-[8px] font-mono" style={{ color: reached ? '#e0554a' : '#3c3b58' }}>
                        {i + 1}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                   style={{ background: 'rgba(112,149,196,0.04)', border: '1px solid rgba(112,149,196,0.06)' }}>
                <Zap className="w-5 h-5" style={{ color: '#5c5b78' }} />
              </div>
              <p className="text-sm" style={{ color: '#8b8aa6' }}>暂无深境螺旋数据</p>
              <p className="text-xs mt-1" style={{ color: '#5c5b78' }}>该账号可能未通关深渊或未公开数据</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
