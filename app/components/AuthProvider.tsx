'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import { getSupabaseClient } from '@/lib/supabase-client'

interface UserProfile {
  id: string
  email: string
  role: 'client' | 'artisan'
  name?: string
  phone?: string
  location?: string
  metier?: string
  isPaid?: boolean
}

interface AuthContextType {
  user: UserProfile | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean | UserProfile>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export default function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = getSupabaseClient()

  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Restore user from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) {
      setUser(JSON.parse(stored))
    }
    setIsLoading(false)
  }, [])

  // CUSTOM LOGIN using password_hash
  const login = async (email: string, password: string): Promise<boolean | UserProfile> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        return false
      }

      const role = data.user.role?.toLowerCase() || 'client'

      const userProfile: UserProfile = {
        id: data.user.id,
        email: data.user.email,
        role: role as 'client' | 'artisan',
        name: data.user.name,
        phone: data.user.phone,
        location: data.user.location,
        metier: data.user.metier,
        isPaid: data.user.isPaid ?? false,
      }

      setUser(userProfile)
      localStorage.setItem('user', JSON.stringify(userProfile))

      return userProfile
    } catch (err) {
      return false
    }
  }

  const logout = async () => {
    setUser(null)
    localStorage.removeItem('user')
    window.location.href = '/'
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
