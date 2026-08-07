/**
 * 生成二维码 + 终端显示 + 轮询登录 + 完整链路(一步到位)
 * 用法: node scripts/qr-login-terminal.cjs
 */
const path = require('path')
const os = require('os')
const fs = require('fs')
const QRCode = require('qrcode')
const mihoyo = require('../electron/mihoyo.cjs')

mihoyo.setApp({ getPath: () => path.join(os.tmpdir(), 'mihoyo-test') })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function main() {
  console.log('=== 正在生成登录二维码... ===')
  const qr = await mihoyo.createQRLogin()

  // 终端显示二维码
  const ascii = await QRCode.toString(qr.url, { type: 'terminal', small: true })
  console.log('\n┌──────────────────────────────────────────┐')
  console.log('│  请用米游社 App 扫描下方二维码并确认登录  │')
  console.log('└──────────────────────────────────────────┘\n')
  console.log(ascii)
  console.log('\n(二维码 URL:', qr.url.slice(0, 60) + '...', ')')

  // 轮询
  let cookie = null
  for (let i = 0; i < 150; i++) {
    await sleep(1000)
    const st = await mihoyo.queryQRLoginStatus(qr.ticket)
    if (st.expired) { console.error('\n二维码已过期, 请重新运行本脚本'); process.exit(1) }
    if (st.status === 'Scanned') console.log(`  [${i + 1}s] 已扫码, 请在手机上点确认...`)
    if (st.status === 'Confirmed') { cookie = st.cookie; console.log('\n登录确认成功!'); break }
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
