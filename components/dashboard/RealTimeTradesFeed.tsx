'use client'

import { useState, useEffect } from 'react'
import { useNotifications } from '@/contexts/NotificationContext'

interface Trade {
  id: string
  symbol: string
  side: 'BUY' | 'SELL'
  quantity: number
  price: number
  pnl?: number
  timestamp: string
}

interface RealTimeTradesFeedProps {
  maxTrades?: number
}

export default function RealTimeTradesFeed({ maxTrades = 10 }: RealTimeTradesFeedProps) {
  const [trades, setTrades] = useState<Trade[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const { socket } = useNotifications()

  useEffect(() => {
    if (!socket) return

    const handleConnection = () => {
      setIsConnected(true)
    }

    const handleDisconnection = () => {
      setIsConnected(false)
    }

    const handleTradeCreated = (tradeData: any) => {
      const newTrade: Trade = {
        id: tradeData.id || `trade-${Date.now()}-${Math.random()}`,
        symbol: tradeData.symbol,
        side: tradeData.side,
        quantity: tradeData.quantity,
        price: tradeData.price,
        pnl: tradeData.pnl,
        timestamp: tradeData.timestamp || new Date().toISOString()
      }

      setTrades(prevTrades => {
        const updatedTrades = [newTrade, ...prevTrades]
        return updatedTrades.slice(0, maxTrades) // Keep only the most recent trades
      })
    }

    // Socket event listeners
    socket.on('connect', handleConnection)
    socket.on('disconnect', handleDisconnection)
    socket.on('trade-created', handleTradeCreated)

    // Check initial connection status
    setIsConnected(socket.connected)

    return () => {
      socket.off('connect', handleConnection)
      socket.off('disconnect', handleDisconnection)
      socket.off('trade-created', handleTradeCreated)
    }
  }, [socket, maxTrades])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price)
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Live Trades Feed</h3>
        <div className="flex items-center">
          <div className={`w-2 h-2 rounded-full mr-2 ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <span className={`text-sm ${
            isConnected ? 'text-green-600' : 'text-red-600'
          }`}>
            {isConnected ? 'Live' : 'Disconnected'}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {trades.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📊</div>
            <p>No trades yet</p>
            <p className="text-sm">Trades will appear here in real-time</p>
          </div>
        ) : (
          trades.map((trade, index) => (
            <div
              key={trade.id}
              className={`flex items-center justify-between p-3 rounded-lg border-l-4 transition-all duration-300 ${
                trade.side === 'BUY' 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-red-500 bg-red-50'
              } ${index === 0 ? 'animate-pulse' : ''}`}
            >
              <div className="flex items-center space-x-4">
                <div className={`px-2 py-1 rounded text-xs font-bold ${
                  trade.side === 'BUY'
                    ? 'bg-green-500 text-white'
                    : 'bg-red-500 text-white'
                }`}>
                  {trade.side}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {trade.quantity} {trade.symbol}
                  </div>
                  <div className="text-sm text-gray-600">
                    @ {formatPrice(trade.price)}
                  </div>
                </div>
              </div>

              <div className="text-right">
                {trade.pnl !== undefined && (
                  <div className={`font-semibold ${
                    trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {trade.pnl >= 0 ? '+' : ''}{formatPrice(trade.pnl)}
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  {formatTime(trade.timestamp)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {trades.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Total Trades: {trades.length}</span>
            <button
              onClick={() => setTrades([])}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  )
}