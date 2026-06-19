'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function ArtisanDashboard() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)

      if (!data.session) {
        router.push('/login')
      }
    })
  }, [])

  if (loading) {
    return <div>Chargement...</div>
  }

  return (
    <main>
      <h1>Dashboard Artisan</h1>
      {/* your dashboard content */}
    </main>
  )
}
