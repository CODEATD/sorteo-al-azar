import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, RotateCcw, Plus, Minus, MonitorPlay, ExternalLink, Timer, Clock3, Hourglass, Volume2, Music, PartyPopper, Keyboard } from 'lucide-react'
import { computeTimer, formatMs, useNow, untilToEpoch } from '../hooks/useTimerStore'

const PRESETS = [1, 3, 5, 10, 15, 20, 30, 45, 60]
const LABELS = ['Volvemos en', 'El desfile comienza en', 'Receso', 'Inicia el sorteo en', 'Tiempo restante']
const END_MSGS = ['¡Comenzamos!', '¡Tiempo!', '¡Bienvenidos!', '¡A la pasarela!']
const MODES = [
  { id: 'down',  label: 'Cuenta regresiva', icon: Hourglass },
  { id: 'until', label: 'Hasta una hora',   icon: Clock3 },
  { id: 'up',    label: 'Cronómetro',       icon: Timer },
]

export default function TimerPanel({ store, onShow }) {
  const { state, update, start, pause, reset, addTime } = store
  const running = state.status === 'running'
  const now = useNow(running || state.mode === 'until', 200)
  const { ms, progress } = computeTimer(state, now)
  const up = state.mode === 'up'
  const locked = running || state.status === 'paused'

  /* Campos manuales h / m / s, sincronizados con la duración */
  const split = (d) => ({ h: Math.floor(d / 3600000), m: Math.floor(d % 3600000 / 60000), s: Math.floor(d % 60000 / 1000) })
  const [hms, setHms] = useState(split(state.duration))
  useEffect(() => { setHms(split(state.duration)) }, [state.duration])
  const setPart = (k, v) => {
    const n = Math.max(0, Math.min(k === 'h' ? 23 : 59, parseInt(v, 10) || 0))
    const next = { ...hms, [k]: n }
    setHms(next)
    const d = (next.h * 3600 + next.m * 60 + next.s) * 1000
    if (d > 0) update({ duration: d, status: 'idle', endAt: null, remaining: null })
  }

  const setPreset = (min) => update({ mode: 'down', duration: min * 60000, status: 'idle', endAt: null, remaining: null, startAt: null, elapsed: 0 })
  const setMode = (mode) => update({ mode, status: 'idle', endAt: null, startAt: null, remaining: null, elapsed: 0 })

  const openProjector = () => {
    const w = window.open(location.pathname + location.search + '#pantalla', 'rosa_pantalla', 'width=1280,height=720')
    if (w) w.focus()
  }

  const statusTxt = { idle: 'Listo', running: 'En marcha', paused: 'En pausa', done: 'Terminado' }[state.status]
  const untilPreview = state.mode === 'until' && state.status === 'idle'
    ? new Date(untilToEpoch(state.untilTime, now)).toLocaleString('es-VE', { weekday: 'short', hour: 'numeric', minute: '2-digit' })
    : null

  return (
    <div className="min-h-screen blush-bg relative overflow-hidden">
      <div className="arc w-[340px] h-[340px] border-[14px] top-[-230px] left-[-120px]" />
      <div className="arc w-[300px] h-[300px] border-[14px] bottom-[-160px] right-[-170px]" />
      <div className="blob w-80 h-80 bg-rosa-fucsia/10 top-20 right-[-80px]" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-24 pb-10">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <p className="font-display font-light text-rosa-magenta text-sm sm:text-base uppercase tracking-[0.35em] mb-1">Desfile de Modas Rosa 2026</p>
          <h1 className="font-display font-black text-4xl sm:text-5xl gradient-text leading-none">Cronómetro</h1>
          <p className="mt-3 text-rosa-ink/55 font-display text-sm sm:text-base">Configúralo aquí y muéstralo en la pantalla del evento.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_.85fr] gap-5 items-start">
          {/* ── Configuración ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-white p-5 sm:p-6 space-y-6 min-w-0">
            <Field label="Tipo">
              <div className="grid grid-cols-3 gap-2">
                {MODES.map(({ id, label, icon: Icon }) => (
                  <button key={id} onClick={() => setMode(id)} disabled={locked && state.mode !== id}
                    className={`rounded-2xl px-2 py-3 flex flex-col items-center gap-1.5 font-display font-bold text-xs sm:text-sm transition-all disabled:opacity-40 ${state.mode === id ? 'bg-rosa-gradient text-white glow-rosa' : 'bg-rosa-cream text-rosa-ink/60 hover:text-rosa-magenta border border-rosa-magenta/10'}`}>
                    <Icon size={18} />{label}
                  </button>
                ))}
              </div>
            </Field>

            {state.mode === 'down' && (
              <>
                <Field label="Tiempo rápido">
                  <div className="flex flex-wrap gap-2">
                    {PRESETS.map(min => {
                      const on = state.duration === min * 60000
                      return (
                        <button key={min} onClick={() => setPreset(min)} disabled={locked}
                          className={`h-11 px-4 rounded-2xl font-display font-black text-sm transition-all disabled:opacity-40 ${on ? 'bg-rosa-fucsia text-white scale-105 shadow-[0_6px_18px_rgba(255,8,126,.35)]' : 'bg-[#FFF0F5] text-[#C98AA5] hover:text-rosa-magenta'}`}>
                          {min} min
                        </button>
                      )
                    })}
                  </div>
                </Field>
                <Field label="O escribe el tiempo">
                  <div className="flex items-end gap-2">
                    {[['h', 'horas'], ['m', 'min'], ['s', 'seg']].map(([k, l], i) => (
                      <div key={k} className="flex items-end gap-2">
                        {i > 0 && <span className="pb-3 font-black text-rosa-magenta/40 text-xl">:</span>}
                        <label className="flex flex-col items-center gap-1">
                          <input type="number" inputMode="numeric" min={0} max={k === 'h' ? 23 : 59} value={hms[k]} disabled={locked}
                            onChange={e => setPart(k, e.target.value)}
                            className="rosa-input w-16 sm:w-20 px-1 py-3 text-center font-display font-black text-2xl disabled:opacity-50" />
                          <span className="text-[11px] uppercase tracking-widest text-rosa-ink/40 font-display font-bold">{l}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </Field>
              </>
            )}

            {state.mode === 'until' && (
              <Field label="Cuenta hasta las">
                <div className="flex flex-wrap items-center gap-3">
                  <input type="time" value={state.untilTime} disabled={locked}
                    onChange={e => update({ untilTime: e.target.value, status: 'idle', endAt: null })}
                    className="rosa-input px-4 py-3 font-display font-black text-2xl disabled:opacity-50" />
                  {untilPreview && <span className="text-sm text-rosa-ink/50 font-display">Termina: {untilPreview}</span>}
                </div>
                <p className="mt-2 text-xs text-rosa-ink/45 font-display">Útil para "El desfile comienza en…" hasta las 6:00 PM. Si la hora ya pasó hoy, cuenta hasta mañana.</p>
              </Field>
            )}

            {state.mode === 'up' && (
              <p className="text-sm text-rosa-ink/55 font-display bg-rosa-cream rounded-2xl px-4 py-3">El cronómetro cuenta hacia arriba desde 00:00. Ideal para medir el tiempo de un bloque o una presentación.</p>
            )}

            <Field label="Texto sobre el reloj">
              <input type="text" value={state.label} maxLength={60}
                onChange={e => update({ label: e.target.value })}
                placeholder="Ej. Volvemos en" className="rosa-input w-full px-4 py-3 font-display" />
              <Chips items={LABELS} value={state.label} onPick={v => update({ label: v })} />
            </Field>

            {!up && (
              <Field label="Mensaje al terminar">
                <input type="text" value={state.endMessage} maxLength={40}
                  onChange={e => update({ endMessage: e.target.value })}
                  placeholder="Ej. ¡Comenzamos!" className="rosa-input w-full px-4 py-3 font-display" />
                <Chips items={END_MSGS} value={state.endMessage} onPick={v => update({ endMessage: v })} />
              </Field>
            )}

            {!up && (
              <Field label="Opciones">
                <div className="grid sm:grid-cols-3 gap-2">
                  <Toggle icon={Volume2} label="Sonido al terminar" on={state.sound} onClick={() => update({ sound: !state.sound })} />
                  <Toggle icon={Music} label="Tic-tac últimos 10 s" on={state.tickLast10} onClick={() => update({ tickLast10: !state.tickLast10 })} disabled={!state.sound} />
                  <Toggle icon={PartyPopper} label="Confetti al final" on={state.confetti} onClick={() => update({ confetti: !state.confetti })} />
                </div>
              </Field>
            )}
          </motion.div>

          {/* ── Vista previa y controles ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="space-y-4 lg:sticky lg:top-6 min-w-0">
            <div className="stage-bg rounded-3xl p-6 text-center text-white relative overflow-hidden shadow-[0_20px_50px_rgba(92,10,46,.25)]">
              <div className="flex items-center justify-between text-[11px] font-display font-bold uppercase tracking-widest">
                <span className="text-rosa-blush/80">Vista previa</span>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ${running ? 'bg-rosa-fucsia/30 text-white' : 'bg-white/10 text-white/70'}`}>
                  <i className={`w-1.5 h-1.5 rounded-full ${running ? 'bg-white animate-pulse' : 'bg-white/50'}`} />{statusTxt}
                </span>
              </div>
              <p className="mt-5 text-xs sm:text-sm font-display font-bold uppercase tracking-[0.3em] text-rosa-blush/80 min-h-5 truncate">{state.status === 'done' ? state.label : state.label}</p>
              <div className="font-display font-black leading-none mt-1"
                style={{ fontSize: 'clamp(54px, 9vw, 92px)', fontVariantNumeric: 'tabular-nums', textShadow: '0 0 40px #FF087E77' }}>
                {state.status === 'done' ? <span className="gradient-text-light" style={{ fontSize: '.55em' }}>{state.endMessage || '¡Tiempo!'}</span> : formatMs(ms, { up })}
              </div>
              {!up && (
                <div className="mt-5 h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-rosa-gradient rounded-full" style={{ width: `${(progress || 0) * 100}%`, transition: 'width .2s linear' }} />
                </div>
              )}
              <div className="mt-6 flex items-center justify-center gap-2">
                <Round onClick={() => addTime(-60000)} label="Restar 1 minuto" disabled={state.status === 'done'}><Minus size={16} /><b className="text-[11px]">1m</b></Round>
                <button onClick={() => (state.status === 'done' ? (reset(), start()) : running ? pause() : start())}
                  className="h-14 px-7 rounded-full bg-rosa-gradient glow-rosa font-display font-black text-lg flex items-center gap-2 active:scale-95 transition-transform">
                  {running ? <Pause size={20} /> : <Play size={20} />}
                  {running ? 'Pausar' : state.status === 'paused' ? 'Seguir' : state.status === 'done' ? 'Repetir' : 'Iniciar'}
                </button>
                <Round onClick={() => addTime(60000)} label="Sumar 1 minuto"><Plus size={16} /><b className="text-[11px]">1m</b></Round>
                <Round onClick={reset} label="Reiniciar"><RotateCcw size={16} /></Round>
              </div>
            </div>

            <button onClick={onShow}
              className="w-full rounded-3xl py-4 bg-rosa-gradient glow-rosa text-white font-display font-black text-lg flex items-center justify-center gap-2.5 active:scale-[0.98] transition-transform">
              <MonitorPlay size={22} /> Mostrar en esta pantalla
            </button>
            <button onClick={openProjector}
              className="w-full rounded-3xl py-3.5 bg-white border-2 border-rosa-fucsia/30 text-rosa-magenta font-display font-black flex items-center justify-center gap-2 hover:border-rosa-fucsia transition-colors">
              <ExternalLink size={18} /> Abrir ventana para el proyector
            </button>
            <p className="text-xs text-rosa-ink/50 font-display leading-relaxed px-1">
              La ventana del proyector se controla desde aquí: arrástrala a la pantalla del evento, presiona <b>F</b> para pantalla completa y maneja el reloj desde este panel.
            </p>

            <div className="card-cream p-4">
              <p className="flex items-center gap-2 text-xs font-display font-bold uppercase tracking-widest text-rosa-magenta/70 mb-2"><Keyboard size={13} /> Atajos en pantalla</p>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-rosa-ink/60 font-display">
                <li><Kbd>Espacio</Kbd> iniciar / pausar</li>
                <li><Kbd>F</Kbd> pantalla completa</li>
                <li><Kbd>+</Kbd> / <Kbd>−</Kbd> sumar o restar 1 min</li>
                <li><Kbd>R</Kbd> reiniciar · <Kbd>Esc</Kbd> volver</li>
              </ul>
            </div>
          </motion.div>
        </div>

        <p className="text-center text-xs text-rosa-magenta/50 font-display font-semibold mt-8 tracking-wide">
          Proyecto Rosa · Rotaract Juntos por una vida Color de Rosa
        </p>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <p className="text-xs font-display font-bold text-rosa-magenta/70 uppercase tracking-widest mb-2.5">{label}</p>
      {children}
    </div>
  )
}
function Chips({ items, value, onPick }) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {items.map(t => (
        <button key={t} onClick={() => onPick(t)}
          className={`text-xs font-display font-semibold rounded-full px-3 py-1.5 transition-colors ${value === t ? 'bg-rosa-magenta text-white' : 'bg-rosa-cream border border-rosa-blush/60 text-rosa-ink/60 hover:text-rosa-magenta'}`}>
          {t}
        </button>
      ))}
    </div>
  )
}
function Toggle({ icon: Icon, label, on, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} aria-pressed={on}
      className={`flex items-center gap-2 rounded-2xl px-3 py-2.5 text-left text-xs font-display font-bold transition-all disabled:opacity-40 ${on ? 'bg-rosa-petal text-rosa-magenta border border-rosa-fucsia/40' : 'bg-white text-rosa-ink/45 border border-rosa-magenta/10'}`}>
      <Icon size={15} /><span className="flex-1">{label}</span>
      <span className={`w-8 h-4.5 rounded-full relative transition-colors ${on ? 'bg-rosa-fucsia' : 'bg-rosa-ink/15'}`} style={{ height: 18 }}>
        <span className="absolute top-[2px] w-3.5 h-3.5 rounded-full bg-white transition-all" style={{ left: on ? 16 : 2 }} />
      </span>
    </button>
  )
}
function Round({ children, onClick, label, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} title={label} aria-label={label}
      className="h-12 min-w-12 px-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center gap-0.5 disabled:opacity-30 transition-colors">
      {children}
    </button>
  )
}
function Kbd({ children }) {
  return <kbd className="inline-block min-w-5 text-center rounded-md bg-white border border-rosa-magenta/15 px-1.5 py-0.5 text-[10px] font-bold text-rosa-ink/70">{children}</kbd>
}
