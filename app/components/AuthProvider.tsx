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
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export default function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = createClientComponentClient()

  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load session + fetch profile from correct table
  useEffect(() => {
    const loadSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) {
        setUser(null)
        localStorage.removeItem('user')
        setIsLoading(false)
        return
      }

      const authUser = session.user

      // 1️⃣ Try CLIENT table
      const { data: clientProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (clientProfile) {
        const profile: UserProfile = {
          id: authUser.id,
          email: authUser.email ?? '',
          role: 'client',
          name: clientProfile.name,
          phone: clientProfile.phone,
          location: clientProfile.location,
          isPaid: clientProfile.isPaid ?? false,
        }

        setUser(profile)
        localStorage.setItem('user', JSON.stringify(profile))
        setIsLoading(false)
        return
      }

      // 2️⃣ Try ARTISAN table
      const { data: artisanProfile } = await supabase
        .from('artisans')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (artisanProfile) {
        const profile: UserProfile = {
          id: authUser.id,
          email: authUser.email ?? '',
          role: 'artisan',
          name: artisanProfile.name,
          phone: artisanProfile.phone,
          location: artisanProfile.ville,
          metier: artisanProfile.metier,
          isPaid: artisanProfile.isPaid ?? false,
        }

        setUser(profile)
        localStorage.setItem('user', JSON.stringify(profile))
        setIsLoading(false)
        return
      }

      // 3️⃣ No profile found
      setUser(null)
      localStorage.removeItem('user')
      setIsLoading(false)
    }

    loadSession()

    // Auth state listener
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!session?.user) {
          setUser(null)
          localStorage.removeItem('user')
          return
        }

        const authUser = session.user

        // CLIENT
        const { data: clientProfile } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single()

        if (clientProfile) {
          const profile: UserProfile = {
            id: authUser.id,
            email: authUser.email ?? '',
            role: 'client',
            name: clientProfile.name,
            phone: clientProfile.phone,
            location: clientProfile.location,
            isPaid: clientProfile.isPaid ?? false,
          }

          setUser(profile)
          localStorage.setItem('user', JSON.stringify(profile))
          return
        }

        // ARTISAN
        const { data: artisanProfile } = await supabase
          .from('artisans')
          .select('*')
          .eq('id', authUser.id)
          .single()

        if (artisanProfile) {
          const profile: UserProfile = {
            id: authUser.id,
            email: authUser.email ?? '',
            role: 'artisan',
            name: artisanProfile.name,
            phone: artisanProfile.phone,
            location: artisanProfile.ville,
            metier: artisanProfile.metier,
            isPaid: artisanProfile.isPaid ?? false,
          }

          setUser(profile)
          localStorage.setItem('user', JSON.stringify(profile))
          return
        }

        setUser(null)
        localStorage.removeItem('user')
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

      const authUser = data.user

      // CLIENT
      const { data: clientProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (clientProfile) {
        const profile: UserProfile = {
          id: authUser.id,
          email: authUser.email ?? '',
          role: 'client',
          name: clientProfile.name,
          phone: clientProfile.phone,
          location: clientProfile.location,
          isPaid: clientProfile.isPaid ?? false,
        }

        setUser(profile)
        localStorage.setItem('user', JSON.stringify(profile))
        return true
      }

      // ARTISAN
      const { data: artisanProfile } = await supabase
        .from('artisans')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (artisanProfile) {
        const profile: UserProfile = {
          id: authUser.id,
          email: authUser.email ?? '',
          role: 'artisan',
          name: artisanProfile.name,
          phone: artisanProfile.phone,
          location: artisanProfile.ville,
          metier: artisanProfile.metier,
          isPaid: artisanProfile.isPaid ?? false,
        }

        setUser(profile)
        localStorage.setItem('user', JSON.stringify(profile))
        return true
      }

      return false
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