'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface UserProfile {
  id: string
  email: string
  name?: string
  role?: 'client' | 'artisan'
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
  user: UserProfile | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export default function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = createClientComponentClient()

  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load session on mount
  useEffect(() => {
    const loadSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        const profile = {
          id: session.user.id,
          email: session.user.email ?? '',
          ...session.user.user_metadata,
        }
        setUser(profile)
        localStorage.setItem('user', JSON.stringify(profile))
      } else {
        setUser(null)
        localStorage.removeItem('user')
      }

      setIsLoading(false)
    }

    loadSession()

    // Listen for login/logout events
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          const profile = {
            id: session.user.id,
            email: session.user.email ?? '',
            ...session.user.user_metadata,
          }
          setUser(profile)
          localStorage.setItem('user', JSON.stringify(profile))
        } else {
          setUser(null)
          localStorage.removeItem('user')
        }
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [supabase])

  // LOGIN
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error || !data.user) return false

      const profile = {
        id: data.user.id,
        email: data.user.email ?? '',
        ...data.user.user_metadata,
      }

      setUser(profile)
      localStorage.setItem('user', JSON.stringify(profile))

      return true
    } catch {
      return false
    }
  }

  // LOGOUT
  const logout = async () => {
    await supabase.auth.signOut()
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
