'use client'

import { useState, useEffect, useRef } from 'react'
import { useMessaging } from './MessagingProvider'
import { useAuth } from './AuthProvider'

export default function MessagingInterface() {
  const { user } = useAuth()
  const {
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
  } = useMessaging()

  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messageInput, setMessageInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [typingUser, setTypingUser] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
  if (user && isConnected) {
    joinUserRoom(user.id)
    loadConversations(user.id)
  }
}, [user, isConnected])


  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSelectConversation = (conversationId: string) => {
    if (selectedConversation) {
      leaveConversation(selectedConversation)
    }
    
    if (!user) return
    
    setSelectedConversation(conversationId)
    loadConversation(conversationId, user.id)
    markMessagesAsRead(conversationId, user.id)
  }

  const handleSendMessage = () => {
    if (!messageInput.trim() || !currentConversation || !user) return

    const messageData = {
      conversationId: currentConversation.conversationId,
      senderId: user.id,
      receiverId: currentConversation.otherUser.id,
      content: messageInput.trim(),
      demandId: currentConversation.demand.id
    }

    sendMessage(messageData)
    setMessageInput('')
    stopTyping(currentConversation.conversationId, user.id)
  }

  const handleInputChange = (value: string) => {
    setMessageInput(value)
    
    if (!isTyping && value.trim()) {
      setIsTyping(true)
      if (currentConversation && user) {
        setTyping(currentConversation.conversationId, user.id, user.name)
      }
    }

    // Clear typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      if (currentConversation && user) {
        stopTyping(currentConversation.conversationId, user.id)
      }
    }, 1000)
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Veuillez vous connecter pour accéder aux messages</p>
      </div>
    )
  }

  return (
    <div className="flex h-full bg-white rounded-lg shadow-lg">
      {/* Conversations List */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Messages</h3>
          {unreadCount > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              {unreadCount} non lu(s)
            </span>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <p>Aucune conversation</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.conversationId}
                onClick={() => handleSelectConversation(conv.conversationId)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedConversation === conv.conversationId ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      {conv.otherUser.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {conv.otherUser.name}
                      </p>
                      <span className="text-xs text-gray-500">
                        {formatTime(conv.lastMessage.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">
                      {conv.otherUser.role === 'ARTISAN' ? conv.otherUser.metier : 'Client'}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {conv.lastMessage.content}
                    </p>
                    {conv.unreadCount > 0 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Conversation View */}
      <div className="flex-1 flex flex-col">
        {currentConversation ? (
          <>
            {/* Conversation Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">
                    {currentConversation.otherUser.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    {currentConversation.otherUser.name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {currentConversation.otherUser.role === 'ARTISAN' 
                      ? currentConversation.otherUser.metier 
                      : 'Client'}
                  </p>
                </div>
              </div>
              <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                <p className="font-medium text-gray-700">{currentConversation.demand.title}</p>
                <p className="text-gray-600">{currentConversation.demand.category} • {currentConversation.demand.location}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.senderId === user.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.senderId === user.id ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatTime(message.createdAt)}
                      {message.readAt && message.senderId === user.id && ' • Lu'}
                    </p>
                  </div>
                </div>
              ))}
              
              {typingUser && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                    <p className="text-sm italic">{typingUser} est en train d'écrire...</p>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                  placeholder="Tapez votre message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Envoyer
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.003 9.003 0 00-8.587-8.98l-2.007.98A3.003 3.003 0 0012 15c0 1.664 1.368 3 3.05 3h2.858c.083.44.174.876.27 1.314L12 21l2.822-2.686c.096-.438.187-.874.27-1.314A3.003 3.003 0 0018 15c0-1.664-1.368-3-3.05-3h-2.858z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Sélectionnez une conversation</h3>
              <p className="text-gray-500">Choisissez une conversation dans la liste pour commencer à discuter</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}