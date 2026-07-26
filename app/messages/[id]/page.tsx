'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase-client'
import AuthProvider, { useAuth } from '@/app/components/AuthProvider'
import { LanguageProvider, useLanguage } from '@/app/components/LanguageProvider'



export default function ConversationPage() {


  const supabase = getSupabaseClient()
  const { user } = useAuth()
  const { t } = useLanguage()
const params = useParams()
const id = params?.id as string

  const [messages, setMessages] = useState<any[]>([])

  
  const [text, setText] = useState('')
  const bottomRef = useRef<HTMLDivElement | null>(null)


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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!text.trim()) return

    await supabase.from('messages').insert({
      conversation_id: id,
      sender_id: user?.id,
      content: text,
      attachment_url: null
    })

    setText('')
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const filePath = `${id}/${Date.now()}-${file.name}`

    const { data, error } = await supabase.storage
      .from('message-attachments')
      .upload(filePath, file)

    if (error) {
      console.error(error)
      return
    }

    const { data: urlData } = supabase.storage
      .from('message-attachments')
      .getPublicUrl(filePath)

    await supabase.from('messages').insert({
      conversation_id: id,
      sender_id: user?.id,
      content: null,
      attachment_url: urlData.publicUrl
    })
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>{t('messages.conversation')}</h2>

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
                color: msg.sender_id === user?.id ? 'white' : 'black',
                maxWidth: '70%'
              }}
            >
              {msg.attachment_url ? (
                msg.attachment_url.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                  <img
                    src={msg.attachment_url}
                    style={{ maxWidth: '200px', borderRadius: 8 }}
                  />
                ) : (
                  <a
                    href={msg.attachment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'white', textDecoration: 'underline' }}
                  >
                    📄 {t('messages.downloadFile')}
                  </a>
                )
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <input
          type="file"
          accept="image/*,application/pdf"
          onChange={handleFileUpload}
          id="fileInput"
          style={{ display: 'none' }}
        />

        <label
          htmlFor="fileInput"
          style={{
            cursor: 'pointer',
            fontSize: 24,
            padding: '0 10px'
          }}
        >
          📎
        </label>

        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('messages.typeMessage')}
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 8,
            border: '1px solid #ccc'
          }}
        />

        <button onClick={sendMessage} style={{ padding: '10px 20px' }}>
          {t('messages.send')}
        </button>
      </div>
    </div>
  )
}
