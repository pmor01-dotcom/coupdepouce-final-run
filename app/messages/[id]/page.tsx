'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase-client'
import { useAuth } from '@/app/components/AuthProvider'
import { useLanguage } from '@/app/components/LanguageProvider'

export default function ConversationPage() {
  const supabase = getSupabaseClient()
  const { user } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  const params = useParams()
  const otherUserId = params?.id as string

  const [messages, setMessages] = useState<any[]>([])
  const [otherUser, setOtherUser] = useState<any>(null)
  const [text, setText] = useState('')
  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!otherUserId || !user?.id) return

    const loadMessages = async () => {
      // Load messages between current user and other user
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true })

      if (!error && data) {
        setMessages(data)
      }

      // Get other user info
      const { data: userData } = await supabase
        .from('users')
        .select('id, name')
        .eq('id', otherUserId)
        .limit(1)

      if (userData && userData.length > 0) {
        setOtherUser(userData[0])
      } else {
        console.error('User not found:', otherUserId)
        setOtherUser({ id: otherUserId, name: 'Unknown User' })
      }
    }

    loadMessages()

    // Real-time subscription for new messages
    const channel = supabase
      .channel(`messages_${user.id}_${otherUserId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `or(and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id}))`
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [otherUserId, user?.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!text.trim() || !user?.id || !otherUserId) return

    const { error } = await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id: otherUserId,
      content: text
    })

    if (error) {
      console.error('Error sending message:', error)
    } else {
      setText('')
    }
  }

  const handleBack = () => {
    router.push('/messages')
  }

  if (!user || !otherUser) {
    return (
      <main
        className="min-h-screen overflow-x-hidden"
        style={{ background: 'linear-gradient(to bottom, #6B8E23, #D4E4BC)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <p>Chargement...</p>
        </div>
      </main>
    )
  }

  return (
    <main
      className="min-h-screen overflow-x-hidden"
      style={{ background: 'linear-gradient(to bottom, #6B8E23, #D4E4BC)' }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
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

        <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {otherUser.name} ({otherUser.role === 'client' ? 'Client' : 'Artisan'})
          </h2>

          <div
            style={{
              height: '60vh',
              overflowY: 'auto',
              border: '1px solid #e5e7eb',
              padding: 16,
              borderRadius: 8,
              marginBottom: 20,
              backgroundColor: '#f9fafb'
            }}
          >
            {messages.length === 0 && (
              <p className="text-gray-500 text-center py-8">
                Aucun message. Envoyez le premier message !
              </p>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  marginBottom: 12,
                  textAlign: msg.sender_id === user.id ? 'right' : 'left'
                }}
              >
                <div
                  style={{
                    display: 'inline-block',
                    padding: '12px 16px',
                    borderRadius: 12,
                    background: msg.sender_id === user.id ? '#6B8E23' : '#e5e7eb',
                    color: msg.sender_id === user.id ? 'white' : 'black',
                    maxWidth: '70%'
                  }}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p className="text-xs mt-1 opacity-75">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            <div ref={bottomRef} />
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t('messages.typeMessage') || 'Tapez votre message...'}
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 8,
                border: '1px solid #e5e7eb',
                fontSize: 14
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  sendMessage()
                }
              }}
            />

            <button
              onClick={sendMessage}
              style={{
                padding: '12px 24px',
                backgroundColor: '#6B8E23',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 500
              }}
            >
              {t('messages.send') || 'Envoyer'}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
