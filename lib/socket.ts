import { Server as NetServer } from 'http'
import { NextApiRequest, NextApiResponse } from 'next'
import { Server as ServerIO } from 'socket.io'

export const config = {
  api: {
    bodyParser: false,
  },
}

const SocketHandler = (req: NextApiRequest, res: NextApiResponse & { socket: any }) => {
  if (res.socket.server.io) {
    console.log('Socket is already running')
  } else {
    console.log('Socket is initializing')
    const httpServer: NetServer = res.socket.server as any
    const io = new ServerIO(httpServer, {
      path: '/api/socket/io',
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    })

    // Socket connection handling
    io.on('connection', (socket) => {
      console.log(`User connected: ${socket.id}`)

      // Join user to their personal room for notifications
      socket.on('join-user-room', (userId: string) => {
        socket.join(`user-${userId}`)
        console.log(`User ${userId} joined their room`)
      })

      // Join a conversation room
      socket.on('join-conversation', (conversationId: string) => {
        socket.join(`conversation-${conversationId}`)
        console.log(`User joined conversation: ${conversationId}`)
      })

      // Leave a conversation room
      socket.on('leave-conversation', (conversationId: string) => {
        socket.leave(`conversation-${conversationId}`)
        console.log(`User left conversation: ${conversationId}`)
      })

      // Send message in conversation
      socket.on('send-message', async (data) => {
        const { conversationId, senderId, receiverId, content, demandId } = data
        
        try {
          // Validate that sender is a client (business rule: only clients can initiate contact)
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
            // Broadcast message to both users in the conversation
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

            // Send to conversation room
            io.to(`conversation-${conversationId}`).emit('new-message', messageData)
            
            // Send notification to receiver's personal room
            io.to(`user-${receiverId}`).emit('new-message-notification', {
              conversationId,
              senderId,
              senderName: result.sender.name,
              content,
              demandTitle: result.demandTitle
            })

            // Send email notification (async, don't wait)
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

      // Mark messages as read
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
            // Notify other user in conversation that messages were read
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

      // Typing indicators
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

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`)
      })
    })

    res.socket.server.io = io
  }
  res.end()
}

export default SocketHandler
