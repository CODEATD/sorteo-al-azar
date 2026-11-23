import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, Plus, Minus, Maximize, Minimize, X, Volume2 } from 'lucide-react'
import confetti from 'canvas-confetti'
import { computeTimer, formatMs, useNow } from '../hooks/useTimerStore'
import { useAudio } from '../hooks/useAudio'

const COLORS = ['#FF087E', '#E20057', '#FF4A8B', '#FF97C1', '#FFE3EE', '#FFFFFF']
function fireConfetti() {
  confetti({ particleCount: 160, spread: 100, origin: { y: 0.55 }, colors: COLORS, scalar: 1.15 })
  setTimeout(() => confetti({ particleCount: 90, spread: 120, origin: { y: 0.45, x: 0.15 }, colors: COLORS, angle: 65 }), 350)
  setTimeout(() => confetti({ particleCount: 90, spread: 120, origin: { y: 0.45, x: 0.85 }, colors: COLORS, angle: 115 }), 500)
}

/*
  Pantalla pública del cronómetro.
  - standalone: ventana de proyector (#pantalla); "Salir" cierra la ventana.
  - onExit: volver al panel cuando se abre en la misma ventana.
*/
export default function TimerDisplay({ store, onExit, standalone = false }) {
  const { state, start, pause, reset, finish, addTime } = store
  const running = state.status === 'running'
  const now = useNow(running, 100)
  const { ms, progress } = computeTimer(state, now)
  const up = state.mode === 'up'
  const done = state.status === 'done'
  const { playTick, playAlarm, unlock, isLocked } = useAudio()

  /* Fin de la cuenta */
  useEffect(() => {
    if (running && !up && ms <= 0) finish()
  }, [running, up, ms, finish])

  /* Tic-tac en los últimos 10 segundos */
  const lastSec = useRef(null)
  const sec = up ? Math.floor(ms / 1000) : Math.ceil(ms / 1000)
  useEffect(() => {
    if (!running || up || !state.sound || !state.tickLast10) { lastSec.current = sec; return }
    if (lastSec.current !== null && sec !== lastSec.current && sec <= 10 && sec > 0) playTick(1 - sec / 10)
    lastSec.current = sec
  }, [sec, running, up, state.sound, state.tickLast10, playTick])

  /* Alarma + confetti al llegar a cero (solo en la transición, no al recargar) */
  const prevStatus = useRef(state.status)
  useEffect(() => {
    if (prevStatus.current === 'running' && state.status === 'done') {
      if (state.sound) playAlarm()
      if (state.confetti) { fireConfetti(); setTimeout(fireConfetti, 1600) }
    }
    prevStatus.current = state.status
  }, [state.status, state.sound, state.confetti, playAlarm])

  /* Controles que se ocultan solos */
  const [showUi, setShowUi] = useState(true)
  const hideT = useRef()
  const poke = useCallback(() => {
    setShowUi(true)
    clearTimeout(hideT.current)
    hideT.current = setTimeout(() => setShowUi(false), 3000)
  }, [])
  useEffect(() => { poke(); return () => clearTimeout(hideT.current) }, [poke])

  /* Sonido bloqueado por el navegador hasta la primera interacción */
  const [locked, setLocked] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setLocked(state.sound && isLocked()), 400)
    return () => clearTimeout(t)
  }, [state.sound, isLocked, state.status])
  const wake = () => { unlock(); setTimeout(() => setLocked(false), 150); poke() }

  /* Pantalla completa */
  const [fs, setFs] = useState(!!document.fullscreenElement)
  useEffect(() => {
    const on = () => setFs(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', on)
    return () => document.removeEventListener('fullscreenchange', on)
  }, [])
  const toggleFs = () => {
    if (document.fullscreenElement) document.exitFullscreen?.()
    else document.documentElement.requestFullscreen?.().catch(() => {})
  }

  const toggleRun = useCallback(() => { unlock(); running ? pause() : start() }, [running, pause, start, unlock])
  const exit = () => {
    if (document.fullscreenElement) document.exitFullscreen?.()
    if (standalone) window.close()
    else onExit?.()
  }

  /* Atajos de teclado */
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      poke()
      if (e.code === 'Space') { e.preventDefault(); toggleRun() }
      else if (e.key === 'f' || e.key === 'F') toggleFs()
      else if (e.key === '+' || e.key === '=' || e.key === 'ArrowUp') addTime(60000)
      else if (e.key === '-' || e.key === 'ArrowDown') addTime(-60000)
      else if (e.key === 'r' || e.key === 'R') reset()
      else if (e.key === 'Escape' && !document.fullscreenElement && !standalone) onExit?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggleRun, addTime, reset, onExit, poke, standalone])

  /* Color según tiempo restante */
  const urgent = !up && running && ms <= 10000
  const warn = !up && (running || state.status === 'paused') && ms <= 60000
  const digitColor = done ? '#FFFFFF' : urgent ? '#FF4A8B' : warn ? '#FF97C1' : '#FFFFFF'
  const text = formatMs(ms, { up })
  const long = text.length > 5

  return (
    <div className="min-h-screen stage-bg relative overflow-hidden flex flex-col items-center justify-center px-4 select-none"
      onMouseMove={poke} onClick={wake} style={{ cursor: showUi ? 'default' : 'none' }}>

      <div className="beam left-[-6%] origin-top animate-sweep-l" />
      <div className="beam right-[-6%] origin-top animate-sweep-r" />
      <div className="arc w-[320px] h-[320px] border-[12px] top-[-220px] left-[-120px] opacity-60" />
      <div className="arc w-[280px] h-[280px] border-[12px] bottom-[-150px] right-[-150px] opacity-60" />

      <motion.div className="absolute inset-0 pointer-events-none"
        animate={{ opacity: urgent ? [0.25, 0.6, 0.25] : 0.25 }}
        transition={urgent ? { duration: 1, repeat: Infinity } : { duration: 0.6 }}
        style={{ background: 'radial-gradient(circle at 50% 50%, rgba(255,8,126,0.45) 0%, transparent 60%)', filter: 'blur(40px)' }} />

      <img src="./rosa/logo-horizontal-white.png" alt="Rotaract · Juntos por una vida Color de Rosa"
        className="absolute top-6 sm:top-8 left-1/2 -translate-x-1/2 w-44 sm:w-60 h-auto opacity-90" />

      <div className="relative z-10 flex flex-col items-center text-center w-full max-w-[1400px]">
        <AnimatePresence mode="wait">
          {done ? (
            <motion.div key="done" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }} transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
              className="flex flex-col items-center gap-4">
              <h1 className="font-display font-black gradient-text-light leading-[0.95]"
                style={{ fontSize: 'clamp(56px, 11vw, 200px)' }}>
                {state.endMessage || '¡Tiempo!'}
              </h1>
            </motion.div>
          ) : (
            <motion.div key="run" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 1.1 }}
              className="flex flex-col items-center w-full">
              {state.label && (
                <p className="font-display font-bold uppercase tracking-[0.35em] text-rosa-blush/85 mb-2 sm:mb-4"
                  style={{ fontSize: 'clamp(14px, 2.2vw, 34px)' }}>
                  {state.label}
                </p>
              )}
              <div className="font-display font-black leading-none"
                style={{
                  fontSize: long ? 'clamp(80px, 19vw, 330px)' : 'clamp(96px, 26vw, 420px)',
                  fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em',
                  color: digitColor, transition: 'color .5s',
                  textShadow: `0 0 50px ${urgent ? '#FF087E' : '#FF087E'}88, 0 0 120px #E2005755`,
                }}>
                {text}
              </div>

              {!up && (
                <div className="mt-6 sm:mt-10 w-[min(84vw,900px)] h-2.5 sm:h-3 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full bg-rosa-gradient"
                    style={{ width: `${(progress || 0) * 100}%`, transition: running ? 'width .12s linear' : 'width .4s' }} />
                </div>
              )}

              <p className="mt-5 font-display font-semibold text-white/45 text-sm sm:text-base h-6">
                {state.status === 'paused' ? 'En pausa' :
                 state.status === 'idle' ? (state.mode === 'until' ? `Hasta las ${state.untilTime}` : 'Listo para iniciar') : ''}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {locked && (
        <button onClick={wake}
          className="absolute top-24 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-auto sm:top-6 sm:right-6 z-20 whitespace-nowrap flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-2 text-sm font-display font-semibold text-white/80 hover:bg-white/20">
          <Volume2 size={16} /> Toca para activar el sonido
        </button>
      )}

      {/* Barra de control */}
      <div className="absolute bottom-6 inset-x-0 z-20 flex justify-center px-3 pointer-events-none">
      <motion.div animate={{ opacity: showUi ? 1 : 0, y: showUi ? 0 : 20 }} transition={{ duration: 0.3 }}
        style={{ pointerEvents: showUi ? 'auto' : 'none' }}
        className="flex items-center gap-1.5 sm:gap-2 rounded-full bg-black/40 backdrop-blur-md border border-white/15 p-1.5 sm:p-2"
        onClick={e => e.stopPropagation()}>
        <Ctl onClick={() => addTime(-60000)} label="Restar 1 min" disabled={done}><Minus size={18} /><span className="text-xs font-bold">1m</span></Ctl>
        <button onClick={() => { unlock(); done ? (reset(), setTimeout(start, 30)) : toggleRun() }}
          className="h-12 sm:h-14 px-5 sm:px-7 rounded-full bg-rosa-gradient glow-rosa text-white font-display font-black flex items-center gap-2"
          aria-label={running ? 'Pausar' : 'Iniciar'}>
          {running ? <Pause size={20} /> : <Play size={20} />}
          <span className="hidden sm:inline">{running ? 'Pausar' : done ? 'Repetir' : state.status === 'paused' ? 'Seguir' : 'Iniciar'}</span>
        </button>
        <Ctl onClick={() => addTime(60000)} label="Sumar 1 min"><Plus size={18} /><span className="text-xs font-bold">1m</span></Ctl>
        <span className="w-px h-7 bg-white/15 mx-1" />
        <Ctl onClick={reset} label="Reiniciar"><RotateCcw size={18} /></Ctl>
        <Ctl onClick={toggleFs} label="Pantalla completa">{fs ? <Minimize size={18} /> : <Maximize size={18} />}</Ctl>
        <Ctl onClick={exit} label={standalone ? 'Cerrar ventana' : 'Volver al panel'}><X size={18} /></Ctl>
      </motion.div>
      </div>
    </div>
  )
}

function Ctl({ children, onClick, label, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} title={label} aria-label={label}
      className="h-11 sm:h-12 min-w-11 sm:min-w-12 px-3 rounded-full flex items-center justify-center gap-0.5 text-white/85 hover:bg-white/15 disabled:opacity-30 transition-colors">
      {children}
    </button>
  )
}
