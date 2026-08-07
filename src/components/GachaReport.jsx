import { useMemo, useState } from 'react'
import {
  Sparkles, Star, Layers, LogOut, ArrowLeft, Trophy, Calendar,
} from 'lucide-react'
import { useTheme } from '../utils/theme'
import icons from '../data/gacha-icons.json'

// 显示卡池定义: 301 和 400 在游戏中共享保底, 合并为一个角色活动祈愿
const POOL_NAMES = {
  '100': { name: '新手祈愿', colorKey: 'gold' },
  '200': { name: '常驻祈愿', colorKey: 'rust' },
  '301': { name: '角色活动祈愿', colorKey: 'sage' },
  '302': { name: '武器活动祈愿', colorKey: 'gold' },
  '500': { name: '集录祈愿', colorKey: 'rust' },
}
// 实际卡池类型 → 显示卡池
const POOL_MERGE = { '301': '301', '400': '301' }

const STAR_COLORS = {
  5: '#f7c95c',
  4: '#c07ae0',
  3: '#5ea7e8',
}

function parseTime(t) {
  const d = new Date(t.replace(/-/g, '/'))
  return isNaN(d) ? null : d
}

function ItemIcon({ name, rank, size = 40 }) {
  const meta = icons[name]
  const starColor = STAR_COLORS[rank] || STAR_COLORS[3]
  return (
    <div className="relative flex-shrink-0 rounded-lg overflow-hidden"
         style={{ width: size, height: size, border: `1.5px solid ${starColor}66`, background: '#0c1018' }}>
      {meta?.icon ? (
        <img src={meta.icon} alt={name} loading="lazy" className="w-full h-full object-cover"
             onError={(e) => { e.target.style.display = 'none' }} />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-sm font-bold"
             style={{ color: starColor }}>
          {name?.[0] || '?'}
        </div>
      )}
      <span className="absolute bottom-0 left-0 right-0 text-center text-[8px] font-bold leading-tight"
            style={{ background: 'rgba(0,0,0,0.65)', color: starColor }}>
        {'★'.repeat(Number(rank) || 3)}
      </span>
    </div>
  )
}

/**
 * 数据预处理: 合并卡池 + 计算每个五星的出货抽数
 * 对齐 TeyvatGuide gro-data-view.vue loadData() 逻辑
 * returns: { pools: { type: { name, color, items, fiveList, total, five, pity } }, total, five }
 */
function buildStats(data) {
  const raw = data?.pools || {}

  // 合并卡池: 301+400 共享保底
  const merged = {}
  for (const [type, items] of Object.entries(raw)) {
    const target = POOL_MERGE[type] || type
    if (!merged[target]) merged[target] = []
    merged[target].push(...items)
  }

  let total = 0
  let five = 0
  const pools = {}

  for (const [type, items] of Object.entries(merged)) {
    // 按 id 升序排序(字符串比较! 祈愿 id 是 19 位大整数, 数字减法会精度丢失导致顺序错乱)
    // 参考 TeyvatGuide: tempData.sort((a, b) => a.id.localeCompare(b.id))
    const sorted = [...items].sort((a, b) => String(a.id).localeCompare(String(b.id)))
    const fiveList = []
    // 对齐 TeyvatGuide gro-data-view.vue:
    // reset5count 从 1 计数, 抽到五星时记录当前值(含本次), 然后重置为 1
    // 3星: reset5count++
    // 4星: reset5count++
    // 5星: 记录 reset5count, reset5count=1
    let reset5count = 1
    for (const item of sorted) {
      if (item.rank_type === '3') {
        reset5count++
      } else if (item.rank_type === '4') {
        reset5count++
      } else if (item.rank_type === '5') {
        fiveList.push({ item, pulls: reset5count })
        reset5count = 1
      } else {
        // 调试: 记录非3/4/5星的异常数据
        console.warn(`[BuildStats] ${type} 异常rank_type: ${JSON.stringify({name:item.name, rank_type:item.rank_type, id:item.id})}`)
      }
    }
    pools[type] = {
      name: POOL_NAMES[type]?.name || type,
      colorKey: POOL_NAMES[type]?.colorKey || 'gold',
      items: sorted,
      fiveList, // 按时间正序, 每个五星带 pulls(第几抽出)
      total: sorted.length,
      five: fiveList.length,
      pity: reset5count, // 当前垫抽
    }
    total += sorted.length
    five += fiveList.length
  }

  return { pools, total, five }
}

function FiveRow({ five, index }) {
  const { colors: c } = useTheme()
  const { item, pulls } = five
  const d = parseTime(item.time)
  const starColor = STAR_COLORS[5]
  return (
    <div className="flex items-center gap-3 py-2.5 px-3 rounded-lg transition-colors"
         style={{ background: index % 2 ? c.surfaceHover : 'transparent' }}>
      <ItemIcon name={item.name} rank="5" size={44} />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold truncate" style={{ color: c.text }}>
          {item.name}
        </div>
        <div className="text-[11px]" style={{ color: starColor }}>
          第 {pulls} 抽获得 · {item.item_type || '五星'}
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="text-[11px] font-mono" style={{ color: c.textFaint }}>
          {d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` : item.time}
        </div>
        <div className="text-[10px] font-mono" style={{ color: c.textFaint }}>
          {d ? `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` : ''}
        </div>
      </div>
    </div>
  )
}

export default function GachaReport({ data, account, onBack, onRelogin }) {
  const { colors: c } = useTheme()
  const [activePool, setActivePool] = useState(null)

  const stats = useMemo(() => buildStats(data), [data])
  const pools = Object.entries(stats.pools)
    .filter(([, p]) => p.total > 0)
    .sort((a, b) => a[1].name.localeCompare(b[1].name, 'zh'))

  const activeType = activePool || pools[0]?.[0] || null
  const activePoolInfo = activeType ? stats.pools[activeType] : null
  const activeColor = activePoolInfo ? (c[activePoolInfo.colorKey] || c.gold) : c.gold

  return (
    <div className="page-enter max-w-6xl mx-auto px-5 py-8 lg:px-8 space-y-6">
      {/* 顶部栏 */}
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={onBack}
                className="px-3.5 py-2 rounded-lg text-sm font-semibold inline-flex items-center gap-2 transition-colors"
                style={{ background: c.surfaceHover, border: `1px solid ${c.border}`, color: c.textMuted }}>
          <ArrowLeft className="w-4 h-4" />
          返回
        </button>
        <div className="flex-1" />
        {account && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
               style={{ background: c.surfaceElevated, border: `1px solid ${c.border}` }}>
            <Trophy className="w-3.5 h-3.5" style={{ color: c.gold }} />
            <span style={{ color: c.textSecondary }}>
              {account.nickname || '旅行者'}
            </span>
            <span className="font-mono" style={{ color: c.textFaint }}>
              UID {account.game_uid}
            </span>
          </div>
        )}
        <button onClick={onRelogin}
                className="px-3.5 py-2 rounded-lg text-sm font-semibold inline-flex items-center gap-2 transition-colors"
                style={{ background: 'transparent', border: `1px solid ${c.border}`, color: c.textMuted }}>
          <LogOut className="w-3.5 h-3.5" />
          切换账号
        </button>
      </div>

      {/* 总览统计 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: '总抽数', value: stats.total, icon: <Layers className="w-5 h-5" />, color: c.text, bg: c.surfaceElevated, border: c.border },
          { label: '五星获得', value: stats.five, icon: <Star className="w-5 h-5" />, color: STAR_COLORS[5], bg: `${STAR_COLORS[5]}0d`, border: `${STAR_COLORS[5]}30` },
          { label: '当前垫抽', value: activePoolInfo?.pity ?? 0, icon: <Sparkles className="w-5 h-5" />, color: activeColor, bg: `${activeColor}0d`, border: `${activeColor}30` },
        ].map((s, i) => (
          <div key={i} className="card p-5" style={{
            animation: `slideUp 0.4s ease-out ${i * 70}ms both, fadeIn 0.4s ease-out ${i * 70}ms both`,
            background: s.bg, border: `1px solid ${s.border}`,
          }}>
            <div className="flex items-center gap-2 mb-2">
              <span style={{ color: s.color }}>{s.icon}</span>
              <span className="text-xs" style={{ color: c.textMuted }}>{s.label}</span>
            </div>
            <div className="text-2xl font-bold font-display" style={{ color: s.color }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* 卡池选择 */}
      <div className="flex items-center gap-2 flex-wrap">
        {pools.map(([type, p]) => {
          const color = c[p.colorKey] || c.gold
          const active = type === activeType
          return (
            <button key={type} onClick={() => setActivePool(type)}
                    className="px-3.5 py-2 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: active ? color : c.surfaceHover,
                      color: active ? c.goldText : c.textMuted,
                      border: `1px solid ${active ? color : c.border}`,
                    }}>
              {p.name}
              <span className="ml-1.5 opacity-80">({p.five} 五星)</span>
            </button>
          )
        })}
      </div>

      {/* 当前卡池五星明细 */}
      {activePoolInfo && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold font-display flex items-center gap-2" style={{ color: c.text }}>
              <Star className="w-4 h-4" style={{ color: STAR_COLORS[5] }} />
              {activePoolInfo.name} · 五星获取记录
            </h3>
            <span className="text-[11px]" style={{ color: c.textFaint }}>
              {activePoolInfo.five} 个五星 / {activePoolInfo.total} 抽
            </span>
          </div>

          {activePoolInfo.fiveList.length === 0 ? (
            <p className="text-xs py-6 text-center" style={{ color: c.textFaint }}>
              该卡池暂无五星记录
            </p>
          ) : (
            <div className="max-h-[460px] overflow-y-auto pr-1">
              {/* 表头 */}
              <div className="flex items-center gap-3 px-3 pb-2 text-[10px] font-display tracking-wider" style={{ color: c.textFaint }}>
                <span className="w-11" />
                <span className="flex-1">物品</span>
                <span className="flex-shrink-0 text-right">获取时间</span>
              </div>
              {activePoolInfo.fiveList.map((five, i) => (
                <FiveRow key={five.item.id || i} five={five} index={i} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 全部卡池五星总览 */}
      <div className="card p-5">
        <h3 className="text-sm font-bold font-display flex items-center gap-2 mb-4" style={{ color: c.text }}>
          <Calendar className="w-4 h-4" style={{ color: c.gold }} />
          全部五星出货
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {pools.map(([type, p]) => {
            const color = c[p.colorKey] || c.gold
            return (
              <div key={type} className="p-4 rounded-xl" style={{ background: c.surfaceElevated, border: `1px solid ${c.border}` }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold" style={{ color }}>{p.name}</span>
                  <span className="text-[11px] font-mono" style={{ color: c.textFaint }}>
                    {p.five} 五星 / {p.total} 抽
                  </span>
                </div>
                {p.fiveList.length === 0 ? (
                  <p className="text-[11px] py-2" style={{ color: c.textFaint }}>暂无五星</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {p.fiveList.map((five, i) => (
                      <div key={i} className="flex flex-col items-center gap-1">
                        <ItemIcon name={five.item.name} rank="5" size={44} />
                        <span className="text-[9px] max-w-[44px] truncate" style={{ color: c.textSecondary }}>
                          {five.item.name}
                        </span>
                        <span className="text-[9px] font-mono" style={{ color: c.textFaint }}>
                          {five.pulls}抽
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="text-center pb-6">
        <p className="text-[11px]" style={{ color: c.textFaint }}>
          角色活动祈愿·其二(400)与角色活动祈愿(301)共享保底，已合并统计
          <br />
          数据来源: 米游社官方接口 · 仅供学习交流
        </p>
      </div>
    </div>
  )
}
