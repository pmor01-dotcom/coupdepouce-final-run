'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'

interface Message {
  id: number
  content: string
  senderId: number
  receiverId: number
  createdAt: string
  readAt?: string
  sender: {
    id: number
    name: string
    role: string
  }
}

interface Conversation {
  conversationId: string
  otherUser: {
    id: number
    name: string
    role: string
    metier?: string
    location?: string
  }
  demand: {
    id: number
    title: string
    description: string
    category: string
    budget_range?: string
    location: string
    department: string
    status: string
  }
  lastMessage: {
    id: number
    content: string
    senderId: number
    createdAt: string
  }
  unreadCount: number
}

interface MessagingContextType {
  socket: Socket | null
  isConnected: boolean
  conversations: Conversation[]
  currentConversation: any | null
  messages: Message[]
  unreadCount: number
  joinUserRoom: (userId: number) => void
  joinConversation: (conversationId: string) => void
  leaveConversation: (conversationId: string) => void
  sendMessage: (data: {
    conversationId: string
    senderId: number
    receiverId: number
    content: string
    demandId: number
  }) => void
  markMessagesAsRead: (conversationId: string, userId: number) => void
  loadConversations: (userId: number) => void
  loadConversation: (conversationId: string, userId: number) => void
  setTyping: (conversationId: string, userId: number, userName: string) => void
  stopTyping: (conversationId: string, userId: number) => void
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined)

export function MessagingProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<any | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    let socketInstance: Socket | null = null

    // Only initialize socket if we're on a page that needs messaging
    const needsMessaging = typeof window !== 'undefined' && (
      window.location.pathname.startsWith('/messages') ||
      window.location.pathname.startsWith('/artisan-dashboard') ||
      window.location.pathname.startsWith('/client-dashboard')
    )

    if (!needsMessaging) {
      console.log('Messaging not needed for this page, skipping socket init')
      return
    }

    try {
      socketInstance = io(process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000', {
        path: '/api/socket/io',
        reconnectionAttempts: 2,
        reconnectionDelay: 2000,
        timeout: 5000,
        transports: ['polling', 'websocket']
      })

      socketInstance.on('connect', () => {
        setIsConnected(true)
        console.log('Connected to messaging server')
      })

      socketInstance.on('disconnect', () => {
        setIsConnected(false)
        console.log('Disconnected from messaging server')
      })

      socketInstance.on('connect_error', (error) => {
        // Silently handle connection errors - messaging is optional
        console.log('Socket connection unavailable - messaging disabled')
        setIsConnected(false)
      })

      if (typeof window !== 'undefined') {
        ;(window as any).socket = socketInstance
      }
    } catch (error) {
      console.log('Socket initialization failed - messaging disabled')
      setIsConnected(false)
    }

    if (socketInstance) {
      socketInstance.on('new-message', (message: Message) => {
        setMessages(prev => [...prev, message])

        // Update conversations list
        setConversations(prev => prev.map(conv =>
          conv.conversationId === message.senderId + '-' + message.receiverId + '-' ||
          conv.conversationId === message.receiverId + '-' + message.senderId + '-'
            ? { ...conv, lastMessage: message, unreadCount: conv.unreadCount + 1 }
            : conv
        ))
      })

      socketInstance.on('new-message-notification', (notification) => {
        // Handle new message notification
        setUnreadCount(prev => prev + 1)
      })

      socketInstance.on('messages-read', (data) => {
        // Update messages as read
        setMessages(prev => prev.map(msg =>
          msg.senderId === data.readBy ? { ...msg, readAt: data.readAt } : msg
        ))
      })

      socketInstance.on('user-typing', (data) => {
        // Handle typing indicator
        console.log('User is typing:', data)
      })

      socketInstance.on('user-stop-typing', (data) => {
        // Handle stop typing indicator
        console.log('User stopped typing:', data)
      })

      socketInstance.on('message-error', (error) => {
        console.error('Message error:', error)
      })
    }

    setSocket(socketInstance)

    return () => {
      if (socketInstance) {
        socketInstance.disconnect()
      }
    }
  }, [])

  const joinUserRoom = (userId: number) => {
    if (socket) {
      socket.emit('join-user-room', userId.toString())
    }
  }

  const joinConversation = (conversationId: string) => {
    if (socket) {
      socket.emit('join-conversation', conversationId)
    }
  }

  const leaveConversation = (conversationId: string) => {
    if (socket) {
      socket.emit('leave-conversation', conversationId)
    }
  }

  const sendMessage = (data: {
    conversationId: string
    senderId: number
    receiverId: number
    content: string
    demandId: number
  }) => {
    if (socket) {
      socket.emit('send-message', data)
    }
  }

  const markMessagesAsRead = (conversationId: string, userId: number) => {
    if (socket) {
      socket.emit('mark-messages-read', { conversationId, userId })
    }
  }

  const loadConversations = async (userId: number) => {
    try {
      const response = await fetch(`/api/messages/conversations?userId=${userId}`)
      const data = await response.json()
      
      if (data.success) {
        setConversations(data.conversations)
        setUnreadCount(data.conversations.reduce((sum: number, conv: Conversation) => sum + conv.unreadCount, 0))
      }
    } catch (error) {
      console.error('Error loading conversations:', error)
    }
  }

  const loadConversation = async (conversationId: string, userId: number) => {
    try {
      const response = await fetch(`/api/messages/conversation/${conversationId}?userId=${userId}`)
      const data = await response.json()
      
      if (data.success) {
        setCurrentConversation(data.conversation)
        setMessages(data.conversation.messages)
        joinConversation(conversationId)
      }
    } catch (error) {
      console.error('Error loading conversation:', error)
    }
  }

  const setTyping = (conversationId: string, userId: number, userName: string) => {
    if (socket) {
      socket.emit('typing', { conversationId, userId, userName })
    }
  }

  const stopTyping = (conversationId: string, userId: number) => {
    if (socket) {
      socket.emit('stop-typing', { conversationId, userId })
    }
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
        sendMessage,
        markMessagesAsRead,
        loadConversations,
        loadConversation,
        setTyping,
        stopTyping
      }}
    >
      {children}
    </MessagingContext.Provider>
  )
}

export function useMessaging() {
  const context = useContext(MessagingContext)
  if (context === undefined) {
    throw new Error('useMessaging must be used within a MessagingProvider')
  }
  return context
}
