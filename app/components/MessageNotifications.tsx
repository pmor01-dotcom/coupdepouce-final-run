'use client'

import { useEffect, useState } from 'react'
import { useMessaging } from './MessagingProvider'

export default function MessageNotifications() {
  const { unreadCount, isConnected } = useMessaging()
  const [showNotification, setShowNotification] = useState(false)
  const [lastNotification, setLastNotification] = useState<any>(null)
  const [showDemandNotification, setShowDemandNotification] = useState(false)
  const [lastDemandNotification, setLastDemandNotification] = useState<any>(null)

  useEffect(() => {
    // Listen for new message and demand notifications
    const socket = (window as any).socket
    if (socket) {
      socket.on('new-message-notification', (notification: any) => {
        setLastNotification(notification)
        setShowNotification(true)
        
        // Auto-hide notification after 5 seconds
        setTimeout(() => {
          setShowNotification(false)
        }, 5000)
      })

      socket.on('new-demand-notification', (notification: any) => {
        setLastDemandNotification(notification)
        setShowDemandNotification(true)

        setTimeout(() => {
          setShowDemandNotification(false)
        }, 5000)
      })
    }

    return () => {
      if (socket) {
        socket.off('new-message-notification')
        socket.off('new-demand-notification')
      }
    }
  }, [])

  if (!isConnected) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-3 py-2 rounded-lg text-sm">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-yellow-600 rounded-full mr-2 animate-pulse"></div>
            Connexion au messagerie...
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Unread Message Counter */}
      {unreadCount > 0 && (
        <div className="fixed top-4 right-4 z-40">
          <div className="bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
              <span className="font-medium">{unreadCount} message{unreadCount > 1 ? 's' : ''} non lu{unreadCount > 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      )}

      {/* New Message Notification Toast */}
      {showNotification && lastNotification && (
        <div className="fixed top-20 right-4 z-50 animate-pulse">
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                </div>
              </div>
              <div className="ml-3 w-0 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Nouveau message de {lastNotification.senderName}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {lastNotification.demandTitle}
                </p>
                <p className="text-sm text-gray-600 mt-1 truncate">
                  {lastNotification.content}
                </p>
              </div>
              <div className="ml-4 flex-shrink-0 flex">
                <button
                  className="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
                  onClick={() => setShowNotification(false)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Typing Indicator */}
      {showDemandNotification && lastDemandNotification && (
        <div className="fixed top-32 right-4 z-50 animate-pulse">
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M5 12h14"></path>
                  </svg>
                </div>
              </div>
              <div className="ml-3 w-0 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Nouvelle demande disponible
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {lastDemandNotification.title}
                </p>
                <p className="text-sm text-gray-600 mt-1 truncate">
                  {lastDemandNotification.message}
                </p>
              </div>
              <div className="ml-4 flex-shrink-0 flex">
                <button
                  className="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
                  onClick={() => setShowDemandNotification(false)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {lastNotification && lastNotification.isTyping && (
        <div className="fixed bottom-4 right-4 z-40">
          <div className="bg-gray-800 text-white px-3 py-2 rounded-lg text-sm">
            <div className="flex items-center">
              <div className="flex space-x-1 mr-2">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span>{lastNotification.userName} est en train d'écrire...</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}