import { Star, Trophy, Users, Zap, MapPin } from 'lucide-react'
import { formatNumber, ELEMENTS } from '../utils/constants'

export default function PlayerOverview({ playerInfo, characters }) {
  if (!playerInfo) return null
  const { nickname, signature, level, worldLevel, finishAchievementNum,
          towerFloorIndex, towerLevelIndex, profilePicture, nameCardUrl, uid } = playerInfo
  const avatarUrl = profilePicture?.iconUrl
  const avatarElement = profilePicture?.element ? ELEMENTS[profilePicture.element] : null
  const abyssFloor = towerFloorIndex || 0
  const abyssChamber = towerLevelIndex || 0
  const charCount = characters?.length || 0

  const stats = [
    { label: '冒险等阶', value: level || '--', sub: worldLevel ? `世界 ${worldLevel}` : '', icon: <Star className="w-4 h-4" />, color: '#edd9a3' },
    { label: '成就达成', value: formatNumber(finishAchievementNum), sub: '', icon: <Trophy className="w-4 h-4" />, color: '#b07cf7' },
    { label: '深渊进度', value: abyssFloor > 0 ? `${abyssFloor}-${abyssChamber}` : '--', sub: abyssFloor > 0 ? '层·间' : '', icon: <Zap className="w-4 h-4" />, color: '#e0554a' },
    { label: '展示角色', value: charCount || '--', sub: '位', icon: <Users className="w-4 h-4" />, color: '#40c9a0' },
  ]

  return (
    <div className="space-y-5">
      {/* ── Player identity card ── */}
      <div className="card overflow-hidden">
        {/* Namecard banner with gradient overlay */}
        {nameCardUrl && (
          <div className="h-28 relative overflow-hidden">
            <img src={nameCardUrl} alt="" className="w-full h-full object-cover opacity-25"
                 onError={e => { e.target.style.display = 'none' }} />
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(to top, #111633 0%, rgba(17,22,51,0.6) 50%, transparent 100%)',
            }} />
          </div>
        )}

        {/* Player info row */}
        <div className={`flex items-center gap-5 px-6 ${nameCardUrl ? '-mt-16' : 'py-6'}`}>
          {/* Avatar — sits partly over the banner */}
          <div className="relative flex-shrink-0 z-10">
            <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center"
                 style={{
                   background: avatarElement ? `${avatarElement.color}15` : 'rgba(112,149,196,0.06)',
                   border: `2px solid ${avatarElement ? avatarElement.color + '30' : 'rgba(112,149,196,0.12)'}`,
                   boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                 }}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="w-full h-full object-cover"
                     onError={e => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex' }} />
              ) : null}
              <span className="text-3xl" style={{ display: avatarUrl ? 'none' : 'flex' }}>{avatarElement?.emoji || '✦'}</span>
            </div>
            {/* Level badge */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-md text-[10px] font-bold font-mono"
                 style={{ background: '#edd9a3', color: '#080c1d' }}>
              Lv.{level}
            </div>
          </div>

          {/* Name & signature */}
          <div className="min-w-0 pt-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-bold truncate font-display tracking-[0.04em]" style={{ color: '#edd9a3' }}>
                {nickname}
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded"
                    style={{ background: 'rgba(112,149,196,0.06)', color: '#5c5b78' }}>
                UID {uid}
              </span>
            </div>
            {signature ? (
              <p className="text-sm mt-1.5 truncate italic opacity-70" style={{ color: '#8b8aa6' }}>
                「{signature}」
              </p>
            ) : (
              <p className="text-sm mt-1.5 italic" style={{ color: '#5c5b78' }}>
                未设置签名
              </p>
            )}
            {worldLevel && (
              <div className="flex items-center gap-1 mt-1.5">
                <MapPin className="w-3 h-3" style={{ color: '#5c5b78' }} />
                <span className="text-[11px]" style={{ color: '#5c5b78' }}>世界等级 {worldLevel}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Stat quadrant ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <div key={i} className="card p-5 group relative overflow-hidden">
            {/* Subtle color dot in corner */}
            <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                   style={{ background: `${s.color}10` }}>
                <span style={{ color: s.color }}>{s.icon}</span>
              </div>
              <span className="text-xs font-medium tracking-wide" style={{ color: '#8b8aa6' }}>{s.label}</span>
            </div>
            <div className="text-2xl font-bold font-mono tracking-tight" style={{ color: s.color }}>
              {s.value}
            </div>
            {s.sub && (
              <div className="text-[11px] mt-0.5" style={{ color: '#5c5b78' }}>{s.sub}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
