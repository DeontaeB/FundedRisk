'use client'

import { useState, useEffect } from 'react'
import { io, Socket } from 'socket.io-client'
import { useSession } from 'next-auth/react'

interface ConnectionStatus {
  connected: boolean
  error: string | null
  userId: string | null
  lastPing: Date | null
}

export default function WebSocketTest() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [status, setStatus] = useState<ConnectionStatus>({
    connected: false,
    error: null,
    userId: null,
    lastPing: null
  })
  const [testMessage, setTestMessage] = useState('')
  const [receivedMessages, setReceivedMessages] = useState<any[]>([])
  const { data: session } = useSession()

  useEffect(() => {
    if (!session?.user?.id) {
      setStatus(prev => ({ ...prev, error: 'No user session found' }))
      return
    }

    // Create socket connection with authentication
    const newSocket = io('http://localhost:3001', {
      auth: {
        token: session.accessToken || 'dummy-token' // You'll need to pass real JWT token
      },
      transports: ['websocket', 'polling']
    })

    // Connection events
    newSocket.on('connect', () => {
      console.log('✅ Connected to WebSocket server')
      setStatus({
        connected: true,
        error: null,
        userId: session.user.id,
        lastPing: new Date()
      })
    })

    newSocket.on('connected', (data) => {
      console.log('✅ Server confirmed connection:', data)
      setReceivedMessages(prev => [...prev, { type: 'connected', data, time: new Date() }])
    })

    newSocket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error.message)
      setStatus(prev => ({
        ...prev,
        connected: false,
        error: error.message
      }))
    })

    newSocket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected:', reason)
      setStatus(prev => ({
        ...prev,
        connected: false,
        error: `Disconnected: ${reason}`
      }))
    })

    // Test event listeners
    newSocket.on('pong', (data) => {
      console.log('🏓 Pong received:', data)
      setStatus(prev => ({ ...prev, lastPing: new Date() }))
      setReceivedMessages(prev => [...prev, { type: 'pong', data, time: new Date() }])
    })

    newSocket.on('trade-created', (data) => {
      console.log('📈 Trade notification:', data)
      setReceivedMessages(prev => [...prev, { type: 'trade', data, time: new Date() }])
    })

    newSocket.on('compliance-alert', (data) => {
      console.log('🚨 Compliance alert:', data)
      setReceivedMessages(prev => [...prev, { type: 'alert', data, time: new Date() }])
    })

    newSocket.on('error', (data) => {
      console.error('💥 Socket error:', data)
      setReceivedMessages(prev => [...prev, { type: 'error', data, time: new Date() }])
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [session?.user?.id, session?.accessToken])

  const sendPing = () => {
    if (socket) {
      socket.emit('ping')
    }
  }

  const joinRoom = () => {
    if (socket && session?.user?.id) {
      socket.emit('join-room', {
        roomName: `user_${session.user.id}_test`,
        options: {}
      })
    }
  }

  const subscribeToStreams = () => {
    if (socket && session?.user?.id) {
      socket.emit('subscribe', {
        streams: [
          `trades_${session.user.id}`,
          `alerts_${session.user.id}`,
          `compliance_${session.user.id}`
        ]
      })
    }
  }

  const simulateTradeNotification = () => {
    if (socket) {
      // Simulate what a TradingView webhook would trigger
      setReceivedMessages(prev => [...prev, {
        type: 'simulated-trade',
        data: {
          symbol: 'ES',
          side: 'BUY',
          quantity: 1,
          price: 4500.25,
          timestamp: new Date().toISOString()
        },
        time: new Date()
      }])
    }
  }

  const simulateComplianceAlert = () => {
    if (socket) {
      // Simulate a compliance violation
      setReceivedMessages(prev => [...prev, {
        type: 'simulated-alert',
        data: {
          title: 'Daily Loss Limit Warning',
          message: 'You are approaching your daily loss limit of $1,000',
          severity: 'warning',
          currentLoss: 850,
          limit: 1000
        },
        time: new Date()
      }])
    }
  }

  const sendRealTradeNotification = async () => {
    if (!session?.user?.id) return
    
    try {
      const response = await fetch('/api/test/websocket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'trade',
          userId: session.user.id,
          data: {
            symbol: 'ES',
            side: 'BUY',
            quantity: 2,
            price: 4502.75,
            pnl: 137.50
          }
        })
      })
      
      const result = await response.json()
      console.log('Real trade notification result:', result)
    } catch (error) {
      console.error('Error sending real trade notification:', error)
    }
  }

  const sendRealComplianceAlert = async () => {
    if (!session?.user?.id) return
    
    try {
      const response = await fetch('/api/test/websocket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'compliance',
          userId: session.user.id,
          data: {
            title: 'Position Size Warning',
            message: 'Position size exceeds maximum allowed for your account',
            severity: 'high',
            ruleType: 'position_size',
            currentValue: 15,
            limit: 10
          }
        })
      })
      
      const result = await response.json()
      console.log('Real compliance alert result:', result)
    } catch (error) {
      console.error('Error sending real compliance alert:', error)
    }
  }

  const clearMessages = () => {
    setReceivedMessages([])
  }

  if (!session) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">Please sign in to test WebSocket connection</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">WebSocket Connection Test</h2>

      {/* Connection Status */}
      <div className={`p-4 rounded-lg ${
        status.connected ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
      }`}>
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-3 ${
            status.connected ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <div>
            <p className={`font-medium ${status.connected ? 'text-green-800' : 'text-red-800'}`}>
              {status.connected ? 'Connected' : 'Disconnected'}
            </p>
            {status.error && <p className="text-red-600 text-sm">{status.error}</p>}
            {status.userId && <p className="text-sm text-gray-600">User ID: {status.userId}</p>}
            {status.lastPing && <p className="text-sm text-gray-600">Last ping: {status.lastPing.toLocaleTimeString()}</p>}
          </div>
        </div>
      </div>

      {/* Test Controls */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Connection Tests</h3>
          <button
            onClick={sendPing}
            disabled={!status.connected}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send Ping
          </button>
          <button
            onClick={joinRoom}
            disabled={!status.connected}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Join Test Room
          </button>
          <button
            onClick={subscribeToStreams}
            disabled={!status.connected}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Subscribe to Streams
          </button>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Notification Tests</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={simulateTradeNotification}
              className="px-3 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Simulate Trade
            </button>
            <button
              onClick={sendRealTradeNotification}
              className="px-3 py-2 text-sm bg-indigo-700 text-white rounded hover:bg-indigo-800"
            >
              Real Trade API
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={simulateComplianceAlert}
              className="px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
            >
              Simulate Alert
            </button>
            <button
              onClick={sendRealComplianceAlert}
              className="px-3 py-2 text-sm bg-red-700 text-white rounded hover:bg-red-800"
            >
              Real Alert API
            </button>
          </div>
          <button
            onClick={clearMessages}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Clear Messages
          </button>
        </div>
      </div>

      {/* Message Log */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Message Log</h3>
          <span className="text-sm text-gray-600">{receivedMessages.length} messages</span>
        </div>
        
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {receivedMessages.length === 0 ? (
            <p className="text-gray-500 italic">No messages received yet</p>
          ) : (
            receivedMessages.slice().reverse().map((msg, index) => (
              <div key={index} className={`p-3 rounded border-l-4 ${
                msg.type === 'connected' ? 'border-green-500 bg-green-50' :
                msg.type === 'pong' ? 'border-blue-500 bg-blue-50' :
                msg.type === 'trade' || msg.type === 'simulated-trade' ? 'border-indigo-500 bg-indigo-50' :
                msg.type === 'alert' || msg.type === 'simulated-alert' ? 'border-red-500 bg-red-50' :
                'border-gray-500 bg-gray-50'
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium mb-2 ${
                      msg.type === 'connected' ? 'bg-green-200 text-green-800' :
                      msg.type === 'pong' ? 'bg-blue-200 text-blue-800' :
                      msg.type === 'trade' || msg.type === 'simulated-trade' ? 'bg-indigo-200 text-indigo-800' :
                      msg.type === 'alert' || msg.type === 'simulated-alert' ? 'bg-red-200 text-red-800' :
                      'bg-gray-200 text-gray-800'
                    }`}>
                      {msg.type.toUpperCase()}
                    </span>
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                      {JSON.stringify(msg.data, null, 2)}
                    </pre>
                  </div>
                  <span className="text-xs text-gray-500">
                    {msg.time.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Testing Tips:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• The WebSocket server should be running on port 3001</li>
          <li>• Authentication may fail if you don't have a proper JWT token</li>
          <li>• Real trade notifications come from TradingView webhooks</li>
          <li>• Compliance alerts are triggered by your trading rules</li>
          <li>• Check the browser console for detailed logs</li>
        </ul>
      </div>
    </div>
  )
}