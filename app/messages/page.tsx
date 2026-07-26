'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase-client'
import AuthProvider from '@/app/components/AuthProvider'
import { LanguageProvider, useLanguage } from '@/app/components/LanguageProvider'




export default function MessagesPage() {
  const router = useRouter()
  const supabase = getSupabaseClient()
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<string | null>(null)

useEffect(() => {
  const loadUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setUser(user)
    
    if (user) {
      // Get user role from users table
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()
      
      if (userData) {
        setUserRole(userData.role?.toLowerCase())
      }
    }
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

  const handleBack = () => {
    if (userRole === 'client') {
      router.push('/client-dashboard')
    } else if (userRole === 'artisan') {
      router.push('/artisan-dashboard')
    } else {
      router.push('/')
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <button
        onClick={handleBack}
        style={{
          marginBottom: 20,
          padding: '10px 20px',
          backgroundColor: '#6b7280',
          color: 'white',
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
          fontSize: 14
        }}
      >
        ← {t('form.back')}
      </button>
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
