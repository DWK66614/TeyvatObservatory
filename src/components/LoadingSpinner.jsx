export default function LoadingSpinner({ message = '正在观测天穹...' }) {
  return (
    <div className="page-enter">
      <div className="card p-20 flex flex-col items-center justify-center">
        {/* ── Armillary Sphere ── */}
        <div className="relative w-24 h-24 mb-8">
          {/* Outer ring — horizontal */}
          <div className="absolute inset-0 rounded-full animate-orbit"
               style={{
                 border: '1.5px solid rgba(112,149,196,0.2)',
                 borderTopColor: 'rgba(237,217,163,0.4)',
               }} />

          {/* Middle ring — tilted ~60deg */}
          <div className="absolute inset-2 rounded-full animate-orbit-reverse"
               style={{
                 border: '1.5px solid rgba(112,149,196,0.15)',
                 borderRightColor: 'rgba(237,217,163,0.3)',
                 transform: 'rotateX(60deg)',
               }} />

          {/* Inner ring — tilted ~120deg */}
          <div className="absolute inset-4 rounded-full animate-orbit"
               style={{
                 border: '1.5px solid rgba(112,149,196,0.12)',
                 borderBottomColor: 'rgba(79,184,160,0.3)',
                 animationDuration: '15s',
                 transform: 'rotateX(-60deg) rotateY(30deg)',
               }} />

          {/* Center star */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full animate-constellation flex items-center justify-center"
                 style={{
                   background: 'rgba(237,217,163,0.15)',
                   boxShadow: '0 0 16px rgba(237,217,163,0.3), 0 0 32px rgba(237,217,163,0.1)',
                 }}>
              <div className="w-2 h-2 rounded-full" style={{ background: '#edd9a3' }} />
            </div>
          </div>

          {/* Orbiting dots */}
          {[0, 72, 144, 216, 288].map((deg, i) => (
            <div key={i} className="absolute inset-0 animate-orbit"
                 style={{ animationDuration: `${8 + i * 2}s` }}>
              <div className="absolute w-1 h-1 rounded-full"
                   style={{
                     top: '0', left: '50%',
                     transform: `translateX(-50%) rotate(${deg}deg)`,
                     background: i % 2 === 0 ? '#edd9a3' : '#7095c4',
                     boxShadow: i % 2 === 0
                       ? '0 0 4px rgba(237,217,163,0.5)'
                       : '0 0 4px rgba(112,149,196,0.5)',
                   }} />
            </div>
          ))}
        </div>

        {/* Message */}
        <p className="text-sm font-display tracking-[0.08em]" style={{ color: '#8b8aa6' }}>
          {message}
        </p>
        <p className="text-[10px] mt-1.5" style={{ color: '#5c5b78' }}>
          正在连接星穹网络...
        </p>
      </div>
    </div>
  )
}
