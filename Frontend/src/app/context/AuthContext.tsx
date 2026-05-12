import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import * as authService from '../services/auth'
import type { User } from '../types'

interface AuthError {
  message: string
  fields?: Record<string, string>
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: AuthError | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, storeName?: string) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<AuthError | null>(null)

  useEffect(() => {
    const init = async () => {
      try {
        await authService.refreshToken()
        const profile = await authService.getProfile()
        setUser(profile)
      } catch {
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }
    init()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setError(null)
    try {
      const { user: loggedInUser } = await authService.login(email, password)
      setUser(loggedInUser)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string; errors?: Record<string, string> } } }
      const data = axiosErr?.response?.data
      setError({
        message: data?.message || 'Login failed',
        fields: data?.errors,
      })
      throw err
    }
  }, [])

  const register = useCallback(async (name: string, email: string, password: string, storeName?: string) => {
    setError(null)
    try {
      const { user: registeredUser } = await authService.register(name, email, password, storeName)
      setUser(registeredUser)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string; errors?: Record<string, string> } } }
      const data = axiosErr?.response?.data
      setError({
        message: data?.message || 'Registration failed',
        fields: data?.errors,
      })
      throw err
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch {
      // even if logout API fails, clear local state
    }
    setUser(null)
  }, [])

  const clearError = useCallback(() => setError(null), [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, error, login, register, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
