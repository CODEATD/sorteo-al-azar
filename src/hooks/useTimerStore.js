import { useState, useEffect, useCallback, useRef } from 'react'

/*
  Estado del cronómetro, compartido entre ventanas.
  Se guarda en localStorage y se escucha el evento `storage`, así la ventana
  de proyector (#pantalla) y el panel de control se mantienen sincronizados.
  El tiempo se calcula con marcas de reloj (endAt / startAt), no con intervalos,
  para que no se desfase aunque la pestaña quede en segundo plano.

  Modos:
    'down'  → cuenta regresiva de una duración
    'until' → cuenta regresiva hasta una hora del día (ej. 18:00)
    'up'    → cronómetro ascendente
*/

const LS_KEY = 'rosa_timer_v1'

export const DEFAULT_TIMER = {
  mode: 'down',
  duration: 5 * 60 * 1000,       // ms (modo 'down')
  untilTime: '18:00',            // HH:MM (modo 'until')
  label: 'Volvemos en',
  endMessage: '¡Comenzamos!',
  status: 'idle',                // idle | running | paused | done
  endAt: null,                   // ms epoch (down / until en marcha)
  startAt: null,                 // ms epoch (up en marcha)
  remaining: null,               // ms congelados al pausar (down)
  elapsed: 0,                    // ms acumulados al pausar (up)
  sound: true,
  tickLast10: true,
  confetti: true,
  untilTotal: null,              // ms totales al iniciar (modo 'until')
  updatedAt: 0,
}

function load() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? { ...DEFAULT_TIMER, ...JSON.parse(raw) } : { ...DEFAULT_TIMER }
  } catch {
    return { ...DEFAULT_TIMER }
  }
}

function save(s) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(s)) } catch {}
}

/* Próxima ocurrencia de HH:MM (hoy o mañana) */
export function untilToEpoch(hhmm, now = Date.now()) {
  const [h, m] = (hhmm || '00:00').split(':').map(n => parseInt(n, 10) || 0)
  const d = new Date(now)
  d.setHours(h, m, 0, 0)
  if (d.getTime() <= now) d.setDate(d.getDate() + 1)
  return d.getTime()
}

/* Valor a mostrar en ms + total para el anillo de progreso */
export function computeTimer(s, now = Date.now()) {
  if (s.mode === 'up') {
    const ms = s.status === 'running' && s.startAt ? s.elapsed + (now - s.startAt) : s.elapsed
    return { ms: Math.max(0, ms), total: null, progress: null }
  }
  let ms, total
  if (s.mode === 'until') {
    const end = s.status === 'running' || s.status === 'done' ? s.endAt : untilToEpoch(s.untilTime, now)
    ms = s.status === 'paused' ? s.remaining : end - now
    total = s.status === 'idle' ? ms : (s.untilTotal || ms)
  } else {
    total = s.duration
    if (s.status === 'running') ms = s.endAt - now
    else if (s.status === 'paused') ms = s.remaining
    else if (s.status === 'done') ms = 0
    else ms = s.duration
  }
  ms = Math.max(0, ms || 0)
  const progress = total > 0 ? Math.min(1, Math.max(0, 1 - ms / total)) : 0
  return { ms, total, progress }
}

export function useTimerStore() {
  const [state, setState] = useState(load)
  const stateRef = useRef(state)
  stateRef.current = state

  /* Sincronización entre ventanas */
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== LS_KEY || !e.newValue) return
      try { setState({ ...DEFAULT_TIMER, ...JSON.parse(e.newValue) }) } catch {}
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const update = useCallback((patch) => {
    setState(prev => {
      const next = { ...prev, ...(typeof patch === 'function' ? patch(prev) : patch), updatedAt: Date.now() }
      save(next)
      return next
    })
  }, [])

  const start = useCallback(() => update(s => {
    const now = Date.now()
    if (s.mode === 'up') {
      return { status: 'running', startAt: now, elapsed: s.status === 'paused' ? s.elapsed : 0 }
    }
    if (s.mode === 'until') {
      if (s.status === 'paused') return { status: 'running', endAt: now + s.remaining, remaining: null }
      const endAt = untilToEpoch(s.untilTime, now)
      return { status: 'running', endAt, untilTotal: endAt - now, remaining: null }
    }
    const left = s.status === 'paused' ? s.remaining : s.duration
    return { status: 'running', endAt: now + left, remaining: null }
  }), [update])

  const pause = useCallback(() => update(s => {
    if (s.status !== 'running') return {}
    const now = Date.now()
    if (s.mode === 'up') return { status: 'paused', elapsed: s.elapsed + (now - s.startAt), startAt: null }
    return { status: 'paused', remaining: Math.max(0, s.endAt - now) }
  }), [update])

  const reset = useCallback(() => update({ status: 'idle', endAt: null, startAt: null, remaining: null, elapsed: 0 }), [update])

  const finish = useCallback(() => update(s => (s.status === 'running' ? { status: 'done', remaining: 0 } : {})), [update])

  /* Sumar / restar tiempo sin detener la cuenta */
  const addTime = useCallback((delta) => update(s => {
    const now = Date.now()
    if (s.mode === 'up') {
      if (s.status === 'running') return { startAt: s.startAt - delta }
      return { elapsed: Math.max(0, s.elapsed + delta) }
    }
    const tk = s.mode === 'until' ? 'untilTotal' : 'duration'
    const tot = s[tk] || 0
    if (s.status === 'running') {
      const endAt = Math.max(now + 1000, s.endAt + delta)
      return { endAt, [tk]: Math.max(tot + delta, endAt - now) }
    }
    if (s.status === 'paused') {
      const remaining = Math.max(1000, s.remaining + delta)
      return { remaining, [tk]: Math.max(tot + delta, remaining) }
    }
    if (s.status === 'done') {
      if (delta <= 0) return {}
      return { status: 'running', endAt: now + delta, [tk]: delta }
    }
    if (s.mode === 'down') return { duration: Math.max(1000, s.duration + delta) }
    return {}
  }), [update])

  return { state, update, start, pause, reset, finish, addTime }
}

/* Re-render periódico mientras corre */
export function useNow(active, every = 200) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    if (!active) { setNow(Date.now()); return }
    const id = setInterval(() => setNow(Date.now()), every)
    return () => clearInterval(id)
  }, [active, every])
  return now
}

export function formatMs(ms, { up = false } = {}) {
  /* Regresivo: redondea hacia arriba (5:00 → 4:59 tras el primer segundo).
     Ascendente: redondea hacia abajo. */
  const totalSec = up ? Math.floor(ms / 1000) : Math.ceil(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  const pad = (n) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}
