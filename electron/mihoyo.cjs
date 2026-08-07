/**
 * 米哈游 API 模块(主进程)
 * 实现参考 TeyvatGuide 0.11.2 (github.com/BTMuli/TeyvatGuide)
 * 链路: 扫码登录 → stoken → cookie_token/ltoken → 游戏角色 → authkey → 祈愿记录
 */
const crypto = require('crypto')
const fs = require('fs')
const os = require('os')
const path = require('path')

// 日志文件路径
let logFile = path.join(os.tmpdir(), 'teyvat-gacha.log')
function logMsg(msg) {
  const line = `[${new Date().toLocaleString()}] ${msg}\n`
  try { fs.appendFileSync(logFile, line) } catch {}
  console.log(msg)
}

// ============ 常量 ============
const BBS_VERSION = '2.109.0'
const BBS_UA_PC = `Mozilla/5.0 (Windows NT 10.0; Win64; x64) miHoYoBBS/${BBS_VERSION}`
const HYP_UA = 'HYPContainer/1.3.3.182'
const PASSPORT_API = 'https://passport-api.mihoyo.com/'
const TAKUMI_API = 'https://api-takumi.mihoyo.com/'
const GACHA_API = 'https://public-operation-hk4e.mihoyo.com/gacha_info/api/getGachaLog'

// DS 签名 salt (米游社 2.109.0)
const SALTS = {
  K2: '47f15f1b66bee46b816115d8e8e6ebb6',
  LK2: 'd9200c846b10886e8c874fc33c8f308b',
  X4: 'xV8v4Qu54lUKrEYFZkJhB8cuOh9Asafs',
  X6: 't0qEgfub6cvueAPgR5m9aQWWVciEer7v',
}

// 祈愿类型
const GACHA_TYPES = [
  { type: '100', name: '新手祈愿' },
  { type: '200', name: '常驻祈愿' },
  { type: '301', name: '角色活动祈愿' },
  { type: '302', name: '武器活动祈愿' },
  { type: '400', name: '角色活动祈愿·其二' },
  { type: '500', name: '集录祈愿' },
]

// 设备信息(首次生成后固定)
let deviceId = ''
function getDeviceId() {
  if (!deviceId) {
    try {
      const fs = require('fs')
      const path = require('path')
      const storePath = path.join(app.getPath('userData'), 'mihoyo-device.json')
      if (fs.existsSync(storePath)) {
        deviceId = JSON.parse(fs.readFileSync(storePath, 'utf8')).deviceId
      }
      if (!deviceId) {
        deviceId = crypto.randomUUID()
        fs.writeFileSync(storePath, JSON.stringify({ deviceId }))
      }
    } catch {
      deviceId = crypto.randomUUID()
    }
  }
  return deviceId
}
// 延迟引入 app,避免模块加载时序问题
let app = null
function setApp(a) {
  app = a
  // 日志写入 userData 目录
  logFile = path.join(app.getPath('userData'), 'gacha-fetch.log')
  // 清空旧日志
  try { fs.writeFileSync(logFile, `=== 祈愿获取日志 ${new Date().toLocaleString()} ===\n`) } catch {}
}

// ============ DS 签名 ============
function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

function getRandomString(len) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let res = ''
  for (let i = 0; i < len; i++) res += chars[Math.floor(Math.random() * chars.length)]
  return res
}

/** 对象转字典序 query 字符串 */
function transParams(obj) {
  if (typeof obj === 'string') return obj
  const keys = Object.keys(obj).sort()
  return keys.map((k) => `${k}=${obj[k].toString()}`).join('&')
}

/** cookie 对象转字符串(字典序) */
function transCookie(cookie) {
  return Object.keys(cookie).sort().map((k) => `${k}=${cookie[k]};`).join('')
}

/**
 * DS 签名
 * @param {string} method GET/POST
 * @param {string} data 字典序 query/body 字符串
 * @param {string} saltType K2/LK2/X4/X6
 * @param {boolean} isSign true=仅 salt&t&r
 */
function getDS(method, data, saltType, isSign = false) {
  const salt = SALTS[saltType]
  const t = Math.floor(Date.now() / 1000).toString()
  const r = isSign ? getRandomString(6) : getRandomNumber(100000, 200000).toString()
  const body = method === 'GET' ? '' : data
  const query = method === 'GET' ? data : ''
  let hashStr = `salt=${salt}&t=${t}&r=${r}&b=${body}&q=${query}`
  if (isSign) hashStr = `salt=${salt}&t=${t}&r=${r}`
  const md5 = crypto.createHash('md5').update(hashStr).digest('hex')
  return `${t},${r},${md5}`
}

/** BBS 请求头(DS 签名版) */
function getRequestHeader(cookie, method, data, saltType = 'X4', isSign = false) {
  return {
    'user-agent': BBS_UA_PC,
    'x-rpc-app_version': BBS_VERSION,
    'x-rpc-client_type': '5',
    'x-requested-with': 'com.mihoyo.hyperion',
    referer: 'https://webstatic.mihoyo.com',
    'x-rpc-device_id': getDeviceId(),
    'x-rpc-device_fp': '0000000000000',
    ds: getDS(method, transParams(data), saltType, isSign),
    cookie: transCookie(cookie),
  }
}

/** 通用请求 */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function request(method, url, { headers = {}, query, body } = {}) {
  let finalUrl = url
  if (query && Object.keys(query).length) {
    const qs = new URLSearchParams()
    for (const [k, v] of Object.entries(query)) qs.append(k, String(v))
    finalUrl += `?${qs.toString()}`
  }
  const opts = { method, headers: { ...headers } }
  if (body !== undefined) {
    opts.body = typeof body === 'string' ? body : JSON.stringify(body)
    if (!headers['content-type']) opts.headers['content-type'] = 'application/json'
  }
  const resp = await fetch(finalUrl, opts)
  const text = await resp.text()
  let json
  try {
    // 保护大整数 id: 将 "id":<16+位数字> 转为 "id":"<数字>", 防止精度丢失
    const safeText = text.replace(/"id"\s*:\s*(\d{15,})/g, '"id":"$1"')
    json = JSON.parse(safeText)
  } catch { json = null }
  if (!resp.ok && !json) {
    throw new Error(`HTTP ${resp.status} ${resp.statusText}`)
  }
  return json
}

function assertOk(resp, action) {
  if (!resp || resp.retcode !== 0) {
    throw new Error(`${action}失败: [${resp?.retcode}] ${resp?.message || resp?.msg || '未知错误'}`)
  }
  return resp.data
}

// ============ 扫码登录 ============
/** 创建登录二维码 */
async function createQRLogin() {
  const data = await request('POST', `${PASSPORT_API}account/ma-cn-passport/app/createQRLogin`, {
    headers: {
      'x-rpc-device_id': getDeviceId(),
      'user-agent': HYP_UA,
      'x-rpc-app_id': 'ddxf5dufpuyo',
      'x-rpc-client_type': '3',
      'content-type': 'application/json',
    },
    body: {},
  })
  const res = assertOk(data, '创建二维码')
  return { url: res.url, ticket: res.ticket }
}

/** 轮询二维码登录状态 */
async function queryQRLoginStatus(ticket) {
  const data = await request('POST', `${PASSPORT_API}account/ma-cn-passport/app/queryQRLoginStatus`, {
    headers: {
      'x-rpc-device_id': getDeviceId(),
      'user-agent': HYP_UA,
      'x-rpc-app_id': 'ddxf5dufpuyo',
      'x-rpc-client_type': '3',
    },
    body: { ticket },
  })
  if (data.retcode !== 0) {
    // -106 = 二维码过期
    return { expired: data.retcode === -106, retcode: data.retcode, message: data.message }
  }
  const res = data.data
  const status = res.status
  if (status === 'Confirmed') {
    return {
      status,
      cookie: {
        account_id: res.user_info.aid,
        ltuid: res.user_info.aid,
        stuid: res.user_info.aid,
        mid: res.user_info.mid,
        stoken: res.tokens[0].token,
        cookie_token: '',
        ltoken: '',
      },
    }
  }
  return { status } // Created / Scanned
}

/** stoken → cookie_token */
async function getCookieAccountInfoBySToken(stoken, mid) {
  const cookie = { stoken, mid }
  const params = { stoken }
  const data = await request('GET', `${PASSPORT_API}account/auth/api/getCookieAccountInfoBySToken`, {
    headers: getRequestHeader(cookie, 'GET', params),
    query: params,
  })
  return assertOk(data, '获取 cookie_token')
}

/** stoken → ltoken */
async function getLTokenBySToken(stoken, mid) {
  const cookie = { mid, stoken }
  const params = { stoken }
  const data = await request('GET', `${PASSPORT_API}account/auth/api/getLTokenBySToken`, {
    headers: getRequestHeader(cookie, 'GET', params),
    query: params,
  })
  return assertOk(data, '获取 ltoken')
}

/** 登录成功后补齐 cookie_token / ltoken */
async function completeLogin(cookie) {
  const cookieInfo = await getCookieAccountInfoBySToken(cookie.stoken, cookie.mid)
  cookie.cookie_token = cookieInfo.cookie_token || cookieInfo.cookie_token_v2 || ''
  cookie.ltoken = cookieInfo.ltoken || ''
  try {
    const ltokenInfo = await getLTokenBySToken(cookie.stoken, cookie.mid)
    cookie.ltoken = ltokenInfo.ltoken || cookie.ltoken
  } catch { /* ltoken 非必需 */ }
  return cookie
}

// ============ 游戏角色 & authkey ============
/** 通过 cookie 获取绑定游戏角色 */
async function getUserGameRolesByCookie(cookie) {
  const ck = { account_id: cookie.account_id, cookie_token: cookie.cookie_token }
  const data = await request('GET', `${TAKUMI_API}binding/api/getUserGameRolesByCookie`, {
    headers: getRequestHeader(ck, 'GET', {}),
  })
  const roles = assertOk(data, '获取游戏角色')
  // 只保留原神国服
  return (roles.list || []).filter((r) => r.game_biz === 'hk4e_cn')
}

/** 生成 authkey(webview_gacha) */
async function genAuthKey(cookie, { game_uid, region, game_biz = 'hk4e_cn' }) {
  const ck = { stoken: cookie.stoken, mid: cookie.mid }
  const body = { auth_appid: 'webview_gacha', game_biz, game_uid, region }
  const data = await request('POST', `${TAKUMI_API}binding/api/genAuthKey`, {
    headers: getRequestHeader(ck, 'POST', JSON.stringify(body), 'LK2', true),
    body,
  })
  return assertOk(data, '生成 authkey')
}

// ============ 祈愿记录 ============
/** 单页祈愿记录 */
async function getGachaLog(authkey, gachaType, endId = '0', page = '1') {
  const params = {
    lang: 'zh-cn',
    auth_appid: 'webview_gacha',
    authkey,
    authkey_ver: '1',
    sign_type: '2',
    gacha_type: gachaType,
    size: '20',
    end_id: endId,
    page: page,
  }
  const data = await request('GET', GACHA_API, {
    headers: { 'user-agent': BBS_UA_PC, referer: 'https://webstatic.mihoyo.com/' },
    query: params,
  })
  return assertOk(data, '获取祈愿记录')
}

/** 分页拉取某一卡池的全部记录(带限流保护: 请求间隔 + 失败重试) */
async function fetchGachaByType(authkey, gachaType, onProgress) {
  const list = []
  let endId = '0'
  let pageNum = 0
  for (;;) {
    let res = null
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        res = await getGachaLog(authkey, gachaType, endId, String(pageNum + 1))
        break
      } catch (err) {
        if (attempt === 4) throw err
        await sleep(Math.min(3000 + attempt * 2000, 15000))
      }
    }
    const items = res.list || []
    list.push(...items)
    pageNum++
    if (onProgress) onProgress(gachaType, pageNum, items.length, list.length)
    if (items.length === 0) break
    endId = String(items[items.length - 1].id)
    if (list.length >= 10000) break
    await sleep(800)
  }
  // 去重
  const seen = new Set()
  const deduped = []
  for (const item of list) {
    if (!seen.has(item.id)) { seen.add(item.id); deduped.push(item) }
  }
  if (deduped.length < list.length) logMsg(`[Gacha] ${gachaType} 去重: ${list.length} → ${deduped.length}`)
  deduped.sort((a, b) => String(a.id).localeCompare(String(b.id)))
  const fiveStars = deduped.filter(i => i.rank_type === '5')
  const fiveNames = fiveStars.map(i => `${i.name}(${i.id})`).join(', ')
  logMsg(`[Gacha] ${gachaType} 完成: ${deduped.length}条, 5星${fiveStars.length}个: ${fiveNames}`)
  return deduped
}

/** 拉取全部卡池祈愿记录 */
async function fetchAllGacha(authkey, onProgress) {
  const result = {}
  const summary = {}
  let total = 0
  for (const gt of GACHA_TYPES) {
    const items = await fetchGachaByType(authkey, gt.type, onProgress)
    result[gt.type] = items
    summary[gt.type] = items.length
    total += items.length
    // 卡池之间间隔, 避免触发限流
    await sleep(3000)
  }
  logMsg(`[Gacha] 全部获取完成: ${JSON.stringify(summary)} 总计:${total}`)
  return { pools: result, total, summary }
}

module.exports = {
  GACHA_TYPES,
  setApp,
  createQRLogin,
  queryQRLoginStatus,
  completeLogin,
  getUserGameRolesByCookie,
  genAuthKey,
  getGachaLog,
  fetchAllGacha,
}
