import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchGeoByIP, isValidIP } from '../api/geo'
import { useGeoHistory } from '../hooks/useGeoHistory'
import GeoMap from '../components/GeoMap'
import './Home.css'
import './Home.css'

export default function Home() {
  const { user, logout } = useAuth()
  const { history, addToHistory, removeFromHistory } = useGeoHistory()
  const [userGeo, setUserGeo] = useState(null)
  const [currentGeo, setCurrentGeo] = useState(null)
  const [ipInput, setIpInput] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)
  const [selectedIds, setSelectedIds] = useState(new Set())

  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetchGeoByIP()
      .then((data) => {
        if (mounted) {
          setUserGeo(data)
          setCurrentGeo(data)
        }
      })
      .catch((err) => {
        if (mounted) setError(err.message || 'Failed to fetch geolocation')
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => { mounted = false }
  }, [])

  const handleSearch = async () => {
    const trimmed = ipInput.trim()
    setError('')

    if (!trimmed) {
      setCurrentGeo(userGeo)
      return
    }

    if (!isValidIP(trimmed)) {
      setError('Please enter a valid IP address')
      return
    }

    setSearchLoading(true)
    try {
      const data = await fetchGeoByIP(trimmed)
      setCurrentGeo(data)
      addToHistory(trimmed, data)
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch geo for this IP')
    } finally {
      setSearchLoading(false)
    }
  }

  const handleClear = () => {
    setIpInput('')
    setCurrentGeo(userGeo)
    setError('')
  }

  const handleHistoryClick = (entry) => {
    setCurrentGeo(entry.geoData)
    setIpInput(entry.ip)
    setError('')
  }

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === history.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(history.map((h) => h.id)))
    }
  }

  const handleDeleteSelected = () => {
    const idsToDelete = [...selectedIds]
    const displayedEntry = history.find((h) => h.geoData?.ip === currentGeo?.ip)
    const shouldRevert = displayedEntry && idsToDelete.includes(displayedEntry.id)
    removeFromHistory(idsToDelete)
    setSelectedIds(new Set())
    if (shouldRevert) {
      setCurrentGeo(userGeo)
      setIpInput('')
    }
  }

  const getLoc = (geo) => {
    if (!geo?.loc) return null
    const [lat, lon] = geo.loc.split(',')
    return { lat, lon }
  }

  const loc = currentGeo ? getLoc(currentGeo) : null

  return (
    <div className="home-page">
      <header className="home-header">
        <div>
          <h1>IP Geolocation</h1>
          <p className="user-email">Logged in as {user?.email}</p>
        </div>
        <button className="btn-logout" onClick={logout}>
          Logout
        </button>
      </header>

      <main className="home-main">
        <section className="search-section">
          <div className="search-row">
            <input
              type="text"
              placeholder="Enter IP address (e.g. 8.8.8.8)"
              value={ipInput}
              onChange={(e) => setIpInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              className="btn-search"
              onClick={handleSearch}
              disabled={searchLoading}
            >
              {searchLoading ? 'Searching...' : 'Search'}
            </button>
            <button className="btn-clear" onClick={handleClear}>
              Clear
            </button>
          </div>
          {error && <div className="search-error">{error}</div>}
        </section>

        {loading ? (
          <div className="loading-state">Loading geolocation...</div>
        ) : currentGeo ? (
          <>
            <section className="geo-section">
              <h2>Geolocation Information</h2>
              <div className="geo-grid">
                <div className="geo-item">
                  <span className="geo-label">IP</span>
                  <span className="geo-value">{currentGeo.ip || '-'}</span>
                </div>
                <div className="geo-item">
                  <span className="geo-label">City</span>
                  <span className="geo-value">{currentGeo.city || '-'}</span>
                </div>
                <div className="geo-item">
                  <span className="geo-label">Region</span>
                  <span className="geo-value">{currentGeo.region || '-'}</span>
                </div>
                <div className="geo-item">
                  <span className="geo-label">Country</span>
                  <span className="geo-value">{currentGeo.country || '-'}</span>
                </div>
                <div className="geo-item">
                  <span className="geo-label">Location (lat, lon)</span>
                  <span className="geo-value">{currentGeo.loc || '-'}</span>
                </div>
                <div className="geo-item">
                  <span className="geo-label">Postal</span>
                  <span className="geo-value">{currentGeo.postal || '-'}</span>
                </div>
                <div className="geo-item">
                  <span className="geo-label">Organization</span>
                  <span className="geo-value">{currentGeo.org || '-'}</span>
                </div>
                <div className="geo-item">
                  <span className="geo-label">Timezone</span>
                  <span className="geo-value">{currentGeo.timezone || '-'}</span>
                </div>
              </div>
            </section>

            {loc && (
              <section className="map-section">
                <h2>Map Location</h2>
                <GeoMap
                  lat={loc.lat}
                  lon={loc.lon}
                  label={currentGeo.city ? `${currentGeo.city}, ${currentGeo.country}` : currentGeo.ip}
                />
              </section>
            )}
          </>
        ) : null}

        <section className="history-section">
          <div className="history-header">
            <h2>Search History</h2>
            {history.length > 0 && (
              <div className="history-actions">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === history.length && history.length > 0}
                    onChange={toggleSelectAll}
                  />
                  Select all
                </label>
                <button
                  className="btn-delete"
                  onClick={handleDeleteSelected}
                  disabled={selectedIds.size === 0}
                >
                  Delete Selected
                </button>
              </div>
            )}
          </div>
          {history.length === 0 ? (
            <p className="history-empty">No search history yet</p>
          ) : (
            <ul className="history-list">
              {history.map((entry) => (
                <li key={entry.id} className="history-item">
                  <label className="history-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(entry.id)}
                      onChange={() => toggleSelect(entry.id)}
                    />
                  </label>
                  <button
                    className="history-content"
                    onClick={() => handleHistoryClick(entry)}
                  >
                    <span className="history-ip">{entry.ip}</span>
                    <span className="history-meta">
                      {entry.geoData?.city}, {entry.geoData?.country}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  )
}
