// Genshin Impact element definitions
export const ELEMENTS = {
  Pyro: { name: '火', color: '#ef4444', emoji: '🔥', cn: '火元素', bg: 'from-red-500/20 to-red-600/10', text: 'text-red-400', border: 'border-red-500/30', glow: 'glow-pyro', icon: '🔥' },
  Hydro: { name: '水', color: '#3b82f6', emoji: '💧', cn: '水元素', bg: 'from-blue-500/20 to-blue-600/10', text: 'text-blue-400', border: 'border-blue-500/30', glow: 'glow-hydro', icon: '💧' },
  Anemo: { name: '风', color: '#22d3a4', emoji: '🍃', cn: '风元素', bg: 'from-emerald-500/20 to-emerald-600/10', text: 'text-emerald-400', border: 'border-emerald-500/30', glow: 'glow-anemo', icon: '🍃' },
  Electro: { name: '雷', color: '#a855f7', emoji: '⚡', cn: '雷元素', bg: 'from-purple-500/20 to-purple-600/10', text: 'text-purple-400', border: 'border-purple-500/30', glow: 'glow-electro', icon: '⚡' },
  Dendro: { name: '草', color: '#84cc16', emoji: '🌿', cn: '草元素', bg: 'from-lime-500/20 to-lime-600/10', text: 'text-lime-400', border: 'border-lime-500/30', glow: 'glow-dendro', icon: '🌿' },
  Cryo: { name: '冰', color: '#67e8f9', emoji: '❄️', cn: '冰元素', bg: 'from-cyan-500/20 to-cyan-600/10', text: 'text-cyan-400', border: 'border-cyan-500/30', glow: 'glow-cryo', icon: '❄️' },
  Geo: { name: '岩', color: '#eab308', emoji: '🪨', cn: '岩元素', bg: 'from-yellow-500/20 to-yellow-600/10', text: 'text-yellow-400', border: 'border-yellow-500/30', glow: 'glow-geo', icon: '🪨' },
}

// Weapon type definitions
export const WEAPONS = {
  WEAPON_SWORD_ONE_HAND: { name: '单手剑', icon: '🗡️' },
  WEAPON_CLAYMORE: { name: '双手剑', icon: '⚔️' },
  WEAPON_POLE: { name: '长柄武器', icon: '🔱' },
  WEAPON_CATALYST: { name: '法器', icon: '📖' },
  WEAPON_BOW: { name: '弓', icon: '🏹' },
}

// Artifact slot names
export const ARTIFACT_SLOTS = {
  EQUIP_BRACER: { name: '生之花', en: 'Flower of Life', icon: '🌸' },
  EQUIP_NECKLACE: { name: '死之羽', en: 'Plume of Death', icon: '🪶' },
  EQUIP_SHOES: { name: '时之沙', en: 'Sands of Eon', icon: '⏳' },
  EQUIP_RING: { name: '空之杯', en: 'Goblet of Eonothem', icon: '🍷' },
  EQUIP_DRESS: { name: '理之冠', en: 'Circlet of Logos', icon: '👑' },
}

// Stat name mappings
export const STAT_NAMES = {
  FIGHT_PROP_HP: '生命值',
  FIGHT_PROP_HP_PERCENT: '生命值%',
  FIGHT_PROP_ATTACK: '攻击力',
  FIGHT_PROP_ATTACK_PERCENT: '攻击力%',
  FIGHT_PROP_DEFENSE: '防御力',
  FIGHT_PROP_DEFENSE_PERCENT: '防御力%',
  FIGHT_PROP_CRITICAL: '暴击率',
  FIGHT_PROP_CRITICAL_HURT: '暴击伤害',
  FIGHT_PROP_ELEMENT_MASTERY: '元素精通',
  FIGHT_PROP_CHARGE_EFFICIENCY: '元素充能效率',
  FIGHT_PROP_HEAL_ADD: '治疗加成',
  FIGHT_PROP_PHYSICAL_ADD_HURT: '物理伤害加成',
  FIGHT_PROP_FIRE_ADD_HURT: '火元素伤害加成',
  FIGHT_PROP_WATER_ADD_HURT: '水元素伤害加成',
  FIGHT_PROP_WIND_ADD_HURT: '风元素伤害加成',
  FIGHT_PROP_ELEC_ADD_HURT: '雷元素伤害加成',
  FIGHT_PROP_GRASS_ADD_HURT: '草元素伤害加成',
  FIGHT_PROP_ICE_ADD_HURT: '冰元素伤害加成',
  FIGHT_PROP_ROCK_ADD_HURT: '岩元素伤害加成',
}

// Main stat priority indicator
export const MAIN_STAT_WEIGHTS = {
  FIGHT_PROP_CRITICAL: 1.0,
  FIGHT_PROP_CRITICAL_HURT: 1.0,
  FIGHT_PROP_HP_PERCENT: 0.7,
  FIGHT_PROP_ATTACK_PERCENT: 0.7,
  FIGHT_PROP_DEFENSE_PERCENT: 0.4,
  FIGHT_PROP_ELEMENT_MASTERY: 0.6,
  FIGHT_PROP_CHARGE_EFFICIENCY: 0.5,
  FIGHT_PROP_HEAL_ADD: 0.3,
  FIGHT_PROP_PHYSICAL_ADD_HURT: 0.6,
  FIGHT_PROP_FIRE_ADD_HURT: 0.8,
  FIGHT_PROP_WATER_ADD_HURT: 0.8,
  FIGHT_PROP_WIND_ADD_HURT: 0.8,
  FIGHT_PROP_ELEC_ADD_HURT: 0.8,
  FIGHT_PROP_GRASS_ADD_HURT: 0.8,
  FIGHT_PROP_ICE_ADD_HURT: 0.8,
  FIGHT_PROP_ROCK_ADD_HURT: 0.8,
}

// Abyss floor names
export const ABYSS_NAMES = {
  '12': { name: '深境螺旋', icon: '🌌' },
}

// Server region names
export const REGIONS = {
  'os_usa': { name: '美服', flag: '🇺🇸' },
  'os_euro': { name: '欧服', flag: '🇪🇺' },
  'os_asia': { name: '亚服', flag: '🌏' },
  'os_cht': { name: '台服', flag: '🇹🇼' },
}

// Utility: format number with commas
export function formatNumber(num) {
  if (num == null) return '--'
  return Number(num).toLocaleString()
}

// Utility: format stat value (integer or percentage)
export function formatStatValue(statId, value) {
  if (statId == null || value == null) return '--'
  if (statId.includes('PERCENT') || statId.includes('CRITICAL') || statId.includes('HURT') ||
      statId.includes('EFFICIENCY') || statId.includes('ADD_HURT') || statId.includes('HEAL_ADD')) {
    return (value * 100).toFixed(1) + '%'
  }
  if (statId === 'FIGHT_PROP_ELEMENT_MASTERY') {
    return Math.round(value).toString()
  }
  return Math.round(value).toLocaleString()
}

// Utility: get stat color class
export function getStatColor(statId) {
  const criticals = ['FIGHT_PROP_CRITICAL', 'FIGHT_PROP_CRITICAL_HURT']
  if (criticals.includes(statId)) return 'text-amber-400'
  if (statId.includes('ADD_HURT')) return 'text-emerald-400'
  if (statId.includes('PERCENT')) return 'text-blue-400'
  return 'text-gray-300'
}

// Utility: render rarity stars as string
export function getRarityStars(rarity = 5) {
  const star = rarity === 5 ? '★' : '★'
  return Array.from({ length: rarity }, () => star).join('')
}
