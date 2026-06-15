'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAuth } from '@/app/components/AuthProvider'
import { useLanguage } from '@/app/components/LanguageProvider'

export default function ConversationPage() {
  const { id } = useParams()
  const supabase = createClientComponentClient()
  const { user } = useAuth()
  const { t } = useLanguage()

  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const bottomRef = useRef(null)

  // Load messages
  useEffect(() => {
    if (!id) return

    const loadMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', id)
        .order('created_at', { ascending: true })

      if (!error) setMessages(data)
    }

    loadMessages()

    // Real‑time subscription
    const channel = supabase
      .channel(`conversation_${id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${id}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [id])

  // Auto‑scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Send message
  const sendMessage = async () => {
    if (!text.trim()) return

    await supabase.from('messages').insert({
      conversation_id: id,
      sender_id: user?.id,
      content: text
    })

    setText('')
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>{t('conversation')}</h2>

      <div
        style={{
          height: '70vh',
          overflowY: 'auto',
          border: '1px solid #ccc',
          padding: 10,
          borderRadius: 8,
          marginBottom: 20
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              marginBottom: 12,
              textAlign: msg.sender_id === user?.id ? 'right' : 'left'
            }}
          >
            <div
              style={{
                display: 'inline-block',
                padding: '8px 12px',
                borderRadius: 12,
                background: msg.sender_id === user?.id ? '#0070f3' : '#eee',
                color: msg.sender_id === user?.id ? 'white' : 'black'
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('type_message')}
          style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #ccc' }}
        />
        <button onClick={sendMessage} style={{ padding: '10px 20px' }}>
          {t('send')}
        </button>
      </div>
    </div>
  )
}