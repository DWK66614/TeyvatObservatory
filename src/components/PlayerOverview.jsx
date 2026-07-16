import { Star, Trophy, Users, Zap, Compass } from 'lucide-react'
import { formatNumber, ELEMENTS } from '../utils/constants'
import { useTheme } from '../utils/theme'

export default function PlayerOverview({ playerInfo, characters }) {
  const { colors: c } = useTheme()
  if (!playerInfo) return null
  const { nickname, signature, level, worldLevel, finishAchievementNum,
          towerFloorIndex, towerLevelIndex, profilePicture, nameCardUrl, uid } = playerInfo
  const avatarUrl = profilePicture?.iconUrl
  const avatarElement = profilePicture?.element ? ELEMENTS[profilePicture.element] : null
  const abyssFloor = towerFloorIndex || 0
  const abyssChamber = towerLevelIndex || 0
  const charCount = characters?.length || 0

  const stats = [
    { label: '冒险等阶', value: level || '--', sub: worldLevel ? `世界 ${worldLevel}` : '', icon: <Star className="w-4 h-4" />, color: c.gold },
    { label: '成就达成', value: formatNumber(finishAchievementNum), sub: '', icon: <Trophy className="w-4 h-4" />, color: c.purple },
    { label: '深渊进度', value: abyssFloor > 0 ? `${abyssFloor}-${abyssChamber}` : '--', sub: abyssFloor > 0 ? '层·间' : '', icon: <Zap className="w-4 h-4" />, color: c.rust },
    { label: '展示角色', value: charCount || '--', sub: '位', icon: <Users className="w-4 h-4" />, color: c.sage },
  ]

  return (
    <div className="space-y-5">
      {/* Player identity card */}
      <div className="card overflow-hidden">
        {nameCardUrl && (
          <div className="h-32 relative overflow-hidden">
            <img src={nameCardUrl} alt="" className="w-full h-full object-cover opacity-25"
                 onError={e => { e.target.style.display = 'none' }} />
            <div className="absolute inset-0" style={{
              background: `linear-gradient(to top, ${c.surface} 0%, ${c.surface}80 50%, transparent 100%)`,
            }} />
          </div>
        )}

        <div className={`flex items-center gap-5 px-6 ${nameCardUrl ? '-mt-16' : 'py-6'}`}>
          <div className="relative flex-shrink-0 z-10">
            <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center"
                 style={{
                   background: avatarElement ? `${avatarElement.color}15` : c.goldBg,
                   border: `3px solid ${c.surface}`,
                   boxShadow: `0 4px 20px ${c.goldBg}`,
                 }}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="w-full h-full object-cover"
                     onError={e => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex' }} />
              ) : null}
              <span className="text-[10px] text-center leading-tight px-1"
                    style={{ display: avatarUrl ? 'none' : 'flex', color: c.textFaint }}>
                旅
              </span>
            </div>
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-md text-[10px] font-bold font-mono"
                 style={{ background: c.gold, color: c.goldText }}>
              Lv.{level}
            </div>
          </div>

          <div className="min-w-0 pt-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-bold truncate font-display tracking-[0.04em]" style={{ color: c.text }}>
                {nickname}
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded"
                    style={{ background: c.goldBg, color: c.textFaint }}>
                UID {uid}
              </span>
            </div>
            {signature ? (
              <p className="text-sm mt-1.5 truncate" style={{ color: c.textSecondary }}>
                「{signature}」
              </p>
            ) : (
              <p className="text-sm mt-1.5" style={{ color: c.textFaint }}>未设置签名</p>
            )}
            {worldLevel > 0 && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <Compass className="w-3 h-3" style={{ color: c.textFaint }} />
                <span className="text-xs" style={{ color: c.textMuted }}>世界等级 {worldLevel}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stat quadrant */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="card p-5 group relative overflow-hidden">
            <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                   style={{ background: `${s.color}18` }}>
                <span style={{ color: s.color }}>{s.icon}</span>
              </div>
              <span className="text-xs font-medium tracking-wide" style={{ color: c.textMuted }}>{s.label}</span>
            </div>
            <div className="text-2xl font-bold font-mono tracking-tight" style={{ color: s.color }}>
              {s.value}
            </div>
            {s.sub && (
              <div className="text-[11px] mt-0.5" style={{ color: c.textFaint }}>{s.sub}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
