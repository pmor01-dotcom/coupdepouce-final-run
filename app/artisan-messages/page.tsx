'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAuth } from '../components/AuthProvider'
import { useLanguage } from '../components/LanguageProvider'

export default function ArtisanMessagesPage() {
  const [conversations, setConversations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { t } = useLanguage()

  const handleDeleteConversation = async (otherUserId: string) => {
    if (!confirm(t('clientDashboard.confirmDeleteMessage'))) {
      return
    }

    try {
      // Delete all messages between current user and other user
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
    const loadConversations = async () => {
      if (!user || !user.id) {
        setLoading(false)
        return
      }

      try {
        const res = await fetch(`/api/messages/conversations?userId=${user.id}`)
        if (res.ok) {
          const data = await res.json()
          if (data.success && data.conversations) {
            setConversations(data.conversations)
          }
        }
      } catch (err) {
        console.error('Erreur lors du chargement des conversations :', err)
      } finally {
        setLoading(false)
      }
    }

    loadConversations()
  }, [user])

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg">{t('clientDashboard.loading')}</p>
      </main>
    )
  }

  return (
    <main
      className="min-h-screen overflow-x-hidden"
      style={{ background: 'linear-gradient(to bottom, #6B8E23, #D4E4BC)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-semibold text-gray-900">
            {t('artisanDashboard.myMessages')}
          </h1>
          <Link
            href="/artisan-dashboard"
            className="inline-block bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg shadow hover:bg-gray-100 transition"
          >
            ← {t('clientDashboard.backToDashboard')}
          </Link>
        </div>

        {conversations.length === 0 ? (
          <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
            <p className="text-gray-700 text-lg">
              {t('artisanDashboard.noMessages')}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {conversations.map((conversation: any) => (
              <div
                key={conversation.id}
                className="rounded-2xl p-6 border-4 border-white"
                style={{ background: 'linear-gradient(to bottom, #6B8E23, #D4E4BC)' }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      {conversation.otherUser?.name || t('clientDashboard.unknownArtisan')}
                    </h2>
                    <p className="text-sm text-white opacity-90">
                      {conversation.lastMessage?.content || t('messages.noMessages')}
                    </p>
                  </div>
                  <span className="text-xs text-white opacity-75">
                    {conversation.lastMessage?.created_at ? new Date(conversation.lastMessage.created_at).toLocaleDateString() : ''}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white border-opacity-30">
                  <div className="text-sm text-white">
                    <strong>{t('clientDashboard.messageCount')}:</strong> {conversation.messages?.length || 0}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDeleteConversation(conversation.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium"
                    >
                      {t('clientDashboard.delete')}
                    </button>
                    <Link
                      href={`/messages/${conversation.id}?name=${encodeURIComponent(conversation.otherUser?.name || 'User')}`}
                      className="px-4 py-2 bg-white text-green-700 rounded-lg hover:bg-gray-100 text-sm font-medium"
                    >
                      {t('clientDashboard.openConversation')}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
