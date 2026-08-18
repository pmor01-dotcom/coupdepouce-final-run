import { Server as NetServer } from 'http'
import type { NextApiRequest, NextApiResponse } from 'next'
import { Server as ServerIO } from 'socket.io'
import { createClient } from '@supabase/supabase-js'

declare global {
  var socketIO: ServerIO | undefined
}

let socketIO: ServerIO | null = null

export const getSocketInstance = (): ServerIO | null => {
  return socketIO || globalThis.socketIO || null
}

export const config = {
  api: {
    bodyParser: false,
  },
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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
        origin: '*',
        methods: ['GET', 'POST'],
      },
    })

    // Authenticate each socket connection using session token
    io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth?.token
        if (!token) {
          console.log('Socket rejected: missing token')
          return next(new Error('Authentication required'))
        }

        const { data: session, error } = await supabase
          .from('sessions')
          .select('user_id')
          .eq('token', token)
          .single()

        if (error || !session) {
          console.log('Socket rejected: invalid token')
          return next(new Error('Invalid session token'))
        }

        ;(socket as any).userId = session.user_id
        console.log('Socket authenticated as user:', session.user_id)
        next()
      } catch (err) {
        console.error('Socket auth error:', err)
        next(new Error('Authentication failed'))
      }
    })

    io.on('connection', (socket) => {
      const userId = (socket as any).userId
      console.log(`User connected: ${socket.id} (userId: ${userId})`)

      socket.on('join-user-room', (uid: string) => {
        socket.join(`user-${uid}`)
        console.log(`User ${uid} joined their room`)
      })

      socket.on('join-conversation', (conversationId: string) => {
        socket.join(`conversation-${conversationId}`)
        console.log(`User joined conversation: ${conversationId}`)
      })

      socket.on('leave-conversation', (conversationId: string) => {
        socket.leave(`conversation-${conversationId}`)
        console.log(`User left conversation: ${conversationId}`)
      })

      // Send message in conversation
      socket.on('send-message', async (data) => {
        const { conversationId, receiverId, content, demandId } = data
        const senderId = (socket as any).userId

        if (!senderId) {
          socket.emit('message-error', { error: 'Vous devez être connecté pour envoyer un message' })
          return
        }

        try {
          const response = await fetch(`${req.headers.origin}/api/messages/send`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              // if your /api/messages/send expects Authorization, add it here:
              // Authorization: `Bearer ${socket.handshake.auth?.token}`,
            },
            body: JSON.stringify({
              senderId,
              receiverId,
              content,
              demandId,
              conversationId,
            }),
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
              sender: result.sender,
            }

            io.to(`conversation-${conversationId}`).emit('new-message', messageData)

            io.to(`user-${receiverId}`).emit('new-message-notification', {
              conversationId,
              senderId,
              senderName: result.sender.name,
              content,
              demandTitle: result.demandTitle,
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
                messageContent: content,
              }),
            }).catch((err) => console.error('Email notification failed:', err))
          } else {
            socket.emit('message-error', { error: result.error })
          }
        } catch (error) {
          console.error('Error sending message:', error)
          socket.emit('message-error', { error: 'Failed to send message' })
        }
      })

      socket.on('mark-messages-as-read', async (data) => {
        const { conversationId, userId: readBy } = data

        try {
          const response = await fetch(`${req.headers.origin}/api/messages/mark-read`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              conversationId,
              userId: readBy,
            }),
          })

          const result = await response.json()

          if (result.success) {
            socket.to(`conversation-${conversationId}`).emit('messages-read', {
              conversationId,
              readBy,
              readAt: new Date().toISOString(),
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
          userName,
        })
      })

      socket.on('stop-typing', (data) => {
        const { conversationId, userId } = data
        socket.to(`conversation-${conversationId}`).emit('user-stop-typing', {
          conversationId,
          userId,
        })
      })

      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id} (userId: ${userId})`)
      })
    })

    socketIO = io
    globalThis.socketIO = io
    res.socket.server.io = io
  }
  res.end()
}

export default SocketHandler
