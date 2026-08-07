/**
 * 全链路 CLI 测试: 扫码登录 → 角色 → authkey → 祈愿记录
 * 用法: node scripts/test-full-login.cjs
 * 会生成二维码到 /tmp/mihoyo-qr.png, 用户扫码确认后自动继续
 */
const path = require('path')
const os = require('os')
const fs = require('fs')
const QRCode = require('qrcode')
const mihoyo = require('../electron/mihoyo.cjs')

mihoyo.setApp({ getPath: () => path.join(os.tmpdir(), 'mihoyo-test') })

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)) }

async function main() {
  console.log('=== 1. 创建二维码 ===')
  const qr = await mihoyo.createQRLogin()
  const qrFile = path.join(os.tmpdir(), 'mihoyo-qr.png')
  await QRCode.toFile(qrFile, qr.url, { width: 300 })
  console.log('二维码已生成:', qrFile)
  console.log('请用米游社 App 扫码并在手机上确认...')

  // 轮询最多 180 秒
  let cookie = null
  for (let i = 0; i < 180; i++) {
    await sleep(1000)
    const st = await mihoyo.queryQRLoginStatus(qr.ticket)
    if (st.expired) { console.error('二维码已过期'); process.exit(1) }
    if (st.status === 'Scanned') console.log(`  [${i + 1}s] 已扫码, 等待确认...`)
    if (st.status === 'Confirmed') { cookie = st.cookie; console.log('  登录确认成功!'); break }
  }
  if (!cookie) { console.error('等待超时'); process.exit(1) }

  console.log('\n=== 2. 补齐 cookie_token/ltoken ===')
  cookie = await mihoyo.completeLogin(cookie)
  console.log('  cookie_token:', cookie.cookie_token ? cookie.cookie_token.slice(0, 12) + '...' : '(空)')
  console.log('  ltoken:', cookie.ltoken ? cookie.ltoken.slice(0, 12) + '...' : '(空)')

  console.log('\n=== 3. 获取游戏角色 ===')
  const roles = await mihoyo.getUserGameRolesByCookie(cookie)
  if (roles.length === 0) { console.error('未绑定原神国服角色'); process.exit(1) }
  for (const r of roles) {
    console.log(`  UID ${r.game_uid} | ${r.nickname} | Lv.${r.level} | ${r.region} | ${r.game_biz}`)
  }
  const role = roles[0]

  console.log('\n=== 4. 生成 authkey ===')
  const auth = await mihoyo.genAuthKey(cookie, {
    game_uid: role.game_uid, region: role.region, game_biz: role.game_biz || 'hk4e_cn',
  })
  console.log('  authkey:', auth.authkey.slice(0, 24) + '...')

  console.log('\n=== 5. 拉取祈愿记录 ===')
  const result = await mihoyo.fetchAllGacha(auth.authkey, (type, page, count, total) => {
    if (page % 5 === 1 || count === 0) console.log(`  卡池${type}: 第${page}页 +${count} (累计${total})`)
  })
  console.log('\n=== 结果 ===')
  console.log('总记录数:', result.total)
  for (const [type, items] of Object.entries(result.pools)) {
    const five = items.filter((i) => i.rank_type === '5').length
    const four = items.filter((i) => i.rank_type === '4').length
    console.log(`  卡池${type}: ${items.length} 条 | 五星 ${five} | 四星 ${four}`)
    if (items.length > 0) {
      console.log('    最近一条:', items[items.length - 1].name, items[items.length - 1].time)
    }
  }
}

main().catch((e) => {
  console.error('\n失败:', e.message)
  process.exit(1)
})
