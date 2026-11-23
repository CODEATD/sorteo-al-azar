import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, RotateCcw, Users } from 'lucide-react'
import confetti from 'canvas-confetti'
import { useAudio } from '../hooks/useAudio'

const MEDALS  = ['🥇','🥈','🥉']
const RANKS   = ['¡Primer lugar!','¡Segundo lugar!','¡Tercer lugar!']
/* Tarjetas de ganadores con la paleta rosa */
const CARD_COLORS = [
  { bg: '#FFFFFF', border: '#FF087E', accent: '#FF087E', label: '#E20057' },
  { bg: '#FFF6F9', border: '#FF4A8B', accent: '#FF4A8B', label: '#D0185F' },
  { bg: '#FFF6F9', border: '#FF97C1', accent: '#FF97C1', label: '#C2306D' },
  { bg: '#FFF6F9', border: '#E20057', accent: '#E20057', label: '#A8003F' },
]

function fireConfetti() {
  const colors = ['#FF087E','#E20057','#FF4A8B','#FF97C1','#FFE3EE','#FFFFFF']
  confetti({ particleCount: 150, spread: 90, origin: { y: 0.5 }, colors, scalar: 1.15 })
  setTimeout(() => confetti({ particleCount: 90, spread: 120, origin: { y: 0.42, x: 0.15 }, colors, angle: 65 }), 380)
  setTimeout(() => confetti({ particleCount: 90, spread: 120, origin: { y: 0.42, x: 0.85 }, colors, angle: 115 }), 520)
  setTimeout(() => confetti({ particleCount: 60, spread: 70,  origin: { y: 0.28 }, colors, startVelocity: 50 }), 850)
}

export default function ResultsView({ titulo, winners, remaining, onPlayAgain, onReset }) {
  const { playWin } = useAudio()

  useEffect(() => {
    const t1 = setTimeout(fireConfetti, 250)
    const t2 = setTimeout(playWin, 120)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <div className="min-h-screen stage-bg flex flex-col items-center justify-center relative overflow-hidden px-4 py-16">
      {/* Luces de pasarela */}
      <div className="beam left-[-6%] origin-top animate-sweep-l" />
      <div className="beam right-[-6%] origin-top animate-sweep-r" />
      <div className="arc w-[320px] h-[320px] border-[12px] top-[-220px] left-[-120px] opacity-70" />
      <div className="arc w-[280px] h-[280px] border-[12px] bottom-[-150px] right-[-150px] opacity-70" />

      <div className="relative z-10 w-full max-w-lg">

        {/* Header */}
        <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }}
          className="text-center mb-8">
          <motion.div
            initial={{ scale:0, rotate:-20 }}
            animate={{ scale:1, rotate:0 }}
            transition={{ type:'spring', stiffness:260, damping:14, delay:0.1 }}
            className="mb-4 inline-block">
            <img src="./rosa/logo-manos-white.png" alt="" className="w-32 sm:w-40 h-auto drop-shadow-[0_0_24px_rgba(255,8,126,0.6)]" />
          </motion.div>
          <h2 className="font-display font-black text-4xl sm:text-5xl gradient-text-light mb-2">
            {winners.length === 1 ? '¡Tenemos ganador!' : `¡${winners.length} Ganadores!`}
          </h2>
          {titulo && (
            <p className="font-display font-bold text-sm text-rosa-blush/80 uppercase tracking-[0.3em]">{titulo}</p>
          )}
        </motion.div>

        {/* Winner cards */}
        <div className="space-y-3 mb-8">
          {winners.map((name, i) => {
            const c = CARD_COLORS[i % CARD_COLORS.length]
            return (
              <motion.div key={name}
                initial={{ opacity:0, x:-32, scale:0.90 }}
                animate={{ opacity:1, x:0,   scale:1    }}
                transition={{ delay: 0.18 + i*0.14, type:'spring', stiffness:220, damping:18 }}
                className="rounded-3xl px-6 py-5 flex items-center gap-5 relative overflow-hidden"
                style={{ background: c.bg, border: `2.5px solid ${c.border}`, boxShadow: `0 10px 36px ${c.accent}40` }}>
                {/* Accent blob inside card */}
                <div className="absolute right-[-20px] top-[-20px] w-24 h-24 rounded-full opacity-10"
                  style={{ background: c.accent }} />

                <span className="text-4xl flex-shrink-0">{MEDALS[i] || '🏅'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-display font-black uppercase tracking-widest mb-0.5"
                    style={{ color: c.label }}>
                    {RANKS[i] || `Ganador #${i+1}`}
                  </p>
                  <p className="font-display font-black text-xl text-rosa-ink truncate">{name}</p>
                </div>
                <motion.div
                  initial={{ scale:0 }}
                  animate={{ scale:[0,1.4,1] }}
                  transition={{ delay: 0.42 + i*0.14, duration:0.4 }}
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ background: c.accent }}
                />
              </motion.div>
            )
          })}
        </div>

        {/* Remaining count */}
        {remaining.length > 0 && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.6 }}
            className="flex items-center justify-center gap-2 text-white/50 text-sm font-display font-bold mb-6">
            <Users size={13} />
            {remaining.length} participante{remaining.length !== 1 ? 's' : ''} restante{remaining.length !== 1 ? 's' : ''}
          </motion.div>
        )}

        {/* Action buttons */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.72 }}
          className="flex flex-col sm:flex-row gap-3">
          {remaining.length > 0 && (
            <button onClick={onPlayAgain}
              className="flex-1 flex items-center justify-center gap-2 card-glass rounded-3xl py-4 font-display font-black text-white text-base hover:bg-white/15 transition-all">
              <RefreshCw size={16} className="text-rosa-blush" />
              Sortear restantes
            </button>
          )}
          <button onClick={onReset}
            className="flex-1 flex items-center justify-center gap-2 rounded-3xl py-4 font-display font-black text-white text-base transition-all duration-200 active:scale-[0.98] glow-rosa bg-rosa-gradient">
            <RotateCcw size={16} />
            Nuevo sorteo
          </button>
        </motion.div>

        {/* Firma de la identidad */}
        <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.9 }}
          className="text-center text-xs text-rosa-blush/60 font-display font-bold mt-8 uppercase tracking-[0.25em]">
          Desfile de Modas Rosa 2026
        </motion.p>
      </div>
    </div>
  )
}
