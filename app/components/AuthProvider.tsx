'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

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
  login: (email: string, password: string, role: 'client' | 'artisan') => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on mount
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        // Validate the parsed user data
        if (parsedUser && typeof parsedUser.email === 'string' && parsedUser.name && parsedUser.role) {
          setUser(parsedUser)
        } else {
          // Invalid user data, clear localStorage
          localStorage.removeItem('user')
        }
      } catch (error) {
        console.error('Error parsing user data:', error)
        // Clear invalid data
        localStorage.removeItem('user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string, role: 'client' | 'artisan', name?: string): Promise<boolean> => {
    try {
      // Validate inputs
      if (!email || !password || !role) {
        throw new Error('Email, password, and role are required')
      }

      // Validate email is a string
      if (typeof email !== 'string' || !email.includes('@')) {
        throw new Error('Invalid email format')
      }

      // Mock authentication - in real app, this would call an API
      const mockUser: User = {
        id: Math.floor(Math.random() * 1000),
        email,
        name: name || (typeof email === 'string' && email.includes('@') ? email.split('@')[0] : 'User'),
        role,
        isPaid: role === 'client', // Clients are paid by default
        subscription: role === 'artisan' ? null : undefined, // Artisans need to pay
      }

      setUser(mockUser)
      localStorage.setItem('user', JSON.stringify(mockUser))
      return true
    } catch (error: any) {
      console.error('Login error:', error instanceof Error ? error.message : 'Unknown error')
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    // Redirect to front page
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
