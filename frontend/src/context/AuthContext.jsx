import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { authApi } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true) // первичная загрузка

  // Загружаем профиль при наличии токена
  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('access')
    if (!token) { setLoading(false); return }
    try {
      const { data } = await authApi.getMe()
      setUser(data)
    } catch {
      localStorage.removeItem('access')
      localStorage.removeItem('refresh')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadUser() }, [loadUser])

  const login = async (credentials) => {
    const { data } = await authApi.login(credentials)
    localStorage.setItem('access', data.access)
    localStorage.setItem('refresh', data.refresh)
    const me = await authApi.getMe()
    setUser(me.data)
    return me.data
  }

  const logout = () => {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    setUser(null)
  }

  const updateUser = (updatedData) => setUser((prev) => ({ ...prev, ...updatedData }))

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser, loadUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
