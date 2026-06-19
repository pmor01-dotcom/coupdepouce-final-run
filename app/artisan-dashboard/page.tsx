'use client'

import { useAuth } from '../components/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ArtisanDashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [isLoading, user, router])

  if (isLoading) return null

  return (
    <div style={{ padding: 40 }}>
      <h1>Artisan Dashboard</h1>
      <p>Welcome, {user?.email}</p>
    </div>
  )
}
