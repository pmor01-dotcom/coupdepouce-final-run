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

    // Get name from URL parameter if available
    const urlParams = new URLSearchParams(window.location.search)
    const nameFromUrl = urlParams.get('name')

    const loadMessages = async () => {
      // Load messages between current user and other user using API
      try {
        const response = await fetch(`/api/messages/conversations?userId=${user.id}`)
        const result = await response.json()

        if (result.success && result.conversations) {
          // Find the specific conversation with the other user
          const conversation = result.conversations.find((c: any) => c.id === otherUserId)
          if (conversation && conversation.messages) {
            setMessages(conversation.messages)
          } else {
            setMessages([])
          }
        } else {
          setMessages([])
        }
      } catch (error) {
        console.error('Error loading messages:', error)
        setMessages([])
      }

      // Get other user info using service role API
      try {
        const response = await fetch(`/api/auth/user-info?userId=${otherUserId}`)
        const result = await response.json()

        if (result.user) {
          setOtherUser(result.user)
        } else if (nameFromUrl) {
          // Use name from URL parameter if user not found in database
          setOtherUser({ id: otherUserId, name: decodeURIComponent(nameFromUrl) })
        } else {
          console.error('User not found:', otherUserId)
          setOtherUser({ id: otherUserId, name: 'Unknown User' })
        }
      } catch (error) {
        console.error('Error fetching user:', error)
        if (nameFromUrl) {
          setOtherUser({ id: otherUserId, name: decodeURIComponent(nameFromUrl) })
        } else {
          setOtherUser({ id: otherUserId, name: 'Unknown User' })
        }
      }
    }

    loadMessages()
  }, [otherUserId, user?.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!text.trim() || !user?.id || !otherUserId) return

    console.log('Sending message:', { senderId: user.id, receiverId: otherUserId, content: text })

    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          senderId: user.id,
          receiverId: otherUserId,
          content: text
        })
      })

      const result = await response.json()
      console.log('Message send response:', result)

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send message')
      }

      setText('')

      // Reload messages after sending
      const loadResponse = await fetch(`/api/messages/conversations?userId=${user.id}`)
      const loadResult = await loadResponse.json()

      if (loadResult.success && loadResult.conversations) {
        const conversation = loadResult.conversations.find((c: any) => c.id === otherUserId)
        if (conversation && conversation.messages) {
          setMessages(conversation.messages)
        }
      }
    } catch (error: any) {
      console.error('Error sending message:', error)
    }
  }

  const handleBack = () => {
    router.push('/messages')
  }

  if (!user) {
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

  // Set fallback for otherUser if not loaded yet
  const displayUser = otherUser || { id: otherUserId, name: 'Utilisateur' }

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
            {displayUser.name}
          </h2>

          <div
            style={{
              height: '24vh',
              overflowY: 'auto',
              border: '1px solid #e5e7eb',
              padding: 16,
              borderRadius: 8,
              marginBottom: 20,
              backgroundColor: '#f9fafb'
            }}
          >
            {messages.length === 0 && (
              <div className="text-center py-4">
                <p className="text-gray-500">
                  Aucun message. Envoyez le premier message !
                </p>
              </div>
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
