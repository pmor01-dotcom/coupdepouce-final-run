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

  const handleDeleteConversation = async (otherUserId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!confirm(t('clientDashboard.confirmDeleteMessage'))) {
      return
    }

    try {
      const res = await fetch(`/api/messages/conversations?userId=${otherUserId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        setConversations(conversations.filter(c => c.id !== otherUserId))
      } else {
        console.error('Failed to delete conversation')
      }
    } catch (err) {
      console.error('Error deleting conversation:', err)
    }
  }

  useEffect(() => {
    if (!user || !user.id) return

    console.log('Loading conversations for user:', user.id, user.name)

    const loadConversations = async () => {
      try {
        // Use API endpoint with service role to bypass RLS
        const response = await fetch(`/api/messages/conversations?userId=${user.id}`)
        const result = await response.json()

        console.log('Conversations API response:', result)

        if (result.success && result.conversations) {
          setConversations(result.conversations)
        } else {
          console.error('Failed to load conversations:', result.error)
        }
      } catch (error) {
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
            <div
              key={conv.id}
              style={{
                padding: 16,
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              <div className="flex items-center justify-between">
                <Link
                  href={`/messages/${conv.id}`}
                  className="flex-1"
                  style={{ textDecoration: 'none' }}
                >
                  <h3 className="text-lg font-semibold text-gray-900">
                    {conv.otherUser?.name || 'Utilisateur'}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2 max-w-xs mt-1">
                    {conv.lastMessage?.content}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(conv.lastMessage?.created_at).toLocaleDateString()}
                  </p>
                </Link>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      router.push(`/messages/${conv.id}`)
                    }}
                    className="ml-4 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                  >
                    {t('clickToReply')}
                  </button>
                  <button
                    onClick={(e) => handleDeleteConversation(conv.id, e)}
                    className="ml-4 px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium"
                  >
                    {t('clientDashboard.delete')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
