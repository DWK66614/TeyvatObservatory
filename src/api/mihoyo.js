/**
 * 米哈游 API 渲染端封装(经 preload IPC → 主进程)
 */
const COOKIE_KEY = 'mihoyo_cookie_v1'
const ROLE_KEY = 'mihoyo_role_v1'
const GACHA_KEY = 'mihoyo_gacha_encrypted_v1'
const ACCOUNTS_KEY = 'mihoyo_accounts_map_v1'
const ENCRYPTION_SALT = 'TeyvatObservatory_2026' // 固定盐值

export function isElectron() {
  return !!window.electronAPI?.isElectron
}

export function getSavedCookie() {
  try {
    return JSON.parse(localStorage.getItem(COOKIE_KEY))
  } catch {
    return null
  }
}

export function saveCookie(cookie) {
  localStorage.setItem(COOKIE_KEY, JSON.stringify(cookie))
}

export function clearCookie() {
  localStorage.removeItem(COOKIE_KEY)
}

export function saveRole(role) {
  localStorage.setItem(ROLE_KEY, JSON.stringify(role))
}

export function loadRole() {
  try {
    return JSON.parse(localStorage.getItem(ROLE_KEY))
  } catch {
    return null
  }
}

export function clearRole() {
  localStorage.removeItem(ROLE_KEY)
}

// ========== 多账号存储 ==========

/**
 * 获取所有保存的账号列表
 * @returns {Array<{uid, nickname, lastLogin}>}
 */
export function getSavedAccounts() {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY)
    if (!raw) return []
    const map = JSON.parse(raw)
    // 转换为数组并按最近登录排序
    return Object.values(map).sort((a, b) => b.lastLogin - a.lastLogin)
  } catch {
    return []
  }
}

/**
 * 保存账号信息（登录时自动调用）
 * @param {string} uid
 * @param {object} cookie
 * @param {object} role - { nickname, game_uid, ... }
 */
export function saveAccount(uid, cookie, role) {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY)
    const map = raw ? JSON.parse(raw) : {}
    map[uid] = {
      uid,
      nickname: role?.nickname || '旅行者',
      cookie,
      role,
      lastLogin: Date.now(),
    }
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(map))
    console.log('[Account] 已保存账号:', uid, role?.nickname)
  } catch (err) {
    console.error('[Account] 保存账号失败:', err)
  }
}

/**
 * 删除某个账号
 * @param {string} uid
 */
export function removeAccount(uid) {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY)
    if (!raw) return
    const map = JSON.parse(raw)
    delete map[uid]
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(map))
  } catch (err) {
    console.error('[Account] 删除账号失败:', err)
  }
}

/**
 * 根据 uid 获取单个账号信息
 * @param {string} uid
 * @returns {object|null} { uid, nickname, cookie, role, lastLogin }
 */
export function getAccountByUid(uid) {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY)
    if (!raw) return null
    const map = JSON.parse(raw)
    return map[uid] || null
  } catch {
    return null
  }
}

// ========== 加密存储祈愿记录 ==========

/**
 * 从 uid 派生 AES-256 加密密钥
 * 使用 PBKDF2 + 固定盐，确保同一 uid 总是得到相同密钥
 */
async function deriveKey(uid) {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(String(uid)),
    'PBKDF2',
    false,
    ['deriveKey']
  )
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode(ENCRYPTION_SALT),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

/**
 * 保存祈愿数据到本地（加密存储）
 * @param {string} uid - 用户 UID（加密密钥）
 * @param {object} gachaData - 祈愿数据 { pools: {...} }
 * @param {object} account - 账户信息 { nickname, game_uid }
 */
export async function saveGachaData(uid, gachaData, account) {
  try {
    const key = await deriveKey(uid)
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const encoder = new TextEncoder()
    const plaintext = encoder.encode(JSON.stringify(gachaData))
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      plaintext
    )
    const encryptedObj = {
      iv: Array.from(iv),
      ciphertext: Array.from(new Uint8Array(ciphertext)),
      timestamp: Date.now(),
      nickname: account?.nickname || '旅行者',
      uid: account?.game_uid || uid,
      // 保存总抽数用于预览（不加密）
      totalPulls: Object.values(gachaData.pools || {}).reduce((s, p) => s + (p?.length || 0), 0),
    }
    localStorage.setItem(GACHA_KEY, JSON.stringify(encryptedObj))
    console.log('[Gacha] 已保存祈愿记录（加密），总抽数:', encryptedObj.totalPulls)
    return true
  } catch (err) {
    console.error('[Gacha] 保存失败:', err)
    return false
  }
}

/**
 * 加载本地祈愿数据（解密）
 * @param {string} uid - 用户 UID（解密密钥）
 * @returns {object|null} 祈愿数据，失败返回 null
 */
export async function loadGachaData(uid) {
  try {
    const raw = localStorage.getItem(GACHA_KEY)
    if (!raw) return null
    const encryptedObj = JSON.parse(raw)
    const key = await deriveKey(uid)
    const iv = new Uint8Array(encryptedObj.iv)
    const ciphertext = new Uint8Array(encryptedObj.ciphertext)
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    )
    const decoder = new TextDecoder()
    const data = JSON.parse(decoder.decode(decrypted))
    console.log('[Gacha] 已加载本地祈愿记录')
    return { data, meta: { timestamp: encryptedObj.timestamp, nickname: encryptedObj.nickname, uid: encryptedObj.uid, totalPulls: encryptedObj.totalPulls } }
  } catch (err) {
    console.error('[Gacha] 加载失败（可能密钥不匹配或数据损坏）:', err)
    return null
  }
}

/**
 * 检查是否有本地保存的祈愿数据
 * @returns {object|null} 返回元数据 { timestamp, nickname, uid, totalPulls }，没有返回 null
 */
export function getGachaMeta() {
  try {
    const raw = localStorage.getItem(GACHA_KEY)
    if (!raw) return null
    const obj = JSON.parse(raw)
    return { timestamp: obj.timestamp, nickname: obj.nickname, uid: obj.uid, totalPulls: obj.totalPulls }
  } catch {
    return null
  }
}

/**
 * 清除本地保存的祈愿数据
 */
export function clearGachaData() {
  localStorage.removeItem(GACHA_KEY)
}

export function createQR() {
  return window.electronAPI.mihoyo.createQR()
}

export function queryQR(ticket) {
  return window.electronAPI.mihoyo.queryQR(ticket)
}

export function completeLogin(cookie) {
  return window.electronAPI.mihoyo.completeLogin(cookie)
}

export function getGameRoles(cookie) {
  return window.electronAPI.mihoyo.gameRoles(cookie)
}

export function genAuthKey(cookie, account) {
  return window.electronAPI.mihoyo.genAuthKey(cookie, account)
}

export function fetchGacha(authkey) {
  return window.electronAPI.mihoyo.fetchGacha(authkey)
}

let progressCb = null
let progressRegistered = false

export function onGachaProgress(cb) {
  progressCb = cb
  if (progressRegistered || !window.electronAPI?.mihoyo) return
  progressRegistered = true
  window.electronAPI.mihoyo.onGachaProgress((p) => {
    if (progressCb) progressCb(p)
  })
}

/** 读取 CLI 测试保存的登录会话(开发便利) */
export function readDevCookie() {
  if (!window.electronAPI?.mihoyo?.devCookie) return Promise.resolve(null)
  return window.electronAPI.mihoyo.devCookie()
}
