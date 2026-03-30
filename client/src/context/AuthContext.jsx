import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('admin_session')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (parsed?.data?.token && parsed?.data?.admin) {
          setAdmin({ ...parsed.data.admin, token: parsed.data.token })
        } else if (parsed?.token) {
          setAdmin(parsed)
        } else if (parsed?.admin && parsed?.token) {
          setAdmin(parsed)
        }
      } catch {
        // ignore
      }
    }
    setLoading(false)
  }, [])

  const login = (adminData) => {
  setAdmin(adminData)
  localStorage.setItem('admin_session', JSON.stringify(adminData))
}

  const logout = () => {
    setAdmin(null)
    localStorage.removeItem('admin_session')
  }

  return (
    <AuthContext.Provider value={{ admin, login, logout, loading, isAuthenticated: !!admin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}