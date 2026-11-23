import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Trash2, ChevronRight, Clock, Users, Sparkles } from 'lucide-react'
import { parseParticipants } from '../utils/shuffle'
import { useAudio } from '../hooks/useAudio'

/* ── Tonos de la paleta rosa para los botones de cantidad ── */
const COUNT_COLORS = [
  { n: 1, bg: '#FF087E' },
  { n: 2, bg: '#E20057' },
  { n: 3, bg: '#FF4A8B' },
]

export default function SetupView({ titulo, setTitulo, onStart, history, onClearHistory }) {
  const [text, setText] = useState('')
  const [numWinners, setNumWinners] = useState(1)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef()
  const { unlock } = useAudio()

  const participants = parseParticipants(text)

  const handleStart = () => {
    if (participants.length === 0) {
      setError('Agrega al menos un participante para comenzar.')
      return
    }
    if (numWinners > participants.length) {
      setError(`Hay menos participantes (${participants.length}) que ganadores solicitados (${numWinners}).`)
      return
    }
    setError('')
    unlock()
    onStart(participants, numWinners)
  }

  const handleFile = useCallback((file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const names = e.target.result.split(/[\n,;]/).map(s => s.trim()).filter(Boolean).join('\n')
      setText(prev => prev ? prev + '\n' + names : names)
    }
    reader.readAsText(file)
  }, [])

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }

  const medals = ['🥇','🥈','🥉']

  return (
    <div className="min-h-screen blush-bg relative overflow-hidden">
      {/* Arcos de la identidad Color de Rosa */}
      <div className="arc w-[340px] h-[340px] border-[14px] top-[-230px] left-[-120px]" />
      <div className="arc w-[300px] h-[300px] border-[14px] bottom-[-160px] right-[-170px]" />
      <div className="blob w-80 h-80 bg-rosa-fucsia/10 top-20 right-[-80px]" />
      <div className="blob w-72 h-72 bg-rosa-blush/30 bottom-[-40px] left-[-40px]" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-20 pb-10">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="flex justify-center mb-6 w-full">
            <motion.img
              src="./rosa/logo-vertical.png"
              alt="Rotaract · Juntos por una vida Color de Rosa"
              className="w-48 sm:w-56 h-auto"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
          <p className="font-display font-light text-rosa-magenta text-sm sm:text-base uppercase tracking-[0.35em] mb-1">
            Desfile de Modas
          </p>
          <h1 className="font-display font-black text-5xl sm:text-6xl md:text-7xl gradient-text leading-none mb-3">
            Rosa 2026
          </h1>
          <p className="inline-flex items-center gap-2 rounded-full bg-white/70 border border-rosa-magenta/15 px-4 py-1.5 text-rosa-ink/60 font-display font-semibold text-sm">
            <Sparkles size={14} className="text-rosa-fucsia" />
            Gran sorteo · 13 años juntos por una vida color de rosa
          </p>
        </motion.div>

        {/* ── Form card ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="card-white p-6 space-y-5"
        >
          {/* Título */}
          <div>
            <label className="block text-xs font-display font-bold text-rosa-magenta/70 uppercase tracking-widest mb-2">
              Título del sorteo
            </label>
            <input
              type="text"
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              placeholder="Ej. Sorteo de cierre Desfile Rosa 🎀"
              className="rosa-input w-full px-4 py-3 text-base font-display"
            />
          </div>

          {/* Participantes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-display font-bold text-rosa-magenta/70 uppercase tracking-widest">
                Participantes
              </label>
              <div className="flex items-center gap-3">
                {participants.length > 0 && (
                  <span className="flex items-center gap-1 text-xs font-display font-bold text-rosa-fucsia">
                    <Users size={11} />{participants.length}
                  </span>
                )}
                <button onClick={() => setText('')} className="text-rosa-ink/25 hover:text-rosa-magenta transition-colors" title="Limpiar">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            <div
              className={`relative rounded-[14px] transition-all ${dragOver ? 'ring-4 ring-rosa-fucsia/30' : ''}`}
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <textarea
                value={text}
                onChange={e => { setText(e.target.value); setError('') }}
                placeholder={"Un nombre por línea:\nMaría García\nJuan López\nLaura Martínez\n…"}
                rows={8}
                className="rosa-input w-full px-4 py-3.5 text-sm resize-none leading-relaxed scrollbar-hide font-display"
              />
              {dragOver && (
                <div className="absolute inset-0 rounded-[14px] flex items-center justify-center bg-rosa-petal/80 border-2 border-dashed border-rosa-fucsia/60">
                  <p className="text-rosa-magenta font-display font-bold text-sm">Suelta el archivo aquí</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 mt-2">
              <button onClick={() => fileRef.current?.click()}
                className="flex items-center gap-1.5 text-xs text-rosa-ink/40 hover:text-rosa-fucsia transition-colors font-display font-semibold">
                <Upload size={12} />Importar .txt / .csv
              </button>
              <input ref={fileRef} type="file" accept=".txt,.csv" className="hidden"
                onChange={e => { handleFile(e.target.files[0]); e.target.value='' }} />
            </div>
          </div>

          {/* Cantidad ganadores */}
          <div>
            <label className="block text-xs font-display font-bold text-rosa-magenta/70 uppercase tracking-widest mb-3">
              Cantidad de ganadores
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {COUNT_COLORS.map(({ n, bg }) => (
                <button key={n} onClick={() => setNumWinners(n)}
                  className="w-12 h-12 rounded-2xl font-display font-black text-lg transition-all duration-200"
                  style={{
                    background: numWinners === n ? bg : '#FFF0F5',
                    color:      numWinners === n ? '#fff' : '#C98AA5',
                    transform:  numWinners === n ? 'scale(1.08)' : 'scale(1)',
                    boxShadow:  numWinners === n ? `0 6px 18px ${bg}55` : 'none',
                  }}>
                  {n}
                </button>
              ))}
              <input type="number" value={numWinners} min={1} max={99}
                onChange={e => setNumWinners(Math.max(1, parseInt(e.target.value) || 1))}
                className="rosa-input w-20 px-3 py-3 text-center font-display font-black text-lg"
              />
            </div>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
                className="text-rosa-magenta text-sm font-display font-semibold bg-rosa-petal border border-rosa-magenta/25 rounded-xl px-4 py-2.5">
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* CTA */}
          <button onClick={handleStart}
            className="w-full group relative overflow-hidden rounded-3xl py-5 font-display font-black text-xl text-white transition-all duration-200 active:scale-[0.98] glow-rosa bg-rosa-gradient">
            <span className="relative z-10 flex items-center justify-center gap-3">
              <Sparkles size={22} />
              ¡Comenzar Sorteo!
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </motion.div>

        {/* ── History ── */}
        <AnimatePresence>
          {history.length > 0 && (
            <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
              className="mt-6 card-cream p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-rosa-magenta/70">
                  <Clock size={13} />
                  <span className="text-xs font-display font-bold uppercase tracking-widest">Historial</span>
                </div>
                <button onClick={onClearHistory} className="text-xs text-rosa-ink/35 hover:text-rosa-magenta transition-colors font-display font-semibold">
                  Borrar
                </button>
              </div>
              <div className="space-y-2">
                {history.slice(0,5).map((entry, i) => (
                  <motion.div key={i} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay: i*0.05 }}
                    className="bg-white/80 rounded-2xl px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-display font-bold text-rosa-ink">{entry.titulo || 'Sorteo'}</p>
                      <p className="text-xs text-rosa-ink/40 font-display">{entry.date}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-wrap justify-end max-w-[180px]">
                      {entry.winners.slice(0,2).map((w,wi) => (
                        <span key={wi} className="text-xs bg-rosa-cream border border-rosa-blush rounded-full px-2 py-0.5 font-display font-semibold text-rosa-ink">
                          {medals[wi]} {w.length > 10 ? w.slice(0,10)+'…' : w}
                        </span>
                      ))}
                      {entry.winners.length > 2 && <span className="text-xs text-rosa-ink/35 font-display">+{entry.winners.length-2}</span>}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center text-xs text-rosa-magenta/50 font-display font-semibold mt-8 tracking-wide">
          Proyecto Rosa · Rotaract Juntos por una vida Color de Rosa
        </p>
      </div>
    </div>
  )
}
