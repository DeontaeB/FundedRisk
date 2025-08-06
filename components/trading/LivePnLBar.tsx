'use client'

import { useState, useEffect, useCallback } from 'react'

interface LivePnLBarProps {
  currentBalance: number
  startingBalance: number
  dailyPnL: number
  dailyLossLimit: number
  maxDrawdown: number
  violations: number
  isMarketOpen: boolean
  sessionStartTime: Date
  onPauseTrading: () => void
  onEmergencyStop: () => void
}

export default function LivePnLBar({
  currentBalance,
  startingBalance,
  dailyPnL,
  dailyLossLimit,
  maxDrawdown,
  violations,
  isMarketOpen,
  sessionStartTime,
  onPauseTrading,
  onEmergencyStop
}: LivePnLBarProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Calculate key metrics
  const totalPnL = currentBalance - startingBalance
  const dailyLossUsed = Math.abs(Math.min(0, dailyPnL))
  const dailyLossRemaining = Math.max(0, dailyLossLimit - dailyLossUsed)
  const dailyLossPercent = (dailyLossUsed / dailyLossLimit) * 100
  const drawdownPercent = Math.max(0, ((startingBalance - currentBalance) / maxDrawdown) * 100)
  
  // Session duration
  const sessionDuration = Math.floor((currentTime.getTime() - sessionStartTime.getTime()) / 1000 / 60)
  
  // Risk status
  const getRiskStatus = () => {
    if (drawdownPercent >= 90 || dailyLossPercent >= 90 || violations >= 3) return 'CRITICAL'
    if (drawdownPercent >= 70 || dailyLossPercent >= 70 || violations >= 2) return 'HIGH'
    if (drawdownPercent >= 50 || dailyLossPercent >= 50 || violations >= 1) return 'MEDIUM'
    return 'SAFE'
  }

  const riskStatus = getRiskStatus()
  const statusColor = {
    'CRITICAL': 'bg-red-600 text-white animate-pulse',
    'HIGH': 'bg-orange-500 text-white',
    'MEDIUM': 'bg-yellow-500 text-black',
    'SAFE': 'bg-green-600 text-white'
  }[riskStatus]

  const pnlColor = dailyPnL >= 0 ? 'text-green-400' : 'text-red-400'

  const handlePauseToggle = useCallback(() => {
    setIsPaused(!isPaused)
    onPauseTrading()
  }, [isPaused, onPauseTrading])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return
      
      switch (e.key.toLowerCase()) {
        case 'p':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            handlePauseToggle()
          }
          break
        case 'e':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            onEmergencyStop()
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handlePauseToggle, onEmergencyStop])

  return (
    <div className="sticky top-0 z-50 bg-gray-900 text-white border-b border-gray-700 px-4 py-2">
      <div className="flex items-center justify-between max-w-full">
        {/* Left: Core P&L Data */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">TOTAL P&L:</span>
            <span className={`text-xl font-mono font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${totalPnL.toFixed(2)}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">DAILY:</span>
            <span className={`text-lg font-mono font-bold ${pnlColor}`}>
              ${dailyPnL.toFixed(2)}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">REMAINING:</span>
            <span className={`text-lg font-mono font-bold ${dailyLossRemaining < 200 ? 'text-red-400' : 'text-green-400'}`}>
              ${dailyLossRemaining.toFixed(0)}
            </span>
            <span className="text-xs text-gray-500">
              ({(100 - dailyLossPercent).toFixed(0)}%)
            </span>
          </div>
        </div>

        {/* Center: Risk Status */}
        <div className="flex items-center space-x-4">
          <div className={`px-3 py-1 rounded font-bold text-sm ${statusColor}`}>
            {riskStatus}
          </div>
          
          {violations > 0 && (
            <div className="bg-red-600 text-white px-2 py-1 rounded text-sm font-bold animate-pulse">
              {violations} VIOLATION{violations > 1 ? 'S' : ''}
            </div>
          )}
          
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${isMarketOpen ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
            <span className="text-xs text-gray-400">
              {isMarketOpen ? 'MARKET OPEN' : 'MARKET CLOSED'}
            </span>
          </div>
        </div>

        {/* Right: Session Info & Actions */}
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-xs text-gray-400">SESSION</div>
            <div className="text-sm font-mono">{sessionDuration}m</div>
          </div>
          
          <div className="text-right">
            <div className="text-xs text-gray-400">TIME</div>
            <div className="text-sm font-mono">
              {currentTime.toLocaleTimeString('en-US', { 
                hour12: false,
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-xs text-gray-500">Ctrl+?</div>
            <div className="text-xs text-gray-400">Shortcuts</div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePauseToggle}
              className={`px-3 py-1 rounded text-sm font-bold transition-colors ${
                isPaused 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-yellow-600 hover:bg-yellow-700 text-white'
              }`}
              title="Ctrl+P"
            >
              {isPaused ? 'RESUME' : 'PAUSE'}
            </button>
            
            <button
              onClick={onEmergencyStop}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-bold transition-colors"
              title="Ctrl+E"
            >
              STOP
            </button>
          </div>
        </div>
      </div>
      
      {/* Progress bar for daily loss */}
      <div className="mt-1 w-full bg-gray-700 rounded-full h-1">
        <div 
          className={`h-1 rounded-full transition-all duration-300 ${
            dailyLossPercent >= 90 ? 'bg-red-500 animate-pulse' :
            dailyLossPercent >= 70 ? 'bg-orange-500' :
            dailyLossPercent >= 50 ? 'bg-yellow-500' :
            'bg-green-500'
          }`}
          style={{ width: `${Math.min(100, dailyLossPercent)}%` }}
        />
      </div>
    </div>
  )
}