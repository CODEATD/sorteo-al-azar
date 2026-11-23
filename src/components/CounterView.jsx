import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SkipForward } from 'lucide-react'
import { useAudio } from '../hooks/useAudio'

const TOTAL = 10

/* Secuencia de tonos rosa para cada segundo */
const COUNT_COLORS = [
  '#FF087E','#FF97C1','#FF4A8B','#FF087E','#FF97C1',
  '#FF4A8B','#FF087E','#FF97C1','#FF4A8B','#FF087E','#FF97C1'
]

export default function CounterView({ titulo, participants, onDone, onSkip }) {
  const [count, setCount] = useState(TOTAL)
  const [key, setKey]     = useState(0)
  const { playCountdown, unlock } = useAudio()
  const doneRef = useRef(false)

  useEffect(() => {
    doneRef.current = false
    unlock()
    playCountdown(TOTAL)
    const interval = setInterval(() => {
      setCount(prev => {
        const next = prev - 1
        if (next >= 0) { playCountdown(next); setKey(k => k + 1) }
        if (next <= 0) {
          clearInterval(interval)
          if (!doneRef.current) { doneRef.current = true; setTimeout(onDone, 600) }
        }
        return next
      })
    }, 900)
    return () => clearInterval(interval)
  }, [])

  const handleSkip = () => { doneRef.current = true; onSkip() }

  const safeCount = Math.max(0, count)
  const color     = COUNT_COLORS[safeCount] || '#FF087E'
  const progress  = (TOTAL - safeCount) / TOTAL

  /* random name floaters */
  const floaters = useRef(
    [...participants].sort(() => Math.random() - 0.5).slice(0, 10).map((name, i) => ({
      name, x: 5 + (i * 9.3) % 85, y: 8 + (i * 7.7) % 78,
      size: 14 + (i % 3) * 6, rot: -12 + (i % 5) * 6,
    }))
  )

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden stage-bg">

      {/* Luces de pasarela */}
      <div className="beam left-[-6%] origin-top animate-sweep-l" />
      <div className="beam right-[-6%] origin-top animate-sweep-r" />

      {/* Big colored blob that changes with count */}
      <motion.div
        animate={{ background: `radial-gradient(circle, ${color}33 0%, transparent 65%)` }}
        transition={{ duration: 0.7 }}
        className="absolute inset-0 pointer-events-none"
        style={{ filter: 'blur(60px)' }}
      />

      {/* Floating participant names */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        {floaters.current.map((f, i) => (
          <motion.span key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.14, 0.06, 0.16, 0] }}
            transition={{ duration: 2.8, delay: i * 0.28, repeat: Infinity, repeatDelay: 0.8 }}
            className="absolute font-display font-black text-rosa-blush"
            style={{ fontSize: f.size, left: `${f.x}%`, top: `${f.y}%`, transform: `rotate(${f.rot}deg)` }}>
            {f.name}
          </motion.span>
        ))}
      </div>

      {/* Firma de la identidad */}
      <img src="./rosa/logo-horizontal-white.png" alt="Rotaract · Juntos por una vida Color de Rosa"
        className="absolute top-6 left-1/2 -translate-x-1/2 w-44 sm:w-52 h-auto opacity-80" />

      <div className="relative z-10 flex flex-col items-center gap-8 px-4">
        {titulo && (
          <motion.p initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
            className="font-display font-black text-sm uppercase tracking-[0.3em] text-rosa-blush/80">
            {titulo}
          </motion.p>
        )}

        {/* SVG ring + number */}
        <div className="relative flex items-center justify-center">
          <svg width="290" height="290" viewBox="0 0 290 290">
            <circle cx="145" cy="145" r="128" fill="none" stroke="rgba(255,151,193,0.14)" strokeWidth="6"/>
            {/* Anillo en 4 segmentos con la paleta rosa */}
            {[
                { color: '#FF087E', offset: 0     },
                { color: '#FF4A8B', offset: 0.25  },
                { color: '#FF97C1', offset: 0.5   },
                { color: '#E20057', offset: 0.75  },
            ].map(({ color: sc, offset }) => {
              const total = 2 * Math.PI * 128
              const segLen = total * 0.23
              const filled = Math.min(progress * 4 - offset * 4, 1)
              if (filled <= 0) return null
              return (
                <circle key={sc} cx="145" cy="145" r="128"
                  fill="none" stroke={sc} strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={`${segLen * Math.max(0,Math.min(filled,1))} ${total}`}
                  strokeDashoffset={`${-total * offset}`}
                  transform="rotate(-90 145 145)"
                  style={{ transition: 'stroke-dasharray 0.85s ease' }}
                />
              )
            })}
          </svg>

          <AnimatePresence mode="popLayout">
            <motion.div key={key}
              initial={{ scale: 0.2, opacity: 0, filter: 'blur(16px)' }}
              animate={{ scale: 1,   opacity: 1, filter: 'blur(0px)'  }}
              exit={{   scale: 2.6,  opacity: 0, filter: 'blur(14px)' }}
              transition={{ duration: 0.48, ease: [0.34,1.56,0.64,1] }}
              className="absolute font-display font-black select-none"
              style={{
                fontSize: '150px', lineHeight: '1',
                color: color,
                textShadow: `0 0 60px ${color}99, 0 0 120px ${color}55`,
                transition: 'color 0.4s',
                minWidth: '170px', textAlign: 'center',
              }}>
              {safeCount}
            </motion.div>
          </AnimatePresence>
        </div>

        <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.4 }}
          className="font-display font-semibold text-white/50 text-sm">
          Sorteando entre {participants.length} participante{participants.length !== 1 ? 's' : ''}…
        </motion.p>

        <motion.button initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.6 }}
          onClick={handleSkip}
          className="flex items-center gap-2 text-white/35 hover:text-rosa-blush text-sm font-display font-bold transition-colors">
          <SkipForward size={14} />Saltar conteo
        </motion.button>
      </div>
    </div>
  )
}
