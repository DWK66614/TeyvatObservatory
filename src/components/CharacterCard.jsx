import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { ELEMENTS, WEAPONS, ARTIFACT_SLOTS } from '../utils/constants'
import { getCharacterInfo } from '../api/enka'
import { useTheme } from '../utils/theme'

function CVRating({ value, colors: c }) {
  const cv = value || 0
  const grade = cv >= 240 ? 'SSS' : cv >= 200 ? 'SS' : cv >= 160 ? 'S' : cv >= 120 ? 'A' : 'B'
  const gradeColors = {
    SSS: c.cvSSS,
    SS: c.cvSS,
    S: c.cvS,
    A: c.cvA,
    B: c.cvB,
  }
  const color = gradeColors[grade]
  return (
    <div className="text-right flex-shrink-0" style={{ minWidth: 52 }}>
      <div className="text-lg font-bold font-mono tracking-tight" style={{ color }}>{cv.toFixed(0)}</div>
      <div className="text-[10px] font-bold font-display tracking-wider" style={{ color }}>
        {grade}
      </div>
    </div>
  )
}

function StatRow({ label, value, max, color = '#c8923f' }) {
  const pct = Math.min((Number(value) || 0) / max * 100, 100)
  const { colors: c } = useTheme()
  return (
    <div className="flex items-center gap-2.5 text-[11px]">
      <span className="w-14 truncate" style={{ color: c.textMuted }}>{label}</span>
      <div className="flex-1 stat-bar">
        <div className="stat-bar-fill" style={{
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${color}20, ${color})`,
        }} />
      </div>
      <span className="w-12 text-right font-mono text-[11px]" style={{ color: c.textSecondary }}>{value}</span>
    </div>
  )
}

export default function CharacterCard({ character, index, isExpanded, onToggle }) {
  const { colors: c } = useTheme()
  const [imgOk, setImgOk] = useState(true)
  const [splashOk, setSplashOk] = useState(true)
  const charInfo = getCharacterInfo(character.id, character.detectedElement)
  const elementKey = charInfo?.element || character.detectedElement
  const element = elementKey ? ELEMENTS[elementKey] : null
  const weaponFromApi = character.weapon?.weaponType
  const weaponType = (charInfo?.weapon ? WEAPONS[charInfo.weapon] : null)
    || (weaponFromApi ? WEAPONS[weaponFromApi] : null)
  const rarity = charInfo?.rarity || 5
  const displayName = charInfo?.name || `#${character.id}`
  const isUnverified = charInfo?.unverified === true

  return (
    <div className="card-clickable transition-all duration-300" style={{
      animation: `slideUp 0.4s ease-out ${index * 50}ms both, fadeIn 0.4s ease-out ${index * 50}ms both`,
    }}>
      <div className="h-[3px] rounded-t-[12px]" style={{
        background: element?.color
          ? `linear-gradient(90deg, ${element.color}, ${element.color}40)`
          : `linear-gradient(90deg, ${c.gold}, ${c.gold}40)`,
      }} />

      <div className="p-4" onClick={onToggle}>
        <div className="flex items-center gap-3.5">
          <div className="relative flex-shrink-0">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden"
                 style={{
                   background: element ? `${element.color}10` : c.surfaceHover,
                   border: `1px solid ${element ? element.color + '20' : c.border}`,
                 }}>
              {character.sideIcon && imgOk ? (
                <img src={character.sideIcon} alt={displayName} className="w-full h-full object-cover"
                     loading="lazy" onError={() => setImgOk(false)} />
              ) : (
                <span className="text-2xl">{element?.emoji || '✦'}</span>
              )}
            </div>
            <div className="absolute -top-1 -right-1 flex gap-px">
              {Array.from({ length: Math.min(rarity, 5) }).map((_, i) => (
                <span key={i} className="text-[7px] leading-none drop-shadow-sm"
                      style={{ color: rarity === 5 ? c.gold : c.purple }}>
                  ★
                </span>
              ))}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm truncate" style={{ color: c.text }}>
              {displayName}
              {isUnverified && (
                <span className="text-[10px] ml-1 font-normal" style={{ color: c.textFaint }}>(?)</span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {element && (
                <span className="element-badge text-[10px]" style={{ background: element.color + '12', color: element.color }}>
                  {element.emoji} {element.cn}
                </span>
              )}
              {weaponType && (
                <span className="text-[11px]" style={{ color: c.textMuted }}>
                  {weaponType.icon}
                </span>
              )}
              <span className="text-[11px] font-mono" style={{ color: c.textMuted }}>
                Lv.{character.level}
              </span>
            </div>
          </div>

          <CVRating value={character.critValue} colors={c} />

          <ChevronDown
            className={`w-4 h-4 flex-shrink-0 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
            style={{ color: c.textFaint }}
          />
        </div>

        {character.constellations > 0 && (
          <div className="flex gap-1.5 mt-3.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-[5px] h-[5px] rounded-full transition-all" style={{
                background: i < character.constellations
                  ? `radial-gradient(circle, ${c.gold}, ${c.goldDim})`
                  : c.border,
                boxShadow: i < character.constellations
                  ? `0 0 6px ${c.goldBg}`
                  : 'none',
              }} />
            ))}
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="px-4 pb-5 border-t animate-slide-up" style={{ borderColor: c.borderLight }}>
          {character.splashUrl && splashOk && (
            <div className="pt-3 pb-2">
              <div className="w-full rounded-xl overflow-hidden" style={{ background: c.surfaceSubtle }}>
                <img src={character.splashUrl} alt={displayName}
                     className="w-full object-cover" style={{ maxHeight: 280 }}
                     loading="lazy" onError={() => setSplashOk(false)} />
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
            <div>
              <h4 className="section-heading mb-3">属性面板</h4>
              <div className="space-y-2.5">
                <StatRow label="生命值" value={Math.round(character.stats?.hp || 0)} max={50000} color={c.rust} />
                <StatRow label="攻击力" value={Math.round(character.stats?.atk || 0)} max={3000} color={c.gold} />
                <StatRow label="防御力" value={Math.round(character.stats?.def || 0)} max={2000} color={c.sage} />
                <StatRow label="元素精通" value={character.stats?.em || 0} max={500} color={c.hydro} />
                <StatRow label="暴击率" value={`${character.stats?.critRate || 0}%`} max={100} color={c.cvSS} />
                <StatRow label="暴击伤害" value={`${character.stats?.critDmg || 0}%`} max={300} color={c.gold} />
                <StatRow label="元素充能" value={`${character.stats?.er || 0}%`} max={200} color={c.purple} />
              </div>
            </div>

            <div className="space-y-4">
              {character.weapon && (
                <div>
                  <h4 className="section-heading mb-2">武器</h4>
                  <div className="flex items-center gap-3 p-3 rounded-lg"
                       style={{ background: c.surfaceHover, border: `1px solid ${c.border}` }}>
                    {character.weapon.iconUrl && (
                      <img src={character.weapon.iconUrl} alt="" className="w-10 h-10 rounded-lg" loading="lazy"
                           onError={e => { e.target.style.display = 'none' }} />
                    )}
                    <div>
                      <div className="text-xs font-medium" style={{ color: c.textSecondary }}>
                        Lv.{character.weapon.level}
                      </div>
                      <div className="text-[10px] mt-0.5" style={{ color: c.textFaint }}>
                        精炼 {character.weapon.refinement}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {character.artifacts?.length > 0 && (
                <div>
                  <h4 className="section-heading mb-2">圣遗物 · {character.artifacts.length} 件</h4>
                  <div className="grid grid-cols-2 gap-1.5">
                    {character.artifacts.map((art, i) => {
                      const slot = ARTIFACT_SLOTS[art.slot] || { name: '?', icon: '💠' }
                      return (
                        <div key={i} className="flex items-center gap-2 p-2 rounded-lg"
                             style={{ background: c.surfaceSubtle }}>
                          {art.iconUrl && (
                            <img src={art.iconUrl} alt="" className="w-8 h-8 rounded-md flex-shrink-0" loading="lazy"
                                 onError={e => { e.target.style.display = 'none' }} />
                          )}
                          <div className="min-w-0">
                            <div className="text-[10px] truncate" style={{ color: c.textMuted }}>
                              {slot.icon} {slot.name}
                            </div>
                            <div className="text-[10px] font-mono font-semibold" style={{ color: c.gold }}>
                              +{art.level}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
