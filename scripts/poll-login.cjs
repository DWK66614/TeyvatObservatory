/**
 * 轮询二维码登录状态并继续完整链路(配合 gen-qr.cjs)
 * 用法: node scripts/poll-login.cjs
 */
const path = require('path')
const os = require('os')
const fs = require('fs')
const mihoyo = require('../electron/mihoyo.cjs')

mihoyo.setApp({ getPath: () => path.join(os.tmpdir(), 'mihoyo-test') })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function main() {
  const ticket = fs.readFileSync(path.join(os.tmpdir(), 'mihoyo-ticket.txt'), 'utf8').trim()
  console.log('等待扫码 (ticket:', ticket.slice(0, 8) + '...', ')...')

  let cookie = null
  for (let i = 0; i < 150; i++) {
    await sleep(1000)
    const st = await mihoyo.queryQRLoginStatus(ticket)
    if (st.expired) { console.error('二维码已过期, 请重新运行 gen-qr.cjs'); process.exit(1) }
    if (st.status === 'Scanned') console.log(`  [${i + 1}s] 已扫码, 请在手机上确认...`)
    if (st.status === 'Confirmed') { cookie = st.cookie; console.log('登录确认成功!'); break }
  }
  if (!cookie) { console.error('等待超时'); process.exit(1) }

  console.log('\n=== 补齐 cookie_token/ltoken ===')
  cookie = await mihoyo.completeLogin(cookie)
  console.log('  cookie_token:', cookie.cookie_token ? cookie.cookie_token.slice(0, 12) + '...' : '(空)')
  console.log('  ltoken:', cookie.ltoken ? cookie.ltoken.slice(0, 12) + '...' : '(空)')

  console.log('\n=== 获取游戏角色 ===')
  const roles = await mihoyo.getUserGameRolesByCookie(cookie)
  if (roles.length === 0) { console.error('未绑定原神国服角色'); process.exit(1) }
  for (const r of roles) console.log(`  UID ${r.game_uid} | ${r.nickname} | Lv.${r.level} | ${r.region}`)
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
