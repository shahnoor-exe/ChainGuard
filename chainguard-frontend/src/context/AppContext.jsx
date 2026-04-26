import { createContext, useContext, useState, useCallback } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [selectedShipment, setSelectedShipment] = useState(null)
  const [selectedRoute, setSelectedRoute]       = useState(null)
  const [activeAlerts, setActiveAlerts]         = useState([])
  const [sidebarOpen, setSidebarOpen]           = useState(true)
  const [toasts, setToasts]                     = useState([])

  const addToast = useCallback((msg, type = 'info') => {
    const id = Date.now()
    setToasts(prev => [...prev.slice(-4), { id, msg, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <AppContext.Provider value={{
      selectedShipment, setSelectedShipment,
      selectedRoute,    setSelectedRoute,
      activeAlerts,     setActiveAlerts,
      sidebarOpen,      setSidebarOpen,
      toasts,           addToast, removeToast,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
