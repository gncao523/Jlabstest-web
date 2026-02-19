import { useState, useCallback } from 'react'

const HISTORY_KEY = 'jlabstest_geo_history'

const loadHistory = () => {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const saveHistory = (items) => {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(items))
}

export function useGeoHistory() {
  const [history, setHistory] = useState(loadHistory)

  const addToHistory = useCallback((ip, geoData) => {
    const entry = {
      id: `${ip}-${Date.now()}`,
      ip,
      geoData,
      timestamp: Date.now(),
    }
    setHistory((prev) => {
      const filtered = prev.filter((h) => h.ip !== ip)
      const next = [entry, ...filtered].slice(0, 50)
      saveHistory(next)
      return next
    })
    return entry
  }, [])

  const removeFromHistory = useCallback((ids) => {
    const idSet = new Set(ids)
    setHistory((prev) => {
      const next = prev.filter((h) => !idSet.has(h.id))
      saveHistory(next)
      return next
    })
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
    saveHistory([])
  }, [])

  return { history, addToHistory, removeFromHistory, clearHistory }
}
