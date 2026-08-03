'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase-client'
import { useAuth } from '../components/AuthProvider'
import { useLanguage } from '../components/LanguageProvider'

export default function MessagesPage() {
  const router = useRouter()
  const supabase = getSupabaseClient()
  const { user } = useAuth()
  const { t } = useLanguage()

  const [conversations, setConversations] = useState<any[]>([])

  useEffect(() => {
    if (!user || !user.id) return

    const loadConversations = async () => {
      // Load messages where user is sender or receiver
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false })

      if (!error && messages) {
        console.log('Messages loaded:', messages.length, messages)

        // Group messages by conversation (unique sender-receiver pairs)
        const conversationMap = new Map()

        for (const msg of messages) {
          const otherUserId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id

          if (!conversationMap.has(otherUserId)) {
            // Fetch other user info
            const { data: otherUser } = await supabase
              .from('users')
              .select('id, name')
              .eq('id', otherUserId)
              .limit(1)

            conversationMap.set(otherUserId, {
              id: otherUserId,
              otherUser: otherUser && otherUser.length > 0 ? otherUser[0] : { id: otherUserId, name: 'Unknown User' },
              lastMessage: msg
            })
          }
        }

        setConversations(Array.from(conversationMap.values()))
      } else {
        console.error('Error loading conversations:', error)
      }
    }

    loadConversations()
  }, [user])

  const handleBack = () => {
    if (user?.role === 'client') {
      router.push('/client-dashboard')
    } else if (user?.role === 'artisan') {
      router.push('/artisan-dashboard')
    } else {
      router.push('/')
    }
  }

  if (!user) {
    return (
      <div style={{ padding: 20 }}>
        <p>Chargement...</p>
      </div>
    )
  }

  return (
    <main
      className="min-h-screen overflow-x-hidden"
      style={{ background: 'linear-gradient(to bottom, #6B8E23, #D4E4BC)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
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
        <h2 className="text-3xl font-semibold text-gray-900 mb-6">{t('messages')}</h2>

        {conversations.length === 0 && (
          <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
            <p className="text-gray-700">{t('no_conversations')}</p>
          </div>
        )}

        <div className="space-y-4">
          {conversations.map((conv) => (
            <Link
              key={conv.id}
              href={`/messages/${conv.id}`}
              style={{
                display: 'block',
                padding: 16,
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                textDecoration: 'none',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {conv.otherUser?.name || 'Utilisateur'}
                  </h3>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 line-clamp-2 max-w-xs">
                    {conv.lastMessage?.content}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(conv.lastMessage?.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
