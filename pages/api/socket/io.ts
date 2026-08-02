import type { NextApiRequest, NextApiResponse } from 'next'
import { Server as IOServer } from 'socket.io'
import { Server as NetServer } from 'http'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const anyRes = res as any

  // If Socket.IO server is not already running, start it
  if (!anyRes.socket.server.io) {
    console.log('Starting Socket.IO server...')

    const httpServer: NetServer = anyRes.socket.server as any

    const io = new IOServer(httpServer, {
      path: '/api/socket/io',
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    })

    anyRes.socket.server.io = io

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id)

      socket.on('join-user-room', (userId: string) => {
        socket.join(`user-${userId}`)
        console.log(`User ${userId} joined their room`)
      })

      socket.on('join-conversation', (conversationId: string) => {
        socket.join(`conversation-${conversationId}`)
        console.log(`User joined conversation: ${conversationId}`)
      })

      socket.on('leave-conversation', (conversationId: string) => {
        socket.leave(`conversation-${conversationId}`)
        console.log(`User left conversation: ${conversationId}`)
      })

      socket.on('send-message', async (data) => {
        const { conversationId, senderId, receiverId, content, demandId } = data
        
        try {
          const response = await fetch(`${req.headers.origin}/api/messages/send`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              senderId,
              receiverId,
              content,
              demandId,
              conversationId
            })
          })

          const result = await response.json()

          if (result.success) {
            const messageData = {
              id: result.messageId,
              conversationId,
              senderId,
              receiverId,
              content,
              demandId,
              createdAt: new Date().toISOString(),
              sender: result.sender
            }

            io.to(`conversation-${conversationId}`).emit('new-message', messageData)
            
            io.to(`user-${receiverId}`).emit('new-message-notification', {
              conversationId,
              senderId,
              senderName: result.sender.name,
              content,
              demandTitle: result.demandTitle
            })

            fetch(`${req.headers.origin}/api/notifications/message`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                senderId,
                receiverId,
                demandId,
                messageContent: content
              })
            }).catch(err => console.error('Email notification failed:', err))

          } else {
            socket.emit('message-error', { error: result.error })
          }
        } catch (error) {
          console.error('Error sending message:', error)
          socket.emit('message-error', { error: 'Failed to send message' })
        }
      })

      socket.on('mark-messages-read', async (data) => {
        const { conversationId, userId } = data
        
        try {
          const response = await fetch(`${req.headers.origin}/api/messages/mark-read`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              conversationId,
              userId
            })
          })

          const result = await response.json()

          if (result.success) {
            socket.to(`conversation-${conversationId}`).emit('messages-read', {
              conversationId,
              readBy: userId,
              readAt: new Date().toISOString()
            })
          }
        } catch (error) {
          console.error('Error marking messages as read:', error)
        }
      })

      socket.on('typing', (data) => {
        const { conversationId, userId, userName } = data
        socket.to(`conversation-${conversationId}`).emit('user-typing', {
          conversationId,
          userId,
          userName
        })
      })

      socket.on('stop-typing', (data) => {
        const { conversationId, userId } = data
        socket.to(`conversation-${conversationId}`).emit('user-stop-typing', {
          conversationId,
          userId
        })
      })

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id)
      })
    })
  }

  res.end()
}
