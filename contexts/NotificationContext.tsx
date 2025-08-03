'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useSession } from 'next-auth/react'

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  timestamp: Date
}

interface NotificationContextType {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void
  removeNotification: (id: string) => void
  socket: Socket | null
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [socket, setSocket] = useState<Socket | null>(null)
  const { data: session } = useSession()

  useEffect(() => {
    if (session?.user?.id) {
      const newSocket = io(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001')
      
      newSocket.on('connect', () => {
        console.log('Connected to server')
        newSocket.emit('join-room', session.user.id)
      })

      newSocket.on('trade-created', (trade) => {
        addNotification({
          type: 'info',
          title: 'New Trade',
          message: `${trade.side.toUpperCase()} ${trade.quantity} ${trade.symbol} at $${trade.price}`,
        })
      })

      newSocket.on('compliance-alert', (alert) => {
        addNotification({
          type: alert.severity === 'high' ? 'error' : 'warning',
          title: alert.title,
          message: alert.message,
        })
      })

      setSocket(newSocket)

      return () => {
        newSocket.close()
      }
    }
  }, [session?.user?.id])

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    }
    
    setNotifications(prev => [newNotification, ...prev])

    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeNotification(newNotification.id)
    }, 5000)
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      socket
    }}>
      {children}
      
      {/* Notification Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`max-w-sm w-full shadow-lg rounded-lg pointer-events-auto overflow-hidden ${
              notification.type === 'success' ? 'bg-green-500' :
              notification.type === 'error' ? 'bg-red-500' :
              notification.type === 'warning' ? 'bg-yellow-500' :
              'bg-blue-500'
            }`}
          >
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">
                    {notification.title}
                  </p>
                  <p className="mt-1 text-sm text-white opacity-90">
                    {notification.message}
                  </p>
                </div>
                <button
                  onClick={() => removeNotification(notification.id)}
                  className="ml-4 text-white hover:text-gray-200"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}