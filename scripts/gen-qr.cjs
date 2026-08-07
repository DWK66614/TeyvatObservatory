/**
 * 生成登录二维码(独立脚本, 输出到项目根目录)
 * 用法: node scripts/gen-qr.cjs
 */
const path = require('path')
const os = require('os')
const fs = require('fs')
const QRCode = require('qrcode')
const mihoyo = require('../electron/mihoyo.cjs')

mihoyo.setApp({ getPath: () => path.join(os.tmpdir(), 'mihoyo-test') })

async function main() {
  const qr = await mihoyo.createQRLogin()
  const out = path.join(__dirname, '..', 'qr-login.png')
  await QRCode.toFile(out, qr.url, { width: 400, margin: 2 })
  // 保存 ticket 供轮询脚本使用
  fs.writeFileSync(path.join(os.tmpdir(), 'mihoyo-ticket.txt'), qr.ticket)
  console.log('OK', out)
  console.log('TICKET', qr.ticket)
}

main().catch((e) => { console.error('失败:', e.message); process.exit(1) })
