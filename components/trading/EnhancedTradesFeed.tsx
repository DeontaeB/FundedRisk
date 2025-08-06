'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface Trade {
  id: string
  symbol: string
  side: 'buy' | 'sell'
  quantity: number
  entryPrice: number
  exitPrice?: number
  currentPrice?: number
  pnl: number
  status: 'open' | 'closed'
  timestamp: Date
  duration?: number // in minutes
  stopLoss?: number
  takeProfit?: number
  rMultiple?: number
  fees?: number
  slippage?: number
  notes?: string
}

interface EnhancedTradesFeedProps {
  trades: Trade[]
  onTradeSelect?: (trade: Trade) => void
  className?: string
}

export default function EnhancedTradesFeed({ 
  trades, 
  onTradeSelect,
  className = '' 
}: EnhancedTradesFeedProps) {
  const [selectedTradeId, setSelectedTradeId] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'timestamp' | 'pnl' | 'symbol'>('timestamp')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [filter, setFilter] = useState<'all' | 'open' | 'closed' | 'winners' | 'losers'>('all')
  const listRef = useRef<HTMLDivElement>(null)

  // Generate more realistic sample data for demo
  const generateSampleTrades = useCallback((): Trade[] => {
    const symbols = ['ES', 'NQ', 'YM', 'RTY', 'CL', 'GC', 'SI']
    const trades: Trade[] = []
    
    for (let i = 0; i < 25; i++) {
      const symbol = symbols[Math.floor(Math.random() * symbols.length)]
      const side = Math.random() > 0.5 ? 'buy' : 'sell'
      const quantity = Math.floor(Math.random() * 5) + 1
      const entryPrice = 4750 + (Math.random() - 0.5) * 100
      const isOpen = i < 3 && Math.random() > 0.7
      
      let exitPrice: number | undefined
      let pnl = 0
      let duration: number | undefined
      
      if (!isOpen) {
        exitPrice = entryPrice + (Math.random() - 0.5) * 50
        const priceMove = exitPrice - entryPrice
        pnl = side === 'buy' ? priceMove * quantity * 50 : -priceMove * quantity * 50
        duration = Math.floor(Math.random() * 120) + 1
      } else {
        const currentPrice = entryPrice + (Math.random() - 0.5) * 20
        const priceMove = currentPrice - entryPrice
        pnl = side === 'buy' ? priceMove * quantity * 50 : -priceMove * quantity * 50
      }
      
      const stopLoss = side === 'buy' ? entryPrice - 25 : entryPrice + 25
      const takeProfit = side === 'buy' ? entryPrice + 50 : entryPrice - 50
      const rMultiple = pnl / (Math.abs(entryPrice - stopLoss) * quantity * 50)
      
      trades.push({
        id: `trade_${i}`,
        symbol,
        side,
        quantity,
        entryPrice,
        exitPrice,
        currentPrice: isOpen ? entryPrice + (Math.random() - 0.5) * 20 : undefined,
        pnl: Math.round(pnl * 100) / 100,
        status: isOpen ? 'open' : 'closed',
        timestamp: new Date(Date.now() - i * 5 * 60 * 1000), // 5 minutes apart
        duration,
        stopLoss,
        takeProfit,
        rMultiple: Math.round(rMultiple * 100) / 100,
        fees: Math.round(quantity * 2.5 * 100) / 100,
        slippage: Math.round((Math.random() * 5) * 100) / 100
      })
    }
    
    return trades
  }, [])

  const [allTrades] = useState<Trade[]>(generateSampleTrades())

  // Filter and sort trades
  const filteredAndSortedTrades = allTrades
    .filter(trade => {
      switch (filter) {
        case 'open': return trade.status === 'open'
        case 'closed': return trade.status === 'closed'
        case 'winners': return trade.pnl > 0
        case 'losers': return trade.pnl < 0
        default: return true
      }
    })
    .sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'timestamp':
          comparison = a.timestamp.getTime() - b.timestamp.getTime()
          break
        case 'pnl':
          comparison = a.pnl - b.pnl
          break
        case 'symbol':
          comparison = a.symbol.localeCompare(b.symbol)
          break
      }
      return sortOrder === 'desc' ? -comparison : comparison
    })

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return
      
      const currentIndex = filteredAndSortedTrades.findIndex(t => t.id === selectedTradeId)
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          if (currentIndex < filteredAndSortedTrades.length - 1) {
            const nextTrade = filteredAndSortedTrades[currentIndex + 1]
            setSelectedTradeId(nextTrade.id)
            onTradeSelect?.(nextTrade)
          }
          break
        case 'ArrowUp':
          e.preventDefault()
          if (currentIndex > 0) {
            const prevTrade = filteredAndSortedTrades[currentIndex - 1]
            setSelectedTradeId(prevTrade.id)
            onTradeSelect?.(prevTrade)
          }
          break
        case 'Enter':
          if (selectedTradeId) {
            const trade = filteredAndSortedTrades.find(t => t.id === selectedTradeId)
            if (trade) onTradeSelect?.(trade)
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [selectedTradeId, filteredAndSortedTrades, onTradeSelect])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit', 
      minute: '2-digit'
    })
  }

  const getPnLColor = (pnl: number, isSelected: boolean = false) => {
    if (isSelected) return 'text-white'
    if (pnl > 0) return 'text-green-400'
    if (pnl < 0) return 'text-red-400'
    return 'text-gray-400'
  }

  const getSideColor = (side: string, isSelected: boolean = false) => {
    if (isSelected) return 'text-white'
    return side === 'buy' ? 'text-blue-400' : 'text-orange-400'
  }

  return (
    <div className={`bg-gray-900 text-white border border-gray-700 rounded ${className}`}>
      {/* Header with filters and sort */}
      <div className="p-3 border-b border-gray-700 bg-gray-800">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-bold text-gray-200">LIVE TRADES FEED</h3>
          <div className="text-xs text-gray-400">
            {filteredAndSortedTrades.length} trades • Use ↑↓ to navigate
          </div>
        </div>
        
        <div className="flex space-x-2 text-xs">
          {(['all', 'open', 'closed', 'winners', 'losers'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 py-1 rounded uppercase font-bold ${
                filter === f ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Trades list */}
      <div ref={listRef} className="h-96 overflow-y-auto">
        <div className="divide-y divide-gray-800">
          {filteredAndSortedTrades.map((trade) => {
            const isSelected = selectedTradeId === trade.id
            return (
              <div
                key={trade.id}
                onClick={() => {
                  setSelectedTradeId(trade.id)
                  onTradeSelect?.(trade)
                }}
                className={`p-2 cursor-pointer transition-colors text-xs ${
                  isSelected 
                    ? 'bg-blue-600 text-white' 
                    : 'hover:bg-gray-800'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex space-x-3">
                    <div className="w-8">
                      <div className="font-bold">{trade.symbol}</div>
                      <div className={`text-xs font-bold ${getSideColor(trade.side, isSelected)}`}>
                        {trade.side.toUpperCase()}
                      </div>
                    </div>
                    
                    <div className="w-12">
                      <div className="text-gray-300">×{trade.quantity}</div>
                      <div className="text-xs text-gray-500">
                        {formatTime(trade.timestamp)}
                      </div>
                    </div>
                    
                    <div className="w-16">
                      <div className="font-mono text-xs">
                        ${trade.entryPrice.toFixed(2)}
                      </div>
                      {trade.exitPrice && (
                        <div className="font-mono text-xs text-gray-400">
                          ${trade.exitPrice.toFixed(2)}
                        </div>
                      )}
                    </div>
                    
                    <div className="w-16">
                      <div className={`font-mono font-bold ${getPnLColor(trade.pnl, isSelected)}`}>
                        ${trade.pnl.toFixed(2)}
                      </div>
                      {trade.rMultiple && (
                        <div className="text-xs text-gray-400">
                          R{trade.rMultiple.toFixed(1)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-xs px-1 rounded ${
                      trade.status === 'open' 
                        ? 'bg-blue-800 text-blue-200' 
                        : isSelected ? 'bg-gray-700 text-white' : 'bg-gray-700 text-gray-300'
                    }`}>
                      {trade.status.toUpperCase()}
                    </div>
                    {trade.duration && (
                      <div className="text-xs text-gray-400 mt-1">
                        {trade.duration}m
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Additional details for selected trade */}
                {isSelected && (
                  <div className="mt-2 pt-2 border-t border-blue-500 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span>Stop Loss:</span>
                      <span className="font-mono">${trade.stopLoss?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Take Profit:</span>
                      <span className="font-mono">${trade.takeProfit?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fees:</span>
                      <span className="font-mono text-red-300">-${trade.fees?.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
      
      {/* Footer stats */}
      <div className="p-2 border-t border-gray-700 bg-gray-800 text-xs">
        <div className="flex justify-between text-gray-400">
          <span>Open: {filteredAndSortedTrades.filter(t => t.status === 'open').length}</span>
          <span>Winners: {filteredAndSortedTrades.filter(t => t.pnl > 0).length}</span>
          <span>Losers: {filteredAndSortedTrades.filter(t => t.pnl < 0).length}</span>
          <span>
            Win Rate: {
              Math.round(
                (filteredAndSortedTrades.filter(t => t.pnl > 0).length / 
                Math.max(1, filteredAndSortedTrades.filter(t => t.status === 'closed').length)) * 100
              )
            }%
          </span>
        </div>
      </div>
    </div>
  )
}