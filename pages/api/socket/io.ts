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
      cors: {
        origin: '*',
      },
    })

    anyRes.socket.server.io = io

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id)

      socket.on('join-user-room', (userId: string) => {
        socket.join(`user-${userId}`)
      })

      socket.on('join-conversation', (conversationId: string) => {
        socket.join(`conversation-${conversationId}`)
      })

      socket.on('leave-conversation', (conversationId: string) => {
        socket.leave(`conversation-${conversationId}`)
      })

      socket.on('send-message', (data) => {
        io.to(`conversation-${data.conversationId}`).emit('new-message', data)
        io.to(`user-${data.receiverId}`).emit('new-message-notification', data)
      })

      socket.on('mark-messages-read', (data) => {
        io.to(`conversation-${data.conversationId}`).emit('messages-read', {
          readBy: data.userId,
          readAt: new Date().toISOString(),
        })
      })

      socket.on('typing', (data) => {
        io.to(`conversation-${data.conversationId}`).emit('user-typing', data)
      })

      socket.on('stop-typing', (data) => {
        io.to(`conversation-${data.conversationId}`).emit('user-stop-typing', data)
      })

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id)
      })
    })
  }

  res.end()
}
