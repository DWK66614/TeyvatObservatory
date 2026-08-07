// 检查祈愿记录 id 的精度情况
const path = require('path')
const os = require('os')
const fs = require('fs')
const mihoyo = require('../electron/mihoyo.cjs')

mihoyo.setApp({ getPath: () => path.join(os.tmpdir(), 'mihoyo-test') })

async function main() {
  const cookie = JSON.parse(fs.readFileSync(path.join(os.tmpdir(), 'mihoyo-cookie.json'), 'utf8'))
  const roles = await mihoyo.getUserGameRolesByCookie(cookie)
  const role = roles[0]
  const auth = await mihoyo.genAuthKey(cookie, {
    game_uid: role.game_uid, region: role.region, game_biz: role.game_biz || 'hk4e_cn',
  })
  const page1 = await mihoyo.getGachaLog(auth.authkey, '301', '0')
  console.log('第1页共', page1.list.length, '条')
  for (const item of page1.list.slice(0, 3)) {
    console.log('  id原始:', JSON.stringify(item.id), '| 类型:', typeof item.id, '| name:', item.name, '| rank:', item.rank_type)
  }
  // 检查 id 是否超精度: 字符串化后长度
  const idStr = String(page1.list[0].id)
  console.log('  id 字符串长度:', idStr.length)
  // 模拟字符串比较 vs 数字比较差异
  const ids = page1.list.map(i => String(i.id))
  console.log('  id 示例:', ids.join(', '))
}

main().catch((e) => { console.error('失败:', e.message); process.exit(1) })
