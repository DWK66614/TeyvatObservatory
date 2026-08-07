/**
 * 扫码登录轮询(自动刷新版): 二维码过期自动重新生成, 无需重启
 * 用法: node scripts/poll-login-auto.cjs
 */
const path = require('path')
const os = require('os')
const fs = require('fs')
const QRCode = require('qrcode')
const mihoyo = require('../electron/mihoyo.cjs')

mihoyo.setApp({ getPath: () => path.join(os.tmpdir(), 'mihoyo-test') })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function main() {
  let cookie = null
  let round = 0

  while (!cookie && round < 5) {
    round++
    console.log(`\n===== 第 ${round} 轮: 生成新二维码 =====`)
    const qr = await mihoyo.createQRLogin()
    console.log('TICKET', qr.ticket)

    // 生成 ASCII 二维码写入临时文件供外部读取展示
    // 注意: terminal 模式用 ▀▄ 半块字符垂直合并两行模块,
    // 裁剪任何一行都会破坏模块完整性, 必须保留完整输出
    const ascii = await QRCode.toString(qr.url, { type: 'terminal', small: true })
    const qrFile = path.join(os.tmpdir(), 'mihoyo-qr-ascii.txt')
    fs.writeFileSync(qrFile, ascii)
    console.log('ASCII QR 已写入:', qrFile)

    // 轮询此二维码, 最多 170 秒(有效期 180 秒)
    for (let i = 0; i < 170; i++) {
      await sleep(1000)
      let st
      try {
        st = await mihoyo.queryQRLoginStatus(qr.ticket)
      } catch (e) {
        console.log(`  [${i + 1}s] 查询异常: ${e.message}`)
        continue
      }
      if (st.expired) {
        console.log(`  [${i + 1}s] 二维码过期, 自动刷新...`)
        break
      }
      if (st.status === 'Scanned') console.log(`  [${i + 1}s] 已扫码, 请在手机上点确认...`)
      if (st.status === 'Confirmed') {
        cookie = st.cookie
        console.log('  登录确认成功!')
        break
      }
    }
  }

  if (!cookie) { console.error('\n多次尝试仍未扫码, 退出'); process.exit(1) }

  console.log('\n=== 补齐 cookie_token/ltoken ===')
  cookie = await mihoyo.completeLogin(cookie)
  // 持久化 cookie, 后续测试免扫码
  fs.writeFileSync(path.join(os.tmpdir(), 'mihoyo-cookie.json'), JSON.stringify(cookie))
  console.log('  cookie 已保存:', path.join(os.tmpdir(), 'mihoyo-cookie.json'))
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
