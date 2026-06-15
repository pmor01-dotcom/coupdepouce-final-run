'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../components/AuthProvider'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useLanguage } from '../components/LanguageProvider'

export default function MessagesPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { user, isLoading } = useAuth()
  const { t } = useLanguage()

  const [conversations, setConversations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
      return
    }

    const loadConversations = async () => {
      const { data, error } = await supabase.rpc('get_conversations', {
        p_user_id: user.id
      })

      if (!error) setConversations(data || [])
      setLoading(false)
    }

    loadConversations()
  }, [user, isLoading, supabase, router])

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>{t('common.loading')}</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-6 bg-gray-100">
      <div className="max-w-3xl mx-auto space-y-6">

        <h1 className="text-3xl font-bold">Messages</h1>

        {conversations.length === 0 && (
          <p className="text-gray-600">Aucune conversation.</p>
        )}

        <div className="space-y-4">
          {conversations.map(conv => (
            <div
              key={conv.user_id}
              className="bg-white p-4 rounded-lg shadow cursor-pointer hover:bg-gray-50"
              onClick={() => router.push(`/messages/${conv.user_id}`)}
            >
              <h2 className="text-lg font-semibold">{conv.name}</h2>
              <p className="text-gray-600 text-sm">{conv.last_message}</p>
            </div>
          ))}
        </div>

      </div>
    </main>
  )
}
