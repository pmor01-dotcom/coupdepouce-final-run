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
  login: (email: string, password: string) => Promise<UserProfile | false>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export default function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = getSupabaseClient()

  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // ⭐ SINGLE SOURCE OF TRUTH: Restore session token ONLY
  useEffect(() => {
    const sessionToken = localStorage.getItem('session_token')

    if (!sessionToken) {
      setIsLoading(false)
      return
    }

    // Fetch user profile from Supabase using the session token
    const restoreUser = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        })

        const data = await response.json()

        if (response.ok && data.user) {
          setUser(data.user)
        } else {
          // Invalid token → clear it
          localStorage.removeItem('session_token')
        }
      } catch (err) {
        localStorage.removeItem('session_token')
      }

      setIsLoading(false)
    }

    restoreUser()
  }, [])

  // ⭐ LOGIN: Store ONLY a session token, not the full user
  const login = async (email: string, password: string): Promise<UserProfile | false> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        return false
      }

      const userProfile: UserProfile = {
        id: data.user.id,
        email: data.user.email,
        role: data.user.role,
        name: data.user.name,
        phone: data.user.phone,
        location: data.user.location,
        metier: data.user.metier,
        isPaid: data.user.isPaid ?? false,
      }

      // Save session token ONLY
      localStorage.setItem('session_token', data.token)

      setUser(userProfile)
      return userProfile
    } catch (err) {
      return false
    }
  }

  // ⭐ LOGOUT: Clear session token and user
  const logout = async () => {
    localStorage.removeItem('session_token')
    setUser(null)
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
