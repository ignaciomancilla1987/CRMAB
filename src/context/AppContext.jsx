import { createContext, useContext, useState, useCallback } from 'react'

const AppContext = createContext({})

export const useApp = () => useContext(AppContext)

export const AppProvider = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [notification, setNotification] = useState(null)

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 4000)
  }, [])

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev)
  }, [])

  const value = {
    sidebarCollapsed,
    setSidebarCollapsed,
    toggleSidebar,
    notification,
    showNotification,
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}
