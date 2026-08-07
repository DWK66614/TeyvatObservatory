/**
 * 生成祈愿物品图标映射 JSON (name → {icon, rank, type})
 * 数据来源: genshin-db
 * 输出: src/data/gacha-icons.json
 * 用法: node scripts/gen-gacha-icons.cjs
 */
const fs = require('fs')
const path = require('path')
const g = require('genshin-db')

g.setOptions({ queryLanguages: ['ChineseSimplified'], resultLanguage: 'ChineseSimplified' })

const map = {}

// 角色 (4星/5星)
const chars = g.characters('names', { matchCategories: true })
for (const name of chars) {
  const c = g.characters(name)
  if (!c || !c.images) continue
  const icon = c.images.mihoyo_icon || c.images.icon || ''
  if (!icon) continue
  const rarity = c.rarity || (c.qualityType ? parseInt(c.qualityType.replace(/\D/g, '')) || 0 : 0)
  map[name] = { icon, rank: String(rarity || 4), type: '角色' }
}

// 武器
const weapons = g.weapons('names', { matchCategories: true })
for (const name of weapons) {
  const w = g.weapons(name)
  if (!w || !w.images) continue
  const icon = w.images.mihoyo_icon || w.images.icon || ''
  if (!icon) continue
  map[name] = { icon, rank: String(w.rarity || 4), type: '武器' }
}

const out = path.join(__dirname, '..', 'src', 'data', 'gacha-icons.json')
fs.writeFileSync(out, JSON.stringify(map))
console.log(`生成 ${Object.keys(map).length} 条映射 → ${out}`)
