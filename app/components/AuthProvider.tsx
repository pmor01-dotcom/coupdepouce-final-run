'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '../../lib/supabase'

interface User {
  id: number
  email: string
  name: string
  role: 'client' | 'artisan'
  isPaid?: boolean
  location?: string
  department?: string
  metier?: string
  subscription?: {
    plan: 'monthly' | 'yearly'
    startDate: string
    endDate: string
    paymentId: string
  } | null
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string, role?: 'client' | 'artisan', name?: string) => Promise<boolean>
  logout: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        if (parsedUser && typeof parsedUser.email === 'string' && parsedUser.name && parsedUser.role) {
          setUser(parsedUser)
        } else {
          localStorage.removeItem('user')
        }
      } catch (error) {
        console.error('Error parsing user data:', error)
        localStorage.removeItem('user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      if (!email || !password) {
        throw new Error('Email and password are required')
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()
      if (!response.ok || !data.user) {
        console.error('Login failed:', data.error)
        return false
      }

      setUser(data.user)
      localStorage.setItem('user', JSON.stringify(data.user))
      return true
    } catch (error: any) {
      console.error('Login error:', error instanceof Error ? error.message : 'Unknown error')
      return false
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.warn('Supabase sign out failed:', error)
    }
    setUser(null)
    localStorage.removeItem('user')
    window.location.href = '/'
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
export { AuthProvider }
