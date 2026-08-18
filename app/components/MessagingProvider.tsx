'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from '../components/AuthProvider'

/* -------------------------------------------------------
   TYPES
-------------------------------------------------------- */

export interface Message {
  id: string
  conversationId?: string
  senderId: string
  receiverId: string
  content: string
  demandId?: string
  createdAt: string
  read?: boolean
  sender?: {
    id: string
    name: string
    role: string
  }
}

export interface Conversation {
  conversationId: string
  otherUser: {
    id: string
    name: string
    role: string
    metier?: string
    location?: string
  }
  demand: {
    id: string
    title: string
    description: string
    category: string
    budget_range?: string
    location: string
    department: string
    status: string
  }
  lastMessage: Message
  unreadCount: number
}

/* -------------------------------------------------------
   CONTEXT
-------------------------------------------------------- */

interface MessagingContextType {
  socket: Socket | null
  isConnected: boolean
  conversations: Conversation[]
  currentConversation: Conversation | null
  messages: Message[]
  unreadCount: number
  sendMessage: (data: {
    conversationId: string
    receiverId: string
    content: string
    demandId: string
  }) => void
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined)

/* -------------------------------------------------------
   PROVIDER
-------------------------------------------------------- */

export function MessagingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()

  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState<boolean>(false)

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [unreadCount, setUnreadCount] = useState<number>(0)

  /* -------------------------------------------------------
     SOCKET INITIALIZATION
  -------------------------------------------------------- */

  useEffect(() => {
    if (!user) return

    const token = typeof window !== 'undefined'
      ? localStorage.getItem('session_token')
      : null

    if (!token) return

    const socketInstance = io(
      process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000',
      {
        path: '/api/socket/io',
        auth: { token },
        transports: ['websocket', 'polling']
      }
    )

    socketInstance.on('connect', () => {
      setIsConnected(true)
      console.log('Socket connected as user:', user.id)
    })

    socketInstance.on('disconnect', () => {
      setIsConnected(false)
      console.log('Socket disconnected')
    })

    socketInstance.on('new-message', (message: Message) => {
      setMessages(prev => [...prev, message])
    })

    socketInstance.on('message-error', (err) => {
      console.error('Message error:', err)
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [user])

  /* -------------------------------------------------------
     SEND MESSAGE
  -------------------------------------------------------- */

  const sendMessage = (data: {
    conversationId: string
    receiverId: string
    content: string
    demandId: string
  }) => {
    if (!socket) return

    socket.emit('send-message', {
      ...data
      // senderId is NOT sent — backend uses authenticated user
    })
  }

  /* -------------------------------------------------------
     PROVIDER VALUE
  -------------------------------------------------------- */

  return (
    <MessagingContext.Provider
      value={{
        socket,
        isConnected,
        conversations,
        currentConversation,
        messages,
        unreadCount,
        sendMessage
      }}
    >
      {children}
    </MessagingContext.Provider>
  )
}

/* -------------------------------------------------------
   HOOK
-------------------------------------------------------- */

export function useMessaging() {
  const ctx = useContext(MessagingContext)
  if (!ctx) throw new Error('useMessaging must be used within a MessagingProvider')
  return ctx
}
