import { createContext, useState, useEffect, type ReactNode } from 'react'
import type { AuthUser } from '../types'

interface AuthContextType {
  user: AuthUser | null
  login: (userData: AuthUser) => void
  logout: () => void
  isAdmin: boolean
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('authUser')
    return stored ? JSON.parse(stored) : null
  })

  const login = (userData: AuthUser) => {
    localStorage.setItem('authUser', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('authUser')
    setUser(null)
  }

  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    const stored = localStorage.getItem('authUser')
    if (stored) setUser(JSON.parse(stored))
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}