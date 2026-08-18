'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from '../components/AuthProvider'

/* -------------------------------------------------------
   TYPES
-------------------------------------------------------- */

export interface Message {
  id: string
  conversationId: string
  senderId: string
  receiverId: string
  content: string
  demandId: string
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

  markMessagesAsRead: (conversationId: string) => void

  loadConversations: () => Promise<void>
  loadConversation: (conversationId: string) => Promise<void>

  setTyping: (conversationId: string, isTyping: boolean) => void
}

/* -------------------------------------------------------
   CONTEXT
-------------------------------------------------------- */

const MessagingContext = createContext<MessagingContextType | undefined>(undefined)

/* -------------------------------------------------------
   PROVIDER
-------------------------------------------------------- */

export function MessagingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()

  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  /* -------------------------------------------------------
     SOCKET INITIALIZATION
  -------------------------------------------------------- */

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

    socketInstance.on('messages-read', ({ conversationId }) => {
      setMessages(prev =>
        prev.map(m =>
          m.conversationId === conversationId ? { ...m, read: true } : m
        )
      )
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [user])

  /* -------------------------------------------------------
     ROOM FUNCTIONS
  -------------------------------------------------------- */

  const joinUserRoom = (userId: string) => {
    socket?.emit('join-user-room', userId)
  }

  const joinConversation = (conversationId: string) => {
    socket?.emit('join-conversation', conversationId)
  }

  const leaveConversation = (conversationId: string) => {
    socket?.emit('leave-conversation', conversationId)
  }

  /* -------------------------------------------------------
     SEND MESSAGE
  -------------------------------------------------------- */

  const sendMessage = (data: {
    conversationId: string
    receiverId: string
    content: string
    demandId: string
  }) => {
    socket?.emit('send-message', data)
  }

  /* -------------------------------------------------------
     MARK MESSAGES AS READ
  -------------------------------------------------------- */

  const markMessagesAsRead = (conversationId: string) => {
    if (!socket || !user) return

    socket.emit('mark-messages-read', {
      conversationId,
      userId: user.id
    })
  }

  /* -------------------------------------------------------
     LOAD CONVERSATIONS
  -------------------------------------------------------- */

  const loadConversations = async () => {
    const res = await fetch('/api/messages