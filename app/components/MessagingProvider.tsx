'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from '../components/AuthProvider'

/* ------------------ TYPES ------------------ */

export interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  createdAt: string
  read?: boolean
}

export interface Conversation {
  conversationId: string
  otherUser: {
    id: string
    name: string
    role: string
  }
  lastMessage: Message
  unreadCount: number
}

interface MessagingContextType {
  socket: Socket | null
  isConnected: boolean
  conversations: Conversation[]
  currentConversation: Conversation | null
  messages: Message[]
  unreadCount: number

  joinUserRoom: (userId: string) => void
  joinConversation: (conversationId: string) => void
  leaveConversation: (conversationId: string) => void

  sendMessage: (data: {
    conversationId: string
    receiverId: string
    content: string
    demandId: string
  }) => void
}

/* ------------------ CONTEXT ------------------ */

const MessagingContext = createContext<MessagingContextType | undefined>(undefined)

/* ------------------ PROVIDER ------------------ */

export function MessagingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()

  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!user) return

    const token = localStorage.getItem('session_token')
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
    })

    socketInstance.on('disconnect', () => {
      setIsConnected(false)
    })

    socketInstance.on('new-message', (message: Message) => {
      setMessages(prev => [...prev, message])
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [user])

  /* ------------------ ROOM FUNCTIONS ------------------ */

  const joinUserRoom = (userId: string) => {
    socket?.emit('join-user-room', userId)
  }

  const joinConversation = (conversationId: string) => {
    socket?.emit('join-conversation', conversationId)
  }

  const leaveConversation = (conversationId: string) => {
    socket?.emit('leave-conversation', conversationId)
  }

  /* ------------------ SEND MESSAGE ------------------ */

  const sendMessage = (data: {
    conversationId: string
    receiverId: string
    content: string
    demandId: string
  }) => {
    socket?.emit('send-message', data)
  }

  return (
    <MessagingContext.Provider
      value={{
        socket,
        isConnected,
        conversations,
        currentConversation,
        messages,
        unreadCount,
        joinUserRoom,
        joinConversation,
        leaveConversation,
        sendMessage
      }}
    >
      {children}
    </MessagingContext.Provider>
  )
}

/* ------------------ HOOK ------------------ */

export function useMessaging() {
  const ctx = useContext(MessagingContext)
  if (!ctx) throw new Error('useMessaging must be used within a MessagingProvider')
  return ctx
}
