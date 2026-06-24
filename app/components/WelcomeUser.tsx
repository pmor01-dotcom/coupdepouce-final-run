'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

export default function WelcomeUser() {
  const [name, setName] = useState<string>('')

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 1️⃣ Try artisan table
      let { data: artisan } = await supabase
        .from('artisans')
        .select('full_name')
        .eq('id', user.id)
        .single()

      if (artisan?.full_name) {
        setName(artisan.full_name)
        return
      }

      // 2️⃣ Try client table
      let { data: client } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

      if (client?.full_name) {
        setName(client.full_name)
        return
      }

      // fallback
      setName('User')
    }

    loadUser()
  }, [])

  return (
    <h1 className="text-2xl font-bold mb-4">
      Welcome {name}
    </h1>
  )
}
