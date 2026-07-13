// Enka.Network API wrapper for Genshin Impact data
// Dev: uses Vite proxy (/api/enka → https://enka.network/api)
// Production (Capacitor): uses CapacitorHttp (bypasses CORS in WebView)
// Production (Electron): uses fetch directly (no CORS in Electron)

const isDev = import.meta.env.DEV

const ENKA_BASE = isDev ? '/api/enka' : 'https://enka.network/api'
const ENKA_UI_BASE = isDev ? '/api/ui' : 'https://enka.network/ui'

// Detect Capacitor platform (no import needed — uses global bridge)
function isCapacitorNative() {
  try {
    return typeof window !== 'undefined' && window.Capacitor && window.Capacitor.isNativePlatform()
  } catch { return false }
}

// Use Capacitor's native HTTP plugin (bypasses CORS) if available
async function capacitorFetch(url) {
  if (typeof window === 'undefined' || !window.Capacitor) return null
  const plugin = window.Capacitor.Plugins?.CapacitorHttp
  if (!plugin) return null
  const result = await plugin.request({ url, method: 'GET', headers: { 'User-Agent': 'TeyvatObservatory/1.0' } })
  return { status: result.status, data: result.data }
}

// Cache to avoid repeated calls
const cache = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

async function cachedFetch(url) {
  const cached = cache.get(url)
  if (cached && Date.now() - cached.timestamp < (cached.cacheTime || CACHE_DURATION)) {
    console.log('[Enka] Using cached data for', url)
    return cached.data
  }

  console.log('[Enka] Fetching', url)
  let status, data

  try {
    if (isDev) {
      // Dev: use regular fetch with Vite proxy
      const res = await fetch(url)
      status = res.status
      if (!res.ok) {
        console.error('[Enka] HTTP error:', status)
        if (status === 400) throw new Error('UID 格式错误')
        if (status === 404) throw new Error('未找到该玩家数据，请确认UID是否正确')
        if (status === 424) throw new Error('Enka 服务正在维护中，请稍后再试')
        if (status === 429) throw new Error('请求过于频繁，请稍后再试')
        if (status === 503) throw new Error('Enka 服务暂时不可用，请稍后再试')
        throw new Error(`API 请求失败 (${status})`)
      }
      data = await res.json()
    } else {
      // Production: try Capacitor native HTTP first (bypasses WebView CORS), fall back to fetch
      const capRes = await capacitorFetch(url)
      if (capRes) {
        status = capRes.status
        data = capRes.data
      } else {
        const res = await fetch(url)
        status = res.status
        if (res.ok) data = await res.json()
      }
      if (status < 200 || status >= 300) {
        console.error('[Enka] HTTP error:', status)
        if (status === 400) throw new Error('UID 格式错误')
        if (status === 404) throw new Error('未找到该玩家数据，请确认UID是否正确')
        if (status === 424) throw new Error('Enka 服务正在维护中，请稍后再试')
        if (status === 429) throw new Error('请求过于频繁，请稍后再试')
        if (status === 503) throw new Error('Enka 服务暂时不可用，请稍后再试')
        throw new Error(`API 请求失败 (${status})`)
      }
    }
  } catch (err) {
    // Re-throw API errors as-is
    if (err.message.includes('UID') || err.message.includes('未找到') || err.message.includes('维护') || err.message.includes('频繁') || err.message.includes('不可用') || err.message.includes('API 请求失败')) {
      throw err
    }
    console.error('[Enka] Network error:', err)
    throw new Error(`网络请求失败: ${err.message}`)
  }

  // Don't cache empty showcase long — user may have just made it public
  const hasShowcase = data?.avatarInfoList?.length > 0
  const cacheTime = hasShowcase ? CACHE_DURATION : 30000 // 30s for empty, 5min for data
  cache.set(url, { data, timestamp: Date.now(), cacheTime })
  console.log('[Enka] Successfully fetched data for', url, hasShowcase ? `(${data.avatarInfoList.length} avatars)` : '(no showcase)')
  return data
}

// Fetch player profile by UID
export async function fetchPlayerData(uid, forceRefresh = false) {
  const url = `${ENKA_BASE}/uid/${uid}`
  if (forceRefresh) {
    cache.delete(url)
    console.log('[Enka] Force refresh, cache cleared for', uid)
  }
  return cachedFetch(url)
}

// Fetch character/weapon/artifact metadata
export async function fetchGameData() {
  const url = `${ENKA_BASE}/uid/700000000` // Use a known invalid UID just to get locale data
  // We'll fetch metadata via the UI endpoint instead
  return null
}

// Mihoyo CDN for character icons (public, no auth needed)
const MIHOYO_ICON_BASE = 'https://upload-os-bbs.mihoyo.com/game_record/genshin/character_icon'
const MIHOYO_SIDE_BASE = 'https://upload-os-bbs.mihoyo.com/game_record/genshin/character_side_icon'

// Get profile picture URL and info
// Profile picture IDs in Enka API are game-internal PlayerIcon IDs (not character avatar IDs)
// For Traveler variants, use their base character icon filename
export function getProfilePicture(profilePicId, avatarIdFromShowcase) {
  // Known mappings for common profile picture IDs (game PlayerIcon IDs → icon filenames)
  // These are difficult to map without full game data, so use character-based fallback
  const PLAYERICON_FILENAMES = {
    // Default character icons use the character's filename
  }

  // If we have a showcase avatar ID, use that character's icon
  if (avatarIdFromShowcase) {
    const char = KNOWN_CHARACTERS[avatarIdFromShowcase]
    if (char) {
      // For Traveler, use PlayerGirl/PlayerBoy
      let iconName
      if (avatarIdFromShowcase === 10000007) iconName = 'PlayerGirl'
      else if (avatarIdFromShowcase === 10000005) iconName = 'PlayerBoy'
      else {
        // For other characters, the side icon filename uses internal name
        // We don't have filename mapping for all characters, skip
        return { url: null, element: char.element, name: char.name }
      }
      const url = `${MIHOYO_SIDE_BASE}/UI_AvatarIcon_Side_${iconName}.png`
      return { url, element: char.element, name: char.name }
    }
  }

  return { url: null, element: null, name: null }
}

// Get character icon URL
export function getCharacterIcon(id) {
  return null
}

// Get character splash art URL
export function getCharacterSplash(id) {
  return null
}

// Get character name card URL
export function getNameCard(id) {
  if (!id) return null
  return `${ENKA_UI_BASE}/UI_NameCardPic_${id}.png`
}

// Parse Enka response into structured data
export function parsePlayerInfo(data) {
  if (!data?.playerInfo) return null

  const { playerInfo, ttl, uid } = data

  return {
    uid: uid || playerInfo.uid,
    nickname: playerInfo.nickname || '旅行者',
    signature: playerInfo.signature || '',
    level: playerInfo.level || 0,
    worldLevel: playerInfo.worldLevel || 0,
    nameCardId: playerInfo.nameCardId || 0,
    finishAchievementNum: playerInfo.finishAchievementNum || 0,
    towerFloorIndex: playerInfo.towerFloorIndex || 0,
    towerLevelIndex: playerInfo.towerLevelIndex || 0,
    profilePicture: (() => {
      const picId = playerInfo.profilePicture?.id || 0

      const resolveByAvatarId = (avatarId) => {
        const img = CHAR_IMAGES[avatarId]
        const char = KNOWN_CHARACTERS[avatarId]
        if (img?.icon) {
          const iconUrl = `${ENKA_UI_BASE}/${img.icon}_Circle.png`
          return { id: picId, iconUrl, name: char?.name || null, element: char?.element || null }
        }
        return null
      }

      // Approach 1: Look up in pfps.json (PlayerIcon ID → icon path)
      const pfpEntry = PFP_DATA[picId]
      if (pfpEntry?.iconPath) {
        const iconUrl = `${ENKA_UI_BASE}/${pfpEntry.iconPath}.png`
        return { id: picId, iconUrl, name: null, element: null }
      }

      // Approach 2: Try profilePicture.id directly as a character avatar ID
      const direct = resolveByAvatarId(picId)
      if (direct) return direct

      return { id: picId, iconUrl: null, name: null, element: null }
    })(),
    nameCardUrl: getNameCard(playerInfo.nameCardId),
    ttl: ttl || 0,
    abyssStars: playerInfo.towerStarIndex || 0,
    stygian: playerInfo.stygianIndex != null ? {
      index: playerInfo.stygianIndex || 0,
      seconds: playerInfo.stygianSeconds || 0,
      id: playerInfo.stygianId || 0,
    } : null,
  }
}

export function parseCharacterInfo(avatarInfo, data) {
  if (!avatarInfo) return null

  const { avatarId, propMap, fightPropMap, skillDepotId, talentIdList, skillLevelMap, proudSkillExtraLevelMap, equipList, fetterInfo } = avatarInfo

  // Look up character images from pre-generated mapping (genshin-db)
  const imgData = CHAR_IMAGES[avatarId]

  // Calculate total CV (crit value)
  const critRate = fightPropMap?.['20'] || 0  // FIGHT_PROP_CRITICAL
  const critDmg = fightPropMap?.['22'] || 0   // FIGHT_PROP_CRITICAL_HURT
  const critValue = (critRate * 2 + critDmg) * 100 // CV = CR*2 + CDMG

  // Auto-detect element from DMG bonus stats in fightPropMap
  const elementDmgMap = {
    '40': 'Pyro', '41': 'Pyro',
    '42': 'Hydro', '43': 'Hydro',
    '44': 'Cryo', '45': 'Cryo',
    '46': 'Anemo', '47': 'Anemo',
    '48': 'Geo', '49': 'Geo',
    '50': 'Dendro', '51': 'Dendro',
    '52': 'Electro', '53': 'Electro',
    '54': 'Electro', '55': 'Electro',
    '30': 'Physical', '31': 'Physical',
  }

  let detectedElement = null
  for (const [key, element] of Object.entries(elementDmgMap)) {
    if (fightPropMap?.[key] > 0) {
      if (element !== 'Physical') {
        detectedElement = element
        break
      }
    }
  }

  return {
    id: avatarId,
    level: parseInt(propMap?.['4001']?.val) || 1,
    ascension: parseInt(propMap?.['1002']?.val) || 0,
    exp: parseInt(propMap?.['1001']?.val) || 0,
    friendship: fetterInfo?.expLevel || 1,
    talentLevels: (() => {
      // Map talentIdList + skillLevelMap to structured talent levels (A/E/Q order)
      if (!skillLevelMap || Object.keys(skillLevelMap).length === 0) return []
      const skillEntries = Object.entries(skillLevelMap).sort(([a], [b]) => Number(a) - Number(b))
      const labels = ['A', 'E', 'Q']

      // If talentIdList is available, use it to match skills to A/E/Q
      if (talentIdList?.length) {
        return talentIdList.slice(0, 3).map((tid, i) => {
          const tidStr = String(tid)
          let level = null
          for (const [key, val] of skillEntries) {
            if (key.endsWith(tidStr) || key.endsWith(tidStr.slice(-2))) {
              level = val; break
            }
          }
          if (level === null && skillEntries[i]) level = skillEntries[i][1]
          let extra = 0
          if (proudSkillExtraLevelMap) {
            for (const [key, val] of Object.entries(proudSkillExtraLevelMap)) {
              if (key.includes(tidStr)) { extra = val; break }
            }
          }
          return { label: labels[i] || String(i), level: level ?? 1, extra }
        })
      }

      // No talentIdList — extract from skillLevelMap directly
      // Some chars have 4+ skills (e.g. Ayaka with alternate sprint);
      // take the 3 entries with highest levels (exclude passives at level 1)
      const mainSkills = skillEntries
        .filter(([, lv]) => lv > 1) // skip level-1 passives/sprints
        .slice(-3)                   // take last 3 (typically A/E/Q in ascending key order)
      if (mainSkills.length < 3) {
        // Fallback: take all entries with level > 0
        const all = skillEntries.filter(([, lv]) => lv > 0).slice(-3)
        if (all.length === 0) return []
        return all.map(([, lv], i) => {
          let extra = 0
          if (proudSkillExtraLevelMap) {
            for (const [key, val] of Object.entries(proudSkillExtraLevelMap)) {
              if (i === 2) { extra = Math.max(extra, val) }
            }
          }
          return { label: labels[i] || 'T' + (i + 1), level: lv, extra }
        })
      }
      return mainSkills.map(([, lv], i) => {
        let extra = 0
        if (proudSkillExtraLevelMap) {
          for (const [key, val] of Object.entries(proudSkillExtraLevelMap)) {
            if (i === 2) { extra = Math.max(extra, val) } // extra levels usually on Q
          }
        }
        return { label: labels[i] || 'T' + (i + 1), level: lv, extra }
      })
    })(),
    skillDepotId: skillDepotId || 0,
    constellations: talentIdList?.length > 6 ? talentIdList.length - 6 : 0,
    critValue: parseFloat(critValue.toFixed(1)),
    detectedElement, // Auto-detected from fightPropMap DMG bonuses
    stats: {
      hp: fightPropMap?.['1'] || 0,
      atk: fightPropMap?.['4'] || 0,
      def: fightPropMap?.['7'] || 0,
      em: Math.round(fightPropMap?.['28'] || 0),
      critRate: parseFloat(((fightPropMap?.['20'] || 0) * 100).toFixed(1)),
      critDmg: parseFloat(((fightPropMap?.['22'] || 0) * 100).toFixed(1)),
      er: parseFloat(((fightPropMap?.['23'] || 0) * 100).toFixed(1)),
      electroDmg: parseFloat(((fightPropMap?.['54'] || 0) * 100).toFixed(1)),
      pyroDmg: parseFloat(((fightPropMap?.['40'] || 0) * 100).toFixed(1)),
      hydroDmg: parseFloat(((fightPropMap?.['42'] || 0) * 100).toFixed(1)),
      cryoDmg: parseFloat(((fightPropMap?.['44'] || 0) * 100).toFixed(1)),
      anemoDmg: parseFloat(((fightPropMap?.['46'] || 0) * 100).toFixed(1)),
      geoDmg: parseFloat(((fightPropMap?.['48'] || 0) * 100).toFixed(1)),
      dendroDmg: parseFloat(((fightPropMap?.['50'] || 0) * 100).toFixed(1)),
      physDmg: parseFloat(((fightPropMap?.['30'] || 0) * 100).toFixed(1)),
    },
    weapon: parseWeapon(equipList?.find(e => e.flat?.weaponStats)),
    artifacts: parseArtifacts(equipList?.filter(e => e.flat?.reliquaryMainstat)),
    // Character images — Enka UI CDN (from pre-generated char-images.json)
    avatarIcon: imgData?.avatarIcon || null,
    sideIcon: imgData?.sideIcon || null,
    splashUrl: imgData?.splashUrl || null,
  }
}

function parseWeapon(weaponData) {
  if (!weaponData) return null

  const { itemId, flat, weapon: wInfo } = weaponData
  const stats = flat?.weaponStats || []
  const mainStat = stats[0]
  const subStat = stats.length > 1 ? stats[stats.length - 1] : null

  // Detect weapon type from icon filename
  const iconName = flat?.icon || ''
  let weaponType = null
  if (iconName.includes('Sword')) weaponType = 'WEAPON_SWORD_ONE_HAND'
  else if (iconName.includes('Claymore')) weaponType = 'WEAPON_CLAYMORE'
  else if (iconName.includes('Pole')) weaponType = 'WEAPON_POLE'
  else if (iconName.includes('Catalyst')) weaponType = 'WEAPON_CATALYST'
  else if (iconName.includes('Bow')) weaponType = 'WEAPON_BOW'

  return {
    id: itemId,
    level: wInfo?.level || 1,
    ascension: wInfo?.promoteLevel || 0,
    refinement: Object.values(wInfo?.affixMap || {})[0] || 1,
    weaponType,
    mainStat: mainStat ? { name: mainStat.appendPropId, value: mainStat.statValue } : null,
    subStat: subStat ? { name: subStat.appendPropId, value: subStat.statValue } : null,
    iconUrl: flat?.icon ? `${ENKA_UI_BASE}/${flat.icon}.png` : null,
  }
}

function parseArtifacts(artifactList) {
  if (!artifactList || !artifactList.length) return []

  return artifactList.map(art => {
    const { itemId, flat, reliquary } = art
    const mainStat = flat?.reliquaryMainstat
    const subStats = flat?.reliquarySubstats || []

    return {
      id: itemId,
      slot: flat?.equipType,
      level: (reliquary?.level || 0) - 1, // 0-based to 20-based
      rarity: flat?.rankLevel || 5,
      mainStat: mainStat ? { name: mainStat.mainPropId, value: mainStat.statValue } : null,
      subStats: subStats.map(s => ({ name: s.appendPropId, value: s.statValue })),
      iconUrl: flat?.icon ? `${ENKA_UI_BASE}/${flat.icon}.png` : null,
      setName: flat?.setNameTextMapHash || null,
    }
  })
}

// Get all showcase characters
export function parseShowcaseCharacters(data) {
  if (!data?.avatarInfoList) return []
  return data.avatarInfoList
    .map(avatar => {
      try {
        return parseCharacterInfo(avatar, data)
      } catch (err) {
        console.error('[Enka] Failed to parse character', avatar?.avatarId, err)
        return null
      }
    })
    .filter(Boolean)
    .sort((a, b) => b.level - a.level)
}

// Character ID → name mapping. Generated from genshin-db npm package.
import CHARACTER_DATA from '../data/characters.json'
export const KNOWN_CHARACTERS = CHARACTER_DATA

// Character ID → official image URLs (Mihoyo CDN / Enka UI)
import CHAR_IMAGES from '../data/char-images.json'

// Profile picture ID → icon path (from Enka.Network store/pfps.json)
import PFP_DATA from '../data/pfps.json'

// Lookup character by ID — with fallback using detected element
export function getCharacterInfo(avatarId, detectedElement = null) {
  const id = parseInt(avatarId)
  if (KNOWN_CHARACTERS[id]) return KNOWN_CHARACTERS[id]

  // Unknown character — use detected element if available
  if (detectedElement) {
    return {
      name: null,
      element: detectedElement,
      rarity: 5, // assume 5-star for unknown (safe default for display)
      weapon: null,
    }
  }
  return null
}
