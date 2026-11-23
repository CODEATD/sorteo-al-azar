import { useState, useCallback, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Gift, Timer } from 'lucide-react'
import SetupView   from './components/SetupView'
import CounterView from './components/CounterView'
import ResultsView from './components/ResultsView'
import TimerPanel   from './components/TimerPanel'
import TimerDisplay from './components/TimerDisplay'
import { useSorteoState } from './hooks/useSorteoState'
import { useTimerStore } from './hooks/useTimerStore'
import { pickWinners }    from './utils/shuffle'

const VIEWS = { SETUP: 'setup', COUNTER: 'counter', RESULTS: 'results', TIMER: 'timer', TIMER_SHOW: 'timer-show' }

const variants = {
  initial: { opacity: 0, y: 30, scale: 0.96 },
  animate: { opacity: 1, y: 0,  scale: 1    },
  exit:    { opacity: 0, y: -20, scale: 1.02 },
}

/* Selector Sorteo / Cronómetro (solo en las pantallas de configuración) */
function ModeTabs({ active, onChange }) {
  const tabs = [
    { id: VIEWS.SETUP, label: 'Sorteo', icon: Gift },
    { id: VIEWS.TIMER, label: 'Cronómetro', icon: Timer },
  ]
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex gap-1 rounded-full bg-white/85 backdrop-blur-md border border-rosa-magenta/15 p-1 shadow-[0_8px_24px_rgba(226,0,87,.12)]">
      {tabs.map(({ id, label, icon: Icon }) => (
        <button key={id} onClick={() => onChange(id)} aria-pressed={active === id}
          className={`flex items-center gap-2 rounded-full px-4 sm:px-5 py-2 font-display font-bold text-sm transition-all ${active === id ? 'bg-rosa-gradient text-white shadow-[0_6px_16px_rgba(255,8,126,.35)]' : 'text-rosa-ink/55 hover:text-rosa-magenta'}`}>
          <Icon size={15} />{label}
        </button>
      ))}
    </div>
  )
}

const isScreen = () => window.location.hash === '#pantalla'

export default function App() {
  const timer = useTimerStore()
  const [screenOnly, setScreenOnly] = useState(isScreen)
  useEffect(() => {
    const on = () => setScreenOnly(isScreen())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])

  const [view,               setView]               = useState(() => {
    try { return sessionStorage.getItem('rosa_tab') === VIEWS.TIMER ? VIEWS.TIMER : VIEWS.SETUP } catch { return VIEWS.SETUP }
  })
  const goTab = useCallback((v) => {
    try { sessionStorage.setItem('rosa_tab', v) } catch {}
    setView(v)
  }, [])
  const [pendingWinners,     setPendingWinners]     = useState([])
  const [pendingParticipants,setPendingParticipants] = useState([])
  const [numWinners,         setNumWinners]         = useState(1)

  const {
    titulo, setTitulo,
    activeParticipants, setActiveParticipants,
    history, addHistoryEntry, clearHistory,
    resetAll, resetSorteo,
  } = useSorteoState()

  const handleStart = useCallback((participants, n) => {
    setNumWinners(n)
    setPendingParticipants(participants)
    setActiveParticipants(participants)
    setView(VIEWS.COUNTER)
  }, [setActiveParticipants])

  const handleCounterDone = useCallback(() => {
    const { winners, remaining } = pickWinners(pendingParticipants, numWinners)
    setPendingWinners(winners)
    setPendingParticipants(remaining)
    setActiveParticipants(remaining)
    addHistoryEntry({
      titulo: titulo || 'Sorteo',
      winners,
      date: new Date().toLocaleString('es-ES', { dateStyle:'short', timeStyle:'short' }),
    })
    setView(VIEWS.RESULTS)
  }, [pendingParticipants, numWinners, titulo, setActiveParticipants, addHistoryEntry])

  const handlePlayAgain = useCallback(() => {
    if (pendingParticipants.length === 0) return
    setView(VIEWS.COUNTER)
  }, [pendingParticipants])

  const handleReset = useCallback(() => {
    resetSorteo()
    setPendingWinners([])
    setPendingParticipants([])
    setView(VIEWS.SETUP)
  }, [resetSorteo])

  /* Ventana del proyector: solo el reloj */
  if (screenOnly) {
    return <div className="font-display"><TimerDisplay store={timer} standalone /></div>
  }

  return (
    <div className="font-display">
      {(view === VIEWS.SETUP || view === VIEWS.TIMER) && <ModeTabs active={view} onChange={goTab} />}
      <AnimatePresence mode="wait">
        {view === VIEWS.SETUP && (
          <motion.div key="setup" variants={variants}
            initial="initial" animate="animate" exit="exit"
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}>
            <SetupView
              titulo={titulo} setTitulo={setTitulo}
              onStart={handleStart}
              history={history} onClearHistory={clearHistory}
            />
          </motion.div>
        )}
        {view === VIEWS.COUNTER && (
          <motion.div key="counter" variants={variants}
            initial="initial" animate="animate" exit="exit"
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}>
            <CounterView
              titulo={titulo} participants={pendingParticipants}
              onDone={handleCounterDone} onSkip={handleCounterDone}
            />
          </motion.div>
        )}
        {view === VIEWS.RESULTS && (
          <motion.div key="results" variants={variants}
            initial="initial" animate="animate" exit="exit"
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}>
            <ResultsView
              titulo={titulo} winners={pendingWinners}
              remaining={pendingParticipants}
              onPlayAgain={handlePlayAgain} onReset={handleReset}
            />
          </motion.div>
        )}
        {view === VIEWS.TIMER && (
          <motion.div key="timer" variants={variants}
            initial="initial" animate="animate" exit="exit"
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}>
            <TimerPanel store={timer} onShow={() => setView(VIEWS.TIMER_SHOW)} />
          </motion.div>
        )}
        {view === VIEWS.TIMER_SHOW && (
          <motion.div key="timer-show" variants={variants}
            initial="initial" animate="animate" exit="exit"
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}>
            <TimerDisplay store={timer} onExit={() => setView(VIEWS.TIMER)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
