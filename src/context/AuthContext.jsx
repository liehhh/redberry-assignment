import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import * as api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }
    try {
      const res = await api.getMe()
      setUser(res.data.data)
    } catch {
      localStorage.removeItem('token')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUser()

    const handleAuthError = () => {
      setUser(null)
      setLoading(false)
    }
    window.addEventListener('auth-error', handleAuthError)
    return () => window.removeEventListener('auth-error', handleAuthError)
  }, [fetchUser])

  const handleLogin = async (credentials) => {
    const res = await api.login(credentials)
    localStorage.setItem('token', res.data.data.token)
    setUser(res.data.data.user)
    return res.data.data
  }

  const handleRegister = async (formData) => {
    const res = await api.register(formData)
    localStorage.setItem('token', res.data.data.token)
    setUser(res.data.data.user)
    return res.data.data
  }

  const handleLogout = async () => {
    try {
      await api.logout()
    } catch {
      // ignore
    }
    localStorage.removeItem('token')
    setUser(null)
  }

  const refreshUser = async () => {
    await fetchUser()
  }

  const isProfileComplete = user?.profileComplete || (user?.fullName && user?.mobileNumber && user?.age)

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: !!user,
      isProfileComplete: !!isProfileComplete,
      login: handleLogin,
      register: handleRegister,
      logout: handleLogout,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
