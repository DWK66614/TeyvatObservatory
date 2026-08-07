import { useTheme } from '../utils/theme'

const spinRing = {
  animation: 'spinRing 1.2s linear infinite',
}
const spinRingReverse = {
  animation: 'spinRingReverse 1.6s linear infinite',
}
const spinRingSlow = {
  animation: 'spinRingSlow 2.2s linear infinite',
}
const breathe = {
  animation: 'breathe 1.4s ease-in-out infinite',
}

export default function LoadingSpinner({ message = '正在查询数据...' }) {
  const { colors: c } = useTheme()
  return (
    <div className="page-enter max-w-md mx-auto">
      <div className="card p-16 flex flex-col items-center justify-center">
        <div className="relative w-16 h-16 mb-8">
          <div className="absolute inset-0 rounded-full"
               style={{
                 border: `2px solid ${c.border}`,
                 borderTopColor: c.gold,
                 ...spinRing,
               }} />
          <div className="absolute inset-2 rounded-full"
               style={{
                 border: `2px solid ${c.border}`,
                 borderRightColor: c.goldDim,
                 ...spinRingReverse,
               }} />
          <div className="absolute inset-4 rounded-full"
               style={{
                 border: `2px solid ${c.borderLight}`,
                 borderBottomColor: c.gold,
                 ...spinRingSlow,
               }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: c.gold, ...breathe }} />
          </div>
        </div>

        <p className="text-sm font-display tracking-wide" style={{ color: c.textSecondary }}>
          {message}
        </p>
        <p className="text-xs mt-1.5" style={{ color: c.textFaint }}>
          正在连接数据网络...
        </p>
      </div>
    </div>
  )
}
