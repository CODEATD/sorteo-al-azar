import { useState, useCallback, useEffect } from 'react'

const LS_KEY = 'sorteo_state_v2'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function saveToStorage(data) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(data))
  } catch {}
}

export function useSorteoState() {
  const [titulo, setTituloState] = useState(() => loadFromStorage()?.titulo || '')
  const [activeParticipants, setActiveParticipantsState] = useState(
    () => loadFromStorage()?.activeParticipants || []
  )
  const [history, setHistoryState] = useState(() => loadFromStorage()?.history || [])

  const setTitulo = useCallback((val) => {
    setTituloState(val)
  }, [])

  const setActiveParticipants = useCallback((val) => {
    setActiveParticipantsState(val)
  }, [])

  const addHistoryEntry = useCallback((entry) => {
    setHistoryState(prev => {
      const next = [entry, ...prev].slice(0, 20)
      return next
    })
  }, [])

  const clearHistory = useCallback(() => {
    setHistoryState([])
  }, [])

  const resetAll = useCallback(() => {
    setTituloState('')
    setActiveParticipantsState([])
    setHistoryState([])
    localStorage.removeItem(LS_KEY)
  }, [])

  /* Resets only the active sorteo state, keeping the history intact */
  const resetSorteo = useCallback(() => {
    setTituloState('')
    setActiveParticipantsState([])
  }, [])

  useEffect(() => {
    saveToStorage({ titulo, activeParticipants, history })
  }, [titulo, activeParticipants, history])

  return {
    titulo, setTitulo,
    activeParticipants, setActiveParticipants,
    history, addHistoryEntry, clearHistory,
    resetAll, resetSorteo,
  }
}
