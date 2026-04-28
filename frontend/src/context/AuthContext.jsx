import { useCallback, useEffect, useMemo, useState } from 'react'
import apiClient from '../api/client.js'
import { AuthContext } from './auth-context.js'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('hms_token'))
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('hms_user')
    return raw ? JSON.parse(raw) : null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const { data } = await apiClient.get('/auth/me')
        setUser(data.user)
      } catch {
        localStorage.removeItem('hms_token')
        localStorage.removeItem('hms_user')
        setToken(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    bootstrap()
  }, [token])

  const persist = useCallback((authToken, authUser) => {
    localStorage.setItem('hms_token', authToken)
    localStorage.setItem('hms_user', JSON.stringify(authUser))
    setToken(authToken)
    setUser(authUser)
  }, [])

  const setSession = useCallback(
    (authToken, authUser) => {
      persist(authToken, authUser)
    },
    [persist]
  )

  const login = useCallback(
    async (payload) => {
      const { data } = await apiClient.post('/auth/login', payload)
      persist(data.token, data.user)
      return data
    },
    [persist]
  )

  const signup = useCallback(
    async (payload) => {
      const { data } = await apiClient.post('/auth/signup', payload)
      persist(data.token, data.user)
      return data
    },
    [persist]
  )

  const logout = useCallback(() => {
    localStorage.removeItem('hms_token')
    localStorage.removeItem('hms_user')
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ token, user, loading, login, signup, logout, setSession }),
    [token, user, loading, login, signup, logout, setSession]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
