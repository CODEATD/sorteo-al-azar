import { useCallback } from 'react'

/* Module-level singleton — shared across all components, survives re-renders */
let _ctx = null
function getCtx() {
  if (!_ctx) {
    try {
      _ctx = new (window.AudioContext || window.webkitAudioContext)()
    } catch { return null }
  }
  return _ctx
}

export function useAudio() {

  const unlock = useCallback(() => {
    const ctx = getCtx()
    if (!ctx) return
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {})
    }
  }, [])

  const playTick = useCallback((intensity = 1) => {
    const ctx = getCtx()
    if (!ctx) return
    if (ctx.state === 'suspended') {
      ctx.resume().then(() => playTick(intensity)).catch(() => {})
      return
    }
    try {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.value = 600 + intensity * 280
      gain.gain.setValueAtTime(0, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(0.22, ctx.currentTime + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.1)
    } catch {}
  }, [])

  const playWin = useCallback(() => {
    const ctx = getCtx()
    if (!ctx) return
    if (ctx.state === 'suspended') {
      ctx.resume().then(() => playWin()).catch(() => {})
      return
    }
    try {
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5]
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = 'triangle'
        osc.frequency.value = freq
        const t = ctx.currentTime + i * 0.12
        gain.gain.setValueAtTime(0, t)
        gain.gain.linearRampToValueAtTime(0.18, t + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4)
        osc.start(t)
        osc.stop(t + 0.42)
      })
    } catch {}
  }, [])

  const playCountdown = useCallback((secondsLeft) => {
    const intensity = 1 - secondsLeft / 10
    playTick(intensity)
  }, [playTick])

  const isLocked = useCallback(() => {
    const ctx = getCtx()
    return !ctx || ctx.state !== 'running'
  }, [])

  /* Alarma suave para el fin del cronómetro: tres campanadas */
  const playAlarm = useCallback(() => {
    const ctx = getCtx()
    if (!ctx) return
    if (ctx.state === 'suspended') { ctx.resume().then(() => playAlarm()).catch(() => {}); return }
    try {
      ;[0, 0.45, 0.9].forEach((dt) => {
        [880, 1318.5].forEach((freq) => {
          const osc = ctx.createOscillator(), gain = ctx.createGain()
          osc.connect(gain); gain.connect(ctx.destination)
          osc.type = 'sine'; osc.frequency.value = freq
          const t = ctx.currentTime + dt
          gain.gain.setValueAtTime(0, t)
          gain.gain.linearRampToValueAtTime(0.2, t + 0.02)
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.7)
          osc.start(t); osc.stop(t + 0.72)
        })
      })
    } catch {}
  }, [])

  return { playTick, playWin, playCountdown, playAlarm, unlock, isLocked }
}
