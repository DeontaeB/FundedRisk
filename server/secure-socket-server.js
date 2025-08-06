const express = require('express')
const cors = require('cors')
const { createServer } = require('http')
const { Server } = require('socket.io')
const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
require('dotenv').config()

const prisma = new PrismaClient()
const app = express()
const server = createServer(app)

// Security middleware
app.use(helmet())
app.use(cors({
  origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
  credentials: true
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false
})
app.use(limiter)

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Socket.IO server with authentication
const io = new Server(server, {
  cors: {
    origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  maxHttpBufferSize: 1e6, // 1MB limit
  allowEIO3: true
})

// JWT authentication middleware for WebSocket
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.query.token
    
    if (!token) {
      return next(new Error('Authentication token required'))
    }

    // Verify JWT token
    let decoded
    try {
      decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET)
    } catch (error) {
      return next(new Error('Invalid authentication token'))
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        subscriptions: {
          where: { 
            status: { in: ['active', 'trialing'] }
          },
          take: 1
        }
      }
    })

    if (!user) {
      return next(new Error('User not found'))
    }

    // Check subscription status
    if (user.subscriptions.length === 0) {
      return next(new Error('Active subscription required'))
    }

    // Attach user to socket
    socket.userId = user.id
    socket.user = user
    
    next()
  } catch (error) {
    console.error('Socket authentication error:', error)
    next(new Error('Authentication failed'))
  }
}

// Apply authentication middleware
io.use(authenticateSocket)

// Connection tracking
const activeConnections = new Map()
const userRooms = new Map()

// WebSocket connection handling
io.on('connection', (socket) => {
  const userId = socket.userId
  console.log(`Authenticated user ${userId} connected:`, socket.id)

  // Track active connection
  activeConnections.set(socket.id, {
    userId,
    connectedAt: new Date(),
    lastActivity: new Date()
  })

  // Join user-specific room
  const roomName = `user_${userId}`
  socket.join(roomName)
  
  // Track user rooms
  if (!userRooms.has(userId)) {
    userRooms.set(userId, new Set())
  }
  userRooms.get(userId).add(socket.id)

  console.log(`User ${userId} joined room: ${roomName}`)

  // Send connection confirmation
  socket.emit('connected', {
    message: 'Successfully connected to real-time updates',
    userId,
    timestamp: new Date().toISOString()
  })

  // Handle room joining (additional rooms)
  socket.on('join-room', (data) => {
    try {
      if (typeof data !== 'object' || !data.roomName) {
        socket.emit('error', { message: 'Invalid room data' })
        return
      }

      const { roomName, options = {} } = data
      
      // Validate room access (users can only join their own rooms)
      if (!roomName.startsWith(`user_${userId}`) && !roomName.startsWith('public_')) {
        socket.emit('error', { message: 'Access denied to room' })
        return
      }

      socket.join(roomName)
      socket.emit('room-joined', { roomName, timestamp: new Date().toISOString() })
      
      console.log(`User ${userId} joined additional room: ${roomName}`)
    } catch (error) {
      console.error('Error joining room:', error)
      socket.emit('error', { message: 'Failed to join room' })
    }
  })

  // Handle leaving rooms
  socket.on('leave-room', (data) => {
    try {
      const { roomName } = data
      socket.leave(roomName)
      socket.emit('room-left', { roomName, timestamp: new Date().toISOString() })
      
      console.log(`User ${userId} left room: ${roomName}`)
    } catch (error) {
      console.error('Error leaving room:', error)
      socket.emit('error', { message: 'Failed to leave room' })
    }
  })

  // Handle ping/pong for connection health
  socket.on('ping', () => {
    socket.emit('pong', { timestamp: new Date().toISOString() })
    
    // Update last activity
    const connection = activeConnections.get(socket.id)
    if (connection) {
      connection.lastActivity = new Date()
    }
  })

  // Handle subscription to specific data streams
  socket.on('subscribe', (data) => {
    try {
      const { streams = [] } = data
      
      // Validate subscription requests
      const allowedStreams = [
        `trades_${userId}`,
        `alerts_${userId}`,
        `compliance_${userId}`,
        `account_${userId}`
      ]
      
      const validStreams = streams.filter(stream => 
        allowedStreams.some(allowed => stream === allowed)
      )
      
      if (validStreams.length > 0) {
        validStreams.forEach(stream => {
          socket.join(stream)
        })
        
        socket.emit('subscribed', { 
          streams: validStreams, 
          timestamp: new Date().toISOString() 
        })
        
        console.log(`User ${userId} subscribed to streams:`, validStreams)
      } else {
        socket.emit('error', { message: 'No valid streams to subscribe to' })
      }
    } catch (error) {
      console.error('Subscription error:', error)
      socket.emit('error', { message: 'Failed to subscribe to streams' })
    }
  })

  // Handle unsubscription
  socket.on('unsubscribe', (data) => {
    try {
      const { streams = [] } = data
      
      streams.forEach(stream => {
        socket.leave(stream)
      })
      
      socket.emit('unsubscribed', { 
        streams, 
        timestamp: new Date().toISOString() 
      })
      
      console.log(`User ${userId} unsubscribed from streams:`, streams)
    } catch (error) {
      console.error('Unsubscription error:', error)
      socket.emit('error', { message: 'Failed to unsubscribe from streams' })
    }
  })

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log(`User ${userId} disconnected:`, socket.id, 'Reason:', reason)
    
    // Clean up tracking
    activeConnections.delete(socket.id)
    
    const userSockets = userRooms.get(userId)
    if (userSockets) {
      userSockets.delete(socket.id)
      if (userSockets.size === 0) {
        userRooms.delete(userId)
      }
    }
  })

  // Handle errors
  socket.on('error', (error) => {
    console.error(`Socket error for user ${userId}:`, error)
  })
})

// Utility functions for broadcasting
const broadcastToUser = (userId, event, data) => {
  io.to(`user_${userId}`).emit(event, {
    ...data,
    timestamp: new Date().toISOString()
  })
}

const broadcastToRoom = (roomName, event, data) => {
  io.to(roomName).emit(event, {
    ...data,
    timestamp: new Date().toISOString()
  })
}

// Health check and monitoring endpoints
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    connections: {
      total: activeConnections.size,
      users: userRooms.size
    },
    uptime: process.uptime()
  })
})

app.get('/stats', (req, res) => {
  const stats = {
    activeConnections: activeConnections.size,
    uniqueUsers: userRooms.size,
    rooms: io.sockets.adapter.rooms.size,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  }
  
  res.json(stats)
})

// API Routes (if needed)
app.use('/api/auth', require('./routes/auth'))
app.use('/api/trades', require('./routes/trades'))
app.use('/api/webhooks', require('./routes/webhooks'))

// Notification API for broadcasting
app.post('/api/notify', async (req, res) => {
  try {
    const { userId, event, data, room } = req.body
    
    if (!userId && !room) {
      return res.status(400).json({ error: 'userId or room required' })
    }
    
    if (userId) {
      broadcastToUser(userId, event, data)
    } else if (room) {
      broadcastToRoom(room, event, data)
    }
    
    res.json({ success: true, message: 'Notification sent' })
  } catch (error) {
    console.error('Notification error:', error)
    res.status(500).json({ error: 'Failed to send notification' })
  }
})

// Global error handler
app.use((err, req, res, next) => {
  console.error('Express error:', err.stack)
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Graceful shutdown handling
const gracefulShutdown = () => {
  console.log('Received shutdown signal, closing server gracefully...')
  
  server.close(() => {
    console.log('HTTP server closed')
    
    // Close database connection
    prisma.$disconnect().then(() => {
      console.log('Database connection closed')
      process.exit(0)
    })
  })
  
  // Force close after 30 seconds
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down')
    process.exit(1)
  }, 30000)
}

process.on('SIGTERM', gracefulShutdown)
process.on('SIGINT', gracefulShutdown)

// Clean up stale connections every 5 minutes
setInterval(() => {
  const now = new Date()
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)
  
  for (const [socketId, connection] of activeConnections.entries()) {
    if (connection.lastActivity < fiveMinutesAgo) {
      console.log(`Cleaning up stale connection: ${socketId}`)
      activeConnections.delete(socketId)
    }
  }
}, 5 * 60 * 1000)

const PORT = process.env.SOCKET_PORT || 3001

server.listen(PORT, () => {
  console.log(`Secure Socket.IO server running on port ${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
})

// Export for testing
module.exports = { 
  app, 
  io, 
  server, 
  broadcastToUser, 
  broadcastToRoom,
  activeConnections,
  userRooms
}