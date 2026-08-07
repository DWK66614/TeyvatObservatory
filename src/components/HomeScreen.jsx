import { Compass, UserSearch, Sparkles, RefreshCw, Clock, Database, Loader2, Users } from 'lucide-react'
import { useTheme } from '../utils/theme'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { getGachaMeta, getSavedAccounts } from '../api/mihoyo'

// 账号选择弹窗
function AccountSelectModal({ open, onClose, onSelect, accounts }) {
  const { colors: c } = useTheme()
  if (!open || accounts.length === 0) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
         onClick={onClose}>
      <div className="card p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}
           style={{ animation: 'slideUp 0.3s ease-out' }}>
        <div className="text-center mb-5">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
               style={{ background: `${c.sage}15`, border: `1px solid ${c.sage}30` }}>
            <Users className="w-7 h-7" style={{ color: c.sage }} />
          </div>
          <h3 className="text-lg font-bold font-display mb-1" style={{ color: c.text }}>
            选择账号
          </h3>
          <p className="text-xs" style={{ color: c.textMuted }}>
            选择要查看祈愿记录的账号
          </p>
        </div>

        <div className="space-y-2 mb-5 max-h-[300px] overflow-y-auto">
          {accounts.map((acc) => {
            const savedDate = new Date(acc.lastLogin)
            const dateStr = `${savedDate.getMonth() + 1}/${savedDate.getDate()} ${String(savedDate.getHours()).padStart(2, '0')}:${String(savedDate.getMinutes()).padStart(2, '0')}`
            return (
              <button
                key={acc.uid}
                onClick={() => onSelect(acc)}
                className="w-full p-4 rounded-xl text-left transition-colors"
                style={{
                  background: c.surfaceElevated,
                  border: `1px solid ${c.border}`,
                }}
                onMouseEnter={e => e.currentTarget.style.background = c.surfaceHover}
                onMouseLeave={e => e.currentTarget.style.background = c.surfaceElevated}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold" style={{ color: c.text }}>
                      {acc.nickname}
                    </div>
                    <div className="text-[11px] font-mono" style={{ color: c.textFaint }}>
                      UID {acc.uid}
                    </div>
                  </div>
                  <div className="text-[10px]" style={{ color: c.textFaint }}>
                    {dateStr}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-lg text-sm font-semibold transition-colors"
          style={{
            background: 'transparent',
            border: `1px solid ${c.border}`,
            color: c.textMuted,
          }}
        >
          取消
        </button>
      </div>
    </div>,
    document.body
  )
}

// 历史记录弹窗
function GachaHistoryModal({ open, onClose, onLoadHistory, onRefresh, meta, loading }) {
  const { colors: c } = useTheme()
  if (!open || !meta) return null

  const savedDate = new Date(meta.timestamp)
  const dateStr = `${savedDate.getFullYear()}-${String(savedDate.getMonth() + 1).padStart(2, '0')}-${String(savedDate.getDate()).padStart(2, '0')}`
  const timeStr = `${String(savedDate.getHours()).padStart(2, '0')}:${String(savedDate.getMinutes()).padStart(2, '0')}`

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
         onClick={onClose}>
      <div className="card p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}
           style={{ animation: 'slideUp 0.3s ease-out' }}>
        <div className="text-center mb-5">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
               style={{ background: `${c.sage}15`, border: `1px solid ${c.sage}30` }}>
            <Database className="w-7 h-7" style={{ color: c.sage }} />
          </div>
          <h3 className="text-lg font-bold font-display mb-1" style={{ color: c.text }}>
            发现历史祈愿记录
          </h3>
          <p className="text-xs" style={{ color: c.textMuted }}>
            已找到 {meta.nickname} 的祈愿数据
          </p>
        </div>

        <div className="rounded-xl p-4 mb-5" style={{ background: c.surfaceElevated, border: `1px solid ${c.border}` }}>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-3.5 h-3.5" style={{ color: c.textFaint }} />
            <span className="text-xs font-medium" style={{ color: c.textSecondary }}>
              保存时间：{dateStr} {timeStr}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" style={{ color: c.gold }} />
            <span className="text-xs font-medium" style={{ color: c.textSecondary }}>
              {meta.nickname} · {meta.totalPulls} 条记录
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            style={{
              background: 'transparent',
              border: `1px solid ${c.border}`,
              color: c.textMuted,
              opacity: loading ? 0.5 : 1,
            }}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            重新获取
          </button>
          <button
            onClick={onLoadHistory}
            disabled={loading}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            style={{
              background: c.sage,
              color: c.goldText,
              opacity: loading ? 0.5 : 1,
            }}>
            <Clock className="w-4 h-4" />
            查看历史记录
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default function HomeScreen({ onUidQuery, onGacha, onReScan, onNewScan, loggedNickname, onLoadGachaHistory, onSwitchAndGacha }) {
  const { colors: c } = useTheme()
  const [gachaMeta, setGachaMeta] = useState(null)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [showAccountModal, setShowAccountModal] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [accounts, setAccounts] = useState([])
  const [selectedAccount, setSelectedAccount] = useState(null)

  // 启动时检查本地保存的数据
  useEffect(() => {
    const meta = getGachaMeta()
    if (meta) {
      setGachaMeta(meta)
    }
    const savedAccounts = getSavedAccounts()
    setAccounts(savedAccounts)
  }, [])

  // 处理祈愿卡片按钮点击
  const handleGachaClick = () => {
    if (accounts.length > 1) {
      // 多个账号，弹出选择
      setShowAccountModal(true)
    } else if (accounts.length === 1) {
      // 单个账号，检查是否有历史记录
      const acc = accounts[0]
      if (gachaMeta && String(gachaMeta.uid) === String(acc.uid)) {
        setSelectedAccount(acc)
        setShowHistoryModal(true)
      } else {
        // 没有历史记录，直接扫码登录（使用已保存的cookie）
        onGacha()
      }
    } else {
      // 没有账号，扫码登录
      onGacha()
    }
  }

  // 选择账号后
  const handleSelectAccount = (acc) => {
    setShowAccountModal(false)
    setSelectedAccount(acc)
    // 检查该账号是否有历史记录
    if (gachaMeta && String(gachaMeta.uid) === String(acc.uid)) {
      setShowHistoryModal(true)
    } else {
      // 没有历史记录，切换到该账号的cookie并弹出扫码窗口重新获取
      onSwitchAndGacha(acc)
    }
  }

  const handleLoadHistory = async () => {
    setHistoryLoading(true)
    try {
      await onLoadGachaHistory(selectedAccount.uid)
      setShowHistoryModal(false)
    } catch (err) {
      console.error('加载历史记录失败:', err)
    } finally {
      setHistoryLoading(false)
    }
  }

  const handleRefresh = async () => {
    setShowHistoryModal(false)
    onReScan()
  }

  // 确定按钮文字
  const getButtonText = () => {
    if (loggedNickname) {
      return accounts.length > 1 ? '查看多个用户抽卡分析' : `查看 ${loggedNickname} 的抽卡分析`
    }
    if (accounts.length > 1) {
      return '查看多个用户抽卡分析'
    }
    if (accounts.length === 1) {
      const acc = accounts[0]
      return `查看 ${acc.nickname} 的抽卡分析`
    }
    return '扫码登录'
  }

  // 确定描述文字
  const getDescription = () => {
    if (accounts.length > 1) {
      return `已登录 ${accounts.length} 个账号\n选择账号查看祈愿记录、五星出货与保底抽数统计。`
    }
    if (loggedNickname) {
      return `已登录账号：${loggedNickname}\n查看完整祈愿记录、五星出货与保底抽数统计。`
    }
    if (accounts.length === 1) {
      const acc = accounts[0]
      return `已登录账号：${acc.nickname}\n查看完整祈愿记录、五星出货与保底抽数统计。`
    }
    return '使用米游社扫码登录，获取账号的完整祈愿记录，\n统计抽数、五星出货与卡池分布。'
  }

  // 确定右侧按钮是否显示
  const showRightButton = loggedNickname || accounts.length > 0

  const cards = [
    {
      key: 'uid',
      icon: <UserSearch className="w-8 h-8" />,
      colorKey: 'gold',
      title: 'UID 查询',
      en: 'PLAYER QUERY',
      desc: '输入原神 UID，查看角色展柜、深境螺旋战绩与面板评分。\n数据来源于 Enka.Network 公开 API。',
      btn: '开始查询',
      onClick: onUidQuery,
    },
    {
      key: 'gacha',
      icon: <Sparkles className="w-8 h-8" />,
      colorKey: 'sage',
      title: '祈愿记录',
      en: 'WISH HISTORY',
      desc: getDescription(),
      btn: getButtonText(),
      onClick: handleGachaClick,
    },
  ]

  return (
    <div className="page-enter max-w-3xl mx-auto pt-16 lg:pt-24 px-5">
      <div className="text-center mb-12">
        <div className="inline-flex mb-6 relative">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
               style={{
                 background: `linear-gradient(135deg, ${c.goldBg}, transparent)`,
                 border: `1px solid ${c.goldBorder}`,
               }}>
            <Compass className="w-9 h-9" style={{ color: c.gold }} />
          </div>
        </div>

        <h2 className="text-2xl font-bold font-display tracking-wide mb-2" style={{ color: c.text }}>
          提瓦特观测台
        </h2>
        <p className="text-xs font-display tracking-[0.15em] mb-4" style={{ color: c.textFaint }}>
          TEYVAT OBSERVATORY
        </p>
        <div className="w-10 h-px mx-auto" style={{ background: c.border }} />
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {cards.map((card, i) => {
          const color = c[card.colorKey]
          return (
            <div
              key={card.key}
              className="card p-7 flex flex-col transition-transform duration-200 hover:-translate-y-1 group"
              style={{
                animation: `slideUp 0.45s ease-out ${i * 120}ms both, fadeIn 0.45s ease-out ${i * 120}ms both`,
                boxShadow: c.cardShadowHover,
              }}
            >
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-5"
                   style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
                <span style={{ color }}>{card.icon}</span>
              </div>

              <h3 className="text-lg font-bold font-display mb-1" style={{ color: c.text }}>
                {card.title}
              </h3>
              <p className="text-[10px] font-display tracking-[0.2em] mb-4" style={{ color: color }}>
                {card.en}
              </p>
              <p className="text-xs leading-relaxed whitespace-pre-line mb-6" style={{ color: c.textMuted }}>
                {card.desc}
              </p>

              <div className="mt-auto flex items-center gap-3">
                <button
                  onClick={card.onClick}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                  style={{ background: color, color: c.goldText }}
                >
                  {card.btn}
                </button>
                {card.key === 'gacha' && showRightButton && (
                  <button
                    onClick={onNewScan}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm transition-colors"
                    style={{
                      background: 'transparent',
                      border: `1px solid ${c.border}`,
                      color: c.textMuted,
                    }}
                    title="使用其他账号登录"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    其他账号
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="text-center mt-10">
        <p className="text-[11px]" style={{ color: c.textFaint }}>
          仅供学习交流 · 祈愿记录数据来自米游社官方接口
        </p>
      </div>

      <AccountSelectModal
        open={showAccountModal}
        onClose={() => setShowAccountModal(false)}
        onSelect={handleSelectAccount}
        accounts={accounts}
      />

      <GachaHistoryModal
        open={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        onLoadHistory={handleLoadHistory}
        onRefresh={handleRefresh}
        meta={gachaMeta}
        loading={historyLoading}
      />
    </div>
  )
}
