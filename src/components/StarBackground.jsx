import { useMemo, useEffect, useRef } from 'react'
import { useTheme } from '../utils/theme'

function generateConstellation() {
  const stars = []
  const clusters = [
    { cx: 15, cy: 20, spread: 18, count: 12 },
    { cx: 75, cy: 15, spread: 16, count: 10 },
    { cx: 20, cy: 70, spread: 15, count: 10 },
    { cx: 80, cy: 65, spread: 18, count: 12 },
    { cx: 50, cy: 40, spread: 12, count: 8 },
  ]

  clusters.forEach(cluster => {
    for (let i = 0; i < cluster.count; i++) {
      const angle = Math.random() * Math.PI * 2
      const dist = Math.random() * cluster.spread
      const x = cluster.cx + Math.cos(angle) * dist
      const y = cluster.cy + Math.sin(angle) * dist
      const size = Math.random() < 0.15
        ? Math.random() * 1.2 + 0.8
        : Math.random() * 0.6 + 0.3
      const opacity = size > 1
        ? Math.random() * 0.3 + 0.5
        : Math.random() * 0.15 + 0.05
      const twinkleDelay = Math.random() * 3
      const twinkleDuration = 2 + Math.random() * 3
      stars.push({ id: stars.length, x, y, size, opacity, twinkleDelay, twinkleDuration, cluster: clusters.indexOf(cluster) })
    }
  })

  for (let i = 0; i < 30; i++) {
    stars.push({
      id: stars.length,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 0.5 + 0.2,
      opacity: Math.random() * 0.1 + 0.03,
      twinkleDelay: Math.random() * 4,
      twinkleDuration: 3 + Math.random() * 4,
      cluster: -1,
    })
  }

  const lines = []
  for (let ci = 0; ci < clusters.length; ci++) {
    const clusterStars = stars.filter(s => s.cluster === ci)
    for (let i = 0; i < clusterStars.length; i++) {
      for (let j = i + 1; j < clusterStars.length; j++) {
        const dx = clusterStars[i].x - clusterStars[j].x
        const dy = clusterStars[i].y - clusterStars[j].y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 12 && Math.random() < 0.35) {
          lines.push({
            id: `${clusterStars[i].id}-${clusterStars[j].id}`,
            x1: clusterStars[i].x,
            y1: clusterStars[i].y,
            x2: clusterStars[j].x,
            y2: clusterStars[j].y,
            opacity: Math.random() * 0.06 + 0.02,
          })
        }
      }
    }
  }

  return { stars, lines }
}

export default function StarBackground() {
  const { colors: c } = useTheme()
  const { stars, lines } = useMemo(generateConstellation, [])
  const containerRef = useRef(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const handleMouse = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 3
      const y = (e.clientY / window.innerHeight - 0.5) * 3
      el.style.transform = `translate(${x}px, ${y}px)`
    }
    window.addEventListener('mousemove', handleMouse)
    return () => window.removeEventListener('mousemove', handleMouse)
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" style={{ background: c.bg }}>
      <div className="absolute" style={{
        width: '60vw', height: '60vw', maxWidth: 800, maxHeight: 800,
        top: '-25%', right: '-15%',
        background: `radial-gradient(ellipse, ${c.nebula}0a 0%, transparent 70%)`,
        borderRadius: '50%',
      }} />
      <div className="absolute" style={{
        width: '50vw', height: '50vw', maxWidth: 600, maxHeight: 600,
        bottom: '-20%', left: '-10%',
        background: `radial-gradient(ellipse, ${c.gold}08 0%, transparent 70%)`,
        borderRadius: '50%',
      }} />

      <div ref={containerRef} className="absolute inset-0 transition-transform duration-[2000ms] ease-out"
           style={{ transform: 'translate(0px, 0px)' }}>
        {stars.map(s => (
          <div
            key={s.id}
            className="absolute rounded-full"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.size,
              height: s.size,
              background: s.size > 1 ? c.gold : c.nebula,
              opacity: s.opacity,
              boxShadow: s.size > 1
                ? `0 0 ${s.size * 3}px ${c.gold}4d, 0 0 ${s.size * 6}px ${c.gold}1a`
                : 'none',
              animation: s.size > 0.8
                ? `twinkle ${s.twinkleDuration}s ease-in-out ${s.twinkleDelay}s infinite`
                : 'none',
            }}
          />
        ))}

        {lines.map(l => {
          const dx = l.x2 - l.x1
          const dy = l.y2 - l.y1
          const length = Math.sqrt(dx * dx + dy * dy)
          const angle = Math.atan2(dy, dx) * (180 / Math.PI)
          const midX = (l.x1 + l.x2) / 2
          const midY = (l.y1 + l.y2) / 2
          return (
            <div
              key={l.id}
              className="absolute"
              style={{
                left: `${midX}%`,
                top: `${midY}%`,
                width: `${length}%`,
                height: '0.5px',
                background: `${c.nebula}08`,
                transform: `translate(-50%, -50%) rotate(${angle}deg)`,
                transformOrigin: 'center',
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
