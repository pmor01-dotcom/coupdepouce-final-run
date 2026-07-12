'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import AuthProvider from '@/app/components/AuthProvider'
import { LanguageProvider, useLanguage } from '@/app/components/LanguageProvider'




export default function MessagesPage() {
  
  const supabase = createClientComponentClient()
const [user, setUser] = useState<any>(null)

useEffect(() => {
  const loadUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setUser(user)
  }
  loadUser()
}, [])


  const { t } = useLanguage()

 const [conversations, setConversations] = useState<any[]>([])


  useEffect(() => {
    if (!user) return

    const loadConversations = async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('updated_at', { ascending: false })

      if (!error) setConversations(data)
    }

    loadConversations()
  }, [user])

  return (
    <div style={{ padding: 20 }}>
      <h2>{t('messages')}</h2>

      {conversations.length === 0 && (
        <p>{t('no_conversations')}</p>
      )}

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {conversations.map((conv) => (
          <li key={conv.id} style={{ marginBottom: 15 }}>
            <Link
              href={`/messages/${conv.id}`}
              style={{
                display: 'block',
                padding: 12,
                border: '1px solid #ccc',
                borderRadius: 8,
                textDecoration: 'none'
              }}
            >
              {t('conversation')} #{conv.id}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
