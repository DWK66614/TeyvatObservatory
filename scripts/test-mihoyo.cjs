// 快速测试 mihoyo.cjs API(不依赖 electron)
const mihoyo = require('../electron/mihoyo.cjs')

mihoyo.setApp({ getPath: () => require('path').join(require('os').tmpdir(), 'mihoyo-test') })

async function main() {
  const cmd = process.argv[2] || 'createQR'
  if (cmd === 'createQR') {
    const qr = await mihoyo.createQRLogin()
    console.log('二维码创建成功:', JSON.stringify(qr).slice(0, 120))
    console.log('ticket:', qr.ticket)
    // 轮询一次看状态
    const st = await mihoyo.queryQRLoginStatus(qr.ticket)
    console.log('状态:', JSON.stringify(st))
  } else if (cmd === 'query') {
    const st = await mihoyo.queryQRLoginStatus(process.argv[3])
    console.log('状态:', JSON.stringify(st))
  }
}

main().catch((e) => {
  console.error('失败:', e.message)
  process.exit(1)
})
