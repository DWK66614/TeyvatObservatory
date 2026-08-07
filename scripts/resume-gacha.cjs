/**
 * 免扫码重测祈愿拉取: 读已保存 cookie → 角色 → authkey → 祈愿记录
 * 用法: node scripts/resume-gacha.cjs
 */
const path = require('path')
const os = require('os')
const fs = require('fs')
const mihoyo = require('../electron/mihoyo.cjs')

mihoyo.setApp({ getPath: () => path.join(os.tmpdir(), 'mihoyo-test') })

async function main() {
  const cookieFile = path.join(os.tmpdir(), 'mihoyo-cookie.json')
  if (!fs.existsSync(cookieFile)) {
    console.error('未找到 cookie, 请先运行 poll-login-auto.cjs 完成登录')
    process.exit(1)
  }
  const cookie = JSON.parse(fs.readFileSync(cookieFile, 'utf8'))
  console.log('cookie 已加载 (uid:', cookie.account_id, ')')

  console.log('\n=== 获取游戏角色 ===')
  const roles = await mihoyo.getUserGameRolesByCookie(cookie)
  for (const r of roles) console.log(`  UID ${r.game_uid} | ${r.nickname} | Lv.${r.level}`)
  if (roles.length === 0) { console.error('未绑定原神国服角色'); process.exit(1) }
  const role = roles[0]

  console.log('\n=== 生成 authkey ===')
  const auth = await mihoyo.genAuthKey(cookie, {
    game_uid: role.game_uid, region: role.region, game_biz: role.game_biz || 'hk4e_cn',
  })
  console.log('  authkey:', auth.authkey.slice(0, 24) + '...')

  console.log('\n=== 拉取祈愿记录 ===')
  const result = await mihoyo.fetchAllGacha(auth.authkey, (type, page, count, total) => {
    if (page % 5 === 1 || count === 0) console.log(`  卡池${type}: 第${page}页 +${count} (累计${total})`)
  })
  console.log('\n=== 结果 ===')
  console.log('总记录数:', result.total)
  for (const [type, items] of Object.entries(result.pools)) {
    const five = items.filter((i) => i.rank_type === '5').length
    console.log(`  卡池${type}: ${items.length} 条 | 五星 ${five}`)
    if (items.length > 0) console.log('    最近:', items[items.length - 1].name, items[items.length - 1].time)
  }
}

main().catch((e) => { console.error('\n失败:', e.message); process.exit(1) })
