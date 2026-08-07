import { useEffect, useRef, useState, useCallback } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { X, RefreshCw, ShieldCheck, User, Loader2, AlertTriangle } from 'lucide-react'
import { useTheme } from '../utils/theme'
import { createQR, queryQR, completeLogin, getGameRoles, genAuthKey } from '../api/mihoyo'

export default function QrLoginModal({ open, onClose, onSuccess, initialCookie }) {
  const { colors: c } = useTheme()
  const [qrUrl, setQrUrl] = useState('')
  const [ticket, setTicket] = useState('')
  const [status, setStatus] = useState('') // '' | 'created' | 'scanned' | 'confirmed' | 'expired' | 'error'
  const [statusText, setStatusText] = useState('')
  const [roles, setRoles] = useState([])
  const [roleLoading, setRoleLoading] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const timerRef = useRef(null)
  const pollRef = useRef(null)
  const cookieRef = useRef(null)
  const ticketRef = useRef('')

  const stopPolling = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
  }, [])

  const freshQr = useCallback(async () => {
    stopPolling()
    setRoles([])
    setStatus('created')
    setStatusText('请使用米游社 App 扫码')
    try {
      const data = await createQR()
      setQrUrl(data.url)
      setTicket(data.ticket)
      ticketRef.current = data.ticket
      pollRef.current = setInterval(async () => {
        try {
          const res = await queryQR(ticketRef.current)
          if (res.expired) {
            setStatus('expired')
            setStatusText('二维码已过期')
            stopPolling()
            clearInterval(pollRef.current)
            return
          }
          if (res.status === 'Scanned') {
            setStatus('scanned')
            setStatusText('已扫码，请在手机上确认')
          } else if (res.status === 'Confirmed') {
            setStatus('confirmed')
            setStatusText('登录成功')
            stopPolling()
            clearInterval(pollRef.current)
            await handleConfirmed(res.cookie)
          } else if (res.status === 'Created') {
            setStatus('created')
            setStatusText('请使用米游社 App 扫码')
          }
        } catch (err) {
          setStatus('error')
          setStatusText(err.message || '查询登录状态失败')
        }
      }, 1000)
    } catch (err) {
      setStatus('error')
      setStatusText(err.message || '创建二维码失败')
    }
  }, [])

  const handleConfirmed = async (cookie) => {
    setRoleLoading(true)
    try {
      const fullCookie = await completeLogin(cookie)
      cookieRef.current = fullCookie
      localStorage.setItem('mihoyo_cookie_v1', JSON.stringify(fullCookie))
      const roleList = await getGameRoles(fullCookie)
      setRoles(roleList)
      if (roleList.length === 1) {
        await doAuth(fullCookie, roleList[0])
      } else if (roleList.length === 0) {
        setStatus('error')
        setStatusText('该账号未绑定原神国服角色，无法获取祈愿记录')
        setRoleLoading(false)
      } else {
        setRoleLoading(false)
      }
    } catch (err) {
      setStatus('error')
      setStatusText(err.message || '登录处理失败')
      setRoleLoading(false)
    }
  }

  const doAuth = async (cookie, role) => {
    setAuthLoading(true)
    try {
      const auth = await genAuthKey(cookie, {
        game_uid: role.game_uid,
        region: role.region,
        game_biz: role.game_biz || 'hk4e_cn',
      })
      onSuccess(cookie, role, auth.authkey)
    } catch (err) {
      setStatus('error')
      setStatusText(err.message || '生成 authkey 失败')
      setAuthLoading(false)
    }
  }

  const handleRoleSelect = async (role) => {
    setRoleLoading(true)
    try {
      await doAuth(cookieRef.current, role)
    } catch (err) {
      setStatus('error')
      setStatusText(err.message || '登录处理失败')
      setRoleLoading(false)
    }
  }

  const bootstrap = useCallback(async () => {
    // 已登录: 跳过扫码,直接进入角色选择
    if (initialCookie) {
      setStatus('confirmed')
      setStatusText('已登录，请选择角色')
      setRoleLoading(true)
      try {
        cookieRef.current = initialCookie
        const roleList = await getGameRoles(initialCookie)
        setRoles(roleList)
        if (roleList.length === 1) {
          await doAuth(initialCookie, roleList[0])
        } else if (roleList.length === 0) {
          setStatus('error')
          setStatusText('该账号未绑定原神国服角色，无法获取祈愿记录')
          setRoleLoading(false)
        } else {
          setRoleLoading(false)
        }
      } catch (err) {
        setStatus('error')
        setStatusText(err.message || '获取角色失败')
        setRoleLoading(false)
      }
      return
    }
    freshQr()
  }, [initialCookie])

  useEffect(() => {
    if (open) {
      setQrUrl('')
      setTicket('')
      setStatus('')
      setStatusText('')
      setRoles([])
      setRoleLoading(false)
      setAuthLoading(false)
      bootstrap()
    }
    return () => {
      stopPolling()
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [open, initialCookie])

  if (!open) return null

  const roleColor = (idx) => (idx % 2 === 0 ? c.gold : c.sage)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
         onClick={onClose}>
      <div className="card w-full max-w-sm p-6 rounded-2xl" style={{ boxShadow: c.cardShadowHover }}
           onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold font-display" style={{ color: c.text }}>
            {initialCookie ? '选择游戏角色' : '米游社扫码登录'}
          </h3>
          <button onClick={onClose} className="p-1 rounded transition-colors hover:bg-white/5" style={{ color: c.textFaint }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 二维码阶段 */}
        {roles.length === 0 && !authLoading && (
          <>
            <div className="flex flex-col items-center py-2">
              <div className="p-3 rounded-xl" style={{ background: '#fff', border: `1px solid ${c.border}` }}>
                {qrUrl ? (
                  <QRCodeSVG value={qrUrl} size={210} fgColor="#1a1814" />
                ) : (
                  <div className="w-[210px] h-[210px] flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin" style={{ color: c.textFaint }} />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 mt-4 text-sm" style={{ color: c.textMuted }}>
                {status === 'scanned' ? (
                  <ShieldCheck className="w-4 h-4" style={{ color: c.sage }} />
                ) : status === 'confirmed' ? (
                  <Loader2 className="w-4 h-4 animate-spin" style={{ color: c.gold }} />
                ) : (
                  <AlertTriangle className="w-4 h-4" style={{ color: c.gold }} />
                )}
                <span>{statusText || '正在生成二维码...'}</span>
              </div>

              {status === 'expired' && (
                <button onClick={freshQr}
                        className="mt-4 px-4 py-2 rounded-lg text-sm font-semibold inline-flex items-center gap-2"
                        style={{ background: c.gold, color: c.goldText }}>
                  <RefreshCw className="w-3.5 h-3.5" />
                  刷新二维码
                </button>
              )}
            </div>
            <p className="text-[11px] text-center mt-4 leading-relaxed" style={{ color: c.textFaint }}>
              请使用米游社 App 扫描二维码
              <br />
              仅用于登录米游社账号，获取祈愿记录
              <br />
              此操作没有盗号风险，放心扫码
            </p>
          </>
        )}

        {/* 角色选择阶段 */}
        {roles.length > 0 && !authLoading && (
          <div className="py-2">
            <p className="text-xs mb-3" style={{ color: c.textMuted }}>
              选择要查询祈愿记录的游戏角色
            </p>
            <div className="space-y-2">
              {roles.map((r, i) => {
                const color = roleColor(i)
                return (
                  <button key={r.game_uid}
                          onClick={() => handleRoleSelect(r)}
                          className="w-full p-3.5 rounded-xl flex items-center gap-3 text-left transition-colors hover:translate-x-0.5"
                          style={{ background: `${color}0d`, border: `1px solid ${color}30` }}>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                         style={{ background: `${color}18` }}>
                      <User className="w-4 h-4" style={{ color }} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate" style={{ color: c.text }}>
                        {r.nickname || `旅行者`}
                      </div>
                      <div className="text-[11px] font-mono" style={{ color: c.textFaint }}>
                        UID {r.game_uid} · Lv.{r.level}
                      </div>
                    </div>
                    <span className="ml-auto text-xs" style={{ color }}>查看 →</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* authkey 生成中 */}
        {authLoading && (
          <div className="py-10 flex flex-col items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: c.gold }} />
            <p className="text-sm" style={{ color: c.textMuted }}>正在获取祈愿记录授权...</p>
          </div>
        )}

        {status === 'error' && roles.length === 0 && (
          <p className="text-xs mt-3 p-3 rounded-lg" style={{ background: c.errorBg, color: c.errorText }}>
            {statusText}
          </p>
        )}
      </div>
    </div>
  )
}
